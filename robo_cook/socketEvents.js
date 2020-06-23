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
    PlayerEvent.coordinates = "player:coordinates";
    PlayerEvent.assignID = "player:assignID";
    PlayerEvent.opponentAnswered = "player:opponentAnswered";
    return PlayerEvent;
}());
