
roboCook.MainMenu = function (game) {

    //this.music = null;
    //this.playButton = null;

};

roboCook.MainMenu.prototype = {

    create: function () {

        this.stage.disableVisibilityChange = true;

        this.wsocket = this.game.socket;
        this.recipeImage1 = this.add.image(this.game.width/2-450, this.game.height/2-250, "recipe1");
        this.recipeImage1.anchor.setTo(0.5, 0.5);
        this.recipeImage1.scale.setTo(0.5, 0.5);

	    this.playButton = this.add.button(this.game.width/2-450, this.game.height/2-250, "buttons", this.joinGame1, this, 
                                          "green_button00.png", "green_button00.png", 
                                          "green_button02.png", "green_button00.png");
        this.playButton.anchor.setTo(0.5, 0.5);
        this.playButton.scale.setTo(1.5, 1.5);
        this.playButton.alpha = 0.85;

        this.proteinLogo = this.add.image(this.game.width/2-450, this.game.height/2+400, "protein-logo");
        this.proteinLogo.scale.setTo(0.33, 0.33);
        this.proteinLogo.anchor.setTo(0.5, 0.5);

        this.gameInstructions = this.add.image(this.game.width/2+350, this.game.height/2+30, "game-instructions");
        this.gameInstructions.anchor.setTo(0.5, 0.5);

        //this.playButton2 = this.add.button(this.game.width/2, this.game.height/2+100, "buttons", this.startGameRecipe2, this, 
        //                                "green_button00.png", "green_button00.png", 
        //                                "green_button02.png", "green_button00.png");

        this.text = new Phaser.Text(this.game, 0, 0, "Discovering Recipe", {font: "22px Handlee"});
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

        this.textWait.x = this.playButton.x;
        this.textWait.y = this.playButton.y+130;
        this.textWait.fill = "#191970";

        this.stage.backgroundColor = '#8abaae';
        this.stage.backgroundColor = '#dddddd';
        this.textWait.tween = this.add.tween(this.textWait).to({alpha:0.2}, 1500, Phaser.Easing.Bounce.InOut, true, 0, -1);

        var _this = this;
        this.game.socket.on(PlayerEvent.players, function (players) {
            _this.startGame1(players, _this);
        });

        this.game.socket.on(PlayerEvent.assignID, function (playerID) {
            _this.game.myID = playerID.id;
            console.log("Player got a unique ID: " +  _this.game.myID );
        });

        this.game.socket.on(PlayerEvent.quit, function (playerID) {
            console.log("Your opponent with ID has quitted: " + playerID );
            _this.state.start('MainMenu');
        });
    },

    update: function () {

	//	Maybe add some nice main-menu effect here

    },

    joinGame1: function (pointer) {
        console.log(this.game.connectedPlayers);
        this.textWait.setText("Waiting for other players to join...");
        this.wsocket.emit(GameEvent.authentication, { level: "discover-recipe" });
    },

    startGame1: function (players, _this){
        if(players["discover-recipe"].length>1)
            for (i = 0; i < players["discover-recipe"].length; i++) {
                if (players["discover-recipe"].id == _this.id){ 
                    this.state.start('Game');
                    break; 
                }
            }
    },
    
    startGameRecipe2: function (pointer) {
        this.state.start('Game');
	    
    }

};
