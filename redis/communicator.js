var oModel = require("../model");
var shortid = require("shortid");
var userService = require("../services/user.service");
var diceService = require("../services/dice-api.service");
var Game = require("./creategame");
const https = require("https");
const url = "http://localhost:8082/throwdice/";
const fetch = require("node-fetch");


class Communication {
  io;
  redisClient;
  aGames;
  constructor() {
    // pickup values from Singleton Model class
    this.io = oModel.io;
    this.redisClient = oModel.redisClient;
    this.aGames = oModel.games;
    //console.log(this.redisClient,"From Communicator")
  }

  initSockets() {
    this.io.on("connection", (socket) => {
      console.log("a user connected .");

      //socket.emit('client_id',  socket.id);
      socket.on("getplayerdata", (data) => {
        var oGame = this.findAndGetGame(data.gameId);
        oGame.getGameData((gameData) => {
          var gameData = gameData;
          for (var i = 0; i < gameData.players.length; i++) {
            if (data.userUniqueId == gameData.players[i].id) {
              socket.emit("playerdata", gameData.players[i]);
            }
          }
          this.io.to(data.gameId).emit("lobbyupdated", gameData.players);
      
         // this.io.to(data.gameId).emit("client_id", data.userUniqueId);
        });
      });

      socket.on("lobbyupdated", (data) => {
        var oGame = this.findAndGetGame(data.gameId);
        oGame.updatePlayerData(data.myID, data.state);
        oGame.getGameData((gameData) => {
          this.io.to(data.gameId).emit("lobbyupdated", gameData.players);
        });
      });

      socket.on("client_id", (data) => {
        socket.emit('client_id',  data);
      });

      socket.on("placebet", (data) => {
        var oGame = this.findAndGetGame(data.gameId);
        oGame.updatePlayerBet(data.myID, data.bet);
        oGame.getGameData((gameData) => {
          this.io
            .to(data.gameId)
            .emit("placebet", {
              players: gameData.players,
              total: gameData.total,
              gameState: gameData.gameState,
            });
        });
        console.log("data.gameID.", data.gameID);
        // var oGame = this.findAndGetGame(data.gameID);
        console.log("oGame", oGame);
        oGame.playTurn("");
      });

      socket.on("creategame", (data) => {
        console.log("create new game SSS ", data);
        // add user to DB and create new game instance
        //
        var oGame = new Game(this.redisClient);
        //oGame.setGameData();
        var gameID = shortid.generate();
        data.id = shortid.generate();
        oGame.createGame(gameID);

        data.currentScore = 0;
        data.turn = "";
        //delete data._id
        oGame.addPlayer(data);

        this.aGames.push({
          id: gameID,
          instance: oGame,
        });
        socket.join(gameID);

        oGame.getGameData((gameData) => {
          console.log("-", gameData, "Game Data");

          socket.emit("joinroom", {
            gamedata: gameData,
            all: data,
            inroom: gameID,
            myID: data.id,
            isAdmin: true,
            activeRound: false,
            roundCount: 0,
          });
          //socket.emit('roomcreated', { 'room': gameID })
          socket.to(gameID).emit("playerjoined", data);

          // save gameID, RoomID, PlayerFrontendID in mongoDB per USER
          let userObj = {
            _id: data._id,
            gameId: gameID,
            gameState: "lobby",
            userUniqueId: data.id,
          };
          //userService.updateGameStats(userObj);
          diceService.updateGameStats(userObj);
        });
      });

      socket.on("joingame", (data) => {
        console.log("join new game", data);

        var myID = shortid.generate();
        data.all.id = myID;
        data.all.currentScore = 0;
        data.all.turn = "";
        data.all.activeRound = false;
        data.all.roundCount = 0;

        socket.join(data.gameID);
        //  add player to game data
        var oGame = this.findAndGetGame(data.gameID);
        oGame.addPlayer(data.all);
        //
        oGame.getGameData((gameData) => {
          socket.emit("joinroom", {
            gamedata: gameData,
            all: data.all,
            inroom: data.gameID,
            myID: myID,
            isAdmin: false,
          });
          console.log('data.gameID :', data.gameID )
          socket.to(data.gameID).emit("playerjoined", data);

          let userObj = {
            _id: data._id,
            gameId: data.gameID,
            gameState: "lobby",
            userUniqueId: data.all.id,
          };
         // userService.updateGameStats(userObj);
          diceService.updateGameStats(userObj);
        });

        //
      });

      socket.on("rejoingamelobby", (data) => {
        console.log("rejoin game", data);
        var myID = shortid.generate();
        //data.all.id = myID
        socket.join(data.gameID);
        var oGame = this.findAndGetGame(data.gameID);
        var bAdmin = false;
        console.log(`data.type rejoingamelobby >>>> ${data.all.type}`);
        if (data.all.type == "room-admin") {
          console.log(`IN ata.type rejoingamelobby >>>> ${data.type}`);
          bAdmin = true;
        }
        oGame.getGameData((gameData) => {
          socket.emit("joinroom", {
            gamedata: gameData,
            all: data.all,
            inroom: data.gameID,
            myID: data.all.id,
            isAdmin: bAdmin,
          });
        });
      });

      socket.on("rejoingameplay", (data) => {
        console.log("join game in gameplay", data);
        var oGame = this.findAndGetGame(data.gameId);
        // oGame.startGame();
        // userService.updateGameStatsToGamePlay(data.gameID);

        // this.io.to(data.gameID).emit("startgame",oGame.getGameData().players)
        socket.join(data.gameId);
        oGame.getGameData((gameData) => {
          socket.emit("startgame", gameData.players);
        });
      });

      //

      //gameplay sockets

      socket.on("startgame", (data) => {
        var oGame = this.findAndGetGame(data.gameID);
        oGame.startGame();

        //userService.updateGameStatsToGamePlay(data.gameID);
        diceService.updateGameStatsToGamePlay(data.gameID);

        oGame.getGameData((gameData) => {
          this.io.to(data.gameID).emit("startgame", gameData.players);
        });
      });



      socket.on("rolldice", (data) => {
        var oGame = this.findAndGetGame(data.gameID);
        // var oGame = this.findAndGetGame(data.gameID);
        // oGame.playTurn('');
        console.log("roll dice oGame: ", oGame.oGameData);
        if (oGame.oGameData.gameState === "BETTING") {
          console.log(" cant roll dice, betting still busy");
        } else {
          this.makeDiceCall(data.gameID, data.clientID);
        }
      });

      socket.on("scoreResult", (data) => {
        console.log("scoreResult and ID : ", data);
        var oGame = this.findAndGetGame(data.gameID);
        console.log("oGame from scoreResult : ", oGame);
        console.log("oGame.gameState : ", oGame.gameState);
        // if(oGame.gameState === 'ACTIVE') {
        console.log("gameState entered on active : ");
        var clientId = data.clientId;
        if(oGame.oGameData.currentPlayer === clientId) {
          oGame.playTurn(data.score);
        }
      });

      socket.on("emitdice", (data) => {
        console.log("emitdice hit communication:", data);
      });
      socket.on("disconnect", function () {
        console.log("user disconnected ");
      });
    });
  }

  findAndGetGame(gameID) {
    console.log(this.aGames, gameID, "From FInd");
    for (var i = 0; i < this.aGames.length; i++) {
      if (this.aGames[i].id == gameID) {
        return this.aGames[i].instance;
      }
    }
    return null;
  }

  makeDiceCall(GameRoom, ClientId) {
    console.log("oGame play : ", this.oGamePlay);
    const apiUrl = url + GameRoom + '/' + ClientId;
    console.log("apiUrl:", apiUrl);
  
    // Make a GET request
    fetch(apiUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log(data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
}

 
module.exports = Communication;
