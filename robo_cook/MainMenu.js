
roboCook.MainMenu = function (game) {

    //this.music = null;
    //this.level1Button = null;

};

roboCook.MainMenu.prototype = {

    create: function () {

        this.stage.disableVisibilityChange = true;

        this.wsocket = this.game.socket;
        this.levelImage1 = this.add.image(this.game.width/2-450, this.game.height/2-250, "recipe1");
        this.levelImage1.anchor.setTo(0.5, 0.5);
        this.levelImage1.scale.setTo(0.5, 0.5);
        this.levelImage2 = this.add.image(this.game.width/2-450, this.game.height/2, "recipe2");
        this.levelImage2.anchor.setTo(0.5, 0.5);
        this.levelImage2.scale.setTo(0.55, 0.55);
        this.levelImage2.alpha = 0.35;


	    this.level1Button = this.add.button(this.game.width/2-450, this.game.height/2-250, "buttons", this.joinGame1, this, 
                                          "green_button00.png", "green_button00.png", 
                                          "green_button02.png", "green_button00.png");
        this.level1Button.anchor.setTo(0.5, 0.5);
        this.level1Button.scale.setTo(1.5, 1.5);
        this.level1Button.alpha = 0.95;

        this.level2Button = this.add.button(this.game.width/2-450, this.game.height/2, "buttons", this.emptyLevel, this, 
                                        "green_button00.png", "green_button00.png", 
                                        "green_button02.png", "green_button00.png");

        this.level2Button.anchor.setTo(0.5, 0.5);
        this.level2Button.scale.setTo(1.5, 1.5);
        this.level2Button.alpha = 0.45;

        this.proteinLogo = this.add.image(this.game.width/2-450, this.game.height/2+400, "protein-logo");
        this.proteinLogo.scale.setTo(0.33, 0.33);
        this.proteinLogo.anchor.setTo(0.5, 0.5);

        this.gameInstructions = this.add.image(this.game.width/2+350, this.game.height/2+30, "game-instructions");
        this.gameInstructions.anchor.setTo(0.5, 0.5);


        // Text for 1st level's button
        this.text = new Phaser.Text(this.game, 0, 0, "Begin with Basic stuff", {font: "22px Handlee"});
        //this.text2 = new Phaser.Text(this.game, 0, 0, "Apple crumble & custard", {font: "22px Handlee"});
        this.textWait = new Phaser.Text(this.game, 0, 0, "", {font: "17px Calibri"});
        this.add.existing(this.text);
        //this.add.existing(this.text2);
        this.add.existing(this.textWait);
        
        this.text.anchor.setTo(0.5, 0.5);
        //this.text2.anchor.setTo(0.5, 0.5);
        this.textWait.anchor.setTo(0.5, 0.5);

        this.text.x = this.level1Button.x;
        this.text.y = this.level1Button.y;
        this.text.fill = "#191970";

        this.textWait.x = this.level1Button.x;
        this.textWait.y = this.level1Button.y+60;
        this.textWait.fill = "#191970";

        this.stage.backgroundColor = '#8abaae';
        this.stage.backgroundColor = '#dddddd';
        this.textWait.tween = this.add.tween(this.textWait).to({alpha:0.2}, 1500, Phaser.Easing.Bounce.InOut, true, 0, -1);


        // Text for 2nd level's button
        this.text2 = new Phaser.Text(this.game, 0, 0, "More interesting stuff", {font: "22px Handlee"});
        //this.text2 = new Phaser.Text(this.game, 0, 0, "Apple crumble & custard", {font: "22px Handlee"});
        this.textWait2 = new Phaser.Text(this.game, 0, 0, "", {font: "17px Calibri"});
        this.add.existing(this.text2);
        //this.add.existing(this.text2);
        this.add.existing(this.textWait2);
        
        this.text2.anchor.setTo(0.5, 0.5);
        //this.text2.anchor.setTo(0.5, 0.5);
        this.textWait2.anchor.setTo(0.5, 0.5);

        this.text2.x = this.level2Button.x;
        this.text2.y = this.level2Button.y;
        this.text2.fill = "#191970";

        this.textWait2.x = this.level2Button.x;
        this.textWait2.y = this.level2Button.y+60;
        this.textWait2.fill = "#191970";

        this.stage.backgroundColor = '#8abaae';
        this.stage.backgroundColor = '#dddddd';
        this.textWait2.tween = this.add.tween(this.textWait2).to({alpha:0.1}, 1500, Phaser.Easing.Bounce.InOut, true, 0, 3);


        var _this = this;
        this.game.socket.on(PlayerEvent.players, function (players) {
            //console.log(players);
            _this.startGame1(players, _this);
        });

        this.game.socket.on(PlayerEvent.assignID, function (playerID) {
            _this.game.myID = playerID.id;
            console.log("Player got a unique ID: " +  _this.game.myID );
        });


    },

    update: function () {
	    //	Maybe add some nice main-menu effect here
    },

    emptyLevel: function(){
        console.log("Sorry the level is currently under construction!")
        this.textWait2.setText("Sorry the level is currently under construction!");
    },

    joinGame1: function (pointer) {
        console.log(this.game.connectedPlayers);
        this.textWait.setText("Waiting for other players to join...");
        this.wsocket.emit(GameEvent.authentication, { level: "discover-recipe" });
    },

    startGame1: function (players, _this){
        if(players["discover-recipe"].length>1)
            for (i = 0; i < players["discover-recipe"].length; i++) {
                if (players["discover-recipe"][i].id == _this.game.myID){ 
                    this.state.start('Game', true, false, "Beginer Cook", i);
                    break; 
                }
            }
    },
    
    startGameRecipe2: function (pointer) {
        this.state.start('Game');
    }

};
