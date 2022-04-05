
var express = require('express');
var app = express();
var path = require('path');
var http = require("http").Server(app);
var io = require("socket.io")(http);
var uuid = require("uuid");
var fs = require('fs');
var nodemailer = require('nodemailer');
const port = 8080;
const IP = "localhost";
require('dotenv').config()

const PLAYERS_PER_LEVEL = 3;
const ACTIONS_PER_STEP = 2;
const levelsIta = JSON.parse(fs.readFileSync('levels-it.json', 'utf8'));
const levelsEng = JSON.parse(fs.readFileSync('levels-en.json', 'utf8'));
const gameLevels = {en:levelsEng, it:levelsIta};

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
const class_codes_db = db.get("ClassPassCodes");
const classes_register_db = db.get("ClassesReg")

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_HOST,
        pass: process.env.EMAIL_PWD
      }
});

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
    GameEvent.scoreRequest = "score:request";
    GameEvent.passcodeRequest = "passcode:request";
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
    PlayerEvent.passcodeFailRepeat = "PlayerEvent:passcodeRepeat";
    PlayerEvent.passcodeCorrect = "PlayerEvent:passcodeCorrect";
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
    res.sendFile(path.join(__dirname + '/langs/index.html'));
});

app.get('/it', function(req, res) {
    res.sendFile(path.join(__dirname + '/it.html'));
});

app.get('/en', function(req, res) {
    res.sendFile(path.join(__dirname + '/en.html'));
});

app.get('/scoreboard-class', function(req, res) {
    res.sendFile(path.join(__dirname + '/scoreboard.html'));
});



class GameServer {
 
    constructor() {

        this.classesRegistered = [];
        this.levels = {"easy-level":[[]], "medium-level":[[]], "hard-level":[[]] };
        this.levelsPlayingNow = {"easy-level":[1], "medium-level":[1], "hard-level":[1]};
        this.syncedPlayersStart = {"easy-level":[], "medium-level":[], "hard-level":[]};
        this.uuidTable = {};
        this.questionsAnswered = {"easy-level":[], "medium-level":[], "hard-level":[]};
        this.levelsAnsweringSocket = {"easy-level":[{}], "medium-level":[{}], "hard-level":[{}]};
        this.totalQuests = {"easy-level":{0:13, 1:10, 2:20}, "medium-level":{0:21, 1:20, 2:20}, "hard-level":{0:20, 1:20, 2:20} };
        this.levelsActionsCounter = {"easy-level":[0], "medium-level":[0], "hard-level":[0]};
        this.levelRecipe = {"easy-level":{}, "medium-level":{}, "hard-level":{}};
        this.socketEvents();

        //this.gameSessions = {};
        this.gSession = {"easy-level":0, "medium-level":0, "hard-level":0 };
        this.gSessionPcodes = {"easy-level":[], "medium-level":[], "hard-level":[] };

        classes_register_db.find({}).then((saved_passcodes) => {
            console.log("Saved passcodes:");
            this.classesRegistered = saved_passcodes;
            saved_passcodes.forEach( function(record){ 
                console.log("code: " + record.classCodePrefix + " - level: " + record.level) 
            } );
        })

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

        this.addScoreRequest(socket);
    };

    togglePlayerTurn(level, session){
        var playersTurn = this.levelsPlayingNow[level][session];

        playersTurn = playersTurn + 1;
        if(playersTurn>PLAYERS_PER_LEVEL)
            playersTurn = 1;

        this.levelsPlayingNow[level][session] = playersTurn;
    };

    addScoreRequest(socket){
        socket.on(GameEvent.scoreRequest , function (msg) {

            session_stats_db.find({}).then((scores) => {
                socket.emit(GameEvent.scoreRequest, scores);
            })
            
        });
    };

    // if(this.classesRegistered.indexOf( passcode.toUpperCase()) < 0 ){
    //     return false;
    // }

    checkAvailableSessions(classroomCode, level){
        var availableSession = -1;
        for (var i=0; i < this.gSessionPcodes[level].length; i++){
            //console.log(i, this.gSessionPcodes[level]);
            if( this.gSessionPcodes[level][i] == classroomCode  &&  this.levels[level][i].length < PLAYERS_PER_LEVEL){
                availableSession = i;
                return availableSession;
            }
        }

        return availableSession;
    }

    addSignOnListener (socket) {
        var _this = this;
        socket.on(GameEvent.authentication, function (playerMessage) {
            if(socket.player){
                console.log("Already awaiting opponent for level: "+playerMessage.level);
                return;
            }

            playerMessage.passcode = "without-pass-code";
            console.log(playerMessage.passcode);

            socket.emit(PlayerEvent.passcodeCorrect, {level: playerMessage.level});

            // var classroomCode = _this.keepClassCodePrefix( playerMessage.passcode );
            var classroomCode = playerMessage.passcode;

            // if this is the first (0) session -> add the classroom passcode
            if( _this.gSessionPcodes[playerMessage.level].length == 0){
                _this.gSessionPcodes[playerMessage.level].push(classroomCode);
            }

            var availableSession = _this.checkAvailableSessions(classroomCode, playerMessage.level);

            if( availableSession == -1 ){
                _this.levels[playerMessage.level].push([]);
                _this.levelsPlayingNow[playerMessage.level].push(1);
                _this.levelsActionsCounter[playerMessage.level].push(0);
                _this.levelsAnsweringSocket[playerMessage.level].push({});
                _this.gSession[playerMessage.level]++;
                _this.gSessionPcodes[playerMessage.level].push(classroomCode);
            }

            // create a new player and send message to her/his session it to previously connected players
            var playerSession = availableSession==-1? _this.gSession[playerMessage.level] : availableSession;
            var newPlayer = _this.createPlayer(socket, playerMessage, playerSession);
            socket.emit(PlayerEvent.assignID, newPlayer);

            console.log("Session-"+newPlayer.session + " has " + _this.levels[playerMessage.level][playerSession].length + " players");

            if(_this.levels[playerMessage.level][playerSession].length>1){
                var sessionSockets = _this.getSessionPlayers( playerSession, playerMessage.level);
                for(var ix=0; ix<sessionSockets.length; ix++)
                    sessionSockets[ix].emit(PlayerEvent.players, _this.levels[playerMessage.level][playerSession] );
            }
        });
    };

    createPlayer (socket, msg, playerSession) {
        if (this.levels[msg.level][playerSession].length == 0)
            this.levelRecipe[msg.level][playerSession] = this.randomIntFromInterval(0, gameLevels[msg.lang].levels.length);

        socket.player = {
            level: msg.level,
            session: playerSession,
            recipeData: gameLevels[msg.lang].levels[this.levelRecipe[msg.level][playerSession]],
            id: uuid()
        };
        //socket.player.recipeData["diffLevel"] = msg.level;

        this.levels[msg.level][playerSession].push(socket.player);
        if(this.levels[msg.level][playerSession].length == 1){
            this.syncedPlayersStart[msg.level][playerSession] = 0;
            this.questionsAnswered[msg.level].push("-");
        }

        if(this.levels[msg.level][playerSession].length == PLAYERS_PER_LEVEL){
            var startTime = new Date().getTime() / 1000;
            this.questionsAnswered[msg.level][playerSession] = 
                    {0:[], 1:[], 2:[], '0R':0, '1R':0, '2R':0, '0W':0, '1W':0, '2W':0, startTime: parseInt(startTime), endTime: "", gLevel: msg.level};
        }

        return socket.player;
    };

    addSignOutListener(socket) {
        var _this = this;
        // Detect if a player has died or has quit the session
        socket.on(ServerEvent.disconnected, () => {
            if (socket.player) {
                var sessionSockets = _this.getSessionPlayers(socket.player.session, socket.player.level);
                for(var ix=0; ix<sessionSockets.length; ix++)
                    sessionSockets[ix].emit(PlayerEvent.quit, socket.player.id );
                console.log("SESSION " +socket.player.session+ " of " + socket.player.level + " FINISHED");
                _this.levels[socket.player.level][socket.player.session] = [0,0,0];

                if (_this.questionsAnswered[socket.player.level][socket.player.session] == "-")
                    return;
                else{  // stop session's time and save the game-stats into database
                    _this.questionsAnswered[socket.player.level][socket.player.session].endTime = parseInt(new Date().getTime() / 1000);
                    _this.durationInSec(_this.questionsAnswered[socket.player.level][socket.player.session]);
                    _this.questionsAnswered[socket.player.level][socket.player.session].passcode = _this.gSessionPcodes[socket.player.level][socket.player.session];
                    
                    if(_this.questionsAnswered[socket.player.level][socket.player.session].sessionEnd != true)
                        session_stats_db.insert( _this.questionsAnswered[socket.player.level][socket.player.session]);
                    _this.questionsAnswered[socket.player.level][socket.player.session].sessionEnd = true;
                }
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
                var sessionSockets = _this.getSessionPlayers(socket.player.session, socket.player.level);
                for(var ix=0; ix<sessionSockets.length; ix++)
                    sessionSockets[ix].emit(PlayerEvent.diceBonus, msg);
            }
        });
    }

    addHelpMeAnswer(socket){
        var _this = this;
        socket.on(PlayerEvent.helpMeAnswer, function (msg) {
            if(socket.player){
                _this.levelsAnsweringSocket[socket.player.level][socket.player.session] = socket;

                var sessionSockets = _this.getSessionPlayers(socket.player.session, socket.player.level);
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
                _this.levelsAnsweringSocket[socket.player.level][socket.player.session].emit(PlayerEvent.sendHelp, msg);
            }
        })
    }

    addStartSynced(socket){
        var _this = this;
        socket.on(PlayerEvent.startSynced, function (msg) {
            if(socket.player){
                _this.syncedPlayersStart[socket.player.level][socket.player.session] ++;

                if(_this.syncedPlayersStart[socket.player.level][socket.player.session] == PLAYERS_PER_LEVEL){
                    console.log(socket.player.session+" session begins!");
                    var sessionSockets = _this.getSessionPlayers(socket.player.session, socket.player.level);
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
                var sessionSockets = _this.getSessionPlayers(socket.player.session, socket.player.level);
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
                var sessionSockets = _this.getSessionPlayers(socket.player.session, socket.player.level);
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
                var sessionSockets = _this.getSessionPlayers(socket.player.session, socket.player.level);
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
                var sessionSockets = _this.getSessionPlayers(socket.player.session, socket.player.level);
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
                var sessionSockets = _this.getSessionPlayers(socket.player.session, socket.player.level);
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
                var sessionSockets = _this.getSessionPlayers(socket.player.session, socket.player.level);
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
                var sessionSockets = _this.getSessionPlayers(socket.player.session, socket.player.level);
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
                    _this.questionsAnswered[socket.player.level][socket.player.session][dataAnswer.category].push(dataAnswer.quIndex);
                    // RESET the list when the team has all answered correctly all questions of this category
                    if(_this.questionsAnswered[socket.player.level][socket.player.session][dataAnswer.category].length == _this.totalQuests[socket.player.level][dataAnswer.category]){
                        _this.questionsAnswered[socket.player.level][socket.player.session][dataAnswer.category] = [];
                        _this.questionsAnswered[socket.player.level][socket.player.session][dataAnswer.category+"R"]++;
                    }
                }else{
                    _this.questionsAnswered[socket.player.level][socket.player.session][dataAnswer.category+"W"]++;
                }
                dataAnswer.updatedQuestions = _this.questionsAnswered[socket.player.level][socket.player.session];

                var sessionSockets = _this.getSessionPlayers(socket.player.session, socket.player.level);
                for(var ix=0; ix<sessionSockets.length; ix++)
                    if(sessionSockets[ix].player.id != socket.player.id)
                        sessionSockets[ix].emit(PlayerEvent.opponentAnswered, dataAnswer );
                socket.emit(PlayerEvent.updateQuestions, dataAnswer.updatedQuestions);
            }
            console.log("Session "+socket.player.session+" of "+ socket.player.level +" progress:")
            console.log(_this.questionsAnswered[socket.player.level][socket.player.session][0],
                        _this.questionsAnswered[socket.player.level][socket.player.session][1], 
                        _this.questionsAnswered[socket.player.level][socket.player.session][2]);
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

    getSessionPlayers(gsession, lvl){
        var acc = [];
        for (const [_, socket] of io.sockets.sockets) {
            const player = socket.player;
            if (player && player.session==gsession && player.level==lvl) {
                acc.push( socket );
            }
          }
          return acc;

    }

    randomIntFromInterval(min, max) { // min and max included 
        var randInt = Math.floor(Math.random() * (max - min + 1) + min);
        return randInt;
    };

    durationInSec(sessionStats){
        sessionStats.dur = sessionStats.endTime - sessionStats.startTime;
    }


};






var gameSession = new GameServer();
gameSession.connect(port);

