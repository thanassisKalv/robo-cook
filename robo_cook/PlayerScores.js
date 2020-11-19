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

      this.game.scoreText = this.game.add.text(95, 25, "Keep Learning", {font: "bold 30px Handlee"});
      this.game.panelBack.addChild(this.game.scoreText);
      this.game.learningBadge = this.game.add.image(275, 35, "learning-icon");
      this.game.learningBadge.scale.setTo(0.25);
      this.game.panelBack.addChild(this.game.learningBadge);
      this.game.searchBadge = this.game.add.image(50, 35, "research-icon");
      this.game.searchBadge.scale.setTo(0.3);
      this.game.panelBack.addChild(this.game.searchBadge);

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
      this.rcpStepsPts = [this.recipe[0].points, this.recipe[1].points];
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
         this.game.objcvs[this.rcpPrgrs].pointsFrame.tweenFrame();
         console.log("Step-"+this.rcpPrgrs+" of recipe unlocked!");
         this.unlockedStep = this.rcpPrgrs;
         this.stepInProgress = true;
      }
   }

   updateRecipeProgress(){
      this.stepInProgress = false;
      this.rcpPrgrs++;
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

   getUnlockedStep(){
      this.isoGroup.forEach(this.activateRecipeTile, this, false);

      var myRole = this.game.roles[this.game.controllingPlayer];
      if(myRole=="Instructor")
         this.game.objcvsTxt[this.unlockedStep].setText( this.recipe[this.unlockedStep].step );
      else if(myRole=="Shopper")
         this.game.objcvsTxt[this.unlockedStep].setText( this.recipe_shopper[this.unlockedStep].step );
      else 
         this.game.objcvsTxt[this.unlockedStep].setText( this.recipe_cook[this.unlockedStep].step );
      
      this.game.objcvsTxt[this.unlockedStep].fontSize = 24;
      this.game.objcvsTxt[this.unlockedStep].fontStyle = 'normal';
      this.game.objcvsTxt[this.unlockedStep].fontWeight = "bold"
      this.game.objcvsTxt[this.unlockedStep].addColor("rgb(10, 225, 10)", 0);
      this.game.objcvs[this.unlockedStep].pointsFrame.selfDestroy();
      // The Shopper and the Cook, should select and drag-drop their recipe-action over the correct mark
      this.game.objcvs[this.unlockedStep].loadTexture("activeObj");
      if(myRole!="Instructor"){
         this.game.objcvs[this.unlockedStep].actions[0].visible = true;
         this.game.objcvs[this.unlockedStep].actions[1].visible = true;
         this.game.objcvs[this.unlockedStep].actions[0].done = false;
         this.game.objcvs[this.unlockedStep].actions[1].done = false;
         this.game.objcvs[this.unlockedStep].completed = false;
      }
      this.adjustLeftPoints(this.unlockedStep);
      
      this.unlockedStep = undefined;
   }

   // RULE: the roles of "Shopper" and "Cook" have to fulfill 2 actions per recipe-step
   checkRcpActionOverlap(){

      for (var i=0; i<2; i++){
         if(this.checkOverlap(this.game.cursor, this.game.objcvs[this.rcpPrgrs].actions[i]) && this.game.objcvs[this.rcpPrgrs].actions[i].done==false)
         {
            console.log("Recipes choices: ", this.game.cursor.rcpItemKey, this.game.objcvs[this.rcpPrgrs].actions[i].name);
            if( this.game.cursor.rcpItemKey == this.game.objcvs[this.rcpPrgrs].actions[i].name+"-recipe"){
               window.socket.emit(PlayerEvent.opponentAnswered, {correct:undefined, category:-1, quIndex:-1, rcpAction:true});
               this.game.objcvs[this.rcpPrgrs].actions[i].alpha = 1.0;
               this.game.objcvs[this.rcpPrgrs].actions[i].scale.setTo(1.0);
               this.game.objcvs[this.rcpPrgrs].actions[i].done = true;
               this.game.cursor.removeChildren();
               this.game.correctMusic.play();
               rcpItemDropping = false;
            }else{
               window.socket.emit(PlayerEvent.opponentAnswered, {correct:undefined, category:-1, quIndex:-1, rcpAction:true});
               this.game.cursor.removeChildren();
               this.game.incorrectMusic.play();
               rcpItemDropping = false;
            }
            togglePlayerTurn();
         }
      }

      if(this.game.objcvs[this.rcpPrgrs].actions[0].done && this.game.objcvs[this.rcpPrgrs].actions[1].done){
         this.game.objcvs[this.rcpPrgrs].completed = true;
         this.game.objcvs[this.rcpPrgrs].actions[0].visible = false;
         this.game.objcvs[this.rcpPrgrs].actions[1].visible = false;
         this.game.objcvs[this.rcpPrgrs].completedBadge.visible = true;
         this.game.objcvsTxt[this.rcpPrgrs].setText( this.recipe[this.rcpPrgrs].step );
         window.socket.emit(PlayerEvent.actionsCompleted, {/*empty*/});
      }

   }

   getRcpStep(){
      return this.rcpPrgrs;
   }

   checkStepCompleted(){
      console.log(this.game.objcvs[this.rcpPrgrs].completed);
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
         this.game.player1score1 -=10;
         this.game.player1score1Text.setText(this.game.player1score1);
      }
      if(category==1 && this.game.player1score2>0){
         this.game.player1score2 -=10;
         this.game.player1score2Text.setText(this.game.player1score2);
      }
      if(category==2 && this.game.player1score3>0){
         this.game.player1score3 -=10;
         this.game.player1score3Text.setText(this.game.player1score3);
      }
    }


}