class RoboCook extends Phaser.Sprite {

	constructor(game, x, y, roboType, startTile, markerColor) {  
	  	super(game, x, y);

        //Phaser.Sprite.call(this, game, x, y, roboType, 1);
        this.game = game;
        // initialize your prefab here
        this.enableBody = true;
        this.inputEnabled = true;
        this.input.enableDrag(true, false, false, 255, this.game.playBoard);
        //this.physicsBodyType = Phaser.Physics.ARCADE;
        this.input.draggable = false;
        this.anchor.setTo(0.5, 0.5);
        this.scale.setTo(0.35, 0.35);
        this.currentTile = startTile;

        //  add a tweening marker below robo-cook character
        this.marker = this.game.make.sprite(-20, 130, markerColor);
        this.marker.anchor.setTo(0.5, 0.5);
        this.marker.scale.setTo(0.08, 0.08);
        this.marker.alpha = 0.7;
        this.addChild(this.marker);

        this.robotFrame = this.game.make.sprite( 0, 0, roboType, 1);
        this.robotFrame.anchor.setTo(0.5, 0.5);
        this.addChild(this.robotFrame);

        this.game.add.existing(this);
	}

    update() {

      }
}