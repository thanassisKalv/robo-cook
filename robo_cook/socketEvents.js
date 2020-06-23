"use strict";

var GameEvent = /** @class */ (function () {
    function GameEvent() {
    }
    GameEvent.authentication = "authentication:successful";
    GameEvent.drop = "drop";
    return GameEvent;
}());

var CometEvent = /** @class */ (function () {
    function CometEvent() {
    }
    CometEvent.create = "comet:create";
    CometEvent.destroy = "comet:destroy";
    CometEvent.hit = "comet:hit";
    CometEvent.coordinates = "comet:coordinates";
    return CometEvent;
}());

var ServerEvent = /** @class */ (function () {
    function ServerEvent() {
    }
    ServerEvent.connected = "connection";
    ServerEvent.disconnected = "disconnect";
    return ServerEvent;
}());

var PlayerEvent = /** @class */ (function () {
    function PlayerEvent() {
    }
    PlayerEvent.joined = "player:joined";
    PlayerEvent.protagonist = "player:protagonist";
    PlayerEvent.players = "actors:collection";
    PlayerEvent.quit = "player:left";
    PlayerEvent.pickup = "player:pickup";
    PlayerEvent.newDiceResult = "player:newDiceResult";
    PlayerEvent.hit = "player:hit";
    PlayerEvent.coordinates = "player:coordinates";
    PlayerEvent.assignID = "player:assignID";
    PlayerEvent.opponentAnswered = "player:opponentAnswered";
    return PlayerEvent;
}());
