class QuestPopUp extends Phaser.Sprite {

	constructor(game, xpos, ypos, qtype) {
		super(game, xpos, ypos, qtype);

		this.x = xpos;
		this.y = ypos;
        this.qpop = game.add.sprite( xpos, ypos, qtype);
        this.game = game;
        this.questComponents = this.game.add.group();
        this.answerComponents = this.game.add.group();

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

        this.rectCanvas = new Phaser.Rectangle(0,0, window.innerWidth, window.innerHeight);
        this.tween = null;

        this.data = this.game.cache.getJSON('questions');
        //this.categoryIndexSelected = 1;
        this.currentQuestionIndex = 0;

        //  Hide it awaiting a click
        this.qpop.scale.set(0.25);
        this.countDownMusic = this.game.add.audio('countdown');
        this.correctMusic = this.game.add.audio('correct');
        this.incorrectMusic = this.game.add.audio('incorrect');
        this.incorrectMusic.volume = 0.5;
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
        this.questComponents = this.game.add.group();
        this.answerComponents = this.game.add.group();
        this.timeOver = false;
        // change position if needed (but use same position for both images)
        var musicTimer = this.countDownMusic;
        this.musicEvent = this.game.time.events.add(10000, this.playTimerMusic, this, musicTimer);

        this.bgBar = this.game.add.image(1100, 555, 'red-bar');
        this.timeBar = this.game.add.image(1100, 555, 'green-bar');
        this.timeClock = this.game.add.sprite(1120, 600, 'clock-running', 0);
        this.timeClock.animations.add('run', [0,1,2,3,4,5,6,7]);
		this.timeClock.animations.play('run', 4, true);
        this.timeClock.anchor.set(0.5,0.5);
        this.timeClock.scale.set(0.3);
        // add text label to left of bar
        this.timeLabel = this.game.add.text(1100, 525, 'Time Remaining',  {font: "22px Handlee"});
        this.timeLimit = Math.floor(this.game.time.totalElapsedSeconds() ) + this.tLimit;

        this.categoryIndexSelected = qType;
        this.currentQuestionIndex = this.randomIntFromInterval(0, this.data.categories[qType].questions.length-1);
        console.log(this.categoryIndexSelected, this.currentQuestionIndex);
        this.showImageQuestion(this.categoryIndexSelected, this.currentQuestionIndex);
        this.showImageAnswer(this.categoryIndexSelected, this.currentQuestionIndex);
        
        // this.livesGroups = this.showLives(this.remainingLives);     -- add related score UI later
        var questionItem = this.getQuestionItem(this.categoryIndexSelected, this.currentQuestionIndex);
        this.showQuestion(questionItem);
        if(this.y+this.questComponents.height > this.game.playBoard.height+200){
            var fixHeight = (this.y+this.questComponents.height)-(this.game.playBoard.height+200);
            this.questComponents.children[0].position.y = this.questComponents.children[0].position.y - fixHeight;
            this.questComponents.children[1].position.y = this.questComponents.children[1].position.y - fixHeight;
            this.questComponents.children[2].position.y = this.questComponents.children[2].position.y - fixHeight;
        }
        if(this.x-this.questComponents.width/2 < 0){
            var fixWidth = (this.x+this.questComponents.width/2);
            this.questComponents.children[0].position.x = this.questComponents.children[0].position.x + fixWidth/2;
            this.questComponents.children[1].position.x = this.questComponents.children[1].position.x + fixWidth/2;
            this.questComponents.children[2].position.x = this.questComponents.children[2].position.x + fixWidth/2;
        }
        if(this.y+this.answerComponents.height > this.game.playBoard.height+200){
            var fixHeight = (this.y+this.answerComponents.height)-(this.game.playBoard.height+200);
            this.answerComponents.children[0].position.y = this.answerComponents.children[0].position.y - fixHeight;
        }
        if(this.x-this.answerComponents.width/2 < 0){
            var fixWidth = (this.x+this.answerComponents.width/2);
            this.answerComponents.children[0].position.x = this.answerComponents.children[0].position.x + fixWidth/2;
        }

        // present the questItem with a smooth open-up pop
        this.questComponents.scale.set(0.01);
        this.answerComponents.scale.set(0.01);
        this.qtween = this.game.add.tween(this.questComponents.scale).to( { x: 1.0, y: 1.0 }, 400, Phaser.Easing.Elastic.Out, true);
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
        var scale = 1.0;
        if(this.image_question.height > this.game.maxHeightImageQuestion){
            scale = this.game.maxHeightImageQuestion/this.image_question.height;      
        }
        this.image_question.scale.set(scale);
        this.image_question.anchor.set(0.5);
        //this.image_question.alignIn(this.rectCanvas, Phaser.TOP_CENTER);
        this.questComponents.add(this.image_question);
        return this.image_question;
    }
    
    showImageAnswer(categoryIndex, questionIndex){
        var key = ['image_answer', categoryIndex, questionIndex].join('_');
        this.image_answer = this.game.add.image(this.x, this.y, key);
        var scale = 1.0;
        if(this.image_answer.height > this.game.maxHeightImageQuestion){
            scale = this.game.maxHeightImageQuestion/this.image_answer.height;      
        }
        this.image_answer.scale.set(scale);
        this.image_answer.anchor.set(0.5);
        this.answerComponents.add(this.image_answer);
        return this.image_answer;
    }

    showResultAnswer(context, isRightAnswer){
        var imageName = context.getAnswerImage(isRightAnswer);
        //var imageAnswer = context.game.add.image(0,200, imageName);
        //imageAnswer.alignTo(context.image_answer, Phaser.BOTTOM_CENTER);
        //context.answerComponents.add(imageAnswer);
        var checkButton = context.game.add.button(0,0, 'gotit', this.onCheckClicked, {context:context}, 2, 1, 0);
        context.answerComponents.add(checkButton);
        checkButton.alignTo(context.image_answer, Phaser.BOTTOM_CENTER, 0);
        context.answerComponents.scale.set(1.0);
    }

    onCheckClicked(){
        this.context.answerComponents.destroy();
    }

    getAnswerImage(isRightAnswer){
        if(isRightAnswer){
            return 'right';
        }
        return 'wrong';
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
            wordWrapWidth: 500,
            align: "left"
        });
        this.questionTitleElement.alignTo(this.image_question, Phaser.BOTTOM_CENTER);
        this.questComponents.add(this.questionTitleElement);
        //console.log(this.questionTitleElement.width);
    }

    addButtonsChoice(choicesText, answerIndex){
        this.groupButtons = this.game.add.group();
        var previousGroup;
        for(var index=0; index<choicesText.length; index++){
            var isRightAnswer = (index===answerIndex);
            var group = this.addChoiceGroup(choicesText[index],isRightAnswer);
            if(previousGroup){
                group.alignTo(previousGroup, Phaser.BOTTOM_LEFT, 0);
            }
            previousGroup = group;
            this.groupButtons.add(group);
        }
        this.groupButtons.alignTo(this.questionTitleElement, Phaser.BOTTOM_CENTER, 0);
        this.questComponents.add(this.groupButtons);
    }

    addChoiceGroup(title, isRightAnswer){
        var button = this.game.add.button(0,0, 'button', this.onButtonChoiceClicked, {context:this, isRightAnswer:isRightAnswer}, 2, 1, 0);
        button.scale.set(0.5);
        var text = this.game.add.text(0,0,title, {font: "16pt Audiowide", fill: "#000000", wordWrap: false,  align: "left",  });
        text.alignTo(button, Phaser.RIGHT_CENTER, 0);
        var group = this.game.add.group();
        group.add(button);
        group.add(text);
        return group;
    }

    onButtonChoiceClicked(){
        // Handle the user's answer - show to him an image_answer hint
        if(this.isRightAnswer){
            //console.log("CHECKED CORRECT ANSWER!");
            this.context.correctMusic.play();
            this.context.closeQuestionUI(this.context);
            this.context.showResultAnswer(this.context, this.isRightAnswer);
            // increase the score of the playing player
            if(playersTurn==1)
                this.context.game.cursor.healthP1 += 10;
            else
                this.context.game.cursor.healthP2 += 10;
            pendingMove = false;
        }
        else{
            //console.log("CHECKED WRONG ANSWER!");
            this.context.incorrectMusic.play();
            this.context.closeQuestionUI(this.context);
            this.context.showResultAnswer(this.context, this.isRightAnswer);
            if(this.context.countDownMusic.isPlaying)
                this.context.countDownMusic.stop();
            if(playersTurn==1)
                if(this.context.game.cursor.healthP1>1)
                    this.context.game.cursor.healthP1 -= 10;
            else
                if(this.context.game.cursor.healthP2>1)
                    this.context.game.cursor.healthP2 -= 10;
            pendingMove = false;
        }
    }

    displayTimeRemaining() {
        var time = Math.floor(this.game.time.totalElapsedSeconds());
        var timeLeft = this.timeLimit - time;
    
        // detect when countdown is over
        if (timeLeft <= 0) {
            timeLeft = 0;
            this.timeOver = true;
            this.closeQuestionUI(this);
            pendingMove = false;
        }
        this.timeBar.scale.setTo(timeLeft / this.tLimit, 1);
    }

    // clear the questions assets with a smooth close-scale tween
    closeQuestionUI(context){
        context.qtween = context.game.add.tween(context.questComponents.scale).to( { x: 0.01, y: 0.01 }, 400, Phaser.Easing.Elastic.In, true);
        context.qtween.onComplete.add(function() { context.questComponents.destroy(); }, this);
        context.bgBar.destroy();
        context.timeBar.destroy();
        context.timeClock.destroy();
        context.timeLabel.destroy();
        context.game.time.events.remove(context.musicEvent);
        if(context.countDownMusic.isPlaying)
            context.countDownMusic.stop();
    }

    update(){
        if (this.timeBar && this.timeOver == false) 
            this.displayTimeRemaining();
        this.game.world.bringToTop(this.questComponents);
        this.game.world.bringToTop(this.answerComponents);
    }
}