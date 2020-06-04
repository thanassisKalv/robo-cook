class QuestPopUp extends Phaser.Sprite {

	constructor(game, xpos, ypos, qtype) {
		super(game, xpos, ypos, qtype);

		this.x = xpos;
		this.y = ypos;
        this.qpop = game.add.sprite( xpos, ypos, qtype);
        this.game = game;
        // global variables
        this.timeLimit = 20;        // timeLimit for countdown in seconds
        this.tLimit = 20;  
        this.timeOver = false;      // set to false at start
        this.timeBar = null;        // bar-display time remaining

         //  You can drag the pop-up window around
        this.qpop.alpha = 0.9;
        this.qpop.anchor.set(0.5);
        this.qpop.inputEnabled = true;
        //this.qpop.input.enableDrag();

        // Position the close button to the top-right of the popup sprite (minus 8px for spacing)
        var pw = ( this.qpop.width / 2) - 40;
        var ph = ( this.qpop.height / 2) - 20;

        //  And click the close button to close it down again
        this.closeButton = this.game.make.sprite(pw, -ph, 'close');
        this.closeButton.inputEnabled = true;
        this.closeButton.input.priorityID = 1;
        this.closeButton.input.useHandCursor = true;
        this.closeButton.events.onInputDown.add(this.closeWindow, this);

        //  Add the "close button" to the popup window image
        this.qpop.addChild(this.closeButton);
        this.rectCanvas = new Phaser.Rectangle(0,0, window.innerWidth, window.innerHeight);
        this.tween = null;

        this.data = this.game.cache.getJSON('questions');
        //this.categoryIndexSelected = 1;
        this.currentQuestionIndex = 0;

        //  Hide it awaiting a click
        this.qpop.scale.set(0.25);
        this.countDownMusic = this.game.add.audio('countdown');
        this.correctMusic = this.game.add.audio('correct');
        //this.countDownMusic.volume -= 25;
        this.musicPlaying = false;
    }
    
     randomIntFromInterval(min, max) { // min and max included 
        return Math.floor(Math.random() * (max - min + 1) + min);
      }

    openWindow() {
        if ((this.tween !== null && this.tween.isRunning) || this.qpop.scale.x === 1)
            return;
        //  Create a tween that will pop-open the window, but only if it's not already tweening or open
        this.tween =  this.game.add.tween(this.qpop.scale).to( { x: 0.9, y: 0.9 }, 1000, Phaser.Easing.Elastic.Out, true);
    }

	closeWindow() {
        if (this.tween && this.tween.isRunning || this.qpop.scale.x === 0.1)
            return;
        //  Create a tween that will close the window, but only if it's not already tweening or closed
        this.tween = this.game.add.tween(this.qpop.scale).to( { x: 0.01, y: 0.01 }, 500, Phaser.Easing.Elastic.In, true);
    }

    popUpQuestion(qType){
        // change position if needed (but use same position for both images)
        var musicTimer = this.countDownMusic;
        this.musicEvent = this.game.time.events.add(10000, this.playTimerMusic, this, musicTimer);

        this.backgroundBar = this.game.add.image(1100, 555, 'red-bar');
        this.timeBar = this.game.add.image(1100, 555, 'green-bar');
        // add text label to left of bar
        this.timeLabel = this.game.add.text(1100, 525, 'Time Remaining',  {font: "22px Handlee"});
        this.timeLimit = Math.floor(this.game.time.totalElapsedSeconds() ) + this.tLimit;

        this.categoryIndexSelected = qType;
        this.currentQuestionIndex = this.randomIntFromInterval(0, this.data.categories[qType].questions.length-1);
        console.log(this.categoryIndexSelected, this.currentQuestionIndex);
        this.showImageQuestion(this.categoryIndexSelected, this.currentQuestionIndex);
        // this.livesGroups = this.showLives(this.remainingLives);     --- add related score UI later
        var questionItem = this.getQuestionItem(this.categoryIndexSelected, this.currentQuestionIndex);
        this.showQuestion(questionItem);
    }

    playTimerMusic(musicTimer) {
        musicTimer.play();
    }

    showQuestion(questionItem){
        this.addQuestionTitle(questionItem.question);
        this.addButtonsChoice(questionItem.choices, questionItem.answer);
    }

    showImageQuestion(categoryIndex, questionIndex){
        var key = ['image_question', categoryIndex, questionIndex].join('_');
        this.image_question = this.game.add.image(this.x, this.y, key);
        var scale = 1;
        if(this.image_question.height > this.game.maxHeightImageQuestion){
            scale = this.game.maxHeightImageQuestion/this.image_question.height;      
        }
        this.image_question.scale.set(scale);
        this.image_question.anchor.set(0.5);
        //this.image_question.alignIn(this.rectCanvas, Phaser.TOP_CENTER);
        return this.image_question;
    }

    getQuestionItem(categoryIndex, questionIndex){
        return this.data.categories[categoryIndex].questions[questionIndex];
        //return this.listQuestionsByCategory(categoryIndex)[questionIndex];
    }

    addQuestionTitle(textContent){
        this.questionTitleElement = this.game.add.text(0,0,textContent, {
            font: "20pt Audiowide", 
            fill: "#AA0000", 
            wordWrap: true,  
            wordWrapWidth:600,
            align: "left"
        });
        this.questionTitleElement.alignTo(this.image_question, Phaser.BOTTOM_CENTER);
        //this.countDownMusic.play();
    }

    addButtonsChoice(choicesText, answerIndex){
        this.groupButtons = this.game.add.group();
        var previousGroup;
        for(var index=0;index<choicesText.length;index++){
            var isRightAnswer = (index===answerIndex);
            var group = this.addChoiceGroup(choicesText[index],isRightAnswer);
            if(previousGroup){
                group.alignTo(previousGroup, Phaser.BOTTOM_LEFT, 0);
            }
            previousGroup = group;
            this.groupButtons.add(group);
        }
        this.groupButtons.alignTo(this.questionTitleElement, Phaser.BOTTOM_CENTER, 0);
    }

    addChoiceGroup(title, isRightAnswer){
        var button = this.game.add.button(0,0, 'button', this.onButtonChoiceClicked, {context:this,isRightAnswer:isRightAnswer}, 2, 1, 0);
        
        button.scale.set(0.5);
        var text = this.game.add.text(0,0,title, {font: "16pt Audiowide", fill: "#000000", wordWrap: false,  align: "left",  });
        text.alignTo(button, Phaser.RIGHT_CENTER, 0);
        var group = this.game.add.group();
        group.add(button);
        group.add(text);
        return group;
    }

    onButtonChoiceClicked(){
        if(this.isRightAnswer){
            console.log("CHECKED CORRECT ANSWER!");
            this.context.correctMusic.play();
            // clear the questions assets with a nice tween
            this.context.groupButtons.destroy();
            this.context.questionTitleElement.destroy();
            this.context.image_question.destroy();
            this.context.backgroundBar.destroy();
            this.context.timeBar.destroy();
            this.context.timeLabel.destroy();
            this.context.game.time.events.remove(this.context.musicEvent);
            if(this.context.countDownMusic.isPlaying)
                this.context.countDownMusic.stop();

            // increase the score of the playing player
            if(playersTurn==1)
                this.context.game.cursor.healthP1 += 10;
            else
                this.context.game.cursor.healthP2 += 10;
        }
        else{
            console.log("CHECKED WRONG ANSWER!");
            this.context.groupButtons.destroy();
            this.context.questionTitleElement.destroy();
            this.context.image_question.destroy();
            this.context.backgroundBar.destroy();
            this.context.timeBar.destroy();
            this.context.timeLabel.destroy();
            this.context.game.time.events.remove(this.context.musicEvent);
            if(this.context.countDownMusic.isPlaying)
                this.context.countDownMusic.stop();
            if(playersTurn==1)
                if(this.context.game.cursor.healthP1>1)
                    this.context.game.cursor.healthP1 -= 10;
            else
                if(this.context.game.cursor.healthP2>1)
                    this.context.game.cursor.healthP2 -= 10;
        }   
    }

    displayTimeRemaining() {
        var time = Math.floor(this.game.time.totalElapsedSeconds() );
        var timeLeft = this.timeLimit - time;
    
        // detect when countdown is over
        if (timeLeft <= 0) {
            timeLeft = 0;
            this.timeBar.destroy();
            this.groupButtons.destroy();
            this.questionTitleElement.destroy();
            this.image_question.destroy();
            this.backgroundBar.destroy();
            this.timeLabel.destroy();
            this.game.time.events.remove(this.musicEvent);
        }
    
        this.timeBar.scale.setTo(timeLeft / this.tLimit, 1);
    }

    update(){
        if (this.timeBar && this.timeOver == false) 
            this.displayTimeRemaining();
    }
}