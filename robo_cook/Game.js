
var playersTurn = 1;
var teamsTurn = { 1:1, 2:2, 3:1, 4:2};
var questionAwaiting = false;
var numOfPlayers = 3;
var playDice = false;
var total = 0;
var newDiceResult = false;
var pendingMove = false;
var playerMoving = false;
var diceGroup;
var teamsDiceBonus = { 1:0, 2:0};
var rcpItemDropping = false;

function togglePlayerTurn(){
    window.socket.emit(PlayerEvent.getPlayerTurn, {});
}

class GameState extends Phaser.State {
  
  get size() {
    return 36;
  }

  get startPosition() {
    return {
      x: this.size * (11 - 0.5),
      y: this.size * (11 - 0.5),
    };
  }


  preload() {
    this.game.time.advancedTiming = true;
    this.game.debug.renderShadow = false;
    this.game.stage.disableVisibilityChange = true;

    this.game.plugins.add(new Phaser.Plugin.Isometric(this.game));
    this.game.world.setBounds(0, 0, 3048, 3048);
    this.game.iso.anchor.setTo(0.5, 0.5);
  }

  init(argLevelName, myPlayer, belongsTeam) {
    this.game.maxHeightImageQuestion = 2*210;
    this.game.maxWidthImageQuestion = 2*300;
    //console.log(myPlayer)
    this.game.controllingPlayer = myPlayer+1;
    this.levelsName = argLevelName;
    this.myTeam = belongsTeam;
  }

  create() {

    var _this = this;
    this.game.time.desiredFps = 45;
    //this.time.desiredFps = 30;
    document.title = "Robo-Cook Path - Discover Recipe"
    this.ingredients = ["target-1", "target-2-player", "target-3", "target-4-player","target-1", "target-2-player", "target-3", "target-4-player",
                        "target-1", "target-2-player", "target-3", "target-4-player","target-1", "target-2-player", "target-3", "target-4-player"];
    this.targetTiles = [];
    this.pathColor = 0x95F985;
    this.endPathColor = 0xbc544b;

    this.mapData =  this.game.cache.getJSON('mapdata');
    this.game.stepsInstructor = this.mapData.recipe;
    this.game.stepsCook = this.mapData.recipe_cook;
    this.game.stepsShopper = this.mapData.recipe_shopper;

    this.data = this.game.cache.getJSON('questions');
    console.log("qlen",this.data.categories[0].questions.length);
    console.log("qlen",this.data.categories[1].questions.length);
    console.log("qlen",this.data.categories[2].questions.length);
    this.game.questionsAnswered = {0:[], 1:[], 2:[]};

    this.startPositions = [];
    this.boardGameTiles = [];
    this.startingTiles = [];
    this.game.helpClouds = [];
    this.game.playersActive = [];
    this.game.roles = {1:"Instructor", 2: "Shopper", 3: "Cook"};
    this.game.rolesIcon = {1:'badge-chef', 2:'badge-shopper', 3:'badge-cook'};
    //this.diceGroup = [];
    this.startSynced = false;
    diceGroup = this.add.group();

    this.groundGroup = this.game.add.group();
    this.objectGroup = this.game.add.group();
    this.cursorPos = new Phaser.Plugin.Isometric.Point3();
    this.easystar = new EasyStar.js(); // eslint-disable-line new-cap
    this.finding = false;
    this.water = [];
    this.isoGroup = this.game.add.group();  

    // Place a "fixed-to-camera" info-frame at the right side
    this.game.panelLeft = createPanelL(this.game);
    this.game.panelRight = createPanelR(this.game);

    this.game.scoreHandler = new PlayerScores(this.game, this.isoGroup);
    this.game.UiModalsHandler = new UiModalsManager(this.game);
    this.game.tileToHelp = null;

    this.rollMusic = this.game.add.audio('rollDice');
    this.rollMusic.volume = 1.2;
    // dice1: 1576;     dice1: 1666;    panel: 1520
    
    for (var i=0; i < 2; i++) {
        var adice = new Dice(this.game, 56+i*90, 190, i);
        //diceGroup.push(adice);
       // this.game.panelRight.addChild(adice);
        diceGroup.add(adice);
    }
    this.game.panelRight.addChild(diceGroup);

    // allow rolling the dice when a mouse button is clicked and is player's turn
    this.input.onDown.add(
      function() {
        //console.log(playDice, pendingMove, playerMoving, playersTurn, this.game.controllingPlayer);
          if(playDice && pendingMove==false && playerMoving==false && playersTurn==this.game.controllingPlayer){
              total=0;
              _this.rollMusic.play();
              _this.isoGroup.forEach(t => { t.tint = 0xffffff});
             // diceGroup.forEach(function(dice){ dice.roll() });
             diceGroup.callAll("roll", null);
          }
      }, this);

    this.input.onDown.add(this.checkTargetTileSelected, this);

    const alevel = new Level(this);
    this.game.ptEmitters = [];
    this.game.ptEmitters.push(this.addPointsGainEmitter("bubble1"));
    this.game.ptEmitters.push(this.addPointsGainEmitter("bubble2"));
    this.game.ptEmitters.push(this.addPointsGainEmitter("bubble3"));

    //this.easystar.setGrid(alevel.walkable);
    //this.easystar.setAcceptableTiles([1]);
    this.easystar.setGrid(this.mapData.tileMap);
    this.easystar.setAcceptableTiles([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]);
    this.easystar.enableDiagonals();
      
    this.spawnBoardGame();
    // player's cursor marker
    this.game.cursor = this.add.sprite(400,300,"cursor");
    this.game.cursor.scale.setTo(0.5, 0.5);
    this.game.cursor.anchor.setTo(0.5, 0.5);
    this.game.cursor.invincible = false;

    // add our RoboCook characters
    var playerMarks = ["blue-mark", "green-mark", "red-mark",];
    var playerColors = ["robots-blue-new", "robots-green-new", "robots-red-new"];
    for (var i=0; i < numOfPlayers; i++){
        var newPlayer = new RoboCook(this.game, this.startPositions[3-i].x, this.startPositions[3-i].y, playerColors[i], this.startingTiles[3-i], playerMarks[i]);
        this.startingTiles[3-i].occupant = newPlayer;
        this.addMarkerScale(newPlayer);
        this.game.playersActive.push(newPlayer);
    }
    // communication tokens for server-client socketIO syncing
    this.uuidSend = uuid();
    this.uuidReceived = uuid();

    // Generate ground
    for (let y = 0; y < alevel.ground.length; y++) {
      for (let x = 0; x < alevel.ground[y].length; x++) {
        var tileName =  alevel.groundNames[alevel.ground[y][x]];
        const tile = this.game.add.isoSprite(this.size * x, this.size * y, 0, 'tileset', tileName, this.groundGroup);

        tile.anchor.set(0.5, 1 - ((tile.height - (tile.width / 2)) / tile.height));
        //tile.scale.x = alevel.direction[y][x];
        tile.initialZ = 0;

        if (alevel.ground[y][x] === 0) {
          // Add to water tiles
          tile.initialZ = -4;
          this.water.push(tile);
        }

        if (alevel.ground[y][x] === 4) {
          // Make bridge higher
          tile.isoZ += 4;
          tile.initialZ += 4;

          // Put tile under bridge
          const waterUnderBridge = this.game.add.isoSprite(this.size * x, this.size * y, 0, 'tileset', alevel.groundNames[0], this.groundGroup);
          waterUnderBridge.anchor.set(0.5, 1);
          waterUnderBridge.initialZ = -4;
          this.water.push(waterUnderBridge);
        }
      }
    }


    diceGroup.forEach(function(dice){
      dice.player1 = this.game.playersActive[0];
      dice.player2 = this.game.playersActive[1];
      dice.playingNowText = this.game.playingNowText;
      //console.log(dice);
    }, this);

    this.game.iso.simpleSort(this.groundGroup);

    // Create dude
    //this.dude = new Dude(this.game, this.startPosition);
    //this.objectGroup.add(this.dude.sprite);

    this.game.world.bringToTop(this.game.panelLeft);
    this.game.world.bringToTop(this.game.panelRight);
    // firstly make the camera to follow the active player
    this.game.camera.follow(this.game.playersActive[this.game.controllingPlayer-1], Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);
    this.game.world.bringToTop(this.game.playersActive[this.game.controllingPlayer-1]);

     // a startup tile animation with a socket-io syncing function
    this.isoGroup.forEach(this.startGameEffect, this, false);

    // --- Register SOCKET listeners --- //
    var _this = this;
    registerSocketListeners(_this, window);
    // --- /Register SOCKET listeners --- //
  }

  addPointsGainEmitter(pointType){
    var ptEmitter = this.game.add.emitter(this.x, this.y, 1000);
    ptEmitter.makeParticles(pointType);
    ptEmitter.setAlpha(0.6, 0.8, 1600);
    ptEmitter.setScale(1.5, 0.2, 1.5, 0.2, 1600, Phaser.Easing.Quintic.Out);
    ptEmitter.particleBringToTop = true;
    return ptEmitter;
  }

  // ** UPDATE Starndard FUNCTION **//
  update() {
    // Update the cursor position.

    // dice rolling
    diceGroup.callAll("update", null);

    // By default, the z position is 0 if not set.
    this.game.iso.unproject(this.game.input.activePointer.position, this.cursorPos);

    // Loop through all board-tiles
    this.isoGroup.forEach(this.checkTiles, this, false);
    // Loop through all ground-tiles
    //this.groundGroup.forEach(this.checkGroundTile, this, false);
    // Generate the water-wave effect
    //this.water.forEach(this.waveWaterTiles, this, false);

    if (this.isMoving && questionAwaiting==false) {
      this.isMoving=false;
      //this.move();
    }

    if(newDiceResult) {
      newDiceResult = false;
      pendingMove = true;
      this.endTiles = [];
      this.midTiles = [];
      const startTile = this.game.playersActive[playersTurn-1].currentTile;
      //this.isoGroup.forEach(t => { t.tint = 0xffffff});
      this.isoGroup.forEach(t => {
          const tile = t;
          this.highlightPaths = highlightPath.bind(this);
          this.easystar.findPath(startTile.Xtable, startTile.Ytable, tile.Xtable, tile.Ytable, this.highlightPaths);
          //calculate new path with "A* algorithm" (A-star)
          this.easystar.calculate();
      });
      function highlightPath(path){
          if (path != null && total == path.length-1)
              this.isoGroup.forEach(t => {
                  const subtile = t;
                  const inPath = path.some(point => point.x == subtile.Xtable && point.y == subtile.Ytable);
                  if (inPath){
                      subtile.tint = this.pathColor;
                      for(var i=0; i<path.length-1; i++){
                          if(path[i].x==subtile.Xtable && path[i].y==subtile.Ytable){
                              subtile.tileMoves = i;
                              this.midTiles.push(subtile);
                          }
                      }
                  }
                  if(path[path.length-1].x==subtile.Xtable && path[path.length-1].y==subtile.Ytable){
                      subtile.tint = this.endPathColor;
                      this.game.add.tween(subtile).to({ isoZ: 12 }, 300, Phaser.Easing.Quadratic.InOut, true).yoyo(true, 300);
                      this.endTiles.push(subtile);
                  }
              });
      }
      if(this.game.controllingPlayer==playersTurn){
        this.game.handDiceTween.pause();
        if(playersTurn==1 || playersTurn==3)
            this.game.player1button.scale.setTo(1, 1);
        else
            this.game.player2button.scale.setTo(1, 1);
      }
    }

    this.checkRcpActionDropped();

    if(playersTurn==1 || playersTurn==3)
      if (this.game.dice1play.contains(this.input.activePointer.x, this.input.activePointer.y)){
        this.game.cursor.loadTexture("cursorPlaying")
        playDice = true;
      }
      else{
        this.game.cursor.loadTexture("cursor")
        playDice = false;
      }
    else
      if (this.game.dice2play.contains(this.input.activePointer.x, this.input.activePointer.y)){
        this.game.cursor.loadTexture("cursorPlaying")
        playDice = true;
      }
      else{
        this.game.cursor.loadTexture("cursor")
        playDice = false;
      }

    this.game.iso.simpleSort(this.objectGroup);

    if (this.game.panelLeft.input.pointerOver())
      this.game.panelLeft.alpha = 0.4;
    else
      this.game.panelLeft.alpha = 0.9;

    // the cursor overlaps the actual user's mouse
    this.game.cursor.position.x = this.input.worldX;
    this.game.cursor.position.y = this.input.worldY;

    this.game.diceSum.setText("Dice Sum: " + total);
    this.game.world.bringToTop(this.game.cursor);

  }
  // ** /UPDATE Starndard FUNCTION **//

  
  spawnBoardGame() {
    var size = 67;
    var map_width = this.mapData.tileMap[0].length - 1;
    var map_height = this.mapData.tileMap.length - 1;

      var i = 0, tile;
      var cc = 5;
      for (var y = 0; y <= map_height; y ++) {
        this.boardGameTiles[ y ] = [];
          for (var x = 0; x <= map_width; x ++) {
              
              var tileNumber =  this.mapData.tileMap[ y ][ x ];
              var tileName = this.mapData.tileNames[tileNumber];
              tile = this.game.add.isoSprite(x*size, y*size, 0, tileName, 0, this.isoGroup);
              tile.scale.setTo(1.0, 1.0);
              tile.anchor.set(0.5, 0);
              tile.alpha = 0.9;
              tile.Xtable = x;
              tile.Ytable = y;
              tile.occupant = null;
              tile.activated = false;

              if(tileName == "quest"){
                  tile.questpop = new QuestPopUp(this.game, false, false, -1, tile.position.x, tile.position.y);
                  tile.ingredient = this.ingredients.shift();
                  tile.scale.setTo(1.2, 1.2);
                  tile.alpha = 1.0;
              }
              if(tileName.includes("path-q")){
                  //tile.scale.setTo(0.75, 0.75);
                  var questNum = parseInt(tileName[tileName.length-1])-1;
                  tile.questpop = new QuestPopUp(this.game, false, false, questNum, tile.position.x, tile.position.y);
              }
              if(tileName.includes("target-")){
                  this.startingTiles.push(tile);
                  this.startPositions.push({x: x*size, y: y*size});
                  this.targetTiles[tileName] = tile;
                  tile.alpha = 1.0;
              }
              if(tileName.includes("cook-")){
                tile.questpop = new QuestPopUp(this.game, true, false, -1, tile.position.x, tile.position.y);
                tile.alpha = 0.6;
              }
              if(tileName.includes("shop-")){
                tile.questpop = new QuestPopUp(this.game, false, true, -1, tile.position.x, tile.position.y);
                tile.alpha = 0.6;
              }
              
              /* TODO -- maybe use an effect like hoping "target-tiles" like (tween for tile.isoZ = 64;) */
              this.boardGameTiles[y][x] = tile;
          }
      }
  }

  checkTiles(tile) {
		  var inBounds = tile.isoBounds.containsXY(this.cursorPos.x, this.cursorPos.y);
      // If it does, do a little animation and tint change.
      if (!tile.selected && inBounds) {
          tile.selected = true;
          if(tile.tint != this.pathColor && tile.tint != this.endPathColor)
              tile.tint = 0x86bfda;
          this.game.add.tween(tile).to({ isoZ: 10 }, 200, Phaser.Easing.Quadratic.InOut, true);
          if (tile.occupant)
              this.game.add.tween(tile.occupant).to({ isoZ: 10 }, 200, Phaser.Easing.Quadratic.InOut, true);
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
  }

  checkGroundTile(t){
      const tile = t;
      const x = tile.isoX / this.size;
      const y = tile.isoY / this.size;
      const inBounds = tile.isoBounds.containsXY(this.cursorPos.x, this.cursorPos.y);
      // Test to see if the 3D position from above intersects with the automatically generated IsoSprite tile bounds.
      if (!tile.selected && inBounds && !this.water.includes(tile)) {
        tile.selected = true;
        if (!tile.inPath) {
          tile.tint = 0x86bfda;
        }
        this.game.add.tween(tile).to({ isoZ: tile.initialZ + 4 }, 200, Phaser.Easing.Quadratic.InOut, true);
      } 
      else if (tile.selected && !inBounds) {
        // If not, revert back to how it was.
        tile.selected = false;
        if (!tile.inPath) {
          tile.tint = 0xffffff;
        }
        this.game.add.tween(tile).to({ isoZ: tile.initialZ + 0 }, 200, Phaser.Easing.Quadratic.InOut, true);
      }

      if (!this.finding && this.game.input.activePointer.isDown && inBounds) {
        // Start path finding
        this.finding = true;
        //const dp = this.dudePosition();
        //this.easystar.findPath(dp.x, dp.y, x, y, this.processPath.bind(this));
        //this.easystar.calculate();
      }
      if(tile.quest)
        tile.questpop.update();
  }

  dudePosition() {
    return {
      x: Math.round(this.dude.x / this.size + 0.5),
      y: Math.round(this.dude.y / this.size + 0.5),
    };
  }

  waveWaterTiles(w){
      const waterTile = w;
      waterTile.isoZ = waterTile.initialZ + (-2 * Math.sin((this.game.time.now + (waterTile.isoX * 7)) * 0.004))
                        + (-1 * Math.sin((this.game.time.now + (waterTile.isoY * 8)) * 0.005));
      waterTile.alpha = Phaser.Math.clamp(1 + (waterTile.isoZ * 0.1), 0.2, 1);
  }

  checkTargetTileSelected(){
    var myRole = this.game.roles[this.game.controllingPlayer];
    if(pendingMove && playerMoving==false && playersTurn==this.game.controllingPlayer)
        this.endTiles.forEach(clickedTile => {
            var inBounds = clickedTile.isoBounds.containsXY(this.cursorPos.x, this.cursorPos.y);
            if(inBounds && playerMoving==false){
                if(clickedTile.activated && myRole=="Instructor")
                  return;
                else
                  movePlayerOnBoard(this, this.game.playersActive[playersTurn-1], clickedTile, true, true, 0);
            }
        });
    if(pendingMove && playerMoving==false && playersTurn==this.game.controllingPlayer)
        this.midTiles.forEach(clickedTile => {
            var inBounds = clickedTile.isoBounds.containsXY(this.cursorPos.x, this.cursorPos.y);
            if(inBounds && playerMoving==false){
              if(clickedTile.activated && myRole=="Instructor")
                return;
              else
                movePlayerOnBoard(this, this.game.playersActive[playersTurn-1], clickedTile, true, false, total-clickedTile.tileMoves);
            }
        });
  }

  startGameEffect(tile) {
    var _this = this;
    if(tile.key=="quest"){
        var zetTween = this.game.add.tween(tile).to({ isoZ: 32 }, 250, Phaser.Easing.Quadratic.InOut, true);
        zetTween.yoyo(true, 700);
        var scaletween = this.game.add.tween(tile.scale).to( { x: 1.55, y: 1.55 }, 200, Phaser.Easing.Quadratic.Out, true);
        scaletween.yoyo(true, 700);

        if(tile.Xtable==6 && tile.Ytable==4)
            scaletween.onComplete.add(function() {
                window.socket.emit(PlayerEvent.startSynced, {});
                //block this player from starting to play without others synced
                setTimeout( _this.checkStartingSync(), 300)
            }, _this);
      }
  }

  waitPlayerSync(){
    this.waitingSync = true;
    this.game.UiModalsHandler.waitingModal(1);
  }

  checkStartingSync(){
      if(this.startSynced==false){
          this.waitPlayerSync();
      }
  }

  // another player has made a valid position
  moveOtherPlayer(playerMove){
    var cargs = {newPos:playerMove.playersTile, dirTile:""};
    this.isoGroup.forEach(this.findDirTile, this, false, cargs);
    movePlayerOnBoard(this, this.game.playersActive[playersTurn-1], cargs.dirTile, false);
  }

  otherPlayerAnswered(data){
    if(typeof this.game.waiting_other !== 'undefined')
        this.game.waiting_other.destroy();

    pendingMove = false;
    if(data.rcpAction==false)
      this.game.scoreHandler.updateScore(data.category, data.correct, teamsTurn[playersTurn]);
    togglePlayerTurn();
  }

  findDirTile(tile, cargs){
    if(tile.Xtable==cargs.newPos.x && tile.Ytable==cargs.newPos.y){
        cargs.dirTile = tile;
    }
  }

  addMarkerScale(aplayer){
    //var playingPlayer = this.game.playersActive[playersTurn-1];
    aplayer.markerScale = this.game.add.tween(aplayer.marker.scale).to( { x: 0.15, y: 0.15 }, 400, Phaser.Easing.Quadratic.Out, true).loop(true);
    aplayer.markerScale.yoyo(true, 300);
    aplayer.markerScale.pause();
    aplayer.marker.scale.setTo(0.05, 0.05);
  }

  resumeMarkerScale(){
    var playingPlayer = this.game.playersActive[playersTurn-1];
    playingPlayer.markerScale.resume();
  }

  checkRcpActionDropped(){
    if(rcpItemDropping){
      this.game.scoreHandler.checkRcpActionOverlap()
    }
  }

  resetGlobalState(){
    total = 0;
    playDice = false;
    playersTurn = 1;
    numOfPlayers = 3;
    pendingMove = false;
    newDiceResult = false;
    playerMoving = false;

    this.endTiles = [];
    this.game.playersActive = [];
    this.startingTiles = [];
    this.startPositions = [];
    this.game.tweens.removeAll();
  }
}



/** WEBPACK FOOTER **
 ** ./src/gameState.js
 **/