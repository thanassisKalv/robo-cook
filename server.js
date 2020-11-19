
var express = require('express');
var app = express();
var path = require('path');
var http = require("http").Server(app);
var io = require("socket.io")(http);
var uuid = require("uuid");
var fs = require('fs');
const port = 8000;
const IP = "localhost";

const PLAYERS_PER_LEVEL = 3;
const ACTIONS_PER_STEP = 2;
const gameLevels = JSON.parse(fs.readFileSync('gameLevels.json', 'utf8'));

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
    PlayerEvent.getPlayerTurn = "player:getPlayerTurn";
    PlayerEvent.startSynced = "player:startSynced";
    PlayerEvent.diceBonus = "player:diceBonus";
    PlayerEvent.helpMeAnswer = "player:helpMeAnswer";
    PlayerEvent.sendHelp = "player:sendHelp";
    PlayerEvent.updateQuestions = "player:updateQuestions";
    PlayerEvent.levelFull = "PlayerEvent:levelFull";
    PlayerEvent.stepCompleted = "PlayerEvent:stepCompleted";
    PlayerEvent.actionsCompleted = "PlayerEvent:actionsCompleted";
    return PlayerEvent;
}());


// viewed at http://localhost:8080
app.use(express.static('.'))

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});


class GameServer {
 
    constructor() {
        this.gameHasStarted = false;
        this.hasComet = false;
        this.levels = {"discover-recipe":[], "discover-diet":[]};
        this.levelsPlayingNow = {"discover-recipe":1, "discover-diet":1};
        this.syncedPlayersStart = {};
        this.uuidTable = {};
        this.questionsAnswered = {0:[], 1:[], 2:[]};
        this.playerAnsweringSocket = {};
        this.totalQuests = {0:6, 1:10, 2:14};
        this.levelsCurrentStep = {"discover-recipe":0, "discover-diet":0};
        this.levelsActionsCounter = {"discover-recipe":0, "discover-diet":0};
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

        this.addPlayerMovementListener(socket);

        this.addSignOutListener(socket);

        this.addDiceResultListener(socket);

        this.addOpponentConfirmedMove(socket);

        this.addPlayerAnswered(socket);
        
        this.addSyncPlayersTurn(socket);

        this.addStartSynced(socket);

        this.addGetBonusDice(socket);

        this.addHelpMeAnswer(socket);

        this.addHelpSender(socket);

        this.addStepCompleted(socket);
    };

    togglePlayerTurn(level){
       var playersTurn = this.levelsPlayingNow[level];

        playersTurn = playersTurn + 1;
        if(playersTurn>PLAYERS_PER_LEVEL)
            playersTurn = 1;
            
        this.levelsPlayingNow[level] = playersTurn;
    };

    resetPlayerTurn(level){
        this.levelsPlayingNow[level] = 1;
        this.syncedPlayersStart[level] = 0;
        this.levelsCurrentStep[level] = 0;
        this.levelsActionsCounter[level] = 0;
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

            if(_this.levels[playerMessage.level].length == PLAYERS_PER_LEVEL){
                socket.emit(PlayerEvent.levelFull, {});
            }
            else{
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
            }
        });
        
    };

    createPlayer (socket, msg, team) {
        var chooseTeam;
        if (this.levels[msg.level].length % 2 == 0)
            chooseTeam = 1;
        else
            chooseTeam = 2;

        socket.player = {
            level: msg.level,
            team: chooseTeam,
            id: uuid()
        };
        //collection_players.insert({playerID:socket.player.id})
        this.levels[msg.level].push(socket.player);
        if(this.levels[msg.level].length == 1)
            this.syncedPlayersStart[socket.player.level] = 0
            
        if(this.levels[msg.level].length == PLAYERS_PER_LEVEL)
            this.questionsAnswered = {0:[], 1:[], 2:[]};

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
                this.resetPlayerTurn(socket.player.level);
                console.log("PLAYER-QUITED");
            }
        });
     }

    addSyncPlayersTurn(socket){
        var _this = this;
        socket.on(PlayerEvent.getPlayerTurn, function (msg) {
            if(socket.player){
                socket.emit(PlayerEvent.getPlayerTurn, _this.levelsPlayingNow[socket.player.level] );
            }
        });
    }

    addGetBonusDice(socket){
        socket.on(PlayerEvent.diceBonus, function (msg) {
            if(socket.player){
                socket.broadcast.emit(PlayerEvent.diceBonus, msg);
                socket.emit(PlayerEvent.diceBonus, msg);
            }
        });
    }

    addHelpMeAnswer(socket){
        var _this = this;
        socket.on(PlayerEvent.helpMeAnswer, function (msg) {
            if(socket.player){
                _this.playerAnsweringSocket = socket; 
                socket.broadcast.emit(PlayerEvent.helpMeAnswer, msg);
            }
        });
    }

    addHelpSender(socket){
        var _this = this;
        socket.on(PlayerEvent.sendHelp, function(msg){
            if(socket.player){
                console.log(msg);
                _this.playerAnsweringSocket.emit(PlayerEvent.sendHelp, msg);
            }
        })
    }

    addStartSynced(socket){
        var _this = this;
        socket.on(PlayerEvent.startSynced, function (msg) {
            if(socket.player){
                _this.syncedPlayersStart[socket.player.level] ++;

                if(_this.syncedPlayersStart[socket.player.level] == PLAYERS_PER_LEVEL){
                    console.log(_this.syncedPlayersStart[socket.player.level]);
                    socket.broadcast.emit(PlayerEvent.startSynced, "synced");
                    socket.emit(PlayerEvent.startSynced, "synced");
                }
            }
        });
    }

    addPlayerMovementListener (socket) {
        var _this = this;
        socket.on(PlayerEvent.coordinates, function (playerMoveMessage) {
            if(socket.player){
                playerMoveMessage.playerID = socket.player.id;
                console.log(playerMoveMessage);
                socket.broadcast.emit(PlayerEvent.coordinates, playerMoveMessage );

                // the moving player has already the unique token
                _this.uuidTable[playerMoveMessage.uuidToken] = 1;
            }
            if(socket.player)
                _this.togglePlayerTurn(socket.player.level);
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
                _this.uuidTable[confirmMessage.uuidToken]++;
                if(_this.levels[socket.player.level].length == _this.uuidTable[confirmMessage.uuidToken])
                    socket.broadcast.emit(PlayerEvent.playerSynced, confirmMessage );
            }
        });
    }

    addStepCompleted(socket){
        var _this = this;
        socket.on(PlayerEvent.actionsCompleted, function (confirmMessage) {
            if(socket.player){
                _this.levelsActionsCounter[socket.player.level] ++;
                if(_this.levelsActionsCounter[socket.player.level] == ACTIONS_PER_STEP){
                    _this.levelsActionsCounter[socket.player.level] = 0;
                    socket.broadcast.emit(PlayerEvent.stepCompleted, "next-step");
                    socket.emit(PlayerEvent.stepCompleted, "next-step");
                }
            }
        });
    }

    addPlayerAnswered (socket) {
        var _this = this;
        socket.on(PlayerEvent.opponentAnswered, function (dataAnswer) {
            // dataAnswer[correct: Boolean, category: Int, quIndex: Int]
            if(socket.player){
                if(dataAnswer.correct){
                    _this.questionsAnswered[dataAnswer.category].push(dataAnswer.quIndex);
                    // RESET the list when the team has all answered correctly all questions of this category
                    if(_this.questionsAnswered[dataAnswer.category].length == _this.totalQuests[dataAnswer.category])
                        _this.questionsAnswered[dataAnswer.category] = [];
                }
                dataAnswer.updatedQuestions = _this.questionsAnswered;
                socket.broadcast.emit(PlayerEvent.opponentAnswered, dataAnswer);
                socket.emit(PlayerEvent.updateQuestions, dataAnswer.updatedQuestions);
            }
            console.log(_this.questionsAnswered);
        });
    };

    getConnectedPlayers(level){
        return Object.keys(io.sockets.connected).reduce((acc, socketID) => {
            const player = io.sockets.connected[socketID].player;
            if (player && player.level==level) {
                acc.push(player);
            }
            //console.log(acc);
            return acc;
        }, []);
    }
};


console.log(gameLevels.recipeLevels[0].recipe_cook);

var gameSession = new GameServer();
gameSession.connect(port);

