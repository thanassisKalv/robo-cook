
var tilesetImage = 'assets/sprites/tileset.png';
var tilesetData = 'assets/sprites/tileset.json';
var charImage = 'assets/sprites/char.png';
var charData = 'assets/sprites/char.json';
var objectImage = 'assets/sprites/object.png';
var objectData = 'assets/sprites/object.json';

class Preloader extends Phaser.State {



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


    preload() {
	//	This sets the preloadBar sprite as a loader sprite.
	//	What that does is automatically crop the sprite from 0 to full-width
	//	as the files below are loaded in.
	// this.game.load.setPreloadSprite(this.preloadBar);

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

        this.game.load.onLoadComplete.addOnce(this.onLoadComplete, this);
        this.game.load.image('bg', path+'assets/robo-cook/background-scene-2.png');
        this.game.load.image("cursor", path+"assets/chars/dot_a.png");
        this.game.load.image("cursorPlaying", path+"assets/chars/can-play.png");
        this.game.load.image("monster", path+"assets/chars/blue_monster.png");
        this.game.load.atlas("pixels", path+"assets/pixels.png", path+"assets/pixels.json");
        this.game.load.atlasXML("buttons", path+"assets/ui/greenButtons.png", path+"assets/ui/greenButtons.xml");
        this.game.load.script('webfont', 'libs/webfont.js');

        //this.game.load.spritesheet('robots-blue', path+'assets/robo-cook/robots-blue.png', 180, 296);
        //this.game.load.spritesheet('robots-pink', path+'assets/robo-cook/robots-pink.png', 180, 296);
        // this.game.load.spritesheet('robots-green', path+'assets/robo-cook/robots-green.png', 180, 296);
        //this.game.load.spritesheet('robots-yellow', path+'assets/robo-cook/robots-yellow.png', 180, 296);
        this.game.load.spritesheet('robots-blue-new', path+'assets/robo-cook/alternative/robocook_blue_frames.png', 115, 154);
        this.game.load.spritesheet('robots-red-new', path+'assets/robo-cook/alternative/robocook_red_frames.png', 115, 154);
        this.game.load.spritesheet('robots-green-new', path+'assets/robo-cook/alternative/robocook_green_frames.png', 115, 154);

        this.game.load.image('handPink', path+'assets/robo-cook/tool-p1.png');
        this.game.load.image('handBlue', path+'assets/robo-cook/tool-p2.png');
        this.game.load.image('kitchen-team1', path+'assets/robo-cook/kitchen-team-1.png');
        this.game.load.image('kitchen-team2', path+'assets/robo-cook/kitchen-team-2.png');
        this.game.load.image('soundoff', path+'assets/images/sound-off.png')
        this.game.load.audio('bgMusic', ['assets/audio/bg_music.mp3']);
        this.game.load.audio('rollDice', ['assets/audio/dice_roll.mp3']);
        this.game.load.audio('countdown', ['assets/audio/countdown10.mp3']);
        this.game.load.audio('correct', ['assets/audio/correct-sound.mp3']);
        this.game.load.audio('incorrect', ['assets/audio/incorrect-sound.mp3']);

        this.game.load.json('questions', path+'assets/questions/data/questions.json');
        this.game.load.pack('images_questions', 'assets/images-pack.json', null, this);
        this.game.load.image('button', 'assets/questions/button.png');
        this.game.load.image('gotit', 'assets/questions/got-answer.png');
        // change asset keys and folder/filenames if necessary
        this.game.load.image('help-message-cloud', 'assets/questions/help-message-cloud.png');
        this.game.load.image('receiver-icon', 'assets/questions/receiver-icon.png');
        this.game.load.image('green-bar', 'assets/questions/green-bar.png');
        this.game.load.image('red-bar', 'assets/questions/red-bar.png');
        this.game.load.image('right', 'assets/questions/right.png');
        this.game.load.image('wrong', 'assets/questions/wrong.png');
        this.game.load.image('panelL', 'assets/menus/panelLeftEmpty.png');
        this.game.load.image('panelR', 'assets/menus/panelRightEmpty.png');

        this.game.load.image('badge-food-recipes','assets/badges/foods-recipes.png');
        this.game.load.image('badge-principles','assets/badges/principles-badge.gif');
        this.game.load.image('badge-seasonality','assets/badges/seasonality-badge-empty.gif');
        this.game.load.image('score-frame1','assets/badges/score-frame-2.png');
        this.game.load.image('score-frame2','assets/badges/score-frame-1.png');
        this.game.load.image('team-1-bonus', 'assets/badges/team-1-bonus.png');
        this.game.load.image('team-2-bonus', 'assets/badges/team-2-bonus.png');
        this.game.load.image('objectives', "assets/badges/objectives-frame.png");
        this.game.load.image('activeObj', "assets/badges/active.png");
        this.game.load.image('noActiveObj', "assets/badges/active-no.png");

        // load the Dice assets
        this.game.load.spritesheet("dice", path + "assets/diceRed.png", 64, 64);
        this.game.load.script("BlurX", path + "assets/scripts/BlurX.js");
        this.game.load.script("BlurY", path + "assets/scripts/BlurY.js");
        this.game.load.pack('level1', 'assets/assetPack.json', null, this);

        this.game.load.image('recipe1', 'assets/menus/baby-level-2.png');
        this.game.load.image('recipe2', 'assets/menus/intermediate-level-2.png');
        this.game.load.image('protein-logo', 'assets/menus/protein-logo-2.png');
        this.game.load.image('protein-logo-small', 'assets/menus/protein-logo-3.png');
        this.game.load.image('game-instructions', 'assets/menus/instructions-fixed.png');
        this.game.load.image('bubble', 'assets/particles/points-1.png');

        this.game.load.image('tree-brown', 'assets/sprites/tree-brown.png');
        this.game.load.image('tree-green', 'assets/sprites/tree-green.png');

        this.game.load.atlas('tileset', tilesetImage, tilesetData, Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);
        this.game.load.atlas('char', charImage, charData, Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);
        this.game.load.atlas('object', objectImage, objectData, Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);    

        //console.log("GOT HERE!")
        //staaaart loading
        this.game.load.start();
  }

  update() {

    if(this.ready) {
      this.game.state.start('MainMenu');
    }

  }

  onLoadComplete() {
    console.log("complete load");
    this.ready = true;
  }

};
