
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
var diceFrames = [0,0];

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

  init(argLevelName, myPlayer, recipeData) {
    this.game.maxHeightImageQuestion = 2*310;
    this.game.maxWidthImageQuestion = 2*380;
    //console.log(myPlayer)
    this.game.controllingPlayer = myPlayer+1;
    this.levelsName = argLevelName;
    this.game.recipeData = recipeData;
    //console.log(this.game.recipeData);
  }

  create() {

    // https://www.html5gamedevs.com/topic/4775-making-a-game-for-both-desktop-and-mobile/
    //this.game.stage.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;
    //this.scale.startFullScreen();
    //this.scale.setShowAll();
    //this.scale.refresh();

    var _this = this;
    this.game.time.desiredFps = 45;
    //this.time.desiredFps = 30;
    document.title = "Robo-Cook's Path - Discover Recipe"
    this.ingredients = ["target-1", "target-2-player", "target-3", "target-4-player","target-1", "target-2-player", "target-3", "target-4-player",
                        "target-1", "target-2-player", "target-3", "target-4-player","target-1", "target-2-player", "target-3", "target-4-player"];
    this.targetTiles = [];
    this.pathColor = 0x95F985;
    this.endPathColor = 0x5fa32d;
    this.startPathColor = 0xdb7f40;

    this.mapData =  this.game.cache.getJSON('mapdata');
    this.game.stepsInstructor = this.game.recipeData.recipe;
    this.game.stepsCook = this.game.recipeData.recipe_cook;
    this.game.stepsShopper = this.game.recipeData.recipe_shopper;
    this.game.totalSteps = this.game.recipeData.total_steps;
    this.game.rcpTitle = this.game.recipeData.recipe_name;

    this.data = this.game.cache.getJSON('questions');
    this.game.questionsAnswered = {0:[], 1:[], 2:[]};

    this.startPositions = [];
    this.boardGameTiles = [];
    this.startingTiles = [];
    this.game.helpClouds = [];
    this.game.playersActive = [];
    this.game.startPositions = [];
    this.game.roles = {1:"Maestro", 2: "Compratore", 3: "Cuciniere"};
    this.game.rolesIcon = {1:'badge-chef', 2:'badge-shopper', 3:'badge-cook'};
    this.game.tooltipTexts = {"path-q1": "CIBI E RICETTE", "path-q2": "STAGIONALITÀ / LOCALITÀ", "path-q3": "PRINCIPI NUTRITIVI",
                            "path-cook-action": "Cook Action", "path-shop-action": "Shop item", "bonus-tile": "??"};
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
    this.moveBonusMusic = this.game.add.audio('move_bonus');
    this.moveBonusMusic.volume = 1.2;
    this.game.pickupMusic = this.game.add.audio('pick-up');
    this.game.wrongActionMusic = this.game.add.audio('wrong-action');
    this.game.pickupMusic.volume = 0.8;
    this.game.wrongActionMusic.volume = 0.8;
    this.bgTrackMusic = this.game.add.audio('bg_track', 1, true);
    this.bgTrackMusic.volume = 0.75;
    this.bgTrackMusic.play();
    this.game.customTip = this.game.add.image(0, 0, "tooltip");
    
    for (var i=0; i < 2; i++) {
        var adice = new Dice(this.game, 56+i*90, 210, i);
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
    this.game.changeTurnMusic = this.game.add.audio('player-turn');
    this.game.changeTurnMusic.volume = 1.5;

    // add our RoboCook characters
    var playerRoles = ["I", "S", "C",];
    var playerMarks = ["blue-mark", "green-mark", "red-mark",];
    var playerColors = ["robots-blue-new", "robots-green-new", "robots-red-new"];
    for (var i=0; i < numOfPlayers; i++){
        var newPlayer = new RoboCook(this.game, this.startPositions[3-i].x, this.startPositions[3-i].y, playerColors[i], this.startingTiles[3-i], playerMarks[i], playerRoles[i]);
        newPlayer.roleName = this.game.roles[i+1];
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


      }
    }


    diceGroup.forEach(function(dice){
      dice.player1 = this.game.playersActive[0];
      dice.player2 = this.game.playersActive[1];
      dice.playingNowText = this.game.playingNowText;
      //console.log(dice);
    }, this);

    this.game.iso.simpleSort(this.groundGroup);

    this.game.world.bringToTop(this.game.panelLeft);
    this.game.world.bringToTop(this.game.panelRight);
    // firstly make the camera to follow the active player
    this.game.camera.follow(this.game.playersActive[this.game.controllingPlayer-1], Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);
    this.game.world.bringToTop(this.game.playersActive[this.game.controllingPlayer-1]);

     // a startup tile animation with a socket-io syncing function
    this.isoGroup.forEach(this.startGameEffect, this, false);

    this.cursors = this.game.input.keyboard.createCursorKeys();

    // --- Register SOCKET listeners --- //
    var _this = this;
    registerSocketListeners(_this, window);
    // --- /Register SOCKET listeners --- //

    this.isoGroup.forEach(this.createTooltip, this, false);
    this.isoGroup.forEach(this.game.scoreHandler.animateFinishedRecipe, this, false);
  }

  addPointsGainEmitter(pointType){
    var ptEmitter = this.game.add.emitter(this.x, this.y, 1000);
    ptEmitter.makeParticles(pointType);
    ptEmitter.setAlpha(0.6, 0.8, 1600);
    ptEmitter.setScale(1.5, 0.2, 1.5, 0.2, 1600, Phaser.Easing.Quintic.Out);
    ptEmitter.particleBringToTop = true;
    return ptEmitter;
  }

  createTooltip(tile){
    if(tile.tooltipText!="none"){
      tile.tooltip = new Phasetips(this.game, {
        targetObject: tile,
        context: tile.tooltipText,
        fontSize: 15, fontFill: "blue",
        backgroundColor: 0xd7f533, roundedCornersRadius: 10,
        strokeColor: 0xfec72c, position: "top", animationDelay: 400, 
        animation: "grow", animationSpeedShow:200, animationSpeedHide:100
      });
      tile.tooltip.alpha = 0.8;
    }
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
                      for(var i=1; i<path.length-1; i++){
                          if(path[i].x==subtile.Xtable && path[i].y==subtile.Ytable){
                              subtile.tileMoves = i;
                              this.midTiles.push(subtile);
                          }
                      }
                     if(path[0].x==subtile.Xtable && path[0].y==subtile.Ytable)
                      subtile.tint = this.startPathColor
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

    if (this.game.panelLeft.input.pointerOver() && rcpItemDropping==false)
      this.game.panelLeft.alpha = 0.2;
    else
      this.game.panelLeft.alpha = 0.9;
    if (this.game.panelRight.input.pointerOver())
      this.game.panelRight.panelTexture.alpha = 0.2;
    else
      this.game.panelRight.panelTexture.alpha = 0.9;

    // the cursor overlaps the actual user's mouse
    this.game.cursor.position.x = this.input.worldX;
    this.game.cursor.position.y = this.input.worldY;

    if (this.cursors.up.isDown){
      this.camera.y -= 16;
      this.game.camera.unfollow();
    }
    else if (this.cursors.down.isDown){
      this.camera.y += 16;
      this.game.camera.unfollow();
    }
    if (this.cursors.left.isDown){
      this.camera.x -= 16;
      this.game.camera.unfollow();
    }
    else if (this.cursors.right.isDown){
      this.camera.x += 16;
      this.game.camera.unfollow();
    }


    this.game.diceSum.setText("Dice: " + total);
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
              tile.tooltipText = "none";

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
                  tile.tooltipText = this.game.tooltipTexts[tileName];
              }
              if(tileName.includes("target-")){
                  this.startingTiles.push(tile);
                  this.startPositions.push({x: x*size, y: y*size});
                  this.targetTiles[tileName] = tile;
                  this.game.startPositions.push({x: x*size, y: y*size});
                  tile.alpha = 1.0;
              }
              if(tileName.includes("cook-")){
                tile.questpop = new QuestPopUp(this.game, true, false, -1, tile.position.x, tile.position.y);
                tile.tooltipText = this.game.tooltipTexts[tileName];
                tile.alpha = 0.6;
              }
              if(tileName.includes("shop-")){
                tile.questpop = new QuestPopUp(this.game, false, true, -1, tile.position.x, tile.position.y);
                tile.tooltipText = this.game.tooltipTexts[tileName];
                tile.alpha = 0.6;
              }
              if(tileName.includes("bonus-"))
                tile.tooltipText = this.game.tooltipTexts[tileName];

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

  makeGreenTile(tile){
    if(tile.key.includes("bonus-tile")){
      tile.tint = this.startPathColor;
    }else{
      tile.tint = this.pathColor;
      this.midTiles.push(tile);
    }
  }

  moveEverywhere(){
    this.midTiles = [];
    this.isoGroup.forEach(this.makeGreenTile, this, false);
    this.moveBonusMusic.play();
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

  alignDiceFrames(playersDiceFrames) {
    diceGroup.getChildAt(0).updateFrame(playersDiceFrames[0]);
    diceGroup.getChildAt(1).updateFrame(playersDiceFrames[1]);
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
                if(clickedTile.activated && myRole=="Maestro" || (clickedTile.activated && this.game.scoreHandler.checkStepCompleted()!=false) ||
                   (clickedTile.activated && (myRole=="Shopper" && clickedTile.questpop.cooktile)) || (clickedTile.activated && (myRole=="Cook" && clickedTile.questpop.shoptile)))
                  return;
                else
                  movePlayerOnBoard(this, this.game.playersActive[playersTurn-1], clickedTile, true, true, 0);
            }
        });
    if(pendingMove && playerMoving==false && playersTurn==this.game.controllingPlayer)
        this.midTiles.forEach(clickedTile => {
            var inBounds = clickedTile.isoBounds.containsXY(this.cursorPos.x, this.cursorPos.y);
            if(inBounds && playerMoving==false){
              if(clickedTile.activated && myRole=="Maestro" || (clickedTile.activated && this.game.scoreHandler.checkStepCompleted()!=false)||
              (clickedTile.activated && (myRole=="Shopper" && clickedTile.questpop.cooktile)) || (clickedTile.activated && (myRole=="Cook" && clickedTile.questpop.shoptile)))
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
    movePlayerOnBoard(this, this.game.playersActive[playerMove.player-1], cargs.dirTile, false);
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

  render () {

      var x = 32;
      var y = 0;
      var yi = 32;

      this.game.debug.text('Viewport', x, y += yi);

      this.game.debug.text('Viewport Width: ' + this.game.scale.viewportWidth, x, y += yi);
      this.game.debug.text('window.innerWidth: ' + window.innerWidth, x, y += yi);
      this.game.debug.text('window.outerWidth: ' + window.outerWidth, x, y += yi);

      this.game.debug.text('Viewport Height: ' + this.game.scale.viewportHeight, x, y += yi);
      this.game.debug.text('window.innerHeight: ' + window.innerHeight, x, y += yi);
      this.game.debug.text('window.outerHeight: ' + window.outerHeight, x, y += yi);

      this.game.debug.text('Document', x, y += yi*2);

      this.game.debug.text('Document Width: ' + this.game.scale.documentWidth, x, y += yi);
      this.game.debug.text('Document Height: ' + this.game.scale.documentHeight, x, y += yi);

      //  Device: How to get device size.

      //  Use window.screen.width for device width and window.screen.height for device height. 
      //  .availWidth and .availHeight give you the device size minus UI taskbars. (Try on an iPhone.) 
      //  Device size is static and does not change when the page is resized or rotated.

      x = 350;
      y = 0;

      this.game.debug.text('Device', x, y += yi);

      this.game.debug.text('window.screen.width: ' + window.screen.width, x, y += yi);
      this.game.debug.text('window.screen.availWidth: ' + window.screen.availWidth, x, y += yi);
      this.game.debug.text('window.screen.height: ' + window.screen.height, x, y += yi);
      this.game.debug.text('window.screen.availHeight: ' + window.screen.availHeight, x, y += yi);
      this.game.debug.text('screen orientation: ' + this.game.scale.screenOrientation , x, y += yi);

  }
}



/** WEBPACK FOOTER **
 ** ./src/gameState.js
 **/