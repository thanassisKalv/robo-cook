
var express = require('express');
var app = express();
var path = require('path');
var http = require("http").Server(app);
var io = require("socket.io")(http);
var uuid = require("uuid");

const port = 8080;
const IP = "localhost";

//var connection_string = "mongodb://127.0.0.1:27017/robocook_v01";
//const db = require("monk")(connection_string);
//const collection_players = db.get("PlayersInGame");

var ServerEvent = (function () {
    function ServerEvent() {
    }
    ServerEvent.connected = "connection";
    ServerEvent.disconnected = "disconnect";
    return ServerEvent;
}());

var GameEvent =  (function () {
    function GameEvent() {
    }
    GameEvent.authentication = "authentication:successful";
    GameEvent.drop = "drop";
    return GameEvent;
}());

var PlayerEvent = (function () {
    function PlayerEvent() {
    }
    PlayerEvent.joined = "player:joined";
    PlayerEvent.players = "actors:collection";
    PlayerEvent.quit = "player:left";
    PlayerEvent.assignID = "player:assignID";
    PlayerEvent.newDiceResult = "player:newDiceResult";
    PlayerEvent.gotDiceResult = "player:gotDiceResult";
    PlayerEvent.coordinates = "player:coordinates";
    PlayerEvent.opponentAnswered = "player:opponentAnswered";
    PlayerEvent.playerSynced = "player:playerSynced";
    return PlayerEvent;
}());


// viewed at http://localhost:8080
app.use(express.static('.'))

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

//app.listen(port, IP, () => console.log(`\nRobo-Cook listening on ${IP}:${port}!`))

class GameServer {
 
    constructor() {
        this.gameHasStarted = false;
        this.hasComet = false;
        this.levels = {"discover-recipe":[], "discover-diet":[]};
        this.socketEvents();
    }
    connect (port) {
        http.listen(port, function () {
            console.info("Listening on port " + port);
        });
    };

    socketEvents() {
        var _this = this;
        io.on(ServerEvent.connected, function (socket) {
            _this.attachListeners(socket);
        });

    };

    attachListeners(socket) {
        
        this.addSignOnListener(socket);

        this.addPlayerMoveListener(socket);

        this.addSignOutListener(socket);

        this.addDiceResultListener(socket);

        this.addOpponentConfirmedMove(socket);

        this.addPlayerAnswered(socket);
    };

    addSignOnListener (socket) {
        var _this = this;
        socket.on(GameEvent.authentication, function (playerMessage) {
            if(socket.player){
                console.log("Already awaiting opponent for level: "+playerMessage.level);
                return;
            }
            // inform the new player about the awaiting connected players
            //socket.emit(PlayerEvent.players, _this.getConnectedPlayers(playerMessage.level));

            // create a new player and broadcast it to previously connected players
            var newPlayer = _this.createPlayer(socket, playerMessage);
            socket.emit(PlayerEvent.assignID, newPlayer);

            console.log("Level-"+playerMessage.level + " contains: ");
            console.log(_this.levels[playerMessage.level]);
            
            if(_this.levels[playerMessage.level].length>1){
                var players_in_Level = _this.getConnectedPlayers(playerMessage.level);
                socket.broadcast.emit(PlayerEvent.players, _this.levels );
                socket.emit(PlayerEvent.players, _this.levels );
            }
        });
        
    };

    createPlayer (socket, msg) {
        socket.player = {
            level: msg.level,
            id: uuid()
        };
        //collection_players.insert({playerID:socket.player.id})

        this.levels[msg.level].push(socket.player);
        return socket.player;
    };

    addSignOutListener(socket) {
        var _this = this;
        // Detect if a player has died or has quit the session
        socket.on(ServerEvent.disconnected, () => {
            if (socket.player) {
                socket.broadcast.emit(PlayerEvent.quit, socket.player.id);
                var activePlayers = _this.levels[socket.player.level];
                for (var i = 0; i <  activePlayers.length; i++) {
                    if(activePlayers[i].id == socket.player.id)
                        _this.levels[socket.player.level].splice(i, 1);
                }
                console.log(_this.levels[socket.player.level]);
            }
        });
        }


    addPlayerMoveListener (socket) {
        var _this = this;
        socket.on(PlayerEvent.coordinates, function (playerMoveMessage) {
            if(socket.player){
                playerMoveMessage.playerID = socket.player.id;
                console.log(playerMoveMessage);
                socket.broadcast.emit(PlayerEvent.coordinates, playerMoveMessage );
            }
        });
    };

    addDiceResultListener (socket) {
        var _this = this;
        socket.on(PlayerEvent.newDiceResult, function (diceResult) {
            if(socket.player){
                console.log(diceResult);
                socket.broadcast.emit(PlayerEvent.newDiceResult, diceResult );
                socket.emit(PlayerEvent.gotDiceResult, diceResult );
            }
        });
    };

    addOpponentConfirmedMove(socket){
        var _this = this;
        socket.on(PlayerEvent.playerSynced, function (confirmMessage) {
            if(socket.player){
                console.log(confirmMessage);
                socket.broadcast.emit(PlayerEvent.playerSynced, confirmMessage );
            }
        });
    }

    addPlayerAnswered (socket) {
        var _this = this;
        socket.on(PlayerEvent.opponentAnswered, function (dataAnswer) {
            if(socket.player){
                socket.broadcast.emit(PlayerEvent.opponentAnswered, dataAnswer );
            }
        });
    };

    getConnectedPlayers(level){
        return Object.keys(io.sockets.connected).reduce((acc, socketID) => {
            const player = io.sockets.connected[socketID].player;
            if (player && player.level==level) {
                acc.push(player);
            }
            console.log(acc);
            return acc;
        }, []);
    }
};

var gameSession = new GameServer();
gameSession.connect(port);

