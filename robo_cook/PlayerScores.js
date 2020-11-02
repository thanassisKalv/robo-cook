class PlayerScores {
    constructor(game) {
      this.game = game;
  
      // --- Team-1 scoreframe elements ---
      this.game.player1score1 = 0;
      this.game.scoreFrame1 = this.game.add.image(6, 65, "score-frame1");
      this.game.scoreFrame1.scale.setTo(0.9);
      this.game.scoreFrame1.alpha = 0.55;

      this.game.player1text = this.game.add.text(30-15, 70+15, "P1 ", {font: "bold 30px Handlee"});
      this.game.player1badge1 = this.game.add.image(110-30, 90+15, "buttons", "green_button07.png");
      this.game.player1badge1.anchor.setTo(0.5);
      this.game.player1tips = this.game.add.image(110-30, 90+15, "badge-food-recipes");
      this.game.player1tips.scale.setTo(0.23);
      this.game.player1tips.anchor.setTo(0.5);
      this.game.player1score1Text = this.game.add.text(110, 70+15, ": ", {font: "bold 30px Handlee"});

      this.game.player1score2 = 0;
      this.game.player1badge2 = this.game.add.image(210-30, 90+15, "buttons", "green_button07.png");
      this.game.player1badge2.anchor.setTo(0.5);
      this.game.player1scale = this.game.add.image(210-30, 90+15, "badge-seasonality");
      this.game.player1scale.scale.setTo(0.055);
      this.game.player1scale.anchor.setTo(0.5);
      this.game.player1score2Text = this.game.add.text(210, 70+15, ": ", {font: "bold 30px Handlee"});

      this.game.player1score3 = 0;
      this.game.player1badge3 = this.game.add.image(310-30, 90+15, "buttons", "green_button07.png");
      this.game.player1badge3.anchor.setTo(0.5);
      this.game.player1forbid = this.game.add.image(310-30, 90+15, "badge-principles");
      this.game.player1forbid.scale.setTo(0.1);
      this.game.player1forbid.anchor.setTo(0.5);
      this.game.player1score3Text = this.game.add.text(310, 70+15, ": ", {font: "bold 30px Handlee"});

      // --- Team-2 scoreframe elements ---
      this.game.scoreFrame2 = this.game.add.image(6, 150, "score-frame2");
      this.game.scoreFrame2.scale.setTo(0.9);
      this.game.scoreFrame2.alpha = 0.55;

      this.game.player2score1 = 0;
      this.game.player2text = this.game.add.text(30-15, 130+40, "P2 ", {font: "bold 30px Handlee"});
      this.game.player2badge1 = this.game.add.image(110-30, 150+40, "buttons", "green_button07.png");
      this.game.player2badge1.anchor.setTo(0.5);
      this.game.player2tips = this.game.add.image(110-30, 150+40, "badge-food-recipes");
      this.game.player2tips.scale.setTo(0.23);
      this.game.player2tips.anchor.setTo(0.5);
      this.game.player2score1Text = this.game.add.text(110, 130+40, ": ", {font: "bold 30px Handlee"});

      this.game.player2score2 = 0;
      this.game.player2badge2 = this.game.add.image(210-30, 150+40, "buttons", "green_button07.png");
      this.game.player2badge2.anchor.setTo(0.5);
      this.game.player2scale = this.game.add.image(210-30, 150+40, "badge-seasonality");
      this.game.player2scale.scale.setTo(0.055);
      this.game.player2scale.anchor.setTo(0.5);
      this.game.player2score2Text = this.game.add.text(210, 130+40, ": ", {font: "bold 30px Handlee"});

      this.game.player2score3 = 0;
      this.game.player2badge3 = this.game.add.image(310-30, 150+40, "buttons", "green_button07.png");
      this.game.player2badge3.anchor.setTo(0.5);
      this.game.player2forbid = this.game.add.image(310-30, 150+40, "badge-principles");
      this.game.player2forbid.scale.setTo(0.1);
      this.game.player2forbid.anchor.setTo(0.5);
      this.game.player2score3Text = this.game.add.text(310, 130+40, ": ", {font: "bold 30px Handlee"});

      this.addOnRightPanel();
    }

   addOnRightPanel(){
      this.game.panelLeft.addChild(this.game.scoreFrame1);
      this.game.panelLeft.addChild(this.game.player1text);
      this.game.panelLeft.addChild(this.game.player1badge1);
      this.game.panelLeft.addChild(this.game.player1tips);
      this.game.panelLeft.addChild(this.game.player1score1Text);
      this.game.panelLeft.addChild(this.game.player1text);
      this.game.panelLeft.addChild(this.game.player1badge2);
      this.game.panelLeft.addChild(this.game.player1scale);
      this.game.panelLeft.addChild(this.game.player1score2Text);
      this.game.panelLeft.addChild(this.game.player1text);
      this.game.panelLeft.addChild(this.game.player1badge3);
      this.game.panelLeft.addChild(this.game.player1forbid);
      this.game.panelLeft.addChild(this.game.player1score3Text);

      this.game.panelLeft.addChild(this.game.scoreFrame2);
      this.game.panelLeft.addChild(this.game.player2text);
      this.game.panelLeft.addChild(this.game.player2badge1);
      this.game.panelLeft.addChild(this.game.player2tips);
      this.game.panelLeft.addChild(this.game.player2score1Text);
      this.game.panelLeft.addChild(this.game.player2text);
      this.game.panelLeft.addChild(this.game.player2badge2);
      this.game.panelLeft.addChild(this.game.player2scale);
      this.game.panelLeft.addChild(this.game.player2score2Text);
      this.game.panelLeft.addChild(this.game.player2text);
      this.game.panelLeft.addChild(this.game.player2badge3);
      this.game.panelLeft.addChild(this.game.player2forbid);
      this.game.panelLeft.addChild(this.game.player2score3Text);
   }
  
   updateScore(category, correct=true, teamPlaying){
       if(teamPlaying==1)
         if(correct)
            this.increaseScore_P1(category);
         else
            this.decreaseScore_P1(category);
      
      else{
         if(correct)
            this.increaseScore_P2(category);
         else
            this.decreaseScore_P2(category);
      }
   }

    increaseScore_P1(category) {
       if(category==0){
        this.game.player1score1 ++;
        this.game.player1score1Text.setText(": "+this.game.player1score1);
       }
       if(category==1){
        this.game.player1score2 ++;
        this.game.player1score2Text.setText(": "+this.game.player1score2);
       }
       if(category==2){
        this.game.player1score3 ++;
        this.game.player1score3Text.setText(": "+this.game.player1score3);
       }
     }
  
   increaseScore_P2(category) {
      if(category==0){
         this.game.player2score1 ++;
         this.game.player2score1Text.setText(": "+this.game.player2score1);
      }
      if(category==1){
         this.game.player2score2 ++;
         this.game.player2score2Text.setText(": "+this.game.player2score2);
      }
      if(category==2){
         this.game.player2score3 ++;
         this.game.player2score3Text.setText(": "+this.game.player2score3);
      }
    }


    decreaseScore_P1(category) {
      if(category==0 && this.game.player1score1>0){
         this.game.player1score1 --;
         this.game.player1score1Text.setText(": "+this.game.player1score1);
      }
      if(category==1 && this.game.player1score2>0){
         this.game.player1score2 --;
         this.game.player1score2Text.setText(": "+this.game.player1score2);
      }
      if(category==2 && this.game.player1score3>0){
         this.game.player1score3 --;
         this.game.player1score3Text.setText(": "+this.game.player1score3);
      }
    }

    decreaseScore_P2(category) {
      if(category==0 && this.game.player2score1>0){
         this.game.player2score1 --;
         this.game.player2score1Text.setText(": "+this.game.player2score1);
      }
      if(category==1 && this.game.player2score2>0){
         this.game.player2score2 --;
         this.game.player2score2Text.setText(": "+this.game.player2score2);
      }
      if(category==2 && this.game.player2score3>0){
         this.game.player2score3 --;
         this.game.player2score3Text.setText(": "+this.game.player2score3);
      }
    }
}