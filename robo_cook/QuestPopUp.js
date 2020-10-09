class QuestPopUp extends Phaser.Sprite {

	constructor(game, xpos, ypos) {
		super(game, xpos, ypos);

		this.x = 210;
		this.y = 370;
        //this.qpop = game.add.sprite( xpos, ypos, qtype);
        this.game = game;
        this.questComponents = this.game.add.group();
        this.answerComponents = this.game.add.group();

        // global variables
        this.timeLimit = 60;        // timeLimit for countdown in seconds
        this.tLimit = 60;  
        this.timeOver = false;      // set to false at start
        this.timeBar = null;        // bar-display time remaining

        this.rectCanvas = new Phaser.Rectangle(0,0, window.innerWidth, window.innerHeight);
        this.tween = null;

        this.data = this.game.cache.getJSON('questions');
        //this.categoryIndexSelected = 1;
        this.currentQuestionIndex = 0;

        //  Hide it awaiting a click
        //this.qpop.scale.set(0.25);
        this.countDownMusic = this.game.add.audio('countdown');
        this.correctMusic = this.game.add.audio('correct');
        this.incorrectMusic = this.game.add.audio('incorrect');
        this.incorrectMusic.volume = 0.5;
        //this.countDownMusic.volume -= 25;
        this.musicPlaying = false;

        this.badgeTargetX = { 1:{0:80+30, 1:180+30, 2: 280+30}, 2: {0:80+30, 1:180+30, 2: 280+30}};
        this.badgeTargetY = { 1:{0:105-20, 1:105-20, 2: 105-20}, 2: {0:190-20, 1:190-20, 2: 190-20}};
    }
    
    randomIntFromInterval(min, max) { // min and max included 
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    waitOtherPlayer(){
        this.game.waiting_other = this.game.add.text(this.x-50, this.y, 'Wait other player to answer',  {font: "bold 26px Handlee"});
        this.game.waiting_other.tween = this.game.add.tween(this.game.waiting_other).to({alpha:0.2}, 1500, Phaser.Easing.Bounce.InOut, true, 0, -1);
        this.game.waiting_other.anchor.set(0.5,0.5);
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

        this.bgBar = this.game.add.image(1100+this.game.offsetUI, 555, 'red-bar');
        this.timeBar = this.game.add.image(1100+this.game.offsetUI, 555, 'green-bar');
        this.timeClock = this.game.add.sprite(1120+this.game.offsetUI, 600, 'clock-running', 0);
        this.timeClock.animations.add('run', [0,1,2,3,4,5,6,7]);
		this.timeClock.animations.play('run', 4, true);
        this.timeClock.anchor.set(0.5,0.5);
        this.timeClock.scale.set(0.3);
        // add text label to left of bar
        this.timeLabel = this.game.add.text(1100+this.game.offsetUI, 525, 'Time Remaining',  {font: "22px Handlee"});
        this.timeLimit = Math.floor(this.game.time.totalElapsedSeconds() ) + this.tLimit;

        this.categoryIndexSelected = qType;
        this.currentQuestionIndex = this.randomIntFromInterval(0, this.data.categories[qType].questions.length-1);
        //console.log(this.categoryIndexSelected, this.currentQuestionIndex);
        this.showImageQuestion(this.categoryIndexSelected, this.currentQuestionIndex);
        //this.showImageAnswer(this.categoryIndexSelected, this.currentQuestionIndex);
        
        // this.livesGroups = this.showLives(this.remainingLives);   --  TODO: add related element for scoreUI
        var questionItem = this.getQuestionItem(this.categoryIndexSelected, this.currentQuestionIndex);
        this.showQuestion(questionItem);

        if(this.y+this.answerComponents.height > this.game.playBoard.height+200){
            var fixHeight = (this.y+this.answerComponents.height)-(this.game.playBoard.height+200);
            this.answerComponents.children[0].position.y = this.answerComponents.children[0].position.y - fixHeight;
        }
        if(this.x-this.answerComponents.width/2 < 0){
            var fixWidth = (this.x+this.answerComponents.width/2);
            this.answerComponents.children[0].position.x = this.answerComponents.children[0].position.x + fixWidth/2;
        }

        // present the questItem with a smooth open-up pop
        //this.questComponents.scale.set(0.01);
        this.questComponents.visible = false;
        this.answerComponents.scale.set(0.01);
        //this.qtween = this.game.add.tween(this.questComponents.scale).to( { x: 1.0, y: 1.0 }, 400, Phaser.Easing.Elastic.Out, true);
    }

    playTimerMusic(musicTimer) {
        musicTimer.play();
    }

    showQuestion(questionItem){
        this.addQuestionTitle(questionItem.question);
        //this.addButtonsChoice(questionItem.question, questionItem.choices, questionItem.answer, questionItem.image);
        this.game.UiModalsHandler.questionImageModal(questionItem.choices, questionItem.image, questionItem.question, questionItem.answer, playersTurn, this);
    }

    showImageQuestion(categoryIndex, questionIndex){
        this.image_frame = this.game.add.image(this.x, this.y, "quest-frame-title");
        this.image_frame.scale.setTo(1.3);
        this.image_frame.anchor.set(0.5,0.3);
        this.questComponents.add(this.image_frame);

        var key = ['image_question', categoryIndex, questionIndex].join('_');
        this.image_question = this.game.add.image(this.x, this.y, key);
        
        var scale1 = 1.0;
        var scale2 = 1.0;
        if(this.image_question.height > this.game.maxHeightImageQuestion){
            scale1 = this.game.maxHeightImageQuestion/this.image_question.height;      
        }
        if(this.image_question.width > this.game.maxWidthImageQuestion){
            scale2 = this.game.maxWidthImageQuestion/this.image_question.width;      
        }

        if(scale1 < scale2){
            this.scaledHeight = this.image_question.height*scale1;
            this.scaledWidth = this.image_question.width*scale1;
        }else{
            this.scaledHeight = this.image_question.height*scale2;
            this.scaledWidth = this.image_question.width*scale2;
        }

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
            fill: "#FF0000", 
            wordWrap: true,  
            wordWrapWidth: 320,
            align: "left"
        });
        this.questionTitleElement.alignTo(this.image_question, Phaser.BOTTOM_CENTER);
        this.questComponents.add(this.questionTitleElement);
        //console.log(this.questionTitleElement.width);
    }

    displayTimeRemaining(){
        var time = Math.floor(this.game.time.totalElapsedSeconds());
        var timeLeft = this.timeLimit - time;
    
        // detect when the countdown is over
        if (timeLeft <= 0){
            timeLeft = 0;
            this.timeOver = true;
            console.log("TIME IS UP!");
            this.closeQuestionUI(this, false, this.categoryIndexSelected);
        }
        else
            this.timeBar.scale.setTo(timeLeft / this.tLimit, 1);
    }


    displayPointsEarned(context, player, ctgry, pls){
        context.game.emitter.emitX = player.x;
        context.game.emitter.emitY = player.y;
        var dirX = context.badgeTargetX[pls][ctgry] - player.x;
        var dirY = context.badgeTargetY[pls][ctgry] - player.y;
        context.game.emitter.setXSpeed(dirX, dirX);
        context.game.emitter.setYSpeed(dirY, dirY);
        context.game.emitter.flow(1300, 25, 1, 10, true);
    }

    // clear the questions assets with a smooth close-scale tween
    closeQuestionUI(context, answer, ctgry){
        context.game.UiModalsHandler.closeModal();
        if(answer){
            if(playersTurn==1)
                context.displayPointsEarned(context, context.game.player1, ctgry, 1)
            else
                context.displayPointsEarned(context, context.game.player2, ctgry, 2)
            //console.log(context.game.emitter);
        }

        context.qtween = context.game.add.tween(context.questComponents.scale).to( { x: 0.01, y: 0.01 }, 400, Phaser.Easing.Elastic.In, true);
        context.qtween.onComplete.add(function() { context.questComponents.destroy(); }, this);
        context.bgBar.destroy();
        context.timeBar.destroy();
        context.timeBar = null;
        context.timeClock.destroy();
        context.timeLabel.destroy();
        context.game.time.events.remove(context.musicEvent);
        context.timeOver == true;
        pendingMove = false;
        window.socket.emit(PlayerEvent.opponentAnswered, {correct:answer, category:ctgry});
        if(context.countDownMusic.isPlaying)
            context.countDownMusic.stop();
        if(playersTurn==1)
            playersTurn = 2
        else
            playersTurn = 1
    }

    update(){
        if (this.timeBar && this.timeOver == false) 
            this.displayTimeRemaining();
        this.game.world.bringToTop(this.questComponents);
        this.game.world.bringToTop(this.answerComponents);
    }
}