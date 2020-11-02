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
        this.timeLimit = 30;        // timeLimit for countdown in seconds
        this.tLimit = 30;  
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

        this.badgeTargetX = { 1:{0: game.player1score1Text.x, 1: game.player1score2Text.x, 2: game.player1score3Text.x}, 
                                2: {0: game.player2score1Text.x, 1: game.player2score2Text.x, 2: game.player2score3Text.x}};
        this.badgeTargetY = { 1:{0: game.player1score1Text.y, 1: game.player1score2Text.y, 2: game.player1score3Text.y}, 
                                2: {0: game.player2score1Text.y, 1: game.player2score2Text.y, 2: game.player2score3Text.y}};
    }
    
    randomIntFromInterval(min, max) { // min and max included 
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    waitOtherPlayer(){
        this.game.waiting_other = this.game.add.text(170, 270, 'WAITING TEAMPLAYER TO ANSWER!',  {font: "bold 25px Handlee"});
        this.game.waiting_other.tween = this.game.add.tween(this.game.waiting_other).to({alpha:0.2}, 1500, Phaser.Easing.Bounce.InOut, true, 0, -1).yoyo(true, 1000);
        this.game.waiting_other.anchor.set(0.5,0.5);
        this.game.waiting_other.addColor('#4400ff', 0);
        this.game.waiting_other.wordWrap = true;      
        this.game.waiting_other.wordWrapWidth = 300;
        this.game.panelLeft.addChild(this.game.waiting_other);
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
        //this.musicEvent = this.game.time.events.add(20000, this.playTimerMusic, this, musicTimer);

        this.bgBar = this.game.add.image(60, 555, 'red-bar');
        this.timeBar = this.game.add.image(60, 555, 'green-bar');
        this.timeClock = this.game.add.sprite(25, 555, 'clock-running', 0);
        this.timeClock.animations.add('run', [0,1,2,3,4,5,6,7]);
		this.timeClock.animations.play('run', 4, true);
        this.timeClock.anchor.set(0.5,0.5);
        this.timeClock.scale.set(0.3);
        // add text label to left of bar
        this.timeLabel = this.game.add.text(60, 525, 'Time Remaining',  {font: "22px Handlee"});
        this.timeLimit = Math.floor(this.game.time.totalElapsedSeconds() ) + this.tLimit;

        this.categoryIndexSelected = qType;
        this.currentQuestionIndex = this.randomIntFromInterval(0, this.data.categories[qType].questions.length-1);
        //console.log(this.categoryIndexSelected, this.currentQuestionIndex);
        this.prepareQuestionImage(this.categoryIndexSelected, this.currentQuestionIndex);
        //this.showImageAnswer(this.categoryIndexSelected, this.currentQuestionIndex);
        this.game.panelRight.addChild(this.bgBar);
        this.game.panelRight.addChild(this.timeBar);
        this.game.panelRight.addChild(this.timeClock);
        this.game.panelRight.addChild(this.timeLabel);
        

        var questionItem = this.getQuestionItem(this.categoryIndexSelected, this.currentQuestionIndex);
        this.showQuestion(questionItem);

        // present the questItem with a smooth open-up pop
        this.questComponents.visible = false;
        this.answerComponents.scale.set(0.01);
    }

    playTimerMusic(musicTimer) {
        console.log(musicTimer);
        musicTimer.play();
    }

    showQuestion(questionItem){
        //this.addQuestionTitle(questionItem.question);
        window.socket.emit(PlayerEvent.helpMeAnswer, {image: questionItem.image, question: questionItem.question, answer: questionItem.answer, playersTurn: playersTurn, w: this.scaledWidth, h: this.scaledHeight});
        this.game.UiModalsHandler.questionImageModal(questionItem.choices, questionItem.image, questionItem.question, questionItem.answer, playersTurn, this);
        this.game.msgReceiver.msgAlertTween.resume();
    }

    showQuestionAsTeamHelp(questionItem){
        this.game.UiModalsHandler.questionImageModal_asTeam( questionItem.image, questionItem.question, questionItem.answer, this.game.controllingPlayer, questionItem.w, questionItem.h);
    }


    prepareQuestionImage(categoryIndex, questionIndex){
        var key = ['image_question', categoryIndex, questionIndex].join('_');
        this.image_question = this.game.add.image(this.x, this.y, key);
        
        var scale1 = 1.0, scale2 = 1.0;
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


    displayTimeRemaining(){
        var time = Math.floor(this.game.time.totalElapsedSeconds());
        var timeLeft = this.timeLimit - time;
        if (timeLeft == 10)
            if (this.countDownMusic.isPlaying==false)
                this.countDownMusic.play()
        
        // check if the countdown is over
        if (timeLeft <= 0){
            timeLeft = 0;
            this.timeOver = true;
            console.log("TIME IS UP!");
            this.closeQuestionUI(this, false, this.categoryIndexSelected, this.currentQuestionIndex);
        }
        else
            this.timeBar.scale.setTo(timeLeft / this.tLimit, 1);
    }


    displayPointsEarned(context, ctgry, plTurn){
        var player = context.game.playersActive[plTurn-1];
        //console.log(context.game.player2score3Text, context.game.player1score3Text, player.sprite);
        var dirX = context.badgeTargetX[teamsTurn[plTurn]][ctgry] - player.worldPosition.x;
        var dirY = context.badgeTargetY[teamsTurn[plTurn]][ctgry] - player.worldPosition.y;

        context.game.emitter.emitX = player.x;
        context.game.emitter.emitY = player.y;
        context.game.emitter.setXSpeed(dirX, dirX);
        context.game.emitter.setYSpeed(dirY, dirY);
        context.game.emitter.flow(1000, 25, 1, 10, true);
        context.game.emitter.particleBringToTop = true;
        context.game.world.bringToTop(context.game.emitter);
    }

    // clear the questions assets with a smooth close-scale tween
    closeQuestionUI(context, answer, ctgry, quIndex){
        //console.log(answer, ctgry, quIndex);
        questionAwaiting = false;
        context.game.UiModalsHandler.closeModal();
        if(answer){
            context.displayPointsEarned(context, ctgry, playersTurn)
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
        window.socket.emit(PlayerEvent.opponentAnswered, {correct:answer, category:ctgry, quIndex:quIndex });
        context.game.msgReceiver.msgAlertTween.pause();
        context.game.msgReceiver.msgAlertTween.tint = 0xffffff;

        setTimeout( function(){
            for(var i=0; i<context.game.helpClouds.length; i++)
                context.game.helpClouds[i].destroy();
            } , 400);
        
        if(context.countDownMusic.isPlaying)
            context.countDownMusic.stop();
        togglePlayerTurn();
    }

    update(){
        if (this.timeBar && this.timeOver == false) 
            this.displayTimeRemaining();
        this.game.world.bringToTop(this.questComponents);
        this.game.world.bringToTop(this.answerComponents);
    }
}