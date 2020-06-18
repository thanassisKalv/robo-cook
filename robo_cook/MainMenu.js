
roboCook.MainMenu = function (game) {

    //this.music = null;
    //this.playButton = null;

};

roboCook.MainMenu.prototype = {

    create: function () {

        this.recipeImage1 = this.add.image(this.game.width/2-250, this.game.height/2-150, "recipe1");
        this.recipeImage1.anchor.setTo(0.5, 0.5);
        this.recipeImage1.scale.setTo(0.5, 0.5);

	    this.playButton = this.add.button(this.game.width/2-250, this.game.height/2-150, "buttons", this.startGameRecipe1, this, 
                                          "green_button00.png", "green_button00.png", 
                                          "green_button02.png", "green_button00.png");
        this.playButton.anchor.setTo(0.5, 0.5);
        this.playButton.scale.setTo(1.5, 1.5);
        this.playButton.alpha = 0.85;

        this.proteinLogo = this.add.image(this.game.width/2-300, this.game.height/2+400, "protein-logo");
        this.proteinLogo.scale.setTo(0.33, 0.33);
        this.proteinLogo.anchor.setTo(0.5, 0.5);

        this.gameInstructions = this.add.image(this.game.width/2+350, this.game.height/2+30, "game-instructions");
        this.gameInstructions.anchor.setTo(0.5, 0.5);

        //this.playButton2 = this.add.button(this.game.width/2, this.game.height/2+100, "buttons", this.startGameRecipe2, this, 
        //                                "green_button00.png", "green_button00.png", 
        //                                "green_button02.png", "green_button00.png");

        this.text = new Phaser.Text(this.game, 0, 0, "Shepherd’s pie", {font: "22px Handlee"});
        //this.text2 = new Phaser.Text(this.game, 0, 0, "Apple crumble & custard", {font: "22px Handlee"});
        this.textWait = new Phaser.Text(this.game, 0, 0, "", {font: "16px Calibri"});
        this.add.existing(this.text);
        //this.add.existing(this.text2);
        this.add.existing(this.textWait);
        
        this.text.anchor.setTo(0.5, 0.5);
        //this.text2.anchor.setTo(0.5, 0.5);
        this.textWait.anchor.setTo(0.5, 0.5);

        this.text.x = this.playButton.x;
        this.text.y = this.playButton.y;
        this.text.fill = "#191970";

        //this.text2.x = this.playButton2.x;
        //this.text2.y = this.playButton2.y;
        //this.text2.fill = "#191970";

        this.textWait.x = this.playButton.x;
        this.textWait.y = this.playButton.y+70;
        this.textWait.fill = "#191970";

        this.stage.backgroundColor = '#8abaae';
        this.stage.backgroundColor = '#dddddd';
        this.textWait.tween = this.add.tween(this.textWait).to({alpha:0.2}, 1500, Phaser.Easing.Bounce.InOut, true, 0, -1);

    },

    update: function () {

	//	Do some nice main-menu effect here

    },

    startGameRecipe1: function (pointer) {
        this.state.start('Game');
	    
    },
    
    startGameRecipe2: function (pointer) {
        this.state.start('Game');
	    
    }

};
