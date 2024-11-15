var oModel = require("../model");
var userService = require("../services/user.service");

class Game {
  sName = "";
  oRedis;
  oGameID;
  oGameModel;
  aPlayers = [];
  oGameRoomID;
  oIO;
  nCurrentPlayer = 0;
  nMaxPlayer;
  oGameData = {};
  nMaxTime = 30;
  nTimerCountdown = this.nMaxTime;
  nTimer;
  winScore = 61;

  //WIN/LOSE/RETRY
  roundResult = "RETRY";

  constructor(redis) {
    this.oRedis = oModel.redisClient;
    this.oIO = oModel.io;
    //console.log(this.oIO,"Socket IO instance >>> in gameroom")
  }

  setGameDataForInit(oGameData, oGameID) {
    console.log(oGameID, "This is good oGameData", oGameData);
    this.oGameData = oGameData;
    this.oGameID = oGameID;
  }

  addPlayer(playerData) {
    console.log("Create Game add player called >>> ", playerData);
    this.oGameData.players.push(playerData);
    this.setGameData(this.oGameData);
  }

  updatePlayerData(id, paramState) {
    for (var i = 0; i < this.oGameData.players.length; i++) {
      if (this.oGameData.players[i].id == id) {
        this.oGameData.players[i].state = paramState;
      }
    }
    this.setGameData(this.oGameData);
  }

  updatePlayerBet(id, bet) {
    this.updatePotTotal(bet);
    for (var i = 0; i < this.oGameData.players.length; i++) {
      if (this.oGameData.players[i].id == id) {
        this.oGameData.players[i].activeRound = bet;
      }
    }
    this.setGameData(this.oGameData);
  }

  updatePotTotal(bet) {
    const wager = this.oGameData.wager;
    if (bet) {
      this.oGameData.total += wager;
    }
  }

  computeNextTurn() {
    console.log("Computing next turn ... ");
    this.nCurrentPlayer++;
    if (this.nCurrentPlayer >= this.nMaxPlayer) {
      this.nCurrentPlayer = 0;
    }
    // if(this.oGameData.gameType === 2) {
    //     this.oGameData.players[this.nCurrentPlayer].currentScore = 0;
    //     this.oGameData.players[this.nCurrentPlayer].roundCount = 1;
    // }

    console.log("this.nCurrentPlayer >> ", this.nCurrentPlayer);
  }

  setPlayerTurn(isRestart) {
    for (var i = 0; i < this.oGameData.players.length; i++) {
      this.oGameData.players[i].turn = "";
    }
    this.oGameData.players[this.nCurrentPlayer].turn = " >> ";
    this.oGameData.currentPlayer =
      this.oGameData.players[this.nCurrentPlayer]._id;
    if (!isRestart) {
      this.oGameData.players[this.nCurrentPlayer].roundCount =
        this.oGameData.players[this.nCurrentPlayer].roundCount + 1;
        

    } else {
      this.oGameData.players[this.nCurrentPlayer].currentScore = 0;
      this.oGameData.players[this.nCurrentPlayer].roundCount = 1;
    }

    this.oIO.to(this.oGameID).emit("playerturn", this.oGameData.players);
  }
  startTurnCountDown() {
    console.log("Starting Countdown Timer... ");
    this.setPlayerTurn(true);
    this.nTimer = setInterval(() => {
      //console.log("Running Timer... ",this.nTimerCountdown)
      this.oIO.to(this.oGameID).emit("turntimer", {
        timer: this.nTimerCountdown,
        playerID: this.oGameData.players[this.nCurrentPlayer].id,
      });
      this.nTimerCountdown--;
      if (this.nTimerCountdown === 0) {
        this.playTurn("");
        //clearInterval(this.nTimer);
      }
    }, 1000);
    //  }
  }

  restartCountDown() {
    console.log("Restart Countdown Timer... ");

    this.setPlayerTurn(false);
    this.nTimerCountdown = this.nMaxTime;
    this.nTimer = setInterval(() => {
      //console.log("Running Timer... ",this.nTimerCountdown)
      this.oIO.to(this.oGameID).emit("turntimer", {
        timer: this.nTimerCountdown,
        playerID: this.oGameData.players[this.nCurrentPlayer].id,
      });
      this.nTimerCountdown--;
      if (this.nTimerCountdown === 0) {
        this.playTurn("");
        //clearInterval(this.nTimer);
      }
    }, 1000);
  }
  computePlayerScore(min, max) {
    // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  validateBets() {
    var gameReady = false;

    this.oGameData.players.forEach((player) => {
      console.log("player info : ", player);
      if (player.roundCount === 1 && player.activeRound === true) {
        gameReady = true;
        this.oGameData.gameState = "ACTIVE";

        //player.roundCount = 0;
        // this.oGameData.players.forEach(element => {
        //     element.roundCount = 0;
        // });
      } else if (
        this.nMaxPlayer < 2 &&
        player.roundCount === 1 &&
        player.activeRound === false
      ) {
        console.log("two player validation failed on betting, start new round");
      }
    });
  }

  playTurn(diceScore) {
    this.nTimerCountdown = this.nMaxTime;
    console.log("playTurn ...  >>");
    clearInterval(this.nTimer);
    if (this.oGameData.gameState === "BETTING") {
      this.validateBets();
      //   this.computeNextTurn();
      //   this.startTurnCountDown();
      //   this.setGameData(this.oGameData);
      //   this.oIO.to(this.oGameID).emit("gameplayupdate", this.oGameData.players);
    } else {
      console.log("diceScore from paly turn : ", diceScore);
      if (this.oGameData.gameType === 3) {
        var roundEnd = this.canCalculateScore();
        if (roundEnd) {
          console.log("round ended");
          console.log(" winner is : ", this.getWinner());
          console.log("Won >>> ");
          this.oGameData.players[this.nCurrentPlayer].currentScore = diceScore;
          this.oGameData.players[this.nCurrentPlayer].Total = diceScore;
          this.oGameData.players[this.nCurrentPlayer].score = eval(
            diceScore.split("+").join("+")
          );
          this.setGameData(this.oGameData);
          //   this.oIO
          //     .to(this.oGameID)
          //     .emit("gameplayupdate", this.oGameData.players);
          this.endGame();
          return;
        } else {
          console.log("Start Next Turn >>> ");

          this.oGameData.players[this.nCurrentPlayer].currentScore = diceScore;
          this.oGameData.players[this.nCurrentPlayer].Total = diceScore;
          this.oGameData.players[this.nCurrentPlayer].score = eval(
            diceScore.split("+").join("+")
          );
          this.setGameData(this.oGameData);
          this.computeNextTurn();
          this.startTurnCountDown();
          this.oIO
            .to(this.oGameID)
            .emit("gameplayupdate", this.oGameData.players);
        }
      } else {
        //Two dice
        if (this.oGameData.gameType === 2) {
          if (diceScore !== "") {
            var game = this.oGameData;
            //check first roll
            var firstRound = false;
            if (this.oGameData.players[this.nCurrentPlayer].roundCount === 1) {
              firstRound = true;
              this.oGameData.players[this.nCurrentPlayer].currentScore =
                diceScore;
            }

            var rolledNumbers = eval(diceScore.split("+").join("+"));
            if (
              this.oGameData.players[this.nCurrentPlayer].currentScore !== 0
            ) {
              var currentRollNumber = eval(
                this.oGameData.players[this.nCurrentPlayer].currentScore
                  .split("+")
                  .join("+")
              );
            } else {
                currentRollNumber = 0;
              return;
            }
            if(currentRollNumber === 0 ) {return; }
            var result = this.validateRoll(
              rolledNumbers,
              firstRound,
              currentRollNumber
            );
            
            if(result === "WIN") {
              
                this.restartCountDown();
                this.resetRound();
            } else if(result === "LOSE") {
               
                this.computeNextTurn();
                this.startTurnCountDown();
                this.oIO
                  .to(this.oGameID)
                  .emit("gameplayupdate", this.oGameData.players);
                  this.oIO
                  .to(this.oGameID)
                  .emit("roundResult", "Please roll dice,new game started");
            } else {
                this.restartCountDown();
            }
          } else {
            this.computeNextTurn();
            this.startTurnCountDown();

            this.oIO
              .to(this.oGameID)
              .emit("roundResult", "Please roll dice, game starting");
          }

          //   this.oIO
          //     .to(this.oGameID)
          //     .emit("gameplayupdate", this.oGameData.players);
        }
      }
    }
  }

  resetRound() {
    this.oGameData.total = 0;
    this.oGameData.gameState = "BETTING";
    this.oGameData.roundResult = "Please place bets, to start new round";
    this.oIO
    .to(this.oGameID)
    .emit("roundResult", this.oGameData.roundResult );
    this.oGameData.players.forEach((player) => {
        player.currentScore = 0;
        player.roundCount = 0;
    })
    this.setGameData(this.oGameData);

    //TODO: CALL API TO UPDATE ACCOUNT

    
    this.computeNextTurn();
    this.startTurnCountDown();

  }
  endGame() {
    this.oIO.to(this.oGameID).emit("GameWon", this.getWinner());
    //     // destry redis key
    //this.oRedis.del(this.oGameID);
    // userService.gameComplete(this.oGameID);
  }

  canCalculateScore() {
    var scoreReady = false;
    this.oGameData.players.forEach((player) => {
      if (player.score > 0) {
        scoreReady = true;
      }
    });
    return scoreReady;
  }
  getWinner() {
    return this.oGameData.players.reduce((maxUser, user) =>
      user.score > maxUser.score ? user : maxUser
    );
  }

  checkWin() {
    var highestNumber = 0;
    for (var i = 0; i < this.oGameData.players.length; i++) {
      highestNumber = this.oGameData.players[i].score;
      if (this.oGameData.players[i].score >= this.winScore) {
        return this.oGameData.players[i].id;
      }
    }
    return "next turn";
  }

  getRoomID() {
    return this.oGameData.gameRoom;
  }

  createGame(gameID) {
    this.oGameID = gameID;
    // this.aPlayers.push(playerData)
    this.oGameData = {
      gameID: gameID,
      players: this.aPlayers,
      gameState: "TOSTART", // "ACTIVE" , "ENDED"
      gameRoom: gameID,
      currentPlayer: this.nCurrentPlayer,
      wager: 1000,
      total: 0,
      gameType: 2,
      roundResult: "Please roll",
    };
    this.setGameData(this.oGameData);
  }

  startGame() {
    this.nMaxPlayer = this.oGameData.players.length;
    //this.oGameData.gameState = "ACTIVE"
    this.oGameData.gameState = "BETTING";
    // start player turn timer
    this.computeNextTurn();
    this.startTurnCountDown();
  }

  removePlayer(id) {
    console.log("removePlayer called..", this.oGameData.gameState, id);
    let tempArr = [];
    let removedPlayer;
    for (var i = 0; i < this.oGameData.players.length; i++) {
      if (this.oGameData.players[i].id != id) {
        tempArr.push(this.oGameData.players[i]);
      } else {
        removedPlayer = this.oGameData.players[i];
      }
    }

    console.log("tempArr ", tempArr);
    this.oGameData.players = tempArr;

    this.setGameData();
    if (this.oGameData.gameState == "TOSTART") {
      this.oIO.to(this.oGameID).emit("lobbyupdated", this.oGameData.players);
    } else if (this.oGameData.gameState == "ACTIVE") {
      console.log("ACTIVE State ..", this.oGameData.gameState);
      this.oIO.to(this.oGameID).emit("forceGameEnd", removedPlayer);
      clearInterval(this.nTimer);
      userService.gameComplete(this.oGameID);
    } else {
      console.log("ELSE State ..", this.oGameData.gameState);
    }
  }

  setGameData(obj) {
    var data = JSON.stringify(obj);
    this.oRedis.set(this.oGameID, data, () => {
      //  console.log("Data Set in redis under key",this.oGameID)
    });
  }

  getGameData(callback) {
    // need to get redis data with await
    //console.log(this.oGameID)
    //return this.oGameData

    this.oRedis.get(this.oGameID, (err, res) => {
      //console.log(res)
      var temp = JSON.parse(res);
      console.log(temp);
      callback(temp);
    });
  }

  validateRoll(rolledNumbers, firstRoll, currentRollNumber) {
    if (firstRoll) {
      switch (rolledNumbers) {
        case 2:
          this.oIO
            .to(this.oGameID)
            .emit(
              "roundResult",
              "you lose on first try with 1 and 1 try again"
            );
          return "LOSE";
        case 3:
          this.oIO
            .to(this.oGameID)
            .emit(
              "roundResult",
              "you lose on first try with 2 and 1 try again , new round started place bets"
            );
          return "LOSE";
        case 11:
          this.oIO
            .to(this.oGameID)
            .emit("roundResult", "you win on first try with 11 , new round started place bets");
          return "WIN";
        case 7:
          this.oIO
            .to(this.oGameID)
            .emit("roundResult", "you win on first try with 7, new round started place bets");
          return "WIN";
        default:
          this.oIO
            .to(this.oGameID)
            .emit("roundResult", "Roll " + rolledNumbers + " to win, roll again");
          return "RETRY";
      }
    } else {
      if (rolledNumbers === currentRollNumber) {
        var response =
          "you hit the correct numbers " +
          rolledNumbers +
          " and " +
          currentRollNumber + ", new round started place bets";
        this.oIO.to(this.oGameID).emit("roundResult", response);
        return "WIN";
      } else if (rolledNumbers === 7) {
        this.oIO.to(this.oGameID).emit("roundResult", "You lose by rolling 7, needed : " + rolledNumbers );
        return "LOSE";
      } else {
        this.oIO
          .to(this.oGameID)
          .emit(
            "roundResult",
            "Try again, you need " + currentRollNumber + " to win"
          );
        return "RETRY";
      }
    }
  }
}

module.exports = Game;
