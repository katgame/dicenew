$(document).ready(function () {
    loadComponents();
    loadScripts();
});

function loadComponents() {
    $("#section-login").load("../components/sections/login/login.html");
    $("#section-header").load("../components/layout/header.html");
    $("#gameroom").load("../components/game/game-room.html");
    $("#section-dashboard").load("../components/sections/dashboard/dashboard.html");
    $("#game-3-dice-lobby").load("../components/game/lobby.html");
    $("#game-3-dice-start-game").load("../components/game/start-game.html");
    $("#game-3-dice-join-room").load("../components/game/join-room.html");
    // 2 Dice
    $("#schools-2-dice").load("../components/sections/schools/2-dice/component.html");
    hideComponents();
}

function loadScripts() {
    $.getScript("../js/frontendlogic.js", function () {
        console.log("Script loaded and executed.");
    });
    // load app.js
    $.getScript("../js/app.js", function () {
        console.log("Script loaded and executed.");
    });
}

function hideComponents() {
    // hide a#dashboard
    $("#section-dashboard").hide();
    // hide game-3-dice-lobby
    $("#game-3-dice-lobby").hide();

}