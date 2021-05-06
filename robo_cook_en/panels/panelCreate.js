
class PointsFrame {

      constructor(game, newStep, panelBack, objPosY, objective){

            this.game = game;
            const badges = ["badge-seasonality-sm", "badge-food-recipes-sm", "badge-principles-sm"];
            const objPosX = [85, 155, 225];
            const scales = [0.7,0.8,0.7];

            this.pointsFrame = game.add.image(170, objPosY, "obj-points");
            this.pointsFrame.anchor.setTo(0.5);
            panelBack.addChild(this.pointsFrame);

            this.pointsBadges = [];
            this.pointsTxtFields = [];
            // a triplet of points required to unlock this step
            for(var i=0; i<3; i++){
                  var newBadge = game.add.image(objPosX[i], objPosY, badges[i]);
                  newBadge.scale.setTo(scales[i]);
                  newBadge.anchor.setTo(0.5);
                  this.pointsBadges.push(newBadge);
                  panelBack.addChild(newBadge);
                  var newPointTxt = game.add.text(objPosX[i]+35, objPosY, "x"+newStep["points"][i], {font: "bold 20px Handlee"});
                  newPointTxt.addColor("rgb(255, 255, 255)", 0);
                  newPointTxt.anchor.setTo(0.5);
                  this.pointsTxtFields.push(newPointTxt);
                  panelBack.addChild(newPointTxt);
            }
      }

      hide(){
            this.pointsFrame.visible = false;
            for(var i=0; i<3; i++){
                  this.pointsBadges[i].visible = false;
                  this.pointsTxtFields[i].visible = false;
            }
      }

      appear(){
            this.pointsFrame.visible = true;
            for(var i=0; i<3; i++){
                  this.pointsBadges[i].visible = true;
                  this.pointsTxtFields[i].visible = true;
            }
      }

      tweenFrame(){
            this.game.add.tween(this.pointsFrame.scale).to( {x:1.15, y:1.15}, 400, Phaser.Easing.Quadratic.Out, true).loop(true).yoyo(true, 300);
      }

      selfDestroy(){
            this.pointsFrame.destroy();
            for(var i=0; i<3; i++){
                  this.pointsBadges[i].destroy();
                  this.pointsTxtFields[i].destroy();
            }
      }
}


function addRecipeActions(game, objcvs, role, stepsRole, Ypos, j){
      objcvs.actions = [];
      for (var i=0; i<2; i++){
            var action = game.add.sprite(540, Ypos[i], "rcpAction-"+role+(i+1));
            action.name =  stepsRole[j]["actions"][i];
            action.solved = [stepsRole[j+"-solved"][0], stepsRole[j+"-solved"][1]];
            action.visible = false;
            action.alpha = 0.6;
            action.scale.setTo(0.8);
            action.pointBody = game.add.sprite(45, 45, "");
            action.addChild(action.pointBody);
            objcvs.addChild(action);
            objcvs.actions.push(action);
      }
      var actionTxt = game.add.text(45, Ypos[2], stepsRole["purpose"], {font: "bold 16px Comic Sans MS"});
      actionTxt.addColor("rgb(0, 0, 255)", 0);
      actionTxt.visible = false;
      actionTxt.wordWrap = true;
      actionTxt.wordWrapWidth = 240;
      objcvs.actions.push(actionTxt);
      objcvs.actions.push(stepsRole["done"]);
      game.panelBack.addChild(actionTxt);

      objcvs.completedBadge = game.add.sprite(470, Ypos[0]/2+Ypos[1]/2-10, "rcpAction-complete");
      objcvs.completedBadge.visible = false;
      objcvs.completedBadge.aplha = 0.8;
      objcvs.completedBadge.scale.setTo(0.65);
      objcvs.addChild(objcvs.completedBadge);
}

function addRecipeNonActions(game, objcvs, role, stepsRole, Ypos, j){
      objcvs.nonActions = [];
      for (var i=0; i<2; i++){
            var action = game.add.sprite(540, Ypos[i], "rcpAction-"+role+(i+1));
            action.name =  stepsRole[j]["actions"][i];
            action.solved = [stepsRole[j+"-solved"][0], stepsRole[j+"-solved"][1]];
            action.visible = false;
            action.alpha = 0.6;
            action.scale.setTo(0.8);
            objcvs.addChild(action);
            objcvs.nonActions.push(action);
      }
      var actionTxt = game.add.text(45, Ypos[2], stepsRole["purpose"], {font: "bold 16px Comic Sans MS"});
      actionTxt.addColor("rgb(0, 0, 255)", 0);
      actionTxt.visible = false;
      actionTxt.wordWrap = true;
      actionTxt.wordWrapWidth = 240;
      objcvs.nonActions.push(actionTxt);
      objcvs.nonActions.push(stepsRole["done"]);
      game.panelBack.addChild(actionTxt);

      objcvs.completedBadgeOther = game.add.sprite(470, Ypos[0]/2+Ypos[1]/2-10, "rcpAction-complete");
      objcvs.completedBadgeOther.visible = false;
      objcvs.completedBadgeOther.aplha = 0.8;
      objcvs.completedBadgeOther.scale.setTo(0.65);
      objcvs.addChild(objcvs.completedBadgeOther);
}

function createPanelL(game){

      game.panelBack = game.add.sprite(0,0,'panelL');
      game.panelBack.fixedToCamera = true;
      game.panelBack.alpha = 0.9;

      game.proteinLogo = game.add.image(175, 900, "protein-logo-small");
      game.proteinLogo.anchor.setTo(0.5, 0.5);
      game.proteinLogo.scale.setTo(0.75, 0.75);
      game.panelBack.addChild(game.proteinLogo);

      // make the left panel interactive, make it almost invinsible when user points-over
      game.panelBack.inputEnabled = true;

      game.objectivesFrame = game.add.sprite(25, 380, "objectives");
      game.panelBack.addChild(game.objectivesFrame);
      game.rcpTitleFrame = game.add.sprite(45, 340, 'recipe-title');
      game.panelBack.addChild(game.rcpTitleFrame);
      game.rcpTitle = game.add.text(165, 375, game.rcpTitle, {font: "bold 17px Comic Sans MS"});
      game.rcpTitle.anchor.setTo(0.5, 0.5);
      game.rcpTitle.wordWrap = true;
      game.rcpTitle.wordWrapWidth = 200;
      game.rcpTitle.addColor("rgb(0, 222, 55)", 0);
      game.panelBack.addChild(game.rcpTitle);
      const objPosY = [420, 420, 420, 420];  // eite [420, 420, 420]; gia 3-steps
      game.objcvs = [];
      game.objcvsTxt = [];
      game.teamProgrTxt = [];
      for(var i=0; i<game.totalSteps; i++){
            game.objcvs.push(game.add.sprite(45, objPosY[i], "noActiveObj"));
            game.objcvs[i].scale.setTo(0.4);
            game.objcvs[i].visible = false;

            game.objcvsTxt.push(game.add.text(55, objPosY[i]+85, "Instructor must go to the correct tile to reveal the recipe step...", {font: "bold 20px Comic Sans MS"}));

            game.objcvsTxt[i].wordWrap = true;
            game.objcvsTxt[i].wordWrapWidth = 250;
            game.objcvsTxt[i].addColor("rgb(180, 175, 172)", 0);
            game.objcvsTxt[i].visible = false;

            game.objcvs[i].pointsFrame = new PointsFrame(game, game.stepsInstructor[i], game.panelBack, objPosY[i]+10, game.objcvs[i]);
            game.objcvs[i].pointsFrame.hide();
            
            game.teamProgrTxt.push( game.add.text(65, objPosY[i]+45, "points to enable recipe step", {font: "bold 18px Comic Sans MS"}) );
            //game.teamProgrTxt[i].anchor.setTo(0.5);
            game.teamProgrTxt[i].wordWrap = true;
            game.teamProgrTxt[i].wordWrapWidth = 240;
            game.teamProgrTxt[i].addColor("rgb(0, 0, 255)", 0);
            game.teamProgrTxt[i].visible = false;

            //if(game.roles[game.controllingPlayer]!="Instructor")
            if( game.roles[game.controllingPlayer]=="Cook" ){
                  addRecipeNonActions(game, game.objcvs[i], "shop", game.stepsShopper, [340+50, 480+50, 580+20 ], i);
                  addRecipeActions(game, game.objcvs[i], "cook", game.stepsCook, [630+50, 780+50, 680+20 ], i);
            }else{
                  addRecipeNonActions(game, game.objcvs[i],"cook", game.stepsCook, [340+50, 480+50, 580+20 ], i);
                  addRecipeActions(game, game.objcvs[i], "shop", game.stepsShopper, [630+50, 780+50, 680+20 ], i);
            }

            game.panelBack.addChild(game.objcvs[i]);
            game.panelBack.addChild(game.objcvsTxt[i]);
            game.panelBack.addChild(game.teamProgrTxt[i]);
      }

      game.objcvs[0].visible = true;
      game.objcvs[0].pointsFrame.appear();
      game.teamProgrTxt[0].visible = true;
      //game.objcvsTxt[0].visible = true;

      return game.panelBack;
}


// game.offsetUI = 466;

function createPanelR(game){

      game.panelBackR = game.add.image(1520,0);
      game.panelBackR.inputEnabled = true;

      //game.panelBackR_hid = game.add.sprite(1520,0,'panelR');
      game.panelBackR.panelTexture = game.add.sprite(0,0,'panelR');
      game.panelBackR.fixedToCamera = true;
      game.panelBackR.alpha = 0.9;
      game.panelBackR.addChild(game.panelBackR.panelTexture);

      game.controllingBadge = game.add.sprite(5, 0, "controlling-"+game.roles[game.controllingPlayer]);
      game.controllPlayerText = game.add.text(53, 15, "Your control player\n "+game.roles[game.controllingPlayer],  {font: "bold 15px Handlee"});
      game.panelBackR.addChild(game.controllingBadge);
      game.panelBackR.addChild(game.controllPlayerText);

      game.dice1play = new Phaser.Circle(1630, 250, 160);
      game.dice2play = new Phaser.Circle(1630, 250, 160);

      game.playingNowText = game.add.text(20, 80, game.roles[playersTurn], {font: "bold 30px Handlee"})
      game.playingNowText.addColor('#ff0000', 0);
      game.turnText = game.add.text(20, 110, "turn", {font: "bold 30px Comic Sans MS"})
      game.playingRoleIcon = game.add.image(140, 140, game.rolesIcon[playersTurn]);
      game.playingRoleIcon.scale.setTo(0.5);
      game.playingRoleIcon.anchor.setTo(0.5);
      game.playingRoleIcon.tween = game.add.tween(game.playingRoleIcon.scale).to({x:0.35,y:0.35}, 600, Phaser.Easing.Bounce.InOut, true, 0, -1).yoyo(true, 400);
      game.playingRoleIcon.tween.pause();
      game.panelBackR.addChild(game.playingNowText);
      game.panelBackR.addChild(game.turnText);
      game.panelBackR.addChild(game.playingRoleIcon);
      if(playersTurn == game.controllingPlayer)
            game.playingRoleIcon.tween.resume();
      
      // dices
      game.diceSum = game.add.text(26, 360, "Dice: -", {font: "28px Comic Sans MS"});
      game.panelBackR.addChild(game.diceSum);

      game.dicePlusTeam1 = game.add.sprite( 26, 420, "team-1-bonus");
      game.dicePlusTeam2 = game.add.sprite( 116, 420, "team-2-bonus");
      game.dicePlusText1 = game.add.text(86, 435, ": 0", {font: "bold 22px Handlee"}).addColor('#c83e3e', 0);
      game.dicePlusText2 = game.add.text(176, 435, ": 0", {font: "bold 22px Handlee"}).addColor('#c83e3e', 0);
      game.dicePlusTeam1.scale.setTo(0.7);
      game.dicePlusTeam2.scale.setTo(0.7);
      game.panelBackR.addChild(game.dicePlusTeam1);
      game.panelBackR.addChild(game.dicePlusTeam2);
      game.panelBackR.addChild(game.dicePlusText1);
      game.panelBackR.addChild(game.dicePlusText2);
      game.dicePlusTeam1.visible = false; game.dicePlusTeam2.visible = false; 
      game.dicePlusText1.visible = false; game.dicePlusText2.visible = false;

      game.player1button = game.add.sprite( 66, 270, "handPink",);
      game.player2button = game.add.sprite( 156, 270, "handBlue");
      game.player1button.anchor.setTo(0.5, 0.5);
      game.player2button.anchor.setTo(0.5, 0.5);
      game.panelBackR.addChild(game.player1button);
      game.panelBackR.addChild(game.player2button);

      if(playersTurn==game.controllingPlayer)
            game.handDiceTween = game.add.tween(game.player1button.scale).to( { x: 0.80, y: 0.80 }, 400, Phaser.Easing.Quadratic.Out, true).loop(true).yoyo(true, 300);
      else if(game.controllingPlayer==3){
            game.handDiceTween = game.add.tween(game.player1button.scale).to( { x: 0.80, y: 0.80 }, 400, Phaser.Easing.Quadratic.Out, true).loop(true).yoyo(true, 300);
            game.handDiceTween.pause();
      }
      else{
            game.handDiceTween = game.add.tween(game.player2button.scale).to( { x: 0.80, y: 0.80 }, 400, Phaser.Easing.Quadratic.Out, true).loop(true).yoyo(true, 300);
            game.handDiceTween.pause();
      }

      game.msgReceiver = game.add.sprite( 26, 850, "receiver-icon");
      game.msgReceiver.inputEnabled = true;
      game.msgReceiver.scale.setTo(0.7);
      game.msgReceiver.msgAlertTween = game.add.tween(game.msgReceiver).to({tint: 0xff0000}, 500, Phaser.Easing.Bounce.InOut, true, 0, -1).yoyo(true,500);
      game.msgReceiver.msgAlertTween.pause();
      game.panelBackR.addChild(game.msgReceiver);

      game.keyArrows = game.add.sprite(110, 740, "key-arrows");
      game.keyArrows.anchor.setTo(0.5);
      game.keyArrows.scale.setTo(0.8);
      game.keyArrows.alpha = 0.8;
      game.keyArrowsText = game.add.text(105, 790, "Navigate the board", {font: "15px Consolas"});
      game.keyArrowsText.anchor.setTo(0.5);
      game.panelBackR.addChild(game.keyArrows);
      game.panelBackR.addChild(game.keyArrowsText);

      game.soundToggle = game.add.sprite(170, 830, "soundOn");
      game.soundToggle.scale.setTo(0.4);
      game.soundToggle.anchor.setTo(0.5);
      game.soundToggle.inputEnabled = true;
      game.soundToggle.events.onInputDown.add(listener, this);
      game.panelBackR.addChild(game.soundToggle);

      function listener (sprite) {

            if(game.sound.mute){
                  sprite.loadTexture('soundOn');
                  game.sound.mute = false;
            }else{
                  sprite.loadTexture('soundOff');
                  game.sound.mute = true;
            }
            
      }

      return game.panelBackR;
}

