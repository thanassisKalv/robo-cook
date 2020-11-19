
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


function addRecipeActions(game, objcvs, j){
      const Xpos = [90, 320];
      if(game.roles[game.controllingPlayer]=="Shopper")
            var stepsRole = game.stepsShopper;
      else
            var stepsRole = game.stepsCook;
      objcvs.actions = [];
      for (var i=0; i<2; i++){
            var action = game.add.sprite(Xpos[i], -130, "rcpAction-"+(i+1));
            action.name =  stepsRole[j]["actions"][i];
            action.visible = false;
            action.alpha = 0.6;
            action.scale.setTo(0.8);
            objcvs.addChild(action);
            objcvs.actions.push(action);
      }
      objcvs.completedBadge = game.add.sprite(Xpos[0]/2+Xpos[1]/2, -110, "rcpAction-complete");
      objcvs.completedBadge.visible = false;
      objcvs.completedBadge.scale.setTo(0.8);
      objcvs.addChild(objcvs.completedBadge);

}

function createPanelL(game){

      game.panelBack = game.add.sprite(0,0,'panelL');
      game.panelBack.fixedToCamera = true;
      game.panelBack.alpha = 0.9;

      game.proteinLogo = game.add.image(175, 850, "protein-logo-small");
      game.proteinLogo.anchor.setTo(0.5, 0.5);
      game.panelBack.addChild(game.proteinLogo);

      // make the left panel interactive, make it almost invinsible when user points-over
      game.panelBack.inputEnabled = true;

      game.objectivesFrame = game.add.sprite(25, 350, "objectives");
      game.panelBack.addChild(game.objectivesFrame);
      const objPosY = [440, 600];
      game.objcvs = [];
      game.objcvsTxt = [];
      for(var i=0; i<2; i++){
            game.objcvs.push(game.add.sprite(45, objPosY[i], "noActiveObj"));
            game.objcvs[i].scale.setTo(0.4);
            if(game.roles[game.controllingPlayer]=="Instructor")
                  game.objcvsTxt.push(game.add.text(63, objPosY[i]+5, game.stepsInstructor[i]["step"].substring(0, 12)+"...", {font: "italic 22px Handlee"}));
            else
                  game.objcvsTxt.push(game.add.text(63, objPosY[i]+5, "Wait instructor...", {font: "italic 22px Handlee"}));
            game.objcvsTxt[i].wordWrap = true;
            game.objcvsTxt[i].wordWrapWidth = 250;
            game.objcvsTxt[i].addColor("rgb(180, 175, 172)", 0);
            game.objcvs[i].pointsFrame = new PointsFrame(game, game.stepsInstructor[i], game.panelBack, objPosY[i]+65, game.objcvs[i]);

            if(game.roles[game.controllingPlayer]!="Instructor")
                  addRecipeActions(game, game.objcvs[i], i);

            game.panelBack.addChild(game.objcvs[i]);
            game.panelBack.addChild(game.objcvsTxt[i]);
      }

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

      game.dice1play = new Phaser.Circle(1520+66, 250, 70);
      game.dice2play = new Phaser.Circle(1520+156, 250, 70);

      game.playingNowText = game.add.text(20, 60, game.roles[playersTurn]+"'s", {font: "bold 30px Handlee"})
      game.playingNowText.addColor('#ff0000', 0);
      game.turnText = game.add.text(20, 90, "turn", {font: "bold 30px Handlee"})
      game.playingRoleIcon = game.add.image(140, 120, game.rolesIcon[playersTurn]);
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
      game.diceSum = game.add.text(26, 340, "Ζάρια: -");
      game.diceSum.font = "Handlee";
      game.diceSum.fontSize = 30;
      game.panelBackR.addChild(game.diceSum);

      game.dicePlusTeam1 = game.add.sprite( 26, 400, "team-1-bonus");
      game.dicePlusTeam2 = game.add.sprite( 116, 400, "team-2-bonus");
      game.dicePlusText1 = game.add.text(86, 415, ": 0", {font: "bold 22px Handlee"}).addColor('#c83e3e', 0);
      game.dicePlusText2 = game.add.text(176, 415, ": 0", {font: "bold 22px Handlee"}).addColor('#c83e3e', 0);
      game.dicePlusTeam1.scale.setTo(0.7);
      game.dicePlusTeam2.scale.setTo(0.7);
      game.panelBackR.addChild(game.dicePlusTeam1);
      game.panelBackR.addChild(game.dicePlusTeam2);
      game.panelBackR.addChild(game.dicePlusText1);
      game.panelBackR.addChild(game.dicePlusText2);
      game.dicePlusTeam1.visible = false; game.dicePlusTeam2.visible = false; 
      game.dicePlusText1.visible = false; game.dicePlusText2.visible = false;

      game.player1button = game.add.sprite( 66, 250, "handPink",);
      game.player2button = game.add.sprite( 156, 250, "handBlue");
      game.player1button.anchor.setTo(0.5, 0.5);
      game.player2button.anchor.setTo(0.5, 0.5);
      game.panelBackR.addChild(game.player1button);
      game.panelBackR.addChild(game.player2button);

      game.controllingBadge = game.add.sprite(5, 0, "controlling-player");
      game.controllPlayerText = game.add.text(53, 15, "Ελέγχεις τον παίκτη\n "+game.roles[game.controllingPlayer],  {font: "bold 15px Handlee"});
      game.panelBackR.addChild(game.controllingBadge);
      game.panelBackR.addChild(game.controllPlayerText);

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

      return game.panelBackR;
}