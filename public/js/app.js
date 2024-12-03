// Declare GAME as a global variable
let GAME;
// jQuery ready function
$(document).ready(function () {
    // Initialize GAME and constants
    loadConstants();
    // Load event listeners
    loadEventListeners();


});

function loadConstants() {
    // Define constants
    GAME = {
        buttons: {
            play3Dice: document.getElementById("btn-play-3-dice"),
            rules3Dice: document.getElementById("btn-rules-3-dice"),
            createRoom3Dice: document.getElementById("creategame"),
            play2Dice: document.getElementById("btn-play-2-dice"),
            rules2Dice: document.getElementById("btn-rules-2-dice"),
            closeJoinRoom: document.getElementById("close-join-room"),


        },
        sections: {
            login: document.getElementById("section-logn"),
            dashboard: document.getElementById("section-dashboard"),
            schools: document.getElementById("section-schools"),
            twoDice: document.getElementById("section-2-dice"),
            threeDice: document.getElementById("section-3-dice"),
            schools: document.getElementById("section-schools"),
            joinRoomControls: document.getElementById("joinroomcontrols"),
            // Game
            game: document.getElementById("section-game"),
            dice3Game: document.getElementById("section-dice-3-game"),
            // 3 dice
            school3Dice: document.getElementById("section-schools-3-dice"),
            game3DiceLobby: document.getElementById("game-3-dice-lobby"),
            game3DiceStartGame: document.getElementById("game-3-dice-start-game"),
            game3DiceJoinRoom: document.getElementById("game-3-dice-join-room"),
        
            // 2 dice
            school2Dice: document.getElementById("section-schools-2-dice"),
            
        },
        actions:   {
            // hide a section
            hideSection: function(section) {
                if (GAME.sections[section]) {
                    GAME.sections[section].style.display = "none";
                }
            },
            //  hide all sections
            hideAllSections: function() {
                for (const section in GAME.sections) {
                    if (GAME.sections[section]) {
                        GAME.sections[section].style.display = "none";
                    }
                }
            },
            //  show a section
            showSection: function(section) {
                if (GAME.sections[section]) {
                    GAME.sections[section].style.display = "block";
                }   
            }
        }
    };
}

function loadEventListeners() {
    // load  Game event listeners
    loadGameEvents();
    // load Section event listeners
    
}

function loadGameEvents() {
    // Check if GAME and its buttons are defined
    if (!GAME || !GAME.buttons) {
        console.error("GAME or GAME.buttons is not initialized");
        return;
    }

    GAME.buttons.play3Dice?.addEventListener("click", function () {
        console.log("Play 3 Dice clicked");
        // Show the schools section
        GAME.actions.hideAllSections();
        GAME.actions.showSection("schools");
        // GAME.actions.showSection("game3DiceLobby");
        GAME.actions.showSection("school3Dice");
        GAME.actions.showSection("game");
        GAME.actions.showSection("game3DiceStartGame");
        GAME.actions.showSection("dice3Game");
        GAME.actions.showSection("game3DiceJoinRoom");

    });

    GAME.buttons.rules3Dice?.addEventListener("click", function () {
        console.log("Rules 3 Dice clicked");
    });

    GAME.buttons.play3Dice?.addEventListener("click", function () {
        console.log("Play 2 Dice clicked");
    });

    GAME.buttons.rules3Dice?.addEventListener("click", function () {
        console.log("Rules 2 Dice clicked");
    });

    GAME.buttons.createRoom3Dice?.addEventListener("click", function () {
        console.log("Create Game clicked");
        GAME.actions.showSection("game3DiceLobby");
    });

    GAME.buttons.join?.addEventListener("click", function () {
        console.log("Join Game clicked");
    });

    GAME.buttons.closeJoinRoom?.addEventListener("click", function () {
        console.log("Create Game clicked");
        GAME.actions.hideSection("game3DiceJoinRoom");
    });

    GAME.buttons.start?.addEventListener("click", function () {
        console.log("Start Game clicked");
    });

    GAME.buttons.leave?.addEventListener("click", function () {
        console.log("Leave Game clicked");
    });

    GAME.buttons.reset?.addEventListener("click", function () {
        console.log("Reset Game clicked");
    });

    GAME.buttons.submit?.addEventListener("click", function () {
        console.log("Submit Answer clicked");
    });

    GAME.buttons.next?.addEventListener("click", function () {
        console.log("Next Question clicked");
    });

    //  Hide all sections
    GAME.actions.hideAllSections();
    // Show Dashboard section
    // GAME.actions.showSection("dashboard");
} 
