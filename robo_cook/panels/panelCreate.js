
function createPanelL(game){

      game.panelBack = game.add.sprite(0,0,'panelL');
      //game.panelBack.anchor.setTo(0.5, 0.5);
      game.panelBack.fixedToCamera = true;
      game.panelBack.alpha = 0.9;

      game.proteinLogo = game.add.image(175, 850, "protein-logo-small");
      game.proteinLogo.anchor.setTo(0.5, 0.5);
      game.panelBack.addChild(game.proteinLogo);

      game.panelBack.inputEnabled = true;

      game.objectivesFrame = game.add.sprite(15, 300, "objectives");
      game.panelBack.addChild(game.objectivesFrame);

      game.scoreText = game.add.text(15, 25, "Items Got", {font: "bold 30px Handlee"});
      game.panelBack.addChild(game.scoreText);

      const objPos = [340, 450];
      game.objs = [];
      game.objsTxt = [];
      for(var i=0; i<2; i++){
            game.objs.push(game.add.sprite(45, objPos[i], "noActiveObj"));
            game.objs[i].scale.setTo(0.4);
            game.objsTxt.push(game.add.text(58, objPos[i]+5, "Waiting for instructor's move", {font: "bold 22px Handlee"}))
            game.objsTxt[i].fontSize = 20;
            game.objsTxt[i].wordWrap = true;
            game.objsTxt[i].wordWrapWidth = 270;
            game.objsTxt[i].addColor("rgb(180, 175, 172)", 0);
            game.objsTxt[i].addFontStyle('italic', 0);

            game.panelBack.addChild(game.objs[i]);
            game.panelBack.addChild(game.objsTxt[i]);
      }

      // game.obj1 = game.add.sprite(45, 340, "noActiveObj");
      // game.obj2 = game.add.sprite(45, 450, "noActiveObj");
      // game.obj3 = game.add.sprite(45, 520, "noActiveObj");
      // game.obj4 = game.add.sprite(45, 590, "noActiveObj");
      // game.obj1.scale.setTo(0.4);
      // game.obj2.scale.setTo(0.4);
      // game.obj3.scale.setTo(0.4);
      // game.obj4.scale.setTo(0.4);
      // game.panelBack.addChild(game.obj1);
      // game.panelBack.addChild(game.obj2);
      // game.panelBack.addChild(game.obj3);
      // game.panelBack.addChild(game.obj4);

      // var obj1 = game.steps.shift();
      // game.ob1_txt = game.add.text(70, 340, obj1, {font: "bold 30px Handlee"})
      // game.ob1_txt.fontSize = 20;
      // game.ob1_txt.wordWrap = true;      
      // game.ob1_txt.wordWrapWidth = 270;
      // game.panelBack.addChild(game.ob1_txt);

      // game.ob2_txt = game.add.text(45, 450, "...", {font: "bold 30px Handlee"})
      // game.ob3_txt = game.add.text(45, 520, "...", {font: "bold 30px Handlee"})
      // game.ob4_txt = game.add.text(45, 590, "...", {font: "bold 30px Handlee"})
      // game.panelBack.addChild(game.ob2_txt);
      // game.panelBack.addChild(game.ob3_txt);
      // game.panelBack.addChild(game.ob4_txt);
      
      return game.panelBack;
}


// game.offsetUI = 466;

function createPanelR(game){

      game.panelBackR = game.add.sprite(1520,0,'panelR');
      //game.panelBack.anchor.setTo(0.5, 0.5);
      game.panelBackR.fixedToCamera = true;
      game.panelBackR.alpha = 0.9;

      game.dice1play = new Phaser.Circle(1520+66, 250, 70);
      game.dice2play = new Phaser.Circle(1520+156, 250, 70);
      // game.panelBackR.addChild(game.dice1play);
      // game.panelBackR.addChild(game.dice2play);

      game.playingNowText = game.add.text(26, 90, "Player #"+playersTurn+" turn", {font: "bold 30px Handlee"})
      game.playingNowText.fontSize = 30;
      game.playingNowText.tween = game.add.tween(game.playingNowText).to({alpha:0.2}, 1500, Phaser.Easing.Bounce.InOut, true, 0, -1);
      game.playingNowText.addColor('#ff0000', 7);
      game.playingNowText.addColor('#000000', 9);
      game.panelBackR.addChild(game.playingNowText);
      
      // dices
      game.diceSum = game.add.text(26, 340, "Dice Sum: -");
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

      game.player1button = game.add.sprite( 66, 250, "handPink",);
      game.player2button = game.add.sprite( 156, 250, "handBlue");
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
      game.msgReceiver.scale.setTo(0.7);
      game.msgReceiver.msgAlertTween = game.add.tween(game.msgReceiver).to({tint: 0xff0000}, 500, Phaser.Easing.Bounce.InOut, true, 0, -1).yoyo(true,500);
      game.msgReceiver.msgAlertTween.pause();
      game.panelBackR.addChild(game.msgReceiver);

      return game.panelBackR;
}