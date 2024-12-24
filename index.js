var path = require("path");
var express = require("express");
var bodyParser = require("body-parser");
var errorHandlers = require("./middleware/errorhandler");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var port = process.env.PORT || 8082;
var config = require("./config.json");
var Communication = require("./redis/communicator");
var oModel = require("./model");
var Game = require("./redis/creategame");
var aGames = [];
var redis = require("redis");
const { fileURLToPath } = require("url");


//var routes = require('./routes/templateroutes');
var userRoutes = require("./routes/users.controller");
var redisClient = redis.createClient(config.redisport, config.redishost);
var redisAdapter = require("socket.io-redis");
io.adapter(redisAdapter({ host: config.redishost, port: config.redisport }));

process.on("uncaughtException", function (err) {
  console.error(new Date().toUTCString() + " uncaughtException:", err.message);
  console.error(err.stack);
  process.exit(1);
});

// adding data to Model Singleton for global access
oModel.io = io;
oModel.redisClient = redisClient;
oModel.games = aGames;

// Add middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Set EJS as the template engine


app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "public/views"));
app.set("view engine", "ejs");
console.log('views path' +  + app.get("views"))

// Add middlewares
//app.use('/', routes);

app.get('/throwdice/:gameId/:clientId', async (req, res) => {
  const gameId = req.params.gameId;
  const clientId = req.params.clientId;
  // Wait for Redis data to be fetched or initialized
  // let gameData = await redisClient.get(`game:${gameId}`);
   console.log('gameId:' , gameId)
  // if (!gameData) {
  //   return res.status(404).json({ error: 'Game not found' });
  // }

  // Emit the event only after data is ready
  const rotation1 = Math.random();
  const rotation2 = Math.random();
  const force = Math.random();

  io.emit('throwdice', {
    gameID :  gameId,
    rotation1: rotation1,
    rotation2: rotation2,
    force: force,
    clientId : clientId
  });

  res.json({ message: "Dice thrown successfully!" });
});

//orginal

app.get('/room/:roomId', (req, res) => {
  const roomId = req.params.roomId;
  res.render('room', { roomId });
});

// app.get('/room/:roomId', async (req, res) => {
//   const roomId = req.params.roomId;

//   // Attempt to retrieve room data from Redis
//   try {
//     let roomData = await redisClient.get(`room:${roomId}`);
    
//     if (!roomData) {
//       // If no data exists, initialize a new room with default state
//       roomData = {
//         roomId: roomId,
//         players: [], // Initial empty list of players
//         gameState: "Waiting for players", // Initial game state
//         createdAt: new Date().toISOString(), // Track room creation time
//       };

//       // Store the initial state in Redis, with an optional expiration time
//       await redisClient.setEx(`room:${roomId}`, 3600, JSON.stringify(roomData)); // Expire in 1 hour
//     } else {
//       // Parse the existing room data
//       roomData = JSON.parse(roomData);
//     }

//     // Render the room view using the stored or initialized room data
//     res.render('room', { roomData });
//   } catch (err) {
//     console.error('Error fetching or setting room data in Redis:', err);
//     res.status(500).send('Error loading room');
//   }
// });

// app.post('/room/:roomId/join', async (req, res) => {
//   const roomId = req.params.roomId;
//   const playerName = req.body.playerName; // Assume playerName is passed in the request
//   console.log('roomId :' , roomId)
//   console.log('playerName :' , playerName)
//   try {
//     // Retrieve the current room data
//     let roomData = await redisClient.get(`room:${roomId}`);
//     if (!roomData) {
//       return res.status(404).json({ message: "Room not found" });
//     }

//     roomData = JSON.parse(roomData);
//     roomData.players.push(playerName); // Add new player to the room

//     // Update the room data in Redis
//     await redisClient.setEx(`room:${roomId}`, 3600, JSON.stringify(roomData));

//     res.json({ message: `Player ${playerName} joined room ${roomId}` });
//   } catch (err) {
//     console.error('Error updating room data in Redis:', err);
//     res.status(500).send('Error joining room');
//   }
// });



app.get('/rooms', (req, res) => {
  return  JSON.parse(oModel);
});




app.use("/user", userRoutes);
// app.use(errorHandlers.error);
// app.use(errorHandlers.notFound);



function initServer() {
  // create game data from Redis

  redisClient.keys("*", function (err, keys) {
    if (err) return console.log(err);
    for (var i = 0, len = keys.length; i < len; i++) {
      redisClient.get(keys[i], (err, res) => {
        var oGameData = JSON.parse(res);
        console.log('oGameData : ', oGameData);
        console.log(oGameData.players.length);
        var oGame = new Game(this.redisClient);
        oGame.setGameDataForInit(oGameData, oGameData.gameID);
        //Restart game if in active state
        oModel.games.push({
          id: oGameData.gameID,
          instance: oGame,
        });
      });
      //console.log(keys[i]);
    }
  });

  // initialize websocket Communication

  Communicator = new Communication();
  Communicator.initSockets();

  // start listening on incoming requests
  http.listen(port, function (err) {
    if (err)
      return console.error(process.pid, "error listening on port", port, err);
    console.log(process.pid, "listening on port", port);
  });
}

initServer();
