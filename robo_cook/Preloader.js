

roboCook.Preloader = function (game) {

    this.background = null;
    this.preloadBar = null;

    this.ready = false;
};


//  The Google WebFont Loader will look for this object, so create it before loading the script.
WebFontConfig = {

    //  'active' means all requested fonts have finished loading
    //  We set a 1 second delay before calling 'createText'.
    //  For some reason if we don't the browser cannot render the text the first time it's created.
    //active: function() { game.time.events.add(Phaser.Timer.SECOND, game.state.start('Boot'), this); },

    //  The Google Fonts we want to load (specify as many as you like in the array)
    google: {
        families: ['Handlee']
    }
};

roboCook.Preloader.prototype = {

    preload: function () {
	//	This sets the preloadBar sprite as a loader sprite.
	//	What that does is automatically crop the sprite from 0 to full-width
	//	as the files below are loaded in.
	// this.load.setPreloadSprite(this.preloadBar);

        // centre the canvas
        // this.scale.pageAlignHorizontally = true;
        // this.scale.refresh();

        var path;
        if (typeof window.path === "undefined") {
            path = "";
        }
        else {
            path = window.path;
        }

        this.ready = false;
        // button sprites taken from opengameart.org/content/ui-pack
        // chars/green_sprite taken from opengameart.org/content/platformer-art-more-animations-and-enemies
        // credit to Kenny.nl

        // chars/blue_monster taken from opengameart.org/content/monsters-2d-pack-no-2
        // credit to Alucard (http://opengameart.org/users/alucard)

        this.load.onLoadComplete.addOnce(this.onLoadComplete, this);
        this.load.image('bg', path+'assets/robo-cook/background-scene-1.png');
        this.load.image("player", path+"assets/chars/green_sprite.png");
        this.load.image("circle", path+"assets/dashed_circle.png");
        this.load.image("monster", path+"assets/chars/blue_monster.png");
        this.load.atlas("pixels", path+"assets/pixels.png", path+"assets/pixels.json");
        this.load.atlasXML("buttons", path+"assets/ui/greenButtons.png", path+"assets/ui/greenButtons.xml");
        this.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');
        this.load.spritesheet('robots-blue', path+'assets/robo-cook/robots-blue.png', 180, 296);
        this.load.spritesheet('robots-pink', path+'assets/robo-cook/robots-pink.png', 180, 296);
        this.load.image('handPink', path+'assets/robo-cook/hand-pink.png');
        this.load.image('handBlue', path+'assets/robo-cook/hand-blue.png');
        this.load.image('soundoff', path+'assets/images/sound-off.png')
        this.load.audio('bgMusic', ['assets/audio/bg_music.mp3']);
        this.load.audio('rollDice', ['assets/audio/dice_roll.mp3']);
        this.load.audio('countdown', ['assets/audio/countdown10.mp3']);
        this.load.audio('correct', ['assets/audio/correct-sound.mp3']);

        this.load.json('questions', path+'assets/questions/data/questions.json');
        this.load.pack('images_questions', 'assets/images-pack.json', null, this);
        this.load.image('button', 'assets/questions/button.png');
        // change asset keys and folder/filenames if necessary
        this.load.image('green-bar', 'assets/questions/green-bar.png');
        this.load.image('red-bar', 'assets/questions/red-bar.png');
        //this.load.image('clock-running', 'assets/questions/clock-running.gif');

        // load the Dice assets
        this.load.spritesheet("dice", path + "assets/diceRed.png", 64, 64);
        this.load.script("BlurX", path + "assets/BlurX.js");
        this.load.script("BlurY", path + "assets/BlurY.js");
        this.load.pack('level1', 'assets/assetPack.json', null, this);

        //console.log("GOT HERE!")
        //staaaart loading
        this.load.start();
  },

  update: function() {

    if(this.ready) {
      this.state.start('MainMenu');
    }

  },

  onLoadComplete: function() {
    this.ready = true;
  }
};
