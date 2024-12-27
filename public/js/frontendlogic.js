(function (app) {
  var socket;
  var myID;
  var GameRoom;
  var oLobby;
  var myState = "idle";
  var oGamePlay;
  var iframe;
  var _myID;
  var schools;
  var baseAPIUrl = "https://localhost:44382/";

  ("use strict");
  window.addEventListener(
    "load",
    function () {
      // Fetch all the forms we want to apply custom Bootstrap validation styles to
      var forms = document.getElementsByClassName("needs-validation");
      iframe = document.getElementById("gameframe");
      swiperWrapper = document.getElementById("swiper-wrapper");

        // Add event listeners to all join-school buttons
        document.addEventListener('click', (event) => {
            if (event.target.classList.contains('join-school-btn')) {
                const price = event.target.getAttribute('data-price');
                onJoinSchool(price);
            }
        });

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
    //   $("#actionButton").bind("click", setGameType);
   
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
          baseAPIUrl +
            "api/Authentication/get-user?userId=" +
            userData.userDetails.id,
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
    $("#dashboard").hide();
    $("#lobby,#gameroom").hide();
    var userData = JSON.parse(sessionStorage.getItem("userData"));
    var jqxhr = $.post(
      baseAPIUrl +
        "api/Authentication/leave-game?userId=" +
        userData.userDetails.id,
      function (data) {
        socket.emit("deletegame", { gameId: GameRoom });
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
      "#start,#dashboard,#joinroomcontrols,#lobby,#gameroom,#logoutBtn,#leaveGameBtn"
    ).hide();
  }

  function loginToApplication() {
    var userName = $("#emailId").val();
    var password = $("#password").val();
    if (!userName || userName.indexOf("@") == -1) {
      return;
    }

    login({
      email: userName,
      password: password,
    });
  }

  function onSetGameType(event) {
    const value = event.target.getAttribute("data-value");
    console.log("Button clicked with value:", value);

    sessionStorage.setItem("gameType", value);
    if (value) {
      loadSchool();
    }
  }

  function onJoinSchool(school) {
    const schoolValue = school;
    console.log("Button clicked with value:", schoolValue);

    sessionStorage.setItem("schoolValue", schoolValue);
    if (schoolValue) {
        
    }
  }

  function selectGameType() {
    if (!userName || userName.indexOf("@") == -1) {
      return;
    }

    login({
      email: userName,
      password: password,
    });
  }

  function loadSchool() {
    try {
      const apiUrl = baseAPIUrl + "api/Dashboard/get-dashboard";
      // Fetch data from the API
      fetch(apiUrl, {
        method: "GET", // Specify the HTTP method
        headers: {
          "Content-Type": "application/json", // Set the content type
        }
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          response.json().then((data) => {
            if (data) {
              data.forEach((slide) => {
                const slideElement = document.createElement("swiper-slide");
                slideElement.innerHTML = `
                  <div class="flex flex-col mx-auto h-[60vh] bg-gray-700 text-white z-30 justify-start p-[5%] bg-blend-multiply rounded-xl border-blue-400 border border-2"
                       style="background-image: url('${slide.image}'); background-size: cover; background-position: center;">
                      <div class="flex flex-col p-6 mx-auto max-w-lg text-center">
                          <h3 class="mb-4 text-2xl font-semibold">${slide.title}</h3>
                          <p class="font-light text-gray-300">${slide.description}</p>
                          <div class="flex justify-center items-baseline my-8">
                              <span class="mr-2 text-5xl font-extrabold">${slide.price}</span>
                              <span class="text-gray-500">/game</span>
                          </div>
                          <ul role="list" class="mb-8 space-y-4 text-left">
                              <li class="flex items-center space-x-3">
                                  <svg class="flex-shrink-0 w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"
                                      xmlns="http://www.w3.org/2000/svg">
                                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                          clip-rule="evenodd"></path>
                                  </svg>
                                  <span>Players online: <span class="font-semibold">508</span></span>
                              </li>
                              <li class="flex items-center space-x-3">
                                  <svg class="flex-shrink-0 w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"
                                      xmlns="http://www.w3.org/2000/svg">
                                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                          clip-rule="evenodd"></path>
                                  </svg>
                                  <span>Max Players per session: <span class="font-semibold">${slide.maxPlayers}</span></span>
                              </li>
                          </ul>
                          <button 
                              class="join-school-btn text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center"  data-price="${slide.price}">
                              Join this school
                          </button>
                      </div>
                  </div>
              `;
                swiperWrapper.appendChild(slideElement);
              });
            }
          });
         
        })
        .then((result) => {
          $("#dashboard").hide();
          $("#school").show();
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    } catch (error) {
      console.error("Error fetching slides:", error);
    }
  }

  function navigateTo(data) {
    console.log("navigate o : ", data);
    $("#loginFormContainer,#leaveGameBtn").hide();
    $("#logoutBtn").show();

    initSocketIO();
    if (data && data.gameState && data.gameState == "lobby") {
      $("#gameroom #scoreboard").remove();
      $("#leaveGameBtn").show();
      //window.location.href = "/components/sections/dashboard/dashboard.html";
      // Load lobby
      myID = data.userUniqueId;

      GameRoom = data.gameId;
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
      //$("#start").show();
      $("#dashboard").show();
    }
  }

  function addButtonEvents() {
    $("#creategame").bind("click", onCreateGame);
    $("#joinroom").bind("click", onJoinRoom);
    $("#joinbutton").bind("click", onJoinButtonClicked);
    $("#rollbutton").bind("click", onRollDice);
    $("#placebet").bind("click", onPlaceBet);
    $("#skip").bind("click", onSkipBet);
    $("#dashboardActionButton").bind("click", onSetGameType);
    $("#joinSchool").bind("click", onJoinSchool);
  }

  // Button Events
  function onJoinButtonClicked() {
    $("#lobby").empty();
    $("#joinroomcontrols").hide();
    $("#leaveGameBtn").show();
    var userData = JSON.parse(sessionStorage.getItem("userData"));

    socket.emit("joingame", {
      all: {
        name: userData.userDetails.email,
        score: 0,
        state: "idle",
        type: "member",
        activeRound: false,
        _id: userData.userDetails.id,
      },
      gameID: $("#roomid").val(),
      _id: userData.userDetails.id,
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
      name: userData.userDetails.email,
      score: 0,
      state: "ready",
      type: "room-admin",
      betStatus: "",
      _id: userData.userDetails.id,
      activeRound: false,
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
    socket.emit("rolldice", {
      gameID: GameRoom,
      clientID: userData.userDetails.id,
    });
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
    const apiUrl = baseAPIUrl + "api/Authentication/login-user";
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
            sessionStorage.setItem("userData", JSON.stringify(data));
          }
          // initSocketIO();
          //window.location.href = "/components/sections/dashboard/dashboard.html";
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

  function getSchools() {
    const apiUrl = baseAPIUrl + "api/Dashboard/get-dashboard";
    console.log("apiUrl:", apiUrl);

    fetch(apiUrl, {
      method: "GET", // Specify the HTTP method
      headers: {
        "Content-Type": "application/json", // Set the content type
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        response.json().then((data) => {
          console.log("promise data schools:", data);
          schools = data;
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
          name: userData.userDetails.email,
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
      console.log("data : ", data);
      console.log("myID : ", myID);
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

    socket.on("requestBetApproval", function (data) {
      console.log("Trigger in requestBetApproval : ", data);

      const { approver, bettor, bet } = data;
      // const approve = confirm(`Player ${bettor} placed a bet of ${bet}. Do you approve?`);
      // console.log("Trigger in requestBetApproval : ", data);
      // Prompt the current player to approve or skip the bet
      // const { approver, bettor, bet } = data;

      // // Example UI logic
      console.log("myID :", myID);
      console.log("approver :", approver);
      if (approver === myID) {
        console.log("approver entered");

        const approve = confirm(
          `Player ${bettor} placed a bet of ${bet}. Do you approve?`
        );
        socket.emit("approveBet", {
          approverID: approver,
          bettorID: bettor,
          approve: approve,
          gameId: GameRoom,
        });
      }
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
        $("#placebet").find("button").prop("disabled", false);
        $("#skip").find("button").prop("disabled", false);
      } else {
        $("#rollbutton").css("pointer-events", "none");
        $("#rollbutton").find("button").prop("disabled", true);
        $("#placebet").find("button").prop("disabled", true);
        $("#skip").find("button").prop("disabled", true);
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
