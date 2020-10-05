

roboCook.Game = function (game) {

    //	When a State is added to Phaser it automatically has the following properties set on it, even if they already exist:

    this.game;		//	a reference to the currently running game
    this.add;		//	used to add sprites, text, groups, etc
    this.camera;	//	a reference to the game camera
    this.cache;		//	the game cache
    this.input;		//	the global input manager (you can access this.input.keyboard, this.input.mouse, as well from it)
    this.load;		//	for preloading assets
    this.math;		//	lots of useful common math operations
    this.sound;		//	the sound manager - add a sound, play one, set-up markers, etc
    this.stage;		//	the game stage
    this.time;		//	the clock
    this.tweens;    //  the tween manager
    this.state;	    //	the state manager
    this.world;		//	the game world
    this.particles;	//	the particle manager
    this.physics;	//	the physics manager
    this.rnd;		//	the repeatable random number generator

    //	You can use any of these from any function within this State.
    //	But do consider them as being 'reserved words', 
    //  i.e. don't create a property for your own game called "world" or 
    //  you'll over-write the world reference.

    this.cursor;       // our player
    this.progressBar;
    this.levelsName;   // level's Title
    this.levelsNameTxt;   // level's Title text element

    this.dest;         // where our player is moving to

    this.rotation;     // angle of target with respect to player    
    
    this.textDice;
    this.scoreText;
    this.diceGroup;
    this.total;

    this.diceSum;
    this.player1button;
    this.player2button;

    this.canDragPlayer = false;
    this.playBoard;
    this.dice1play;
    this.dice2play;
    this.badMove;

    this.playersTurnText;
    this.playerStartPos;
    this.player2Pos;
    this.currentTargetTile

    this.soldierTime = 400;
    this.selectedTile;
    this.gameTiles = [];

    this.maxHeightImageQuestion = 2*210;
    this.maxWidthImageQuestion = 2*300;
    
    this.questNum = 0;
    this.ingredients = [];
    this.targetTiles = {};

    this.offsetUI = 360+106;

    this.pathColor = 0x95F985;
    this.endPathColor = 0xbc544b;

    this.endTiles = [];
    
};

var diceGroup;
var total = 0;
var playDice;
var playersTurn=1;
var rollMusic;
var pendingMove = false;
var newDiceResult = false;
var playerMoveLength;
var playerMoving=false;
var opponentMoving=false;

window.socket = io.connect();

roboCook.Game.prototype = {

    init: function(argLevelName, myPlayer) {
        //console.log(myPlayer)
        this.controllingPlayer = myPlayer+1;
        this.levelsName = argLevelName;
    },

    create: function () {
        
        this.mapData =  this.game.cache.getJSON('mapdata');
        this.bg = this.add.sprite(350,0,'bg');
        this.bg.fixedToCamera =true;
        // change the title according to level
        document.title = "Robo-Cook Path - Discover Recipe"
        this.ingredients = ["target-1", "target-2", "target-3", "target-4"];
        this.proteinLogo = this.add.image(150, this.game.height/2+380, "protein-logo");
        this.proteinLogo.scale.setTo(0.3, 0.3);
        this.proteinLogo.anchor.setTo(0.5, 0.5);

        // hide the mouse cursor when it's over the game
        this.game.canvas.onmouseover = function(e) {
            this.style.cursor = "none";
        };
        this.game.canvas.onmouseout = function() {
            this.style.cursor = "default";
        };
        this.game.canvas.style.cursor = "none";

        // limit the fps, prevents physics errors, 1/60 = 60fps
        this.time.deltaCap = 1/30;
        this.playBoard = new Phaser.Rectangle(0, 0, 1175, 974);
        this.time.advancedTiming = true;
        this.stage.disableVisibilityChange = true;

        // This is used to set a game canvas-based offset for the (0, 0, 0) isometric coordinate - by default
        // this point would be at screen coordinates 0, 0 (top left) which is usually undesirable.
        this.game.plugins.add(new Phaser.Plugin.Isometric(this.game));
        this.game.iso.anchor.setTo(0.6, 0.25);
        this.cursorPos = new Phaser.Plugin.Isometric.Point3();

        this.isoGroup = this.game.add.group();
        this.isoChars = this.game.add.group();
        
        this.spawnTiles();
        this.allies = this.game.add.group(this.isoChars);

        // player's cursor
        this.cursor = this.add.sprite(400,300,"player");
        this.cursor.scale.setTo(0.5, 0.5);
        this.cursor.anchor.setTo(0.5, 0.5);
        this.cursor.healthP1 = 1;
        this.cursor.healthP2 = 1;

        this.progressBar1 = this.add.sprite(90, 70, "pixels");
        this.progressBar1.frame = 1;
        this.progressBar1.height = 15;
        this.progressBar1.width = this.cursor.healthP1;
        this.progressBar2 = this.add.sprite(90, 100, "pixels");
        this.progressBar2.frame = 3;
        this.progressBar2.height = 15;
        this.progressBar2.width = this.cursor.healthP2;

        this.cursor.invincible = false;
                                                  
        diceGroup = this.add.group();
        for (var i=0; i < 2; i++) {
            var d = new Dice(this.game, 1110+i*90+this.offsetUI, 190, i);
            diceGroup.add(d);
        }

        this.dice1play = new Phaser.Circle(1120+this.offsetUI, 250, 70);
        this.dice2play = new Phaser.Circle(1210+this.offsetUI, 250, 70);

        this.player1button = this.game.add.sprite( 1120+this.offsetUI, 250, "handPink",);
        this.player2button = this.game.add.sprite( 1210+this.offsetUI, 250, "handBlue");
        this.player1button.anchor.setTo(0.5, 0.5);
        this.player2button.anchor.setTo(0.5, 0.5);
        this.player1button.scale.setTo(0.25, 0.25);
        this.player2button.scale.setTo(0.25, 0.25);
        
        this.playersTurnText = this.add.text(1080+this.offsetUI, 90, "Player #"+playersTurn+" turn", {font: "bold 30px Handlee"})
        this.playersTurnText.fontSize = 30;
        this.playersTurnText.tween = this.add.tween(this.playersTurnText).to({alpha:0.2}, 1500, Phaser.Easing.Bounce.InOut, true, 0, -1);
        this.playersTurnText.addColor('#ff0000', 7);
        this.playersTurnText.addColor('#000000', 9);

        // dices
        this.diceSum = this.add.text(1080+this.offsetUI, 340, "Dice Sum: -");
        this.diceSum.font = "Handlee";
        this.diceSum.fontSize = 30;

        // roll the dice when a mouse button is clicked
        this.input.onDown.add(
            function() {
                if(playDice && pendingMove==false && playerMoving==false && playersTurn==this.controllingPlayer){
                    total=0;
                    rollMusic.play();
                    diceGroup.callAll("roll", null);
                }

            }, this);

        this.input.onDown.add(this.checkTargetTileSelected, this);

        // UI score elements
        this.scoreText = this.add.text(30-15, 25, "Cook's Progress", {font: "bold 30px Handlee"});
        this.scoreHandler = new PlayerScores(this.game);
        this.UiModalsHandler = new UiModalsManager(this.game);

        this.levelsNameTxt = this.add.text(830+this.offsetUI, 50, this.levelsName, {font: "26px Handlee"});

        this.music = this.game.add.audio('bgMusic');
        this.music.loop = true;
        //this.music.play();
        this.music.volume = 0.1;
        this.btn_musicOff = this.add.button(1180+this.offsetUI, 30, 'soundoff', this.muteSound, this);
        this.musicHandle = this.music;
        this.btn_musicOff.input.useHandCursor = true;

        rollMusic = this.game.add.audio('rollDice');
        rollMusic.volume = 1.2;

        // pathfinding with  **EasyStar.js** library
        this.easystar = new EasyStar.js();
        this.easystar.setGrid(this.mapData.tileMap);
        this.easystar.setAcceptableTiles([1,2,3,4,5,6,7,8,9,10,11]);
        this.easystar.enableDiagonals();
        this.boundFound = this.pathFound.bind(this);

        this.kitchenStart = this.game.add.sprite(this.targetTiles["target-1"].x, this.targetTiles["target-1"].y-10, "kitchen-start");
        this.kitchenStart.scale.setTo(0.15);
        this.kitchenStart.anchor.setTo(0.5, 0.5);

        // communication server-client tokens for sockets
        this.uuidSend = uuid();
        this.uuidReceived = uuid();

        // add our robo-cook characters
        this.player1 = new RoboCook(this.game, this.playerStart.x-30, this.playerStart.y, "robots-blue", this.startTile, 'red-mark');
        this.player1.events.onDragStart.add(this.onDragStart, this);
        this.player1.events.onDragStop.add(this.onDragStop, this);
        this.player1.currentTile = this.startTile;
        this.player2 = new RoboCook(this.game, this.playerStart.x+30, this.playerStart.y, "robots-pink", this.startTile, 'blue-mark');
        this.player2.events.onDragStart.add(this.onDragStart, this);
        this.player2.events.onDragStop.add(this.onDragStop, this);
        this.player2.currentTile = this.startTile;

        // score-graphics points-emitter
        this.emitter = this.addPointsEmitter("bubble");

        // follow the 1st player
        this.game.camera.follow(this.player1);

        this.isoGroup.forEach(this.startTiles, this, false);

        diceGroup.forEachAlive(function(dice){
            dice.player1 = this.player1;
            dice.player2 = this.player2;
            dice.playersTurnText = this.playersTurnText;
        }, this);

        var _this = this;
        window.socket.on(PlayerEvent.coordinates, function (playerMove) {
            //console.log(playerMove);
            _this.uuidReceived = playerMove.uuidToken;
            _this.moveOtherPlayer(playerMove);
        });

        window.socket.on(PlayerEvent.newDiceResult, function (diceResult) {
            newDiceResult = true;
            total = diceResult.diceTotal;
            _this.addMarkerScale();
        });

        window.socket.on(PlayerEvent.gotDiceResult, function (diceResult) {
            _this.addMarkerScale();
        });
        
        window.socket.on(PlayerEvent.playerSynced, function (syncData){
            _this.uuidReceived = syncData.uuidToken;

            if(_this.waitingSync){
                console.log(syncData);

                _this.waitingSync = false;
                Swal.close();
                _this.currentTargetTile.questpop.popUpQuestion(_this.currentTargetTile.questNum);
            }
        });

        window.socket.on(PlayerEvent.opponentAnswered, function (data) {
            _this.otherPlayerAnswered(data);
        });
        
        window.socket.on(PlayerEvent.quit, function (playerID) {
            console.log("Your opponent with ID has quitted: " + playerID );
            _this.music.stop();
            _this.state.start('MainMenu');
        });
        
    },
    
    
    update: function () {

        this.game.iso.unproject(this.input.activePointer.position, this.cursorPos);
        // Loop through all tiles and test to see if the 3D position from above intersects with the automatically generated IsoSprite tile bounds.
        this.isoGroup.forEach(this.checkTiles, this, false);
        
        if(newDiceResult) {
            newDiceResult = false;
            pendingMove = true;
            this.endTiles = [];
            const startTile = playersTurn==1? this.player1.currentTile : this.player2.currentTile;
            //this.isoGroup.forEach(t => { t.tint = 0xffffff});
            this.isoGroup.forEach(t => {
                const tile = t;
                this.highlightPaths = highlightPath.bind(this);
                this.easystar.findPath(startTile.Xtable, startTile.Ytable, tile.Xtable, tile.Ytable, this.highlightPaths);
                this.easystar.calculate();
            });
            function highlightPath(path){
                if (path != null && total == path.length-1)
                    this.isoGroup.forEach(t => {
                        const subtile = t;
                        const inPath = path.some(point => point.x == subtile.Xtable && point.y == subtile.Ytable);
                        if (inPath) {
                            subtile.tint = this.pathColor;
                        }
                        if(path[path.length-1].x==subtile.Xtable && path[path.length-1].y==subtile.Ytable){
                            subtile.tint = this.endPathColor;
                            this.game.add.tween(subtile).to({ isoZ: 12 }, 300, Phaser.Easing.Quadratic.InOut, true).yoyo(true, 300);
                            this.endTiles.push(subtile);
                        }
                    });
            }
            this.playersTurnText.setText("Player #"+playersTurn+" turn")
            //console.log(this.endTiles);
        }

        if (this.dice1play.contains(this.input.activePointer.x,this.input.activePointer.y))
            playDice = true;
        else
            playDice = false;
        

        // the cursor follows the mouse
        this.cursor.position.x = this.input.position.x;
        this.cursor.position.y = this.input.position.y;
        
        // update UI elements  -- todo: implement updating function of the progress-badges
        this.diceSum.setText("Dice Sum: " + total);
        this.progressBar1.width = this.cursor.healthP1;
        this.progressBar2.width = this.cursor.healthP2;
        this.game.world.bringToTop(this.cursor);

        if(playersTurn==1)
            this.game.world.bringToTop(this.player1);
        else
            this.game.world.bringToTop(this.player2);
        //calculate new "A-star" paths
        //this.easystar.calculate();
    },

    waitPlayerSync: function(){
        this.waitingSync = true;
        if(playersTurn==1)
            this.UiModalsHandler.waitingModal(2);
        else
            this.UiModalsHandler.waitingModal(1);
           
    },

    // opponent has made a valid position
    moveOtherPlayer: function(playerMove){
        var cargs = {newPos:playerMove.playersTile, dirTile:""};
        this.isoGroup.forEach(this.findDirTile, this, false, cargs);

        if(playerMove.player==1)
            this.movePlayer(this.player1, cargs.dirTile, false);
        if(playerMove.player==2)
            this.movePlayer(this.player2, cargs.dirTile, false);

    },

    addMarkerScale: function(){
        if(playersTurn==1){
            this.player1.markerScale = this.game.add.tween(this.player1.marker.scale).to( { x: 0.18, y: 0.18 }, 400, Phaser.Easing.Quadratic.Out, true).loop(true);
            this.player1.markerScale.yoyo(true, 300);
        }else{
            this.player2.markerScale = this.game.add.tween(this.player2.marker.scale).to( { x: 0.18, y: 0.18 }, 400, Phaser.Easing.Quadratic.Out, true).loop(true);
            this.player2.markerScale.yoyo(true, 300);
        }
    },

    addPointsEmitter: function(pointType){
        var newEmitter = this.add.emitter(this.x, this.y, 2000);
        newEmitter.makeParticles('bubble');
        newEmitter.setRotation(0, 0);
        newEmitter.setAlpha(0.4, 0.9, 2000);
        newEmitter.setScale(1.5, 0.1, 1.5, 0.1, 2000, Phaser.Easing.Quintic.Out);
        newEmitter.particleBringToTop = true;
        return newEmitter;
    },

    findDirTile: function(tile, cargs){
        if(tile.Xtable==cargs.newPos.x && tile.Ytable==cargs.newPos.y){
            cargs.dirTile = tile;
        }
    },

    otherPlayerAnswered: function(data){
        this.waiting_other.destroy();
        pendingMove = false;

        if(playersTurn==1){
            if(data.correct)
                this.scoreHandler.increaseScore_P1(data.category);
            else
                this.scoreHandler.decreaseScore_P1(data.category);
            playersTurn=2
        }
        else{
            if(data.correct)
                this.scoreHandler.increaseScore_P2(data.category);
            else
                this.scoreHandler.decreaseScore_P2(data.category);
            playersTurn=1
        }
    },

    checkTargetTileSelected: function(){
        //console.log(pendingMove,playerMoving);
        if(pendingMove && playerMoving==false && playersTurn==this.controllingPlayer)
            this.endTiles.forEach(clickedTile => {
                var inBounds = clickedTile.isoBounds.containsXY(this.cursorPos.x, this.cursorPos.y);
                if(inBounds){
                    //console.log("End-tile selected!");
                    if(playersTurn==1)
                        this.movePlayer(this.player1, clickedTile, true);
                    else
                        this.movePlayer(this.player2, clickedTile, true);
                }
            });
    },

    movePlayer: function(sprite, targetTile, manually){
        playerMoving = true;
        sprite.moveTween = this.add.tween(sprite).to({x: targetTile.position.x, y: targetTile.position.y}, 900, Phaser.Easing.Sinusoidal.InOut);
        sprite.moveTween.start();
        this.currentTargetTile = targetTile

        if(manually){
            this.uuidSend = uuid();
            console.log(this.uuidSend)
            window.socket.emit(PlayerEvent.coordinates,  { uuidToken: this.uuidSend, player: playersTurn, diceTotal: total, playersTile: {x: targetTile.Xtable, y: targetTile.Ytable}});
        }
        else{
            console.log(this.uuidReceived)
        }

        sprite.moveTween.onComplete.add(function() {
            sprite.currentTile = targetTile;

            if(targetTile.key.includes("path-q")){
                if(manually){
                    if(this.uuidSend==this.uuidReceived)
                        targetTile.questpop.popUpQuestion(targetTile.questNum);
                    else
                        setTimeout( this.waitPlayerSync(), 200)
                }
                else{
                    window.socket.emit(PlayerEvent.playerSynced, {uuidToken: this.uuidReceived});
                    targetTile.questpop.waitOtherPlayer( /* empty-for-now */);
                }

                if(playersTurn==1)
                    targetTile.occupant = this.player1;
                else
                    targetTile.occupant = this.player2;
            }
            else{
                if(targetTile.key.includes("quest"))
                    this.targetTiles[targetTile.ingredient].loadTexture(targetTile.ingredient.replace("target", "progress"))
                if(playersTurn==1){
                    targetTile.occupant = this.player1;
                    playersTurn=2;
                }
                else{
                    targetTile.occupant = this.player2;
                    playersTurn=1;
                }
                pendingMove = false;
            }

            playerMoving = false;
            this.player1.input.draggable = false;
            this.player2.input.draggable = false;
            if (typeof sprite.markerScale !== 'undefined')
                sprite.markerScale.stop();
            sprite.marker.scale.setTo(0.08, 0.08);
            
            this.isoGroup.forEach(t => { t.tint = 0xffffff});
    
        }, this);

    },
    
    onDragStart: function(sprite, pointer) {
        console.log("Move by dragging is deprecated!")
    },
    
    onDragStop: function(sprite, pointer) {
        sprite.tween = this.add.tween(sprite).to({x: sprite.currentTile.position.x, y: sprite.currentTile.position.y}, 300, Phaser.Easing.Sinusoidal.InOut);
        sprite.tween.start();
    },

    findStopTile: function(tile, args){
        var inBounds = tile.isoBounds.containsXY(this.cursorPos.x, this.cursorPos.y);
        if(inBounds){
            //console.log(this.cursorPos.x, this.cursorPos.y);
            args.retTile = tile;
        }
    },

    checkTiles: function(tile) {
		var inBounds = tile.isoBounds.containsXY(this.cursorPos.x, this.cursorPos.y);
        // If it does, do a little animation and tint change.
        if (!tile.selected && inBounds) {
            //console.log(tile.key);
            tile.selected = true;
            if(tile.tint != this.pathColor && tile.tint != this.endPathColor)
                tile.tint = 0x86bfda;
            this.game.add.tween(tile).to({ isoZ: 10 }, 200, Phaser.Easing.Quadratic.InOut, true);
            if (tile.occupant)
                this.game.add.tween(tile.occupant).to({ isoZ: 10 }, 200, Phaser.Easing.Quadratic.InOut, true);

        	this.selectedTile = tile;
        }
        // If not, revert back to how it was.
        else if (tile.selected && !inBounds) {
            tile.selected = false;
            if(tile.tint != this.pathColor && tile.tint != this.endPathColor)
                tile.tint = 0xffffff;
            this.game.add.tween(tile).to({ isoZ: 0 }, 200, Phaser.Easing.Quadratic.InOut, true);
            if (tile.occupant)
                this.game.add.tween(tile.occupant).to({ isoZ: 0 }, 200, Phaser.Easing.Quadratic.InOut, true);
        }

        if(tile.key.includes("path-q"))
            tile.questpop.update();
    },

    startTiles: function(tile) {
        if(tile.key=="quest"){
            var zetTween = this.game.add.tween(tile).to({ isoZ: 32 }, 250, Phaser.Easing.Quadratic.InOut, true);
            zetTween.yoyo(true, 700);
            var scaletween = this.game.add.tween(tile.scale).to( { x: 1.55, y: 1.55 }, 200, Phaser.Easing.Quadratic.Out, true);
            scaletween.yoyo(true, 700);
        }
    },
    
    pathFound: function(path) {
        if (path === null) {
	        console.log("Path was not found.");
	    } else {
            console.log("Path was found. The first Point is " + path[0].x + " " + path[0].y);
            console.log(path.length-1);
            playerMoveLength = path.length-1;
	        this.playerPath = [];
	        var curPoint;
	        for(var i = 0; i < path.length; i++) {
	        	curPoint = this.gameTiles[path[i].y][path[i].x];
	        	this.playerPath.push( { x: curPoint.isoX, y: curPoint.isoY } )
	        }
	    }
    },

    getPlayerPosition: function() {
        return this.cursor.position;
    },

    muteSound: function(){
        if (this.musicHandle.mute == false)
            this.musicHandle.mute = true;
        else
            this.musicHandle.mute = false;
    },

    restart: function() {
        this.state.start(this.state.current);
    },


    spawnTiles: function() {

  		var size = 50;
  		var map_width = this.mapData.tileMap[0].length - 1;
  		var map_height = this.mapData.tileMap.length - 1;

        var i = 0, tile;
        var cc = 5;
        for (var y = 0; y <= map_height; y ++) {
        	this.gameTiles[ y ] = [];
            for (var x = 0; x <= map_width; x ++) {
                
                var tileNumber =  this.mapData.tileMap[ y ][ x ];
                var tileName = this.mapData.tileNames[tileNumber];

                tile = this.game.add.isoSprite(x*size, y*size, 0, tileName, 0, this.isoGroup);
                tile.scale.setTo(1.1, 1.1);
                tile.anchor.set(0.5, 0);
                tile.Xtable = x;
                tile.Ytable = y;
                tile.occupant = null;

                if(tileName == "quest"){
                    tile.questpop = new QuestPopUp(this, tile.position.x, tile.position.y);
                    tile.ingredient = this.ingredients.shift();
                }
                if(tileName == "path-simple"){
                    tile.alpha = 0.55;
                    tile.scale.setTo(0.75, 0.75);
                }
                if(tileName.includes("path-q")){
                    tile.scale.setTo(0.75, 0.75);
                    tile.alpha = 0.85;
                    tile.questNum = parseInt(tileName[tileName.length-1])-1;
                    tile.questpop = new QuestPopUp(this, tile.position.x, tile.position.y);
                }
                if(tileName == "target-1"){
                    this.playerStart = {x: tile.position.x, y: tile.position.y}
                    this.startTile = tile;
                }
                if(tileName.includes("target-")){
                    this.targetTiles[tileName] = tile;
                }
                /* todo -- Think about using elevated "target-tiles" like -> tile.isoZ = 64;*/
                this.gameTiles[y][x] = tile;
            }
        }
    }
};
