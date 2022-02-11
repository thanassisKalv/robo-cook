
class MainMenu extends Phaser.State {

    create () {

        this.stage.disableVisibilityChange = true;

        this.wsocket = this.game.socket;

        this.gameIntroPic =  this.add.image(0, 0, "game-intro-pic");
        this.gameIntroPic.anchor.setTo(0.5,0.5);
        this.gameIntroPic.scale.setTo(0.7);

        var btCol = "green_button00.png";
	    this.level1Button = this.add.button(this.game.width/2-450, this.game.height/2-200, "buttons", this.joinGame1, this, btCol, btCol, btCol, btCol);
        this.level1Button.anchor.setTo(0.5, 0.5);
        this.level1Button.scale.setTo(1.5, 1.5);
        this.level1Button.alpha = 0.95;

        this.level2Button = this.add.button(this.game.width/2-450, this.game.height/2-100, "buttons", this.joinGame2, this, btCol, btCol, btCol, btCol);
        this.level2Button.anchor.setTo(0.5, 0.5);
        this.level2Button.scale.setTo(1.5, 1.5);
        this.level2Button.alpha = 0.95;
        this.level2Button.tint = 0xf9a226;
        //this.level2Button.visible = false;

        this.level3Button = this.add.button(this.game.width/2-450, this.game.height/2, "buttons", this.joinGame3, this, btCol, btCol, btCol, btCol);
        this.level3Button.anchor.setTo(0.5, 0.5);
        this.level3Button.scale.setTo(1.5, 1.5);
        this.level3Button.alpha = 0.95;
        this.level3Button.tint = 0xff6d26;

        this.proteinLogo = this.add.image(this.game.width/2-450, this.game.height/2+210, "protein-logo");
        this.proteinLogo.anchor.setTo(0.5, 0.5);
        this.reqsFrame = this.add.image(this.game.width/2-450, this.game.height/2+380, "system-reqs");
        this.reqsFrame.anchor.setTo(0.5, 0.5);
        this.reqsText = new Phaser.Text(this.game, 0, 0, "►Access is recommended with Chrome or Chromium browser\n►Please use an updated version of your browser \n"+
                                                            "►Game requires screen resolution at least 1920x1080", {font: "16px Calibri"});
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
        this.moreInstructionsText = this.add.text(0,0, "Next page", {font: "bold 17px Comic Sans MS"});
        this.moreInstructionsText.anchor.setTo(0.5);
        this.istructionsDetailButton.addChild(this.moreInstructionsText);

        
        this.gameTitle = new Phaser.Text(this.game, 0, 0, "Robo-Cook's Path ", {font: "bold 28px Handlee"});
        this.add.existing(this.gameTitle);
        // Text for 1st level's button
        this.text = new Phaser.Text(this.game, 0, 0, "Junior Level", {font: "bold 21px Handlee"});
        //this.text2 = new Phaser.Text(this.game, 0, 0, "Apple crumble & custard", {font: "22px Handlee"});
        this.textWait = new Phaser.Text(this.game, 0, 0, "", {font: "17px Calibri"});
        this.textRoleAssign = new Phaser.Text(this.game, 0, 0, "", {font: "20px Handlee"});
        this.add.existing(this.text);
        this.add.existing(this.textWait);
        this.add.existing(this.textRoleAssign);
        
        this.gameTitle.anchor.setTo(0.5, 0.5);
        this.text.anchor.setTo(0.5, 0.5);
        this.textWait.anchor.setTo(0.5, 0.5);
        this.textRoleAssign.anchor.setTo(0.5, 0.5);

        this.gameTitle.x = this.level1Button.x;
        this.gameTitle.y = this.level1Button.y-160;
        this.gameTitle.fill = "#2828ef";
        this.gameIntroPic.x = this.level1Button.x;
        this.gameIntroPic.y = this.level1Button.y-100;
        this.gameIntroPic.alpha = 0.6;
        this.text.x = this.level1Button.x;
        this.text.y = this.level1Button.y;
        this.text.fill = "#191970";

        this.textWait.x = this.level1Button.x;
        this.textWait.y = this.level1Button.y+50;
        this.textWait.fill = "#191970";
        this.textWait.tween = this.add.tween(this.textWait).to({alpha:0.2}, 1500, Phaser.Easing.Bounce.InOut, true, 0, -1);
        this.textRoleAssign.x = this.level1Button.x;
        this.textRoleAssign.y = this.level1Button.y+290;
        this.textRoleAssign.fill = "#0088ff";


        // Text for 2nd level's button
        this.text2 = new Phaser.Text(this.game, 0, 0, "Senior Level", {font: "bold 21px Handlee"});
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
        this.textWait2.y = this.level2Button.y+50;
        this.textWait2.fill = "#191970";
        this.textWait2.tween = this.add.tween(this.textWait2).to({alpha:0.2}, 1500, Phaser.Easing.Bounce.InOut, true, 0, -1);

        // Text for 2nd level's button
        this.text3 = new Phaser.Text(this.game, 0, 0, "Advanced Level", {font: "bold 21px Handlee"});
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
        this.textWait3.y = this.level3Button.y+50;
        this.textWait3.fill = "#191970";
        this.textWait3.tween = this.add.tween(this.textWait3).to({alpha:0.1}, 1500, Phaser.Easing.Bounce.InOut, true, 0, 3);

        this.game.stage.backgroundColor = '#d7ffcf';

        this.roles = ["Instructor", "Shopper", "Cook"];

        var _this = this;
        this.game.socket.on(PlayerEvent.players, function (players) {
            //console.log(players);
            _this.startGame1(players, _this);
        });

        this.game.socket.on(PlayerEvent.assignID, function (playerID) {
            _this.game.myID = playerID.id;
            _this.game.myTeam = playerID.team;
            _this.game.recipeData = playerID.recipeData;
            _this.game.diffLevel = playerID.level;
            console.log("Player got a unique ID: " +  _this.game.myID );
        });

        this.game.socket.on(PlayerEvent.passcodeFailRepeat, function (response) {
            var errorCodeTitle = "The passcode you provided is not valid!\n" + "Submit your class passcode (provided by your teacher)";

            if (response.level == "easy-level")
                _this.submitPassCode("easy-level", "en", errorCodeTitle);
            else if (response.level == "medium-level")
                _this.submitPassCode("medium-level", "en", errorCodeTitle);
            else
                _this.submitPassCode("hard-level", "en", errorCodeTitle);

        });

        this.game.socket.on(PlayerEvent.passcodeCorrect, function (response) {
            if (response.level == "easy-level"){
                _this.level2Button.inputEnabled = false;  _this.level2Button.alpha = 0.6;
                _this.level3Button.inputEnabled = false;  _this.level3Button.alpha = 0.6;
                _this.textWait.setText("Waiting for other players to join...");
            }
            else if (response.level == "medium-level"){
                _this.level1Button.inputEnabled = false;  _this.level1Button.alpha = 0.6;
                _this.level3Button.inputEnabled = false;  _this.level3Button.alpha = 0.6;
                _this.textWait2.setText("Waiting for other players to join...");
            }
            else{
                _this.level1Button.inputEnabled = false;  _this.level1Button.alpha = 0.6;
                _this.level2Button.inputEnabled = false;  _this.level2Button.alpha = 0.6;
                _this.textWait3.setText("Waiting for other players to join...");
            }
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
        //button.visible = false;
        if(this.gameInstructions.key=="game-instructions")
            this.gameInstructions.loadTexture("game-instructions-2");
        else
            this.gameInstructions.loadTexture("game-instructions");
    }

    joinGame1 (pointer) {
        //this.wsocket.emit(GameEvent.authentication, { level: "easy-level", lang: "it"});
        this.submitPassCode("easy-level", "en");
        //this.wsocket.emit(GameEvent.authentication, { level: "easy-level" });
    }

    joinGame2(){
        //this.textWait2.setText("Sorry the level is currently under construction!");
        this.submitPassCode("medium-level", "en");
        //this.wsocket.emit(GameEvent.authentication, { level: "medium-level" });
    }

    joinGame3(){
        //this.textWait3.setText("Sorry the level is currently under construction!");
        this.submitPassCode("hard-level", "en");
        //this.wsocket.emit(GameEvent.authentication, { level: "hard-level" });
    }

    submitPassCode(level, lang, title = "Submit your class passcode (provided by your teacher)"){
        var _this = this;
        _this.wsocket.emit(GameEvent.authentication, {level: level, lang: lang, passcode: "without-pass-code"});
        // Swal.fire({
        //     title: title,
        //     html: '<label for="swal-input1" style="float:left;font-weight:bold;font-size:19px">Type your code correctly</label>'+
        //     '<input id="swal-input1" class="swal2-input swal2-custom">',
        //     focusConfirm: false,
        //     showLoaderOnConfirm: true,
        //     preConfirm: () => {
        //         var passcode = document.getElementById('swal-input1').value;
        //         _this.wsocket.emit(GameEvent.authentication, {level: level, lang: lang, passcode: passcode});
        //     }
        //   }).then((result) => { /* pass */ })
    }

    startGame1 (players, _this){

        if(players.length==3)
            for (var i = 0; i < players.length; i++){
                if (players[i].id == _this.game.myID){
                    _this.game.recipeData['diffLevel'] = _this.game.diffLevel;
                    this.state.start('GameState', true, false, "Beginer Cook", i, _this.game.recipeData);
                    break; 
                }
            }
        else{
            for (var i = 0; i < players.length; i++){
                if (players[i].id == _this.game.myID){
                    this.textRoleAssign.setText("Your role is: " + this.roles[i]);
                    break; 
                }
            }
        }
    }

};
