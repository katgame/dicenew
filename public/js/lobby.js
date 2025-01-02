var lobby = function (bAdmin, players, GameRoom) {
  var _bAdmin = bAdmin;
  console.log("This player data is ", bAdmin);
  var _html = $("<div></div>");
  var _header = $(`<h2 class="text-xl mb-3 font-extrabold text-yellow-300 text-shadow">Game lobby</h2>`);
  var _playerlist = $('<div id="player_list" class="h-[22vh] w-[40vw] text-xs mt-4"></div>');
  var _footer = $(`
    <button class="bg-zinc-800 border border-zinc-800 w-8 h-8 rounded-full flex items-center justify-center relative">
    <svg height="60%" width="60%" fill="#ffffff" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 66.459 66.46" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path d="M65.542,11.777L33.467,0.037c-0.133-0.049-0.283-0.049-0.42,0L0.916,11.748c-0.242,0.088-0.402,0.32-0.402,0.576 l0.09,40.484c0,0.25,0.152,0.475,0.385,0.566l31.047,12.399v0.072c0,0.203,0.102,0.393,0.27,0.508 c0.168,0.111,0.379,0.135,0.57,0.062l0.385-0.154l0.385,0.154c0.072,0.028,0.15,0.045,0.227,0.045c0.121,0,0.24-0.037,0.344-0.105 c0.168-0.115,0.27-0.305,0.27-0.508v-0.072l31.047-12.399c0.232-0.093,0.385-0.316,0.385-0.568l0.027-40.453 C65.943,12.095,65.784,11.867,65.542,11.777z M32.035,63.134L3.052,51.562V15.013l28.982,11.572L32.035,63.134L32.035,63.134z M33.259,24.439L4.783,13.066l28.48-10.498l28.735,10.394L33.259,24.439z M63.465,51.562L34.484,63.134V26.585l28.981-11.572 V51.562z M14.478,38.021c0-1.692,1.35-2.528,3.016-1.867c1.665,0.663,3.016,2.573,3.016,4.269 c-0.001,1.692-1.351,2.529-3.017,1.867C15.827,41.626,14.477,39.714,14.478,38.021z M5.998,25.375c0-1.693,1.351-2.529,3.017-1.866 c1.666,0.662,3.016,2.572,3.016,4.267c0,1.695-1.351,2.529-3.017,1.867C7.347,28.979,5.998,27.069,5.998,25.375z M22.959,32.124 c0-1.694,1.351-2.53,3.017-1.867c1.666,0.663,3.016,2.573,3.016,4.267c0,1.695-1.352,2.53-3.017,1.867 C24.309,35.728,22.959,33.818,22.959,32.124z M5.995,43.103c0.001-1.692,1.351-2.529,3.017-1.867 c1.666,0.664,3.016,2.573,3.016,4.269c0,1.694-1.351,2.53-3.017,1.867C7.344,46.709,5.995,44.797,5.995,43.103z M22.957,49.853 c0.001-1.695,1.351-2.529,3.017-1.867s3.016,2.572,3.016,4.269c0,1.692-1.351,2.528-3.017,1.866 C24.306,53.458,22.957,51.546,22.957,49.853z M27.81,12.711c-0.766,1.228-3.209,2.087-5.462,1.917 c-2.253-0.169-3.46-1.301-2.695-2.528c0.765-1.227,3.207-2.085,5.461-1.916C27.365,10.352,28.573,11.484,27.81,12.711z M43.928,13.921c-0.764,1.229-3.208,2.086-5.46,1.917c-2.255-0.169-3.46-1.302-2.696-2.528c0.764-1.229,3.209-2.086,5.462-1.918 C43.485,11.563,44.693,12.695,43.928,13.921z M47.04,42.328c-1.041-1.278-0.764-3.705,0.619-5.421 c1.381-1.716,3.344-2.069,4.381-0.792c1.041,1.276,0.764,3.704-0.617,5.42S48.079,43.604,47.04,42.328z"></path> </g> </g></svg>
                    <span class="absolute -bottom-5 text-zinc-50 text-xs w-[70px]">Start Game</span>
    </button>`
  );
  var _shareButton = $(`
    <button class="bg-zinc-800 border border-zinc-800 w-8 h-8 rounded-full flex items-center justify-center relative">
      <svg height="60%" width="60%" viewBox="0 -0.5 25 25" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M14.734 15.8974L19.22 12.1374C19.3971 11.9927 19.4998 11.7761 19.4998 11.5474C19.4998 11.3187 19.3971 11.1022 19.22 10.9574L14.734 7.19743C14.4947 6.9929 14.1598 6.94275 13.8711 7.06826C13.5824 7.19377 13.3906 7.47295 13.377 7.78743V9.27043C7.079 8.17943 5.5 13.8154 5.5 16.9974C6.961 14.5734 10.747 10.1794 13.377 13.8154V15.3024C13.3888 15.6178 13.5799 15.8987 13.8689 16.0254C14.158 16.1521 14.494 16.1024 14.734 15.8974Z" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
                    <span class="absolute -bottom-5 text-zinc-50 text-xs">Share</span>
    </button>`
  ); 
  var _buttonGroup = $('<div class="flex gap-6 justify-end absolute right-2 bottom-3"></div>');
  
  
  // Share button
  var _playerState = false;
  var Evts = new Events();

  var aPlayers = [];

  function initLobby() {
    $(_html).append(_header);
    $(_html).append(_playerlist);
    // $(_html).append(_shareButton);
    $(_footer).bind("click", onStartgame);
    if (_bAdmin) {
      roomURL(GameRoom);
      // $(_footer).text("Start Game");
      _playerState = true;
    }
    $(_shareButton).bind("click", onShareRoom); // Bind the share button click event
    
    _buttonGroup.append(_footer);
    _buttonGroup.append(_shareButton);
    $(_html).append(_buttonGroup);

    //addPlayer(all,id)
    createLobby(players);
    console.log($(_html));
  }

  function createLobby(playersParam) {
    for (var i = 0; i < playersParam.length; i++) {
      addPlayer(playersParam[i]);
    }
  }
  function onShareRoom() {
      if (navigator.share) {
          navigator.share({
              title: 'Join the Game Room!',
              text: `Join my game room with ID: ${GameRoom}`,
              url: window.location.href // Current page URL
          }).then(() => {
              console.log('Room shared successfully!');
          }).catch(error => {
              console.error('Error sharing room:', error);
          });
      } else {
          alert('Sharing not supported in this browser.');
      }
  }
  function updateLobby(playersParam) {
    console.log("RECEIVED ", playersParam);
    $("#player_list").empty();
    for (var i = 0; i < playersParam.length; i++) {
      addPlayer(playersParam[i]);
    }
    // for(var i=0;i<playersParam.length;i++){
    //     var player = getPlayerInstance(playersParam[i].id);
    //     player.update(playersParam[i]);
    // }
  }

  function getPlayerInstance(id) {
    for (var i = 0; i < aPlayers.length; i++) {
      if (aPlayers[i].id == id) {
        return aPlayers[i].player;
      }
    }
  }

  function onStartgame() {
    if (_bAdmin) {
      Evts.dispatchEvent("ON_START_GAME");
    } else {
      Evts.dispatchEvent("ON_DISPATCH_STATE");
    }
  }

  function addPlayer(data) {
    var oPlayer = new lobbyPlayer(data);
    aPlayers.push({
      id: data.id,
      player: oPlayer,
    });
    $(_playerlist).append(oPlayer.getHTML());
  }
  function roomURL(url) {
    _header.after(
      `<p class="mb-3"><span><strong class="text-yellow-300">Room Id: </strong> </span><span> ${url}</span></p>`
    );
  }
  initLobby();
  return {
    getHTML: function () {
      console.log(_html);
      return _html;
    },
    Evts: Evts,
    roomURL: roomURL,
    addPlayer: addPlayer,
    updateLobby: updateLobby,
  };
};

var lobbyPlayer = function (player) {
  var _player = $(`<div class="text-xs text-zinc-200 flex justify-between bg-zinc-700 rounded-lg px-2 py-1 border border-zinc-600 w-[50%] "> <span>${player.name}</span> <span class="text-green-300"> ${player.state} </span> </div>`);

  function update(data) {
    console.log("FF DATA :: ", data);
    $(_player).text(data.name + ": " + data.state);
    console.log("DOM  :: ", $(_player));
  }

  return {
    getHTML: function () {
      return _player;
    },
    update: update,
  };
};
