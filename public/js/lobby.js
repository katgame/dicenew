var lobby = function (bAdmin, players, GameRoom) {
    var _bAdmin = bAdmin;
    console.log("This player data is ", bAdmin);
    var _html = $('<div class="flex flex-col items-center bg-zinc-800 text-zinc-100 rounded-lg shadow-lg p-6 space-y-4 w-full max-w-[580px] m-auto"></div>');
    var _header = $('<h2 class="text-2xl font-bold">Game Lobby</h2>');
    var _playerlist = $('<div id="player_list" class="w-full bg-zinc-900 p-4 rounded-lg space-y-2"></div>');
    var _footer = $('<button class="w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg shadow-md transition duration-300 ">Ready</button>');
    var _playerState = false;
    var Evts = new Events();

    var aPlayers = [];

    function initLobby() {
        $(_html).append(_header);
        $(_html).append(_playerlist);
        $(_footer).bind("click", onStartgame);
        if (_bAdmin) {
            roomURL(GameRoom);
            $(_footer).text("Start Game");
            _playerState = true;
        }
        $(_html).append(_footer);
        // Add Players
        createLobby(players);
        console.log($(_html));
    }

    function createLobby(playersParam) {
        for (var i = 0; i < playersParam.length; i++) {
            addPlayer(playersParam[i]);
        }
    }

    function updateLobby(playersParam) {
        console.log("RECEIVED ", playersParam);
        $("#player_list").empty();
        for (var i = 0; i < playersParam.length; i++) {
            addPlayer(playersParam[i]);
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
        _header.after(`<p class="text-sm text-zinc-400"><strong>Game Room Id: </strong> ${url}</p>`);
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
    var _player = $(
        `<div class="flex justify-between items-center bg-zinc-800 text-white py-2 px-4 rounded-lg font-bold">
      <span class="font-medium text-zinc-300">${player.name}</span>
      <span class="text-sm text-zinc-300 text-green-400">${player.state}</span>
    </div>`
    );

    function update(data) {
        console.log("FF DATA :: ", data);
        $(_player).find("span:first").text(data.name);
        $(_player).find("span:last").text(data.state);
        console.log("DOM  :: ", $(_player));
    }

    return {
        getHTML: function () {
            return _player;
        },
        update: update,
    };
};
