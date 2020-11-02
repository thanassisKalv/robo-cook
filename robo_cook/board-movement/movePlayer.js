function movePlayerOnBoard(_this, sprite, targetTile, controlling, finishedDice, bonus)
{
    playerMoving = true;
    sprite.moveTween = _this.game.add.tween(sprite).to({isoX: targetTile.isoX, isoY: targetTile.isoY}, 400, Phaser.Easing.Sinusoidal.InOut);
    sprite.moveTween.start();
    sprite.alpha = 0.55;
    _this.currentTargetTile = targetTile;
    if(finishedDice==false){
        window.socket.emit(PlayerEvent.diceBonus, {team:teamsTurn[playersTurn], bonus:bonus})
    }

    if(controlling){
        _this.uuidSend = uuid();
        //console.log(_this.uuidSend)
        window.socket.emit(PlayerEvent.coordinates,  { uuidToken: _this.uuidSend, player: playersTurn, diceTotal: total, playersTile: {x: targetTile.Xtable, y: targetTile.Ytable}});
    }
    //else
        //console.log(_this.uuidReceived)
    sprite.moveTween.onComplete.add(function() {
        sprite.currentTile = targetTile;
        sprite.alpha = 1;

        if(targetTile.key.includes("path-q")){
            if(controlling){
                if(_this.uuidSend==_this.uuidReceived)
                    targetTile.questpop.popUpQuestion(targetTile.questNum);
                else
                     setTimeout( _this.waitPlayerSync(), 200)
             }
            else{
                 window.socket.emit(PlayerEvent.playerSynced, {uuidToken: _this.uuidReceived});
                 _this.game.tileToHelp = targetTile;
                 targetTile.questpop.waitOtherPlayer( /* empty-for-now */);
             }
            targetTile.occupant = _this.game.playersActive[playersTurn-1];
        }
        else{
            if(targetTile.key.includes("quest"))
                _this.targetTiles[targetTile.ingredient].loadTexture(targetTile.ingredient.replace("target", "progress"))

            targetTile.occupant = _this.game.playersActive[playersTurn-1];

            togglePlayerTurn();

            pendingMove = false;
        }

        playerMoving = false;

        if (typeof sprite.markerScale !== 'undefined')
            sprite.markerScale.pause();
        sprite.marker.scale.setTo(0.08, 0.08);
        
        _this.isoGroup.forEach(t => { t.tint = 0xffffff});
        setTimeout( _this.isoGroup.forEach(t => { t.tint = 0xffffff}), 700);

    }, _this);

}