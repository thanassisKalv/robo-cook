
var express = require('express');
var app = express();
var path = require('path');
var http = require("http").Server(app);
var io = require("socket.io")(http);
var uuid = require("uuid");
var fs = require('fs');
const port = 8080;
const IP = "localhost";

const PLAYERS_PER_LEVEL = 3;
const ACTIONS_PER_STEP = 2;
const gameLevels = JSON.parse(fs.readFileSync('gameLevels.json', 'utf8'));

const {
    MONGO_USERNAME,
    MONGO_PASSWORD,
    MONGO_HOSTNAME,
    MONGO_PORT,
    MONGO_DB
  } = process.env;

var connection_string = "mongodb://127.0.0.1:27017/robocook_teams";
//const connection_string = `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOSTNAME}:${MONGO_PORT}/${MONGO_DB}?authSource=admin`;
const db = require("monk")(connection_string);
const session_stats_db = db.get("SessionStats");


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
    PlayerEvent.subStepsCompleted = "PlayerEvent:subStepsCompleted";
    PlayerEvent.updateRecipeItems = "PlayerEvent:updateRecipeItems";
    PlayerEvent.showAnswer = "PlayerEvent:showAnswer";
    PlayerEvent.revealMusicPlay = "PlayerEvent:revealMusicPlay";
    return PlayerEvent;
}());


// viewed at http://localhost:8080
app.use(express.static('.'))

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/scoreboard-class', function(req, res) {
    res.sendFile(path.join(__dirname + '/scoreboard.html'));
});

class GameServer {
 
    constructor() {
        this.gameHasStarted = false;
        this.hasComet = false;
        this.levels = {"discover-recipe":[[]], "discover-diet":[]};
        this.levelsPlayingNow = {"discover-recipe":[1], "discover-diet":1};
        this.syncedPlayersStart = {};
        this.uuidTable = {};
        this.questionsAnswered = [];
        this.levelsAnsweringSocket = [{}];
        this.totalQuests = {0:13, 1:10, 2:20};
        this.levelsActionsCounter = {"discover-recipe":[0], "discover-diet":0};
        this.levelRecipe = 0;
        this.socketEvents();

        //this.gameSessions = {};
        this.gSession = 0;
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

        this.updateRecipeItems(socket);

        this.addShowAnswerResult(socket);

        this.addRevealMusicPlay(socket);
    };

    togglePlayerTurn(level, session){
        var playersTurn = this.levelsPlayingNow[level][session];

        playersTurn = playersTurn + 1;
        if(playersTurn>PLAYERS_PER_LEVEL)
            playersTurn = 1;

        this.levelsPlayingNow[level][session] = playersTurn;
    };

    //resetPlayerTurn(level){
    //    this.levelsPlayingNow[level] = 1;
        //this.syncedPlayersStart[level] = 0;
      //  this.levelsActionsCounter[level] = 0;
     //   this.levelRecipe = 0;
     //};

    addSignOnListener (socket) {
        var _this = this;
        socket.on(GameEvent.authentication, function (playerMessage) {
            if(socket.player){
                console.log("Already awaiting opponent for level: "+playerMessage.level);
                return;
            }
            // inform the new player about the awaiting connected players
            //socket.emit(PlayerEvent.players, _this.getConnectedPlayers(playerMessage.level));
            if(_this.levels[playerMessage.level][_this.gSession].length == PLAYERS_PER_LEVEL){
                _this.levels[playerMessage.level].push([]);
                _this.levelsPlayingNow[playerMessage.level].push(1);
                _this.levelsActionsCounter[playerMessage.level].push(0);
                _this.levelsAnsweringSocket.push({});
                _this.gSession++;
            }

            // create a new player and send message to her/his session it to previously connected players
            var newPlayer = _this.createPlayer(socket, playerMessage);
            socket.emit(PlayerEvent.assignID, newPlayer);

            console.log("Session-"+newPlayer.session + " has " + _this.levels[playerMessage.level][_this.gSession].length + " players");

            if(_this.levels[playerMessage.level][_this.gSession].length>1){
                var sessionSockets = _this.getSessionPlayers(_this.gSession);
                for(var ix=0; ix<sessionSockets.length; ix++)
                    sessionSockets[ix].emit(PlayerEvent.players, _this.levels[playerMessage.level][_this.gSession] );
            }
        });
    };

    createPlayer (socket, msg) {
        if (this.levels[msg.level][this.gSession].length == 0)
            this.levelRecipe = this.randomIntFromInterval(0,2);

        socket.player = {
            level: msg.level,
            session: this.gSession,
            recipeData: gameLevels.levels[this.levelRecipe],
            id: uuid()
        };

        this.levels[msg.level][this.gSession].push(socket.player);
        if(this.levels[msg.level][this.gSession].length == 1)
            this.syncedPlayersStart[this.gSession] = 0;

        if(this.levels[msg.level][this.gSession].length == PLAYERS_PER_LEVEL){
            var startTime = new Date().getTime() / 1000;
            this.questionsAnswered.push({0:[], 1:[], 2:[], '0R':0, '1R':0, '2R':0,'0W':0, '1W':0, '2W':0, startTime: parseInt(startTime), endTime: ""});
        }

        return socket.player;
    };

    addSignOutListener(socket) {
        var _this = this;
        // Detect if a player has died or has quit the session
        socket.on(ServerEvent.disconnected, () => {
            if (socket.player) {
                var sessionSockets = _this.getSessionPlayers(socket.player.session);
                for(var ix=0; ix<sessionSockets.length; ix++)
                    sessionSockets[ix].emit(PlayerEvent.quit, socket.player.id );
                // stop session's time and save the game-stats into database

                _this.questionsAnswered[socket.player.session].endTime = parseInt(new Date().getTime() / 1000);
                _this.durationInSec(_this.questionsAnswered[socket.player.session]);
                console.log("SESSION " +socket.player.session+ " FINISHED");
                if(_this.questionsAnswered[socket.player.session].sessionEnd != true)
                    session_stats_db.insert( _this.questionsAnswered[socket.player.session]);
                _this.questionsAnswered[socket.player.session].sessionEnd = true;
            }
        });
     }

    addSyncPlayersTurn(socket){
        var _this = this;
        socket.on(PlayerEvent.getPlayerTurn, function (msg) {
            if(socket.player){
                socket.emit(PlayerEvent.getPlayerTurn, _this.levelsPlayingNow[socket.player.level][socket.player.session] );
            }
        });
    }

    addGetBonusDice(socket){
        var _this = this;
        socket.on(PlayerEvent.diceBonus, function (msg) {
            if(socket.player){
                var sessionSockets = _this.getSessionPlayers(socket.player.session);
                for(var ix=0; ix<sessionSockets.length; ix++)
                    sessionSockets[ix].emit(PlayerEvent.diceBonus, msg);

            }
        });
    }

    addHelpMeAnswer(socket){
        var _this = this;
        socket.on(PlayerEvent.helpMeAnswer, function (msg) {
            if(socket.player){
                _this.levelsAnsweringSocket[socket.player.session] = socket;

                var sessionSockets = _this.getSessionPlayers(socket.player.session);
                for(var ix=0; ix<sessionSockets.length; ix++)
                    if(sessionSockets[ix].player.id != socket.player.id)
                        sessionSockets[ix].emit(PlayerEvent.helpMeAnswer, msg );
            }
        });
    }

    addHelpSender(socket){
        var _this = this;
        socket.on(PlayerEvent.sendHelp, function(msg){
            if(socket.player){
                console.log(msg, " session:"+socket.player.session);
                _this.levelsAnsweringSocket[socket.player.session].emit(PlayerEvent.sendHelp, msg);
            }
        })
    }

    addStartSynced(socket){
        var _this = this;
        socket.on(PlayerEvent.startSynced, function (msg) {
            if(socket.player){
                _this.syncedPlayersStart[socket.player.session] ++;

                if(_this.syncedPlayersStart[socket.player.session] == PLAYERS_PER_LEVEL){
                    console.log(socket.player.session+" session begins!");
                    var sessionSockets = _this.getSessionPlayers(socket.player.session);
                    for(var ix=0; ix<sessionSockets.length; ix++)
                        sessionSockets[ix].emit(PlayerEvent.startSynced, "synced");
                    var startTime = new Date().getTime() / 1000;

                }
            }
        });
    }

    addPlayerMovementListener (socket) {
        var _this = this;
        socket.on(PlayerEvent.coordinates, function (moveMsg) {
            if(socket.player){
                moveMsg.playerID = socket.player.id;
                console.log(moveMsg.player+" moves to x:" +moveMsg.playersTile.x+" - y:"+moveMsg.playersTile.y );
                var sessionSockets = _this.getSessionPlayers(socket.player.session);
                for(var ix=0; ix<sessionSockets.length; ix++)
                    if(sessionSockets[ix].player.id != socket.player.id)
                        sessionSockets[ix].emit(PlayerEvent.coordinates, moveMsg );

                // the moving player has ALREADY the unique token
                _this.uuidTable[moveMsg.uuidToken] = 1;
            }
            if(socket.player)
                _this.togglePlayerTurn(socket.player.level, socket.player.session );
        });
    };

    addDiceResultListener (socket) {
        var _this = this;
        socket.on(PlayerEvent.newDiceResult, function (diceResult) {
            if(socket.player){
                console.log(diceResult);
                socket.emit(PlayerEvent.gotDiceResult, diceResult );
                var sessionSockets = _this.getSessionPlayers(socket.player.session);
                for(var ix=0; ix<sessionSockets.length; ix++)
                    if(sessionSockets[ix].player.id != socket.player.id)
                        sessionSockets[ix].emit(PlayerEvent.newDiceResult, diceResult );
            }
        });
    };

    addOpponentConfirmedMove(socket){
        var _this = this;
        socket.on(PlayerEvent.playerSynced, function (confirmMessage) {
            if(socket.player){
                _this.uuidTable[confirmMessage.uuidToken]++;
                var sessionSockets = _this.getSessionPlayers(socket.player.session);
                if(_this.levels[socket.player.level][socket.player.session].length == _this.uuidTable[confirmMessage.uuidToken])
                    for(var ix=0; ix<sessionSockets.length; ix++)
                        if(sessionSockets[ix].player.id != socket.player.id)
                            sessionSockets[ix].emit(PlayerEvent.playerSynced, confirmMessage );
            }
        });
    }

    addShowAnswerResult(socket){
        var _this = this;
        socket.on(PlayerEvent.showAnswer, function (msg) {
            if(socket.player){
                var sessionSockets = _this.getSessionPlayers(socket.player.session);
                for(var ix=0; ix<sessionSockets.length; ix++)
                    if(sessionSockets[ix].player.id != socket.player.id)
                        sessionSockets[ix].emit(PlayerEvent.showAnswer, msg );
            }
        });
    }

    addRevealMusicPlay(socket){
        var _this = this;
        socket.on(PlayerEvent.revealMusicPlay, function (msg) {
            if(socket.player){
                var sessionSockets = _this.getSessionPlayers(socket.player.session);
                for(var ix=0; ix<sessionSockets.length; ix++)
                    if(sessionSockets[ix].player.id != socket.player.id)
                        sessionSockets[ix].emit(PlayerEvent.revealMusicPlay, msg );
            }
        });
    }

    addStepCompleted(socket){
        var _this = this;
        socket.on(PlayerEvent.actionsCompleted, function (confirmMessage) {
            if(socket.player){
                _this.levelsActionsCounter[socket.player.level][socket.player.session] ++;
                var sessionSockets = _this.getSessionPlayers(socket.player.session);
                for(var ix=0; ix<sessionSockets.length; ix++)
                    if(sessionSockets[ix].player.id != socket.player.id)
                        sessionSockets[ix].emit(PlayerEvent.subStepsCompleted, confirmMessage );

                if(_this.levelsActionsCounter[socket.player.level][socket.player.session] == ACTIONS_PER_STEP){
                    _this.levelsActionsCounter[socket.player.level][socket.player.session] = 0;
                    for(var ix=0; ix<sessionSockets.length; ix++)
                        sessionSockets[ix].emit(PlayerEvent.stepCompleted, "next-step");

                }
            }
        });
    }

    
    updateRecipeItems(socket){
        var _this = this;
        socket.on(PlayerEvent.updateRecipeItems, function (msg) {
            if(socket.player){
                var sessionSockets = _this.getSessionPlayers(socket.player.session);
                for(var ix=0; ix<sessionSockets.length; ix++)
                    if(sessionSockets[ix].player.id != socket.player.id)
                        sessionSockets[ix].emit(PlayerEvent.updateRecipeItems, msg );
            }
        });
    }

    addPlayerAnswered (socket) {
        var _this = this;
        socket.on(PlayerEvent.opponentAnswered, function (dataAnswer) {
            // dataAnswer[correct: Boolean, category: Int, quIndex: Int]
            if(socket.player){
                if(dataAnswer.correct){
                    _this.questionsAnswered[socket.player.session][dataAnswer.category].push(dataAnswer.quIndex);
                    // RESET the list when the team has all answered correctly all questions of this category
                    if(_this.questionsAnswered[socket.player.session][dataAnswer.category].length == _this.totalQuests[dataAnswer.category]){
                        _this.questionsAnswered[socket.player.session][dataAnswer.category] = [];
                        _this.questionsAnswered[socket.player.session][dataAnswer.category+"R"]++;
                    }
                }else{
                    _this.questionsAnswered[socket.player.session][dataAnswer.category+"W"]++;
                }
                dataAnswer.updatedQuestions = _this.questionsAnswered[socket.player.session];

                var sessionSockets = _this.getSessionPlayers(socket.player.session);
                for(var ix=0; ix<sessionSockets.length; ix++)
                    if(sessionSockets[ix].player.id != socket.player.id)
                        sessionSockets[ix].emit(PlayerEvent.opponentAnswered, dataAnswer );
                socket.emit(PlayerEvent.updateQuestions, dataAnswer.updatedQuestions);
            }
            console.log("Session "+socket.player.session+" progress:")
            console.log(_this.questionsAnswered[socket.player.session][0],
                        _this.questionsAnswered[socket.player.session][1], 
                        _this.questionsAnswered[socket.player.session][2]);
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

    getSessionPlayers(gsession){
        return Object.keys(io.sockets.connected).reduce((acc, socketID) => {
            const player = io.sockets.connected[socketID].player;
            if (player && player.session==gsession) {
                acc.push(io.sockets.connected[socketID]);
            }
            //console.log(acc);
            return acc;
        }, []);
    }

    randomIntFromInterval(min, max) { // min and max included 
        var randInt = Math.floor(Math.random() * (max - min + 1) + min);
        return randInt;
    };

    durationInSec(sessionStats){
        sessionStats.dur = sessionStats.endTime - sessionStats.startTime;
    }
};


//console.log(gameLevels);

var gameSession = new GameServer();
gameSession.connect(port);

