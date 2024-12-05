(function (app) {
  var socket;
  var myID;
  var GameRoom;
  var oLobby;
  var myState = "idle";
  var oGamePlay;
  var iframe;
  var _myID;
  var baseAPIUrl = "https://localhost:44382/";

  ("use strict");
  window.addEventListener(
    "load",
    function () {
      // Fetch all the forms we want to apply custom Bootstrap validation styles to
      var forms = document.getElementsByClassName("needs-validation");
      iframe = document.getElementById("gameframe");
      // Loop over them and prevent submission
      var validation = Array.prototype.filter.call(forms, function (form) {
        form.addEventListener(
          "submit",
          function (event) {
            if (form.checkValidity() === false) {
              event.preventDefault();
              event.stopPropagation();
            }
            form.classList.add("was-validated");
          },
          false
        );
      });
    },
    false
  );

  $(document).ready(function () {
    initApplication();
    $("#loginBtn").bind("click", loginToApplication);
    $("#logoutBtn").bind("click", logOutFromApplication);
    $("#leaveGameBtn").bind("click", leaveGame);

    if (sessionStorage) {
      var userData = JSON.parse(sessionStorage.getItem("userData"));
      if (userData) {
        $("#logoutBtn").show();
        $(
          "#start,#joinroomcontrols,#lobby,#gameroom,#loginFormContainer"
        ).hide();
      } else {
        $("#logoutBtn").hide();
      }
      if (userData) {
        // Get user game details
        //var jqxhr = $.get("/user/" + userData._id, function (data) {
        var jqxhr = $.get(
          baseAPIUrl + "api/Authentication/get-user?userId=" + userData._id,
          function (data) {
            navigateTo(data);
          }
        ).fail(function (err) {
          console.log("Fail data on Lofin: ", err);
          if (err && err.responseText) {
            alert(err.responseText);
          }
        });
      }
    }
  });

  function leaveGame() {
    $("#lobby,#gameroom").hide();
    var userData = JSON.parse(sessionStorage.getItem("userData"));
    var jqxhr = $.post(
      baseAPIUrl + "api/Authentication/leave-game?userId=" + userData._id,
      function (data) {
        // var jqxhr = $.post("/user/leaveGame/" + userData._id, function (data) {
        $("#lobby").empty();
        navigateTo(data);
      }
    ).fail(function (err) {
      console.log("Fail data on Lofin: ", err);
      if (err && err.responseText) {
        alert(err.responseText);
      }
    });
  }

  function logOutFromApplication() {
    if (sessionStorage) {
      sessionStorage.removeItem("userData");
      sessionStorage.removeItem("gameroom");
    }
    $("#loginFormContainer").show();
    $(
      "#start,#joinroomcontrols,#lobby,#gameroom,#logoutBtn,#leaveGameBtn"
    ).hide();
  }

  function loginToApplication() {
    var userName = $("#emailId").val();

    if (!userName || userName.indexOf("@") == -1) {
      return;
    }

    login({
      email: userName,
      password: "@Tester2",
    });

    // var jqxhr = $.post(
    //   "/user/authenticate",
    //   { userName: userName },
    //   function (data) {
    //     console.log("Response data on Successful login: ", data);

    //     if (sessionStorage) {
    //       let sessionData = {
    //         _id: data._id,
    //         userName: data.userName,
    //       };
    //       sessionStorage.setItem("userData", JSON.stringify(sessionData));
    //     }

    //     navigateTo(data);
    //   }
    // ).fail(function (err) {
    //   console.log("Fail data on Lofin: ", err);
    //   if (err && err.responseText) {
    //     alert(err.responseText);
    //   }
    // });
  }

  function navigateTo(data) {
    console.log("navigate o : ", data);
    $("#loginFormContainer,#leaveGameBtn").hide();
    $("#logoutBtn").show();

    initSocketIO();
    if (data && data.gameState && data.gameState == "lobby") {
      $("#gameroom #scoreboard").remove();
      $("#leaveGameBtn").show();
      // Load lobby
      myID = data.userUniqueId;

      GameRoom = data.gameId;

      var userData = JSON.parse(sessionStorage.getItem("userData"));
      socket.emit("getplayerdata", { gameId: GameRoom, userUniqueId: myID });
    } else if (data && data.gameState && data.gameState == "gamePlay") {
      // Load gamePlay
      $("#leaveGameBtn").show();
      $("#gameroom #scoreboard").remove();
      myID = data.userUniqueId;
      GameRoom = data.gameId;

      socket.emit("rejoingameplay", { gameId: GameRoom });
      //socket.emit("getplayerdata",{gameId:GameRoom,userUniqueId:myID});
      // rejoin concept
    } else {
      $("#gameroom #scoreboard").remove();
      $("#start").show();
    }
  }

  function addButtonEvents() {
    $("#creategame").bind("click", onCreateGame);
    $("#joinroom").bind("click", onJoinRoom);
    $("#joinbutton").bind("click", onJoinButtonClicked);
    $("#rollbutton").bind("click", onRollDice);
    $("#placebet").bind("click", onPlaceBet);
    $("#skip").bind("click", onSkipBet);
  }

  // Button Events
  function onJoinButtonClicked() {
    $("#lobby").empty();
    $("#joinroomcontrols").hide();
    $("#leaveGameBtn").show();
    var userData = JSON.parse(sessionStorage.getItem("userData"));

    socket.emit("joingame", {
      all: {
        name: userData.userName,
        score: 0,
        state: "idle",
        type: "member",
        activeRound: "false",
        _id: userData._id,
      },
      gameID: $("#roomid").val(),
      _id: userData._id,
    });
  }

  function onJoinRoom() {
    $("#start").hide();
    $("#joinroomcontrols").show();
  }

  function onCreateGame() {
    $("#start").hide();
    $("#leaveGameBtn").show();
    var userData = JSON.parse(sessionStorage.getItem("userData"));

    socket.emit("creategame", {
      name: userData.userName,
      score: 0,
      state: "ready",
      type: "room-admin",
      _id: userData._id,
      activeRound: "false",
      roundCount: 0,
    });
  }
  function initApplication() {
    //

    addButtonEvents();

    //
    var user = $("#user").text();
    // show join box
    if (user === "") {
      $("#login").show();
      $("#login input").focus();
    } else {
      //rejoin using old session
      $("#logout").show();
      $("#start").show();
      join(user);
    }

    // join on enter
    $("#login input").keydown(function (event) {
      if (event.keyCode == 13) {
        $("#login a").click();
      }
    });

    /*
        When the user joins, hide the join-field, display chat-widget and also call 'join' function that
        initializes Socket.io and the entire app.
        */
    $("#login a").click(function () {
      join($("#login input").val());
    });
  }

  function onRollDice() {
    $("#playertimer").text("0");
    var userData = JSON.parse(sessionStorage.getItem("userData"));
    console.log("userData :", userData);
    socket.emit("rolldice", { gameID: GameRoom, clientID: userData._id });
    //makeDiceCall(GameRoom);
  }

  function onPlaceBet() {
    updateBet(true);
  }

  function updateBet(status) {
    socket.emit("placebet", {
      gameId: GameRoom,
      myID: myID,
      bet: status,
    });
  }

  function onSkipBet() {
    updateBet(false);
  }

  function login(data) {
    const apiUrl =  baseAPIUrl + "api/Authentication/login-user";
    console.log("apiUrl:", apiUrl);

    fetch(apiUrl, {
      method: "POST", // Specify the HTTP method
      headers: {
        "Content-Type": "application/json", // Set the content type
      },
      body: JSON.stringify(data), // Convert the data to JSON string
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        response.json().then((data) => {
          console.log("promise data :", data);
          if (sessionStorage) {
            let sessionData = {
              _id: data.userDetails.id,
              userName: data.userDetails.email,
            };
            sessionStorage.setItem("userData", JSON.stringify(sessionData));
          }

          navigateTo(data);
        });
      })
      .then((result) => {
        // console.log('login result' , result)

        console.log("Success:", result);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  function onGameStart(obj, evtName, data) {
    //oGamePlay = new gameroom();
    console.log("GameRoom", GameRoom);
    //oGamePlay.update();
    $("#leaveGameBtn").show();
    socket.emit("startgame", { gameID: GameRoom });
    $("#rollbutton").find("button").prop("disabled", true);
    //  $("#placebet").find("button").prop("disabled", false);
  }

  function onDispatchState(obj, evtName, data) {
    if (myState == "idle") {
      myState = "ready";
    } else {
      myState = "idle";
    }
    socket.emit("lobbyupdated", {
      gameId: GameRoom,
      myID: myID,
      state: myState,
    });
  }

  function initSocketIO() {
    socket = io.connect("http://localhost:8082/", {
      transports: ["websocket"],
    });

    socket.on("playerdata", function (data) {
      console.log("playerdata  >>>>> :: ", data);
      var userData = JSON.parse(sessionStorage.getItem("userData"));
      socket.emit("rejoingamelobby", {
        all: {
          name: userData.userName,
          score: 0,
          state: data.state,
          type: data.type,
          id: data.id,
        },
        gameID: GameRoom,
      });
    });

    socket.on("forceGameEnd", function (data) {
      if (data.id != myID) {
        location.reload();
      }
      alert(`${data.name} left the game. Game ended.`);
    });

    socket.on("GameWon", function (data) {
      if (data.result === "win") {
        if (myID == data.player.id) {
          $("#winnerResult").text("YOU WON");
        } else {
          $("#winnerResult").text("YOU LOST BUDDY");
        }
      } else {
        if (myID != data.player.id) {
          $("#winnerResult").text("YOU WON");
        } else {
          $("#winnerResult").text("YOU LOST BUDDY");
        }
      }
    });

    socket.on("playerjoined", function (data) {
      console.log("new player joined", data);
      oLobby.addPlayer(data.all, data.gameID);
    });

    socket.on("joinroom", function (playerdata) {
      console.log("oGamePlay : ", oGamePlay);
      console.log(playerdata, "join room");
      all = playerdata.all;
      myID = playerdata.myID;
      GameRoom = playerdata.inroom;

      // get into lobby
      oLobby = new lobby(
        playerdata.isAdmin,
        playerdata.gamedata.players,
        GameRoom
      );
      oLobby.Evts.addEventListener("ON_START_GAME", onGameStart);
      oLobby.Evts.addEventListener("ON_DISPATCH_STATE", onDispatchState);
      $("#lobby").html("");
      $("#lobby").append(oLobby.getHTML()).show();
      console.log(playerdata.gamedata, "complete game data");
    });

    socket.on("lobbyupdated", function (data) {
      console.log("Trigger in updateLobby");
      oLobby.updateLobby(data);
    });

    socket.on("placebet", function (data) {
      console.log("placebet updated, player is ready", data);
      $("#winnerResult").text("Waiting for match results....");
      //   $("#rollbutton").find("button").prop("disabled", false);
      //   $("#placebet").find("button").prop("disabled", true);

      if (data !== null) {
        $("#totalBet").text(data.total);
        if (data.gameState === "ACTIVE") {
          $("#placebet").find("button").prop("disabled", true);
          $("#skip").find("button").prop("disabled", true);
          $("#rollbutton").find("button").prop("disabled", false);
        } else if (data.gameState === "BETTING") {
          $("#placebet").find("button").prop("disabled", false);
          $("#skip").find("button").prop("disabled", false);
          $("#rollbutton").find("button").prop("disabled", true);
        }
      }
    });

    // gameplay sockets

    socket.on("throwdice", function (data) {
      console.log("throwDice  hit from front end js");
    });

    socket.on("rejoingameroom", function (data) {
      // setup rejoin game room
    });

    socket.on("startgame", function (data) {
      sessionStorage.setItem("gameroom", JSON.stringify(GameRoom));
      // show gameplay screen and hide all other screens

      console.log("startgame  hit just for testing");
      $("#totalBet").text("0");
      $("#playertimer").text("0.00");

      $(
        "#start,#joinroomcontrols,#lobby,#gameroom,#loginFormContainer,#lobby"
      ).hide();
      $("#gameroom").show();
      oGamePlay = new gameroom();
      $("#gameroom").prepend(oGamePlay.getHtml()).show();
      $("#dicecanvas").show();
      oGamePlay.create(data);
      iframe.src = "http://localhost:8082/room/" + GameRoom;
      console.log("iframe", iframe.src);
    });

    socket.on("playerturn", function (data) {
      // update the turn of the player and highlights its data in the table
      try {
        oGamePlay.setTurn(data);
      } catch (e) {
        console.log(e);
      }
    });

    socket.on("turntimer", function (data) {
      // as soon as the turn comes of a player and 00:30 sec timer starts ... the time will be displayed through this socket
      // console.log("turn timer",data)
      if (data.playerID == myID) {
        $("#playertimer").text(data.timer);
        $("#rollbutton").css("pointer-events", "all");
        $("#rollbutton").find("button").prop("disabled", false);
      } else {
        $("#rollbutton").css("pointer-events", "none");
        $("#rollbutton").find("button").prop("disabled", true);
      }
    });

    socket.on("gameplayupdate", function (data) {
      // as soon as any change in the scores

      oGamePlay.update(data);
    });

    socket.on("roundResult", function (data) {
      $("#roundResult").text(data);
    });
  }
})((myApp = myApp || {}));

var myApp;
