// Extended Phaser.Sprite
// Added a function to animate rolling.
Dice = function (game, x, y, id) {
    Phaser.Sprite.call(this, game, x, y, 'dice');
    
    this.tween;
    this.anim;
    this.blurX = game.add.filter("BlurX");  // Blur filters taken from
    this.blurY = game.add.filter("BlurY");  // Filters -> blur example
    this.id = id;
    this.player1 = null;
    this.player2 = null;

    // change the origin point from the top left (where Phaser puts it)
    // to the centre
    this.anchor.setTo(0.5, 0.5);

    var frames = [];
    for (var i=0; i < 15; i++) {
        frames[i] = game.rnd.pick([0,1,2,4,5,6]);
    }

    // the animation displays the frames from the spritesheet in a random order
    this.anim = this.animations.add("roll", frames);
    this.anim.onComplete.add(this.rollComplete, this); 

    this.frame = 1;
    game.add.existing(this);
    //game.panelRight.addChild(this);
    this.game = game;
};

Dice.prototype = Object.create(Phaser.Sprite.prototype);
Dice.prototype.constructor = Dice;


Dice.prototype.roll = function() {
    this.filters = [this.blurX, this.blurY];
    this.animations.play("roll", 20);
};

Dice.prototype.rollComplete = function() {
    this.filters = null;
    this.frame = this.game.rnd.pick([0,1,2,4,5,6]);
    diceFrames[this.id] = this.frame;
    total += this.value();
    newDiceResult = true;
    if(this.id==1){
        // **** /SOCKET inform other player for dice-results **** //
        this.game.socket.emit(PlayerEvent.newDiceResult, {diceTotal:total, frames:diceFrames });
        // **** /SOCKET **** //
        //console.log(total);
    }
};

Dice.prototype.updateFrame = function(fnum) {
    this.frame = fnum;
};

Dice.prototype.update = function() {
    if (this.anim.isPlaying) {
        this.angle = this.game.rnd.angle();
    }
};

Dice.prototype.value = function() {

    switch(this.frame) {
    case 0:
        return 6;
        break;
    case 1:
        return 1;
        break;
    case 2:
        return 2;
        break;
    case 4:
        return 5;
        break;
    case 5:
        return 3;
        break;
    case 6:
        return 4;
        break;
    default:
        return null;
        break;
    }
};

