class Human extends Phaser.Plugin.Isometric.IsoSprite {

	constructor(game, x, y) {  
	  	super(game, x, y, 2, 'human', 0);

	  	// initialize your prefab here
		this.animations.add('idle', [10,11]);
		this.animations.play('idle', 2, true);
		this.animations.add('attack', [13,14,13,14,14,13,14]);

		this.anchor.setTo(.5, .5);
		//this.enemies = enemies;
		//this.arrows = arrows;
		this.path, this.pathPosition;

		this.shotInterval = 400;
		this.shotTime = this.game.time.now+this.shotInterval;

		this.pathFinished = new Phaser.Signal();
	}

	setPath(path) {
		this.path = path;
		this.pathPosition = -1;
	}

	advanceTile() {
		if( this.game == null)
				return;
		this.pathPosition ++;

		if(this.pathPosition < this.path.length) {
			//tween
			if( this.path[this.pathPosition].x > this.isoX ) {
				this.scale.x = 1;
			} else {
				this.scale.x = -1;
			}

			this.animations.play('idle', 2, true);
			this.walkMotion = this.game.add.tween(this).to({ isoX: this.path[this.pathPosition].x, isoY: this.path[this.pathPosition].y }, 200, Phaser.Easing.Linear.None, true);
			this.walkMotion.onComplete.add(this.advanceTile, this);
		} else {
			//this.animations.play("attack", 2);
			//this.animations.currentAnim.onComplete.addOnce(this.attackOver, this);
			this.attackOver();
		}

	}
	attackOver() {
		this.pathFinished.dispatch(this);
	}
}