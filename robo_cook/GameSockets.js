
function registerSocketListeners(_this, window)
{
    const roles = {1:"Instructor", 2: "Shopper", 3: "Cook"};
    const rolesIcon = {1:'badge-chef', 2:'badge-shopper', 3:'badge-cook'};
    window.socket.on(PlayerEvent.coordinates, function (playerMove) {
        _this.uuidReceived = playerMove.uuidToken;
        _this.moveOtherPlayer(playerMove);
    });

    window.socket.on(PlayerEvent.newDiceResult, function (diceResult) {
        newDiceResult = true;
        //console.log(diceResult);
        total = diceResult.diceTotal;
        //_this.addMarkerScale();
        _this.resumeMarkerScale();
    });

    window.socket.on(PlayerEvent.gotDiceResult, function (diceResult) {
        //_this.addMarkerScale();
        _this.resumeMarkerScale();
    });

    window.socket.on(PlayerEvent.getPlayerTurn, function (syncPlayersTurn) {
        playersTurn = syncPlayersTurn;
        _this.game.playingNowText.setText(roles[playersTurn]+"'s");
        _this.game.playingRoleIcon.loadTexture(rolesIcon[playersTurn]);

        if(playersTurn == _this.game.controllingPlayer){
            _this.game.handDiceTween.resume();
            _this.game.playingRoleIcon.tween.resume();
        }
        else{
            _this.game.playingRoleIcon.tween.pause();
            _this.game.playingRoleIcon.scale.setTo(0.5);
        }

        //_this.game.camera.follow(_this.game.playersActive[playersTurn-1], Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);
        _this.game.world.bringToTop(_this.game.panelLeft);
        _this.game.world.bringToTop(_this.game.panelRight);
        _this.game.world.bringToTop(_this.game.ptEmitters[0]);
        _this.game.world.bringToTop(_this.game.ptEmitters[1]);
        _this.game.world.bringToTop(_this.game.ptEmitters[2]);

        for(var i=0; i<_this.game.playersActive.length; i++)
            if(playersTurn-1 != i)
                if (typeof _this.game.playersActive[i].markerScale !== 'undefined')
                    _this.game.playersActive[i].markerScale.pause();
    });
    
    window.socket.on(PlayerEvent.playerSynced, function (syncData){
        _this.uuidReceived = syncData.uuidToken;
        
        if(_this.waitingSync){
            console.log(syncData);
            _this.waitingSync = false;
            Swal.close();
            if(playersTurn == _this.game.controllingPlayer)
                _this.currentTargetTile.questpop.popUpQuestion(_this.currentTargetTile.questNum);
        }
    });

    window.socket.on(PlayerEvent.startSynced, function (data) {
        console.log(data);
        _this.startSynced = true;
        _this.waitingSync = false;
        Swal.close();
    });

    window.socket.on(PlayerEvent.diceBonus, function (data) {
        teamsDiceBonus[data.team] += data.bonus;
        if(data.team==1){
            _this.game.dicePlusText1.setText(": "+teamsDiceBonus[data.team]);
            _this.game.add.tween(_this.game.dicePlusTeam1.scale).to( {x:1,y:1}, 400, Phaser.Easing.Quadratic.Out, true).yoyo(true, 300);
        }
        else{
            _this.game.dicePlusText2.setText(": "+teamsDiceBonus[data.team]);
            _this.game.add.tween(_this.game.dicePlusTeam2.scale).to( {x:1,y:1}, 400, Phaser.Easing.Quadratic.Out, true).yoyo(true, 300);
        }
    });


    window.socket.on(PlayerEvent.opponentAnswered, function (data) {
        _this.otherPlayerAnswered(data);
        _this.game.questionsAnswered = data.updatedQuestions;
        Swal.close();
    });
    
    window.socket.on(PlayerEvent.updateQuestions, function (updatedQuestions) {
        _this.game.questionsAnswered = updatedQuestions;
    });

    window.socket.on(PlayerEvent.helpMeAnswer, function (questionItem) {
        //console.log(questionItem);
        _this.game.tileToHelp.questpop.showQuestionAsTeamHelp(questionItem)
    });

    window.socket.on(PlayerEvent.stepCompleted, function (msgEmpty) {
        _this.game.scoreHandler.updateRecipeProgress();
    });

    window.socket.on(PlayerEvent.sendHelp, function (helpMessage) {

        var helpCloudX = _this.game.msgReceiver.x;
        var helpCloudY = _this.game.msgReceiver.y;
        if(_this.game.helpClouds.length==0)
            var msgHelpMsg = _this.game.add.sprite(helpCloudX+35, helpCloudY-40, 'help-message-cloud');
        else
            var msgHelpMsg = _this.game.add.sprite(helpCloudX+20, helpCloudY-170, 'help-message-cloud');
        
        _this.game.helpClouds.push(msgHelpMsg);
        var msgΗelpText = _this.game.add.text(-90, -40, helpMessage.helpText, {font: "21px Handlee"});
        msgΗelpText.wordWrap = true;
        msgΗelpText.wordWrapWidth = 200;
        msgHelpMsg.addChild(msgΗelpText);
        msgHelpMsg.visible = false;
        msgHelpMsg.anchor.setTo(0.5, 0.5);
        msgHelpMsg.scale.setTo(0.3);

        var i = _this.game.helpClouds.length-1;
        _this.game.helpClouds[i].visible = true;
        _this.game.add.tween(_this.game.helpClouds[i].scale).to( {x:0.9, y:0.9}, 400, Phaser.Easing.Quadratic.Out, true);
        _this.game.panelBackR.addChild( _this.game.helpClouds[i] );
    });

    //  ******   PLAYER HAS QUITTED  -->  RESET STATE VARIABLES & RESTART SCENE
    window.socket.on(PlayerEvent.quit, function (playerID) {
        console.log("Your opponent with ID has quitted: " + playerID );
        Swal.close();
        _this.resetGlobalState();
        //_this.music.stop();
        _this.game.world.removeAll(true);
        _this.state.start('MainMenu', true, false);
    });
}