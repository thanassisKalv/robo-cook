
class MainMenu extends Phaser.State {

    create () {

        this.stage.disableVisibilityChange = true;

        this.wsocket = this.game.socket;
        this.levelImage1 = this.add.image(this.game.width/2-450, this.game.height/2-100, "recipe1");
        this.levelImage1.anchor.setTo(0.5, 0.5);
        this.levelImage1.scale.setTo(0.5, 0.5);
        this.levelImage2 = this.add.image(this.game.width/2-450, this.game.height/2, "recipe2");
        this.levelImage2.anchor.setTo(0.5, 0.5);
        this.levelImage2.scale.setTo(0.55, 0.55);
        this.levelImage2.alpha = 0.35;
        //this.levelImage2.visible = false;


	    this.level1Button = this.add.button(this.game.width/2-450, this.game.height/2-100, "buttons", this.joinGame1, this, 
                                          "green_button00.png", "green_button00.png", 
                                          "green_button02.png", "green_button00.png");
        this.level1Button.anchor.setTo(0.5, 0.5);
        this.level1Button.scale.setTo(1.5, 1.5);
        this.level1Button.alpha = 0.95;

        this.level2Button = this.add.button(this.game.width/2-450, this.game.height/2, "buttons", this.joinGame2, this, 
                                        "green_button00.png", "green_button00.png", 
                                        "green_button02.png", "green_button00.png");

        this.level2Button.anchor.setTo(0.5, 0.5);
        this.level2Button.scale.setTo(1.5, 1.5);
        this.level2Button.alpha = 0.45;
        //this.level2Button.visible = false;

        this.level3Button = this.add.button(this.game.width/2-450, this.game.height/2+100, "buttons", this.joinGame3, this, 
                                        "green_button00.png", "green_button00.png", 
                                        "green_button02.png", "green_button00.png");
        this.level3Button.anchor.setTo(0.5, 0.5);
        this.level3Button.scale.setTo(1.5, 1.5);
        this.level3Button.alpha = 0.95;

        this.proteinLogo = this.add.image(this.game.width/2-450, this.game.height/2+210, "protein-logo");
        this.proteinLogo.anchor.setTo(0.5, 0.5);
        this.reqsFrame = this.add.image(this.game.width/2-450, this.game.height/2+380, "system-reqs");
        this.reqsFrame.anchor.setTo(0.5, 0.5);
        this.reqsText = new Phaser.Text(this.game, 0, 0, "►Si raccomanda di usare il gioco con Chrome o Chromium\n►Usare una versione aggiornata del browser \n"+
                                                            "►Il gioco richiede la risoluzione dello schermo 1920x1080", {font: "16px Calibri"});
        this.reqsText.x = this.reqsFrame.x;
        this.reqsText.y = this.reqsFrame.y+10;
        this.reqsText.anchor.set(0.5);
        this.add.existing(this.reqsText);

        this.gameInstructions = this.add.image(this.game.width/2+350, this.game.height/2, "game-instructions");
        this.gameInstructions.anchor.setTo(0.5, 0.5);
	    this.istructionsDetailButton = this.add.button(0, 200, "buttons", this.moreInstructionShow, this, 
                                          "green_button00.png", "green_button00.png", 
                                          "green_button02.png", "green_button00.png");
        this.istructionsDetailButton.anchor.setTo(0.5, 0.5);
        this.istructionsDetailButton.alpha = 0.80;
        this.gameInstructions.addChild(this.istructionsDetailButton);
        this.moreInstructionsText = this.add.text(0,0, "Istruzioni dettagliate", {font: "bold 17px Comic Sans MS"});
        this.moreInstructionsText.anchor.setTo(0.5);
        this.istructionsDetailButton.addChild(this.moreInstructionsText);

        // Text for 1st level's button
        this.text = new Phaser.Text(this.game, 0, 0, "        Start \nRobo-cook's Path", {font: "bold 21px Handlee"});
        //this.text2 = new Phaser.Text(this.game, 0, 0, "Apple crumble & custard", {font: "22px Handlee"});
        this.textWait = new Phaser.Text(this.game, 0, 0, "", {font: "17px Calibri"});
        this.textRoleAssign = new Phaser.Text(this.game, 0, 0, "", {font: "20px Handlee"});
        this.add.existing(this.text);
        this.add.existing(this.textWait);
        this.add.existing(this.textRoleAssign);
        
        this.text.anchor.setTo(0.5, 0.5);
        //this.text2.anchor.setTo(0.5, 0.5);
        this.textWait.anchor.setTo(0.5, 0.5);
        this.textRoleAssign.anchor.setTo(0.5, 0.5);

        this.text.x = this.level1Button.x;
        this.text.y = this.level1Button.y;
        this.text.fill = "#191970";

        this.textWait.x = this.level1Button.x;
        this.textWait.y = this.level1Button.y+60;
        this.textWait.fill = "#191970";
        this.textWait.tween = this.add.tween(this.textWait).to({alpha:0.2}, 1500, Phaser.Easing.Bounce.InOut, true, 0, -1);
        this.textRoleAssign.x = this.level1Button.x;
        this.textRoleAssign.y = this.level1Button.y+90;
        this.textRoleAssign.fill = "#0088ff";


        // Text for 2nd level's button
        this.text2 = new Phaser.Text(this.game, 0, 0, "Intermediate Questions", {font: "21px Handlee"});
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
        //this.text2.visible = false;

        this.textWait2.x = this.level2Button.x;
        this.textWait2.y = this.level2Button.y+60;
        this.textWait2.fill = "#191970";
        this.textWait2.tween = this.add.tween(this.textWait2).to({alpha:0.1}, 1500, Phaser.Easing.Bounce.InOut, true, 0, 3);

        // Text for 2nd level's button
        this.text3 = new Phaser.Text(this.game, 0, 0, "Advanced Questions", {font: "21px Handlee"});
        //this.text2 = new Phaser.Text(this.game, 0, 0, "Apple crumble & custard", {font: "22px Handlee"});
        this.textWait3 = new Phaser.Text(this.game, 0, 0, "", {font: "17px Calibri"});
        this.add.existing(this.text3);
        //this.add.existing(this.text2);
        this.add.existing(this.textWait3);
        
        this.text3.anchor.setTo(0.5, 0.5);
        //this.text2.anchor.setTo(0.5, 0.5);
        this.textWait3.anchor.setTo(0.5, 0.5);

        this.text3.x = this.level3Button.x;
        this.text3.y = this.level3Button.y;
        this.text3.fill = "#191970";
        //this.text2.visible = false;

        this.textWait3.x = this.level3Button.x;
        this.textWait3.y = this.level3Button.y+60;
        this.textWait3.fill = "#191970";
        this.textWait3.tween = this.add.tween(this.textWait3).to({alpha:0.1}, 1500, Phaser.Easing.Bounce.InOut, true, 0, 3);

        this.game.stage.backgroundColor = '#d7ffcf';

        this.roles = ["Maestro", "Compratore", "Cuciniere"];

        var _this = this;
        this.game.socket.on(PlayerEvent.players, function (players) {
            //console.log(players);
            _this.startGame1(players, _this);
        });

        this.game.socket.on(PlayerEvent.assignID, function (playerID) {
            _this.game.myID = playerID.id;
            _this.game.myTeam = playerID.team;
            _this.game.recipeData = playerID.recipeData;
            console.log("Player got a unique ID: " +  _this.game.myID );
        });

        this.game.socket.on(PlayerEvent.levelFull, function (warning) {
            _this.textWait.setText("Sorry the level is full at the moment");
            _this.textWait.fill = "#ff0000";
        });

        this.game.socket.on(PlayerEvent.quit, function (playerID) {
            console.log("Your teamplayer with ID has quitted: " + playerID );
            Swal.close();
            //_this.music.stop();
            _this.game.world.removeAll(true);
            _this.state.start('MainMenu', true, false);
            location.reload();
        });
    }

    update () {
	    //	Maybe add some nice main-menu effect here
    }

    moreInstructionShow(button){
        button.visible = false;
        this.gameInstructions.loadTexture("game-instructions-details");
    }

    joinGame1 (pointer) {
        //console.log(this.game.connectedPlayers);
        this.textWait.setText("Waiting for other players to join...");
        this.wsocket.emit(GameEvent.authentication, { level: "easy-level" });
    }

    joinGame2(){
        //console.log("Sorry the level is currently under construction!")
        //this.textWait2.setText("Sorry the level is currently under construction!");
        this.textWait2.setText("Waiting for other players to join...");
        this.wsocket.emit(GameEvent.authentication, { level: "medium-level" });
    }

    joinGame3(){
        //console.log("Sorry the level is currently under construction!")
        //this.textWait2.setText("Sorry the level is currently under construction!");
        this.textWait2.setText("Waiting for other players to join...");
        this.wsocket.emit(GameEvent.authentication, { level: "hard-level" });
    }

    startGame1 (players, _this){

        if(players.length==3)
            for (var i = 0; i < players.length; i++)
            {
                if (players[i].id == _this.game.myID){
                    this.state.start('GameState', true, false, "Beginer Cook", i, _this.game.recipeData);
                    break; 
                }
            }
        else{
            for (var i = 0; i < players.length; i++)
            {
                if (players[i].id == _this.game.myID){
                    this.textRoleAssign.setText("Il tuo personaggio è: " + this.roles[i]);
                    break; 
                }
            }
        }
    }
    
    startGameRecipe2 (pointer) {
        this.state.start('GameState');
    }

};
