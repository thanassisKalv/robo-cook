"use strict";

var GameEvent =  (function () {
    function GameEvent() {
    }
    GameEvent.authentication = "authentication:successful";
    GameEvent.drop = "drop";
    return GameEvent;
}());


var ServerEvent = (function () {
    function ServerEvent() {
    }
    ServerEvent.connected = "connection";
    ServerEvent.disconnected = "disconnect";
    return ServerEvent;
}());

var PlayerEvent = (function () {
    function PlayerEvent() {
    }
    PlayerEvent.joined = "player:joined";
    PlayerEvent.players = "actors:collection";
    PlayerEvent.quit = "player:left";
    PlayerEvent.newDiceResult = "player:newDiceResult";
    PlayerEvent.gotDiceResult = "player:gotDiceResult";
    PlayerEvent.coordinates = "player:coordinates";
    PlayerEvent.playerSynced = "player:playerSynced";
    PlayerEvent.assignID = "player:assignID";
    PlayerEvent.opponentAnswered = "player:opponentAnswered";
    PlayerEvent.getPlayerTurn = "player:getPlayerTurn";
    PlayerEvent.startSynced = "player:startSynced";
    PlayerEvent.diceBonus = "player:diceBonus";
    PlayerEvent.helpMeAnswer = "player:helpMeAnswer";
    PlayerEvent.sendHelp = "player:sendHelp";
    return PlayerEvent;
}());
