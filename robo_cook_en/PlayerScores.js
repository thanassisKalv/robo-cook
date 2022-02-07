class PlayerScores {
    constructor(game, isoGroup) {
      this.game = game;
      this.isoGroup = isoGroup;
  
      // --- Team-1 scoreframe elements ---
      this.game.player1score1 = 0;

      this.game.scoreBg1 = this.game.add.image(21, 65, "bg-score");
      this.game.scoreFrame1 = this.game.add.image(36, 75, "table-score");

      this.game.player1score2 = 0;
      this.game.player1badge2 = this.game.add.image(210-80, 130, "buttons", "green_button07.png");
      this.game.player1badge2.anchor.setTo(0.5);
      this.game.player1badge2.scale.setTo(1.25);
      this.game.player1scale = this.game.add.image(210-80, 130, "badge-seasonality");
      this.game.player1scale.scale.setTo(0.06875);
      this.game.player1scale.anchor.setTo(0.5);
      this.game.player1scoreTextBg2 = this.game.add.image( 210-20, 130-20, "element-score");
      this.game.player1scoreTextBg2.scale.setTo(0.75);
      // the following score-elements will be updated (stars and number)
      this.game.player1scoreStar2 = this.game.add.image( 210-10, 130-15, "star-score");
      this.game.player1score2Text = this.game.add.text(210+20, 130-20, "0", {font: "bold 24px Handlee"});
      this.game.player1score2Text.addColor('#ffffff', 0);

      this.game.player1score1 = 0;
      this.game.player1badge1 = this.game.add.image(210-80, 200, "buttons", "green_button07.png");
      this.game.player1badge1.anchor.setTo(0.5);
      this.game.player1badge1.scale.setTo(1.25);
      this.game.player1tips = this.game.add.image(210-80, 200, "badge-food-recipes");
      this.game.player1tips.scale.setTo(0.2875);
      this.game.player1tips.anchor.setTo(0.5);
      this.game.player1scoreTextBg1 = this.game.add.image( 210-20, 200-20, "element-score");
      this.game.player1scoreTextBg1.scale.setTo(0.75);
      // the following score-elements will be updated (stars and number)
      this.game.player1scoreStar1 = this.game.add.image( 210-10, 200-15, "star-score");
      this.game.player1score1Text = this.game.add.text(210+20, 200-20, "0", {font: "bold 24px Handlee"});
      this.game.player1score1Text.addColor('#ffffff', 0);


      this.game.player1score3 = 0;
      this.game.player1badge3 = this.game.add.image(210-80, 270, "buttons", "green_button07.png");
      this.game.player1badge3.anchor.setTo(0.5);
      this.game.player1badge3.scale.setTo(1.25);
      this.game.player1forbid = this.game.add.image(210-80, 270, "badge-principles");
      this.game.player1forbid.scale.setTo(0.125);
      this.game.player1forbid.anchor.setTo(0.5);
      this.game.player1scoreTextBg3 = this.game.add.image( 210-20, 270-20, "element-score");
      this.game.player1scoreTextBg3.scale.setTo(0.75);
      // the following score-elements will be updated (stars and number)
      this.game.player1scoreStar3 = this.game.add.image( 210-10, 270-15, "star-score");
      this.game.player1score3Text = this.game.add.text(210+20, 270-20, "0", {font: "bold 24px Handlee"});
      this.game.player1score3Text.addColor('#ffffff', 0);

      this.addElementsOnRightPanel();

      this.game.scoreText = this.game.add.text(115, 40, "Keep Learning", {font: "bold 23px Comic Sans MS"});
      this.game.panelBack.addChild(this.game.scoreText);
      // this.game.learningBadge = this.game.add.image(275, 35, "learning-icon");
      // this.game.learningBadge.scale.setTo(0.25);
      // this.game.panelBack.addChild(this.game.learningBadge);
      // this.game.searchBadge = this.game.add.image(50, 35, "research-icon");
      // this.game.searchBadge.scale.setTo(0.3);
      // this.game.panelBack.addChild(this.game.searchBadge);


      this.game.stepDoneMusic = this.game.add.audio('step_done');
      this.game.finaleMusic = this.game.add.audio('game_finished');
      this.game.finaleMusic.volume = 1.5;
      this.setRecipeProgress(this.game.stepsInstructor,this.game.stepsShopper, this.game.stepsCook);
    }

    addElementsOnRightPanel(){
      this.game.panelLeft.addChild(this.game.scoreBg1);
      this.game.panelLeft.addChild(this.game.scoreFrame1);

      this.game.panelLeft.addChild(this.game.player1badge1);
      this.game.panelLeft.addChild(this.game.player1tips);
      this.game.panelLeft.addChild(this.game.player1scoreTextBg1);
      this.game.panelLeft.addChild(this.game.player1scoreStar1);
      this.game.panelLeft.addChild(this.game.player1score1Text);

      this.game.panelLeft.addChild(this.game.player1badge2);
      this.game.panelLeft.addChild(this.game.player1scale);
      this.game.panelLeft.addChild(this.game.player1scoreTextBg2);
      this.game.panelLeft.addChild(this.game.player1scoreStar2);
      this.game.panelLeft.addChild(this.game.player1score2Text);

      this.game.panelLeft.addChild(this.game.player1badge3);
      this.game.panelLeft.addChild(this.game.player1forbid);
      this.game.panelLeft.addChild(this.game.player1scoreTextBg3);
      this.game.panelLeft.addChild(this.game.player1scoreStar3);
      this.game.panelLeft.addChild(this.game.player1score3Text);

   }

   setRecipeProgress(recipeSteps, recipeStepsShopper, recipeStepsCook){
      this.recipe = recipeSteps;
      this.recipe_shopper = recipeStepsShopper;
      this.recipe_cook = recipeStepsCook
      this.rcpPrgrs = 0;
      this.rcpStepsPts = [this.recipe[0].points, this.recipe[1].points, this.recipe[2].points, this.recipe[3].points];
      this.rcpStepsCompleted = [false,false];
      this.unlockedStep = undefined;
      this.stepInProgress = false;
   }

   checkStepsPrice(){
      var p1 = this.rcpStepsPts[this.rcpPrgrs][0];
      var p2 = this.rcpStepsPts[this.rcpPrgrs][1];
      var p3 = this.rcpStepsPts[this.rcpPrgrs][2];
      if(p1<=this.game.player1score1 && p2<=this.game.player1score2 && p3<=this.game.player1score3)
      {
         //this.game.objcvs[this.rcpPrgrs].pointsFrame.tweenFrame();
         this.game.objcvsTxt[this.rcpPrgrs].visible = true;
         this.game.objcvs[this.rcpPrgrs].pointsFrame.selfDestroy();
         console.log("Step-"+this.rcpPrgrs+" of recipe unlocked!");
         this.unlockedStep = this.rcpPrgrs;
         this.game.teamProgrTxt[this.rcpPrgrs].setText("Step "+(this.unlockedStep+1)+" is activated!");
         this.game.teamProgrTxt[this.rcpPrgrs].y = this.game.teamProgrTxt[this.rcpPrgrs].y - 55;
         this.game.teamProgrTxt[this.rcpPrgrs].visible = true;
         this.stepInProgress = true;
         if(this.rcpPrgrs>0)
            this.game.teamProgrTxt[this.rcpPrgrs-1].visible=false;
      }
   }

   updateRecipeProgress(){
      var _this = this;
      this.game.teamProgrTxt[this.rcpPrgrs].setText("\n\nStep "+(this.rcpPrgrs+1)+" is complete!");
      this.game.objcvsTxt[this.rcpPrgrs].visible = false;
      this.stepInProgress = false;
      var x = this.rcpPrgrs;
      setTimeout( function(){ 
         _this.game.UiModalsHandler.showStepFinished(x, _this.recipe[x].step);
         _this.game.stepDoneMusic.play(); }, 1000);
      setTimeout( function(){
         _this.game.objcvs[x].visible = false;
         _this.game.objcvs[x].pointsFrame.hide();
         _this.game.objcvs[x].actions[2].visible = false;
         _this.game.objcvs[x].nonActions[2].visible = false;}, 4000);

      this.rcpPrgrs++;
      if(this.rcpPrgrs<this.rcpStepsPts.length){
         this.game.objcvs[this.rcpPrgrs].pointsFrame.appear();
         this.checkStepsPrice();
      }
      else{
         var _this = this;
         this.game.teamProgrTxt[this.rcpPrgrs-1].setText("\n\nRECIPE IS READY!");
         setTimeout( function(){ 
            _this.game.finaleMusic.play();}, 2000);
         setTimeout(function(){
            var xc = _this.game.startPositions[0].x/2+_this.game.startPositions[2].x/2;
            var yc = _this.game.startPositions[0].y/2+_this.game.startPositions[2].y/2;
            _this.game.finaleBadge = _this.game.add.image(xc, yc, "cake-complete"); }, 4000);
      }
   }

   adjustLeftPoints(step){
      var p1 = this.rcpStepsPts[step][0];
      var p2 = this.rcpStepsPts[step][1];
      var p3 = this.rcpStepsPts[step][2];
      this.game.player1score1 -= p1;
      this.game.player1score2 -= p2;
      this.game.player1score3 -= p3;
      this.game.player1score1Text.setText(this.game.player1score1);
      this.game.player1score2Text.setText(this.game.player1score2);
      this.game.player1score3Text.setText(this.game.player1score3);
   }

   hasUnlockedStep(){
      if(typeof this.unlockedStep !== 'undefined')
         return true
      else
         return false
   }

   activateRecipeTile(tile){
      if(tile.key.includes("cook-") || tile.key.includes("shop-")){
        tile.alpha = 0.95;
        tile.activated = true;
      }
    }

    clearPrevStep(prevStep, currentStep){
       if(prevStep>-1){
         this.game.objcvsTxt[prevStep].visible = false;
         this.game.objcvs[prevStep].visible = false;
         this.game.objcvs[prevStep].pointsFrame.hide();
         this.game.objcvs[prevStep].actions[2].visible = false;
         this.game.objcvs[prevStep].nonActions[2].visible = false;

         this.game.objcvsTxt[currentStep].visible = true;
         this.game.objcvs[currentStep].visible = true;
         this.game.objcvs[currentStep].pointsFrame.appear();
       }
    }

   getUnlockedStep(){
      this.isoGroup.forEach(this.activateRecipeTile, this, false);
      this.clearPrevStep(this.unlockedStep-1, this.unlockedStep);

      var myRole = this.game.roles[this.game.controllingPlayer];
      if(myRole=="Instructor")
         this.game.objcvsTxt[this.unlockedStep].setText( this.recipe[this.unlockedStep].step );
      else if(myRole=="Shopper")
         this.game.objcvsTxt[this.unlockedStep].setText( this.recipe_shopper[this.unlockedStep].step );
      else 
         this.game.objcvsTxt[this.unlockedStep].setText( this.recipe_cook[this.unlockedStep].step );
      
      this.game.objcvsTxt[this.unlockedStep].fontSize = 15;
      this.game.objcvsTxt[this.unlockedStep].fontStyle = 'normal';
      this.game.objcvsTxt[this.unlockedStep].fontWeight = "bold"
      this.game.objcvsTxt[this.unlockedStep].addColor("rgb(10, 225, 10)", 0);
      this.game.objcvs[this.unlockedStep].pointsFrame.selfDestroy();
      this.game.teamProgrTxt[this.unlockedStep].setText( "Step "+(this.unlockedStep+1)+" is enabled and revealed (...almost)!" );
      // The Shopper and the Cook, should select and drag-drop their recipe-action over the correct mark
      this.game.objcvs[this.unlockedStep].loadTexture("activeObj");
      //if(myRole!="Instructor"){
         this.game.objcvs[this.unlockedStep].actions[0].visible = true;
         this.game.objcvs[this.unlockedStep].actions[1].visible = true;
         this.game.objcvs[this.unlockedStep].actions[0].done = false;
         this.game.objcvs[this.unlockedStep].actions[1].done = false;
         this.game.objcvs[this.unlockedStep].actions[2].visible = true;
         this.game.objcvs[this.unlockedStep].nonActions[0].visible = true;
         this.game.objcvs[this.unlockedStep].nonActions[1].visible = true;
         this.game.objcvs[this.unlockedStep].nonActions[0].done = false;
         this.game.objcvs[this.unlockedStep].nonActions[1].done = false;
         this.game.objcvs[this.unlockedStep].nonActions[2].visible = true;
         this.game.objcvs[this.unlockedStep].completed = false;
      
      this.adjustLeftPoints(this.unlockedStep);
      
      this.unlockedStep = undefined;
   }

   stepProgressUpdate(currentStep, partSolvedText){
      var role = this.game.roles[this.game.controllingPlayer];
      if(role=="Shopper")
         this.game.stepsShopper[currentStep].step = partSolvedText;
      else
         this.game.stepsCook[currentStep].step = partSolvedText;
   }

   // RULE: the roles of "Shopper" and "Cook" have to fulfill 2 actions per recipe-step
   checkRcpActionOverlap(){

      for (var i=0; i<2; i++){
         if(this.checkOverlap(this.game.cursor, this.game.objcvs[this.rcpPrgrs].actions[i].pointBody) && this.game.objcvs[this.rcpPrgrs].actions[i].done==false)
         {
            console.log("Recipes choices: ", this.game.cursor.rcpItemKey, this.game.objcvs[this.rcpPrgrs].actions[i].name);
            if( this.game.cursor.rcpItemKey == this.game.objcvs[this.rcpPrgrs].actions[i].name+"-recipe"){
               window.socket.emit(PlayerEvent.opponentAnswered, {correct:undefined, category:-1, quIndex:-1, rcpAction:true});
               this.game.objcvsTxt[this.rcpPrgrs].setText( this.game.objcvs[this.rcpPrgrs].actions[i].solved[i] );
               this.game.objcvs[this.rcpPrgrs].actions[i].alpha = 1.0;
               this.game.objcvs[this.rcpPrgrs].actions[i].scale.setTo(1.0);
               this.game.objcvs[this.rcpPrgrs].actions[i].loadTexture(this.game.cursor.rcpItemKey);
               this.game.objcvs[this.rcpPrgrs].actions[i].done = true;
               this.stepProgressUpdate(this.rcpPrgrs, this.game.objcvs[this.rcpPrgrs].actions[i].solved[i]);
               window.socket.emit(PlayerEvent.updateRecipeItems, {role:this.game.roles[this.game.controllingPlayer], i:i, rcpItemKey:this.game.cursor.rcpItemKey});
               this.game.cursor.removeChildren();
               this.game.pickupMusic.play();
               rcpItemDropping = false;
            }else{
               var _this = this;
               window.socket.emit(PlayerEvent.opponentAnswered, {correct:undefined, category:-1, quIndex:-1, rcpAction:true});
               this.game.cursor.getChildAt(0).loadTexture("redX");
               setTimeout( function(){ _this.game.cursor.removeChildren();}, 700);
               this.game.wrongActionMusic.play();
               rcpItemDropping = false;
            }
            togglePlayerTurn();
         }
      }

      if(this.game.objcvs[this.rcpPrgrs].actions[0].done && this.game.objcvs[this.rcpPrgrs].actions[1].done){
         this.game.objcvs[this.rcpPrgrs].completed = true;
         //this.game.objcvs[this.rcpPrgrs].actions[0].visible = false;
         //this.game.objcvs[this.rcpPrgrs].actions[1].visible = false;
         this.game.objcvs[this.rcpPrgrs].completedBadge.visible = true;
         this.game.objcvsTxt[this.rcpPrgrs].setText( this.recipe[this.rcpPrgrs].step );
         this.game.objcvs[this.rcpPrgrs].actions[2].setText(this.game.objcvs[this.rcpPrgrs].actions[3]);
         window.socket.emit(PlayerEvent.actionsCompleted, {role: this.game.roles[this.game.controllingPlayer]});
      }

   }

   updateRecipeItems(role, i, rcpItemKey){
      this.game.pickupMusic.play();
      if(this.game.roles[this.game.controllingPlayer]=="Instructor" && role=="Shopper"){
         this.game.objcvs[this.rcpPrgrs].actions[i].loadTexture(rcpItemKey);
         this.game.objcvs[this.rcpPrgrs].actions[i].alpha = 1.0;
         this.game.objcvs[this.rcpPrgrs].actions[i].scale.setTo(1.0);
      }
      else{
         this.game.objcvs[this.rcpPrgrs].nonActions[i].loadTexture(rcpItemKey);
         this.game.objcvs[this.rcpPrgrs].nonActions[i].alpha = 1.0;
         this.game.objcvs[this.rcpPrgrs].nonActions[i].scale.setTo(1.0);
      }
   }

   updateOtherRolesProgress(role){
      if(this.game.roles[this.game.controllingPlayer]=="Instructor" && role=="Shopper"){
         this.game.objcvs[this.rcpPrgrs].completedBadge.visible = true;
         this.game.objcvs[this.rcpPrgrs].actions[2].setText(this.game.objcvs[this.rcpPrgrs].actions[3]);
      }else{
         this.game.objcvs[this.rcpPrgrs].completedBadgeOther.visible = true;
         this.game.objcvs[this.rcpPrgrs].nonActions[2].setText(this.game.objcvs[this.rcpPrgrs].nonActions[3]);
      }
      //this.game.objcvsTxt[this.rcpPrgrs].setText( this.recipe[this.rcpPrgrs].step );
   }

   getRcpStep(){
      return this.rcpPrgrs;
   }

   checkStepCompleted(){
      //console.log(this.game.objcvs[this.rcpPrgrs].completed);
      return this.game.objcvs[this.rcpPrgrs].completed;
   }

   checkOverlap(spriteA, spriteB) {
      var boundsA = spriteA.getBounds();
      var boundsB = spriteB.getBounds();
      return Phaser.Rectangle.intersects(boundsA, boundsB);
    }
  
   updateScore(category, correct=true, teamPlaying){
       //if(teamPlaying==1)
         if(correct)
            this.increaseScore_P1(category);
         else
            this.decreaseScore_P1(category);

      if(this.rcpPrgrs<this.rcpStepsPts.length && this.stepInProgress==false)
         this.checkStepsPrice();
   }

    increaseScore_P1(category) {
       if(category==0){
        this.game.player1score1 +=10;
        this.game.player1score1Text.setText(this.game.player1score1);
       }
       if(category==1){
        this.game.player1score2 +=10;
        this.game.player1score2Text.setText(this.game.player1score2);
       }
       if(category==2){
        this.game.player1score3 +=10;
        this.game.player1score3Text.setText(this.game.player1score3);
       }
     }
  

    decreaseScore_P1(category) {
      if(category==0 && this.game.player1score1>0){
         //this.game.player1score1 -=10;
         this.game.player1score1Text.setText(this.game.player1score1);
      }
      if(category==1 && this.game.player1score2>0){
         //this.game.player1score2 -=10;
         this.game.player1score2Text.setText(this.game.player1score2);
      }
      if(category==2 && this.game.player1score3>0){
         //this.game.player1score3 -=10;
         this.game.player1score3Text.setText(this.game.player1score3);
      }
    }


}