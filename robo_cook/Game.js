

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
    this.healthBar;
    this.levelName;   // player health
    this.dest;         // where our player is moving to

    this.rotation;     // angle of target with respect to player    
    
    this.monsters;     // monsters group
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

    this.playersTurnText;
    this.playerStartPos;
    this.player2Pos;

    this.soldierTime = 400;
    this.selectedTile;
    this.gameTiles = [];

    this.maxHeightImageQuestion = 450;
    
    this.questNum = 0;
    
};

var diceGroup;
var total = 0;
var playDice;
var playersTurn;
var rollMusic;
var pendingMove = false;

roboCook.Game.prototype = {

    create: function () {

        this.mapData =  this.game.cache.getJSON('mapdata');
        this.bg = this.add.sprite(0,0,'bg');
        this.bg.fixedToCamera =true;
        // change the title according to level
        document.title = "Robo-Cook Path - Seafood Path"

        // hide the mouse cursor when it's over the game
        this.game.canvas.onmouseover = function(e) {
            this.style.cursor = "none";
        };
        this.game.canvas.onmouseout = function() {
            this.style.cursor = "default";
        };
        this.game.canvas.style.cursor = "none";

        // limit the fps, prevents physics errors, 1/60 = 60fps
        this.time.deltaCap = 1/60;
        this.playBoard = new Phaser.Rectangle(0, 0, 1069, 974);
        playersTurn = 1;
        this.time.advancedTiming = true;

        // This is used to set a game canvas-based offset for the (0, 0, 0) isometric coordinate - by default
        // this point would be at screen coordinates 0, 0 (top left) which is usually undesirable.
        this.game.plugins.add(new Phaser.Plugin.Isometric(this.game));
        this.game.iso.anchor.setTo(0.5, 0.2);
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

        this.healthBar1 = this.add.sprite(90, 70, "pixels");
        this.healthBar1.frame = 1;
        this.healthBar1.height = 15;
        this.healthBar1.width = this.cursor.healthP1;
        this.healthBar2 = this.add.sprite(90, 100, "pixels");
        this.healthBar2.frame = 3;
        this.healthBar2.height = 15;
        this.healthBar2.width = this.cursor.healthP2;


        this.cursor.invincible = false;
                                                  
        // enable physics on our player
        this.physics.enable(this.cursor, Phaser.Physics.ARCADE);
        this.cursor.body.allowRotation = false;
        
        diceGroup = this.add.group();
        for (var i=0; i < 2; i++) {
            var d = new Dice(this.game, 1110+i*90, 190, i);
            diceGroup.add(d);
        }

        this.dice1play = new Phaser.Circle(1120, 250, 70);
        this.dice2play = new Phaser.Circle(1210, 250, 70);

        this.player1button = this.game.add.sprite( 1120, 250, "handPink",);
        this.player2button = this.game.add.sprite( 1210, 250, "handBlue");
        this.player1button.anchor.setTo(0.5, 0.5);
        this.player2button.anchor.setTo(0.5, 0.5);
        this.player1button.scale.setTo(0.25, 0.25);
        this.player2button.scale.setTo(0.25, 0.25);
        
        this.playersTurnText = this.add.text(1080, 90, "Player #"+playersTurn+" turn")
        this.playersTurnText.font = "Handlee";
        this.playersTurnText.fontSize = 30;
        this.playersTurnText.tween = this.add.tween(this.playersTurnText).to({alpha:0.2}, 1500, Phaser.Easing.Bounce.InOut, true, 0, -1);
        this.playersTurnText.addColor('#ff0000', 7);
        this.playersTurnText.addColor('#000000', 9);

        // monsters
        this.monsters = new MonsterSpawner(this, 300, 300, 300);
        this.diceSum = this.add.text(1080, 340, "Dice Sum: -");
        this.diceSum.font = "Handlee";
        this.diceSum.fontSize = 30;

        // roll the dice when a mouse button is clicked
        this.input.onDown.add(
            function() {
                if(playDice && pendingMove==false){
                    rollMusic.play();
                    total=0;
                    diceGroup.callAll("roll", null);
                }
            }, this);

        // UI text elements
        this.scoreText = this.add.text(30, 30, "Recipe Progress", {font: "30px Handlee"});
        this.player1text = this.add.text(30, 60, "P1: ", {font: "30px Handlee"});
        this.player2text = this.add.text(30, 90, "P2: ", {font: "30px Handlee"});
        this.levelName = this.add.text(830, 50, "The Seafood Path", {font: "26px Handlee"});

        this.nextSoldierTime = this.game.time.now  + this.soldierTime;

        this.music = this.game.add.audio('bgMusic');
        this.music.loop = true;
        this.music.play();
        this.music.volume = 0.1;
        this.btn_musicOff = this.add.button(1180, 30, 'soundoff', this.muteSound, this);
        this.musicHandle = this.music;
        this.btn_musicOff.input.useHandCursor = true;

        rollMusic = this.game.add.audio('rollDice');
        rollMusic.volume += 10;

        // pathfinding with  **EasyStar.js** library
        this.easystar = new EasyStar.js();
        this.easystar.setGrid(this.mapData.tileMap);
        this.easystar.setAcceptableTiles([1,2,3,4,5,6]);
        this.boundFound = this.pathFound.bind(this);
        this.easystar.findPath(6, 7, 2, 3, this.boundFound);

        // add our robo-cook characters
        this.roboCook1 = this.game.add.sprite(this.playerStart.x-30, this.playerStart.y, "robots-blue", 1);
        this.roboCook1.enableBody = true;
        this.roboCook1.inputEnabled = true;
        this.roboCook1.input.enableDrag(true, false, false, 255, this.playBoard);
        this.roboCook1.physicsBodyType = Phaser.Physics.ARCADE;

        this.roboCook1.events.onDragStart.add(this.onDragStart, this);
        this.roboCook1.events.onDragStop.add(this.onDragStop, this);
        this.roboCook1.input.draggable = false;
        this.roboCook1.anchor.setTo(0.5, 0.5);
        this.roboCook1.scale.setTo(0.35, 0.35);

        this.roboCook2 = this.game.add.sprite(this.playerStart.x+30, this.playerStart.y, "robots-pink", 1);
        this.roboCook2.enableBody = true;
        this.roboCook2.inputEnabled = true;
        this.roboCook2.input.enableDrag(true, false, false, 255, this.playBoard);
        this.roboCook2.input.draggable = false;
        this.roboCook2.physicsBodyType = Phaser.Physics.ARCADE;

        this.roboCook2.events.onDragStart.add(this.onDragStart, this);
        this.roboCook2.events.onDragStop.add(this.onDragStop, this);
        this.roboCook2.anchor.setTo(0.5, 0.5);
        this.roboCook2.scale.setTo(0.35, 0.35);

        this.isoGroup.forEach(this.startTiles, this, false);

        diceGroup.forEachAlive(function(dice){
            dice.player1 = this.roboCook1;
            dice.player2 = this.roboCook2;
            dice.playersTurnText = this.playersTurnText;
        }, this);
    },
    
    update: function () {

        this.game.iso.unproject(this.input.activePointer.position, this.cursorPos);
        // Loop through all tiles and test to see if the 3D position from above intersects with the automatically generated IsoSprite tile bounds.
        this.isoGroup.forEach(this.checkTiles, this, false);
        
        if(this.game.input.activePointer.isDown && this.selectedTile && (this.game.time.now > this.nextSoldierTime)) {
        	if(!this.selectedTile.occupant && this.selectedTile.buyable) {
                    //var human = new Human(this.game, this.selectedTile.isoX, this.selectedTile.isoY);
                   // human.setPath(this.playerPath);       
                   // human.sourceTile = this.selectedTile;
                   // this.allies.add(human);
                   // this.selectedTile.occupant = human;
                   // this.easystar.findPath(this.selectedTile.Xtable, this.selectedTile.Ytable, 2, 3, this.boundFound);
                    // console.log(this.selectedTile);
                   // human.advanceTile();
                   // human.pathFinished.addOnce(this.pathDone, this);
                    
            }else if(this.selectedTile.occupant && this.selectedTile.buyable) {
                this.selectedTile.occupant.destroy();
                this.selectedTile.occupant = false;
                
            }
            this.nextSoldierTime = this.game.time.now + this.soldierTime;
        }

        if (this.dice1play.contains(this.input.activePointer.x,this.input.activePointer.y)){
            playDice = true;
        }else{
            playDice = false;
        }

        // the cursor follows the mouse
        this.cursor.body.velocity.setTo(0,0);
        this.cursor.position.x = this.input.position.x;
        this.cursor.position.y = this.input.position.y;
        //this.physics.arcade.moveToPointer(this.player, 800);
        
        // update UI elements
        this.diceSum.setText("Dice Sum: " + total);
        this.healthBar1.width = this.cursor.healthP1;
        this.healthBar2.width = this.cursor.healthP2;

        // calculate fresh "A-star" paths
        this.easystar.calculate();
    },
    
    onDragStart: function(sprite, pointer) {
        this.playerStartPos = { x: sprite.position.x , y: sprite.position.y};
    },
    
    onDragStop: function(sprite, pointer) {
        cargs = {player: sprite, retTile: null};
        this.isoGroup.forEach(this.findStopTile, this, false, cargs);

        if(cargs.retTile==null || cargs.retTile.key=="empty"){
            // sprite.input.enabled = false;
            sprite.tween = this.add.tween(sprite).to({x:this.playerStartPos.x, y:this.playerStartPos.y}, 300, Phaser.Easing.Sinusoidal.InOut);
            sprite.tween.start();
        }else{
            sprite.position.x = cargs.retTile.position.x;
            sprite.position.y = cargs.retTile.position.y;
            if(cargs.retTile.key.includes("path-q")){
                console.log(cargs.retTile);
                cargs.retTile.questpop.popUpQuestion( cargs.retTile.questNum);
            }

            if(playersTurn==1){
                cargs.retTile.occupant = this.roboCook1;
                playersTurn = 2
            }
            else{
                cargs.retTile.occupant = this.roboCook2;
                playersTurn = 1
            } 
            this.roboCook1.input.draggable = false;
            this.roboCook2.input.draggable = false;
            
            this.playersTurnText.setText("Player #"+playersTurn+" turn")
            pendingMove = false;

        }
    },

    findStopTile: function(tile, args){
        var inBounds = tile.isoBounds.containsXY(this.cursorPos.x, this.cursorPos.y);
        if(inBounds){
            //console.log(args.player);
            //console.log(this.cursorPos.x, this.cursorPos.y);
            console.log(tile);
            args.retTile = tile;
        }
    },

    checkTiles: function(tile) {
		var inBounds = tile.isoBounds.containsXY(this.cursorPos.x, this.cursorPos.y);
        // If it does, do a little animation and tint change.
        if (!tile.selected && inBounds) {
            //console.log(tile.key);
            tile.selected = true;
            tile.tint = 0x86bfda;
            this.game.add.tween(tile).to({ isoZ: 10 }, 200, Phaser.Easing.Quadratic.InOut, true);
            if (tile.occupant)
                this.game.add.tween(tile.occupant).to({ isoZ: 10 }, 200, Phaser.Easing.Quadratic.InOut, true);

        	this.selectedTile = tile;
        }
        // If not, revert back to how it was.
        else if (tile.selected && !inBounds) {
            tile.selected = false;
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
	        this.playerPath = [];
	        var curPoint;
	        for(var i = 0; i < path.length; i++) {
	        	curPoint = this.gameTiles[path[i].y][path[i].x];
	        	this.playerPath.push( { x: curPoint.isoX, y: curPoint.isoY } )
	        }
	    }
    },

    pathDone: function(player){
        //player.sourceTile.questpop.openWindow();
        var questType = player.sourceTile.questNum % 3;
        player.sourceTile.questpop.popUpQuestion(questType);
        //console.log(player.sourceTile);
        console.log("PATH FINISHED!");
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

  		var size = 65;
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
                tile.scale.setTo(1.25, 1.25);
                tile.anchor.set(0.5, 0);
                tile.buyable = (tileNumber == 1) ? true : false;
                tile.Xtable = x;
                tile.Ytable = y;
                tile.occupant = null;

                if(tileName == "quest"){
                    tile.questpop = new QuestPopUp(this, tile.position.x, tile.position.y, "path-q1-info");
                }
                if(tileName == "path-simple"){
                    tile.alpha = 0.35;
                }
                if(tileName.includes("path-q")){
                    tile.alpha = 0.7;
                    tile.questNum = parseInt(tileName[tileName.length-1])-1;
                    tile.questpop = new QuestPopUp(this, tile.position.x, tile.position.y, tileName+"-info");
                }
                if(tileName == "start"){
                    this.playerStart = {x: tile.position.x, y: tile.position.y}
                }

                this.gameTiles[y][x] = tile;
            }
        }
    }
};
