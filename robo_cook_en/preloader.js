
var tilesetImage = 'assets/sprites/tileset.png';
var tilesetData = 'assets/sprites/tileset.json';


class Preloader extends Phaser.State {


//  The Google WebFont Loader will look for this object, so create it before loading the script.
WebFontConfig = {
    //  'active' means all requested fonts have finished loading
    //  We set a 1 second delay before calling 'createText'.
    //  For some reason if we don't the browser cannot render the text the first time it's created.
    //active: function() { game.time.events.add(Phaser.Timer.SECOND, game.state.start('Boot'), this); },

    //  The Google Fonts we want to load (specify as many as you like in the array)
    google: {
        families: ['Handlee', 'Revalia']
    }
};

    preload() {
      this.ready = false;
      this.load.image('loading_bg', 'assets/images/loading_bg.png');
    }


    create() {
      
	//	This sets the preloadBar sprite as a loader sprite.
	//	What that does is automatically crop the sprite from 0 to full-width
	//	as the files below are loaded in.
  // this.game.load.setPreloadSprite(this.preloadBar);
        this.bgload = this.add.sprite(this.game.width/2,this.game.height/2, "loading_bg");
        this.bgload.anchor.set(0.5);

        this.preloadAsset = this.add.sprite(this.game.width/2-300,this.game.height/2, 'preloader');
        this.preloadAsset.scale.setTo(0.8);
        //this.preloadAsset.anchor.setTo(0.5, 0.5);
        this.game.load.onLoadComplete.addOnce(this.onLoadComplete, this);
        this.game.load.setPreloadSprite(this.preloadAsset);

        var path;
        if (typeof window.path === "undefined") {
            path = "";
        }
        else {
            path = window.path;
        }

        // button sprites taken from opengameart.org/content/ui-pack
        // chars/green_sprite taken from opengameart.org/content/platformer-art-more-animations-and-enemies
        // credit to Kenny.nl

        this.game.load.image('bg', path+'assets/robo-cook/background-scene-2.png');
        this.game.load.image("cursor", path+"assets/menus/dot_a.png");
        this.game.load.image("cursorPlaying", path+"assets/menus/can-play.png");
        this.game.load.atlas("pixels", path+"assets/pixels.png", path+"assets/pixels.json");
        this.game.load.atlasXML("buttons", path+"assets/menus/ui/greenButtons.png", path+"assets/menus/ui/greenButtons.xml");
        this.game.load.script('webfont', 'libs/webfont.js');

        //this.game.load.spritesheet('robots-blue', path+'assets/robo-cook/robots-blue.png', 180, 296);
        this.game.load.spritesheet('robots-blue-new', path+'assets/robo-cook/alternative/robocook_blue_frames.png', 115, 154);
        this.game.load.spritesheet('robots-red-new', path+'assets/robo-cook/alternative/robocook_red_frames.png', 115, 154);
        this.game.load.spritesheet('robots-green-new', path+'assets/robo-cook/alternative/robocook_green_frames.png', 115, 154);

        this.game.load.image('handPink', path+'assets/robo-cook/tool-p1.png');
        this.game.load.image('handBlue', path+'assets/robo-cook/tool-p2.png');
        this.game.load.image('kitchen-team1', path+'assets/robo-cook/kitchen-team-1.png');
        this.game.load.image('kitchen-team2', path+'assets/robo-cook/kitchen-team-2.png');
        this.game.load.image('soundOff', path+'assets/images/sound-off.png')
        this.game.load.image('soundOn', path+'assets/images/sound-on.png')
        //this.game.load.audio('bgMusic', ['assets/audio/bg_music.mp3']);
        this.game.load.audio('rollDice', ['assets/audio/dice_roll.mp3']);
        this.game.load.audio('countdown', ['assets/audio/countdown10.mp3']);
        this.game.load.audio('correct', ['assets/audio/new/correct_answer.mp3']);
        this.game.load.audio('pick-up', ['assets/audio/new/correct_action.mp3']);
        this.game.load.audio('wrong-action', ['assets/audio/new/wrong_action.mp3']);
        this.game.load.audio('player-turn', ['assets/audio/new/next_player.mp3']);
        this.game.load.audio('incorrect', ['assets/audio/new/wrong_answer.mp3']);
        this.game.load.audio('move_bonus', ['assets/audio/new/teleportation.mp3']);
        this.game.load.audio('step_done', ['assets/audio/new/step_finished.mp3']);
        this.game.load.audio('correct_answer_reveal', ['assets/audio/new/agony_music.mp3']);
        this.game.load.audio('game_finished', ['assets/audio/new/game_finished.mp3']);
        this.game.load.audio('bg_track', ['assets/audio/new/bg_track_0.mp3']);

        //this.game.load.json('questions-eng', path+'assets/questions/data/questions-eng.json');
        this.game.load.json('easy-level', path+'assets/questions/data/questions-eng.json');
        this.game.load.json('medium-level', path+'assets/questions/data/questions-en-m.json');
        this.game.load.json('hard-level', path+'assets/questions/data/questions-en-h.json');
        this.game.load.pack('images_questions', 'assets/images-pack.json', null, this);
        this.game.load.image('button', 'assets/questions/button.png');
        // change asset keys and folder/filenames if necessary
        this.game.load.image('help-message-sure', 'assets/questions/help-message.png');
        this.game.load.image('help-message-doubt', 'assets/questions/help-message-doubt.gif');
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
        this.game.load.image('badge-food-recipes-sm','assets/badges/small/food-recipe.png');
        this.game.load.image('badge-principles-sm','assets/badges/small/principles.gif');
        this.game.load.image('badge-seasonality-sm','assets/badges/small/seasonality.gif');
        this.game.load.image('obj-points','assets/badges/obj-points.png');

        this.game.load.image('learning-icon', 'assets/badges/knowledge-item.gif')
        this.game.load.image('research-icon', 'assets/badges/research-badge.gif')
        this.game.load.image('bg-score','assets/badges/scoreframe/bg-score.png');
        this.game.load.image('table-score','assets/badges/scoreframe/table-score.png');
        this.game.load.image('element-score','assets/badges/scoreframe/score-element.png');
        this.game.load.image('star-score','assets/badges/scoreframe/star-element.png');
        this.game.load.image('controlling-Instructor','assets/menus/controlling/instructor.png');
        this.game.load.image('controlling-Shopper','assets/menus/controlling/shopper.png');
        this.game.load.image('controlling-Cook','assets/menus/controlling/cook.png');
        this.game.load.image("key-arrows", 'assets/menus/key-arrows.png');
        this.game.load.image("tooltip", 'assets/menus/customTip.png');

        this.game.load.image('team-1-bonus', 'assets/badges/team-1-bonus.png');
        this.game.load.image('team-2-bonus', 'assets/badges/team-2-bonus.png');
        this.game.load.image('recipe-title', "assets/badges/title-frame.png");
        this.game.load.image('objectives', "assets/badges/objectives-frame-xl.png");
        this.game.load.image('activeObj', "assets/badges/active.png");
        this.game.load.image('noActiveObj', "assets/badges/active-no.png");

        this.game.load.image('badge-chef','assets/badges/roles/chef-icon.gif');
        this.game.load.image('badge-cook','assets/badges/roles/cook-icon.gif');
        this.game.load.image('badge-shopper','assets/badges/roles/shopper-icon.gif');

        // load the Dice assets
        this.game.load.spritesheet("dice", path + "assets/diceRed.png", 64, 64);
        this.game.load.script("BlurX", path + "assets/scripts/BlurX.js");
        this.game.load.script("BlurY", path + "assets/scripts/BlurY.js");
        this.game.load.pack('level1', 'assets/assetPack.json', null, this);

        this.game.load.image('recipe1', 'assets/menus/easy-level.png');
        this.game.load.image('recipe2', 'assets/menus/intermediate-level-2.png');
        this.game.load.image('protein-logo', 'assets/menus/protein-logo-with-flag.png');
        this.game.load.image('protein-logo-small', 'assets/menus/protein-logo-3.png');
        this.game.load.image('system-reqs', 'assets/menus/requirements-check.png');
        this.game.load.image('game-instructions', 'assets/menus/instructions-eng-p1.png');
        this.game.load.image('game-intro-pic', 'assets/menus/intro-title-pic.jpg');
        this.game.load.image('game-instructions-2', 'assets/menus/instructions-eng-p2.png');
        this.game.load.image('bubble1', 'assets/badges/particles/points-1.png');
        this.game.load.image('bubble2', 'assets/badges/particles/points-2.png');
        this.game.load.image('bubble3', 'assets/badges/particles/points-3.png');

        this.game.load.image('rcpAction-cook1', 'assets/recipe-items/recipe-1.gif');
        this.game.load.image('rcpAction-cook2', 'assets/recipe-items/recipe-2.gif');
        this.game.load.image('rcpAction-shop1', 'assets/recipe-items/shop-1.png');
        this.game.load.image('rcpAction-shop2', 'assets/recipe-items/shop-2.png');
        this.game.load.image('rcpAction-complete', 'assets/recipe-items/substeps-completed.png');
        this.game.load.image('cake-complete', 'assets/recipe-items/cake-complete.png');
        this.game.load.image('eggs-recipe', 'assets/recipe-items/eggs.png');
        this.game.load.image('salt & pepper-recipe', 'assets/recipe-items/salt-pepper.png');
        this.game.load.image('heat-recipe', 'assets/recipe-items/heating-action.jpg');
        this.game.load.image('stir-recipe', 'assets/recipe-items/stir-action.gif');
        this.game.load.image('season-recipe', 'assets/recipe-items/season-action.gif');
        this.game.load.image('beat-recipe', 'assets/recipe-items/beat-eggs.png');
        this.game.load.image('frying-recipe', 'assets/recipe-items/frying-pan-action.png');
        this.game.load.image('pan-recipe', 'assets/recipe-items/frying-pan-action.png');
        this.game.load.image('butter-recipe', 'assets/recipe-items/butter.png');
        this.game.load.image('tilt-recipe', 'assets/recipe-items/tilt-pan.png');
        this.game.load.image('melt-recipe', 'assets/recipe-items/melt.gif');
        this.game.load.image('oil-recipe', 'assets/recipe-items/oil.png');
        this.game.load.image('bowl-recipe', 'assets/recipe-items/bowl.png');
        this.game.load.image('sugar-recipe', 'assets/recipe-items/sugar.gif');
        this.game.load.image('flour-recipe', 'assets/recipe-items/flour.png');
        this.game.load.image('cocoa-recipe', 'assets/recipe-items/cocoa.png');
        this.game.load.image('preheat-recipe', 'assets/recipe-items/preheat-action.png');
        this.game.load.image('sieve-recipe', 'assets/recipe-items/sieve-action.png');
        this.game.load.image('add-recipe', 'assets/recipe-items/adding-action.png');
        this.game.load.image('mix-recipe', 'assets/recipe-items/mix-action.png');
        this.game.load.image('pour-recipe', 'assets/recipe-items/pour-action.png');
        this.game.load.image('bake-recipe', 'assets/recipe-items/bake-action.png');
        this.game.load.image('mixture-recipe', 'assets/recipe-items/mixture-action.png');
        this.game.load.image('vanilla-recipe', 'assets/recipe-items/vanilla.png');
        this.game.load.image('oregano-recipe', 'assets/recipe-items/oregano.png');
        this.game.load.image('saucepan-recipe', 'assets/recipe-items/saucepan.png');
        this.game.load.image('beans-recipe', 'assets/recipe-items/beans.png');
        this.game.load.image('strain-recipe', 'assets/recipe-items/strain-action.png');
        this.game.load.image('peppers-recipe', 'assets/recipe-items/peppers.png');
        this.game.load.image('cheese-recipe', 'assets/recipe-items/cheese.png');
        this.game.load.image('grate-recipe', 'assets/recipe-items/grate.png');
        this.game.load.image('spatula-recipe', 'assets/recipe-items/spatula.png');
        this.game.load.image('fold-recipe', 'assets/recipe-items/folded.png');
        this.game.load.image('boil-recipe', 'assets/recipe-items/boil-action.png');
        this.game.load.image('cut-recipe', 'assets/recipe-items/chop-action.png');
        this.game.load.image('salt-recipe', 'assets/recipe-items/salt.png');
        this.game.load.image('vinaigrette-recipe', 'assets/recipe-items/vinaigrette.png')
        this.game.load.image('redX', 'assets/recipe-items/redX.png');

        this.game.load.atlas('tileset', tilesetImage, tilesetData, Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);  

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
    //console.log("loading complete");
    this.ready = true;
  }

};
