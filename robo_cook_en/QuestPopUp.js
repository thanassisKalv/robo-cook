class QuestPopUp extends Phaser.Sprite {

	constructor(game, cooktile, shoptile, questNum, xpos, ypos) {
		super(game, xpos, ypos);

		this.x = 210;
		this.y = 370;
        //this.qpop = game.add.sprite( xpos, ypos, qtype);
        this.game = game;
        this.questComponents = this.game.add.group();
        this.answerComponents = this.game.add.group();

        // global variables
        this.timeLimit = 50;        // timeLimit for countdown in seconds
        this.tLimit = 50;  
        this.timeOver = false;      // set to false at start
        this.timeBar = null;        // bar-display time remaining
        this.cooktile = cooktile;
        this.shoptile = shoptile;
        this.qType = questNum;

        this.cookActionOptions =   this.game.recipeData.cookActionOptions;
        this.cookActionOptionsEng =  this.game.recipeData.cookActionOptionsEng;
        this.shoppingActionOptions =  this.game.recipeData.shoppingActionOptions
        this.shoppingActionOptionsEng =   this.game.recipeData.shoppingActionOptionsEng;

        this.recipe =  this.game.stepsInstructor;
        this.recipe_shopper = this.game.stepsShopper;
        this.recipe_cook = this.game.stepsCook;

        this.data = this.game.cache.getJSON('questions-eng');
        //this.categoryIndexSelected = 1;
        this.currentQuestionIndex = 0;

        //  Hide it awaiting a click
        //this.qpop.scale.set(0.25);
        this.countDownMusic = this.game.add.audio('countdown');
        this.game.correctMusic = this.game.add.audio('correct');
        this.game.incorrectMusic = this.game.add.audio('incorrect');
        this.game.answerReveal = this.game.add.audio('correct_answer_reveal');
        this.game.incorrectMusic.volume = 1.3;
        this.musicPlaying = false;

        this.badgeTargetX = { 0: game.player1score1Text.x, 1: game.player1score2Text.x, 2: game.player1score3Text.x};
        this.badgeTargetY = { 0: game.player1score1Text.y-10, 1: game.player1score2Text.y-10, 2: game.player1score3Text.y-10};
    }

    waitOtherPlayer(){
        this.game.waiting_other = this.game.add.text(100, 570, 'Wait \nteamplayers...',  {font: "bold 20px Comic Sans MS"});
        this.game.waiting_other.tween = this.game.add.tween(this.game.waiting_other).to({alpha:0.2}, 1500, Phaser.Easing.Bounce.InOut, true, 0, -1).yoyo(true, 1000);
        this.game.waiting_other.anchor.set(0.5,0.5);
        this.game.waiting_other.addColor('#4400ff', 0);
        this.game.waiting_other.wordWrap = true;      
        this.game.waiting_other.wordWrapWidth = 300;
        this.game.panelRight.addChild(this.game.waiting_other);
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

    popUpQuestion(){

        this.questComponents = this.game.add.group();
        this.answerComponents = this.game.add.group();
        this.timeOver = false;
        this.answered = false;
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
        this.timeLabel = this.game.add.text(60, 500, 'Time\nremaining',  {font: "19px Comic Sans MS"});
        this.timeLimit = Math.floor(this.game.time.totalElapsedSeconds() ) + this.tLimit;
        //this.showImageAnswer(this.categoryIndexSelected, this.currentQuestionIndex);
        this.game.panelRight.addChild(this.bgBar);
        this.game.panelRight.addChild(this.timeBar);
        this.game.panelRight.addChild(this.timeClock);
        this.game.panelRight.addChild(this.timeLabel);
        
        if(this.cooktile){
            var cstep = this.game.scoreHandler.getRcpStep();
            this.displayCookActions(this.cookActionOptions[cstep], this.cookActionOptionsEng[cstep], this.recipe_cook[cstep].step );
        }
        else if (this.shoptile){
            var cstep = this.game.scoreHandler.getRcpStep();
            this.displayShopActions(this.shoppingActionOptions[cstep], this.shoppingActionOptionsEng[cstep], this.recipe_shopper[cstep].step );
        }
        else{
           // console.log(this.game.questionsAnswered);
            this.categoryIndexSelected = this.qType;
            this.currentQuestionIndex = this.randomIntFromInterval(0, this.data.categories[this.qType].questions.length-1, this.game.questionsAnswered[this.qType]);
            //console.log(this.categoryIndexSelected, this.currentQuestionIndex);
            this.prepareQuestionImage(this.categoryIndexSelected, this.currentQuestionIndex);
            var questionItem = this.getQuestionItem(this.categoryIndexSelected, this.currentQuestionIndex);
            this.showQuestion(questionItem);

            // present the questItem with a smooth open-up pop
            this.questComponents.visible = false;
            this.answerComponents.scale.set(0.01);
        }
    }

    randomIntFromInterval(min, max, answeredList) { // min and max included 
        var randInt = 0;
        do {
            randInt = Math.floor(Math.random() * (max - min + 1) + min);
        }while(answeredList.includes(randInt))

        return randInt;
    }

    playTimerMusic(musicTimer) {
        console.log(musicTimer);
        musicTimer.play();
    }

    displayCookActions(options, optionsEng, currentStep){
        this.game.UiModalsHandler.questionOfActions(options, optionsEng, currentStep, "#bf6767", "Choose a cooking action to complete your recipe", "cook", this);
    }
    displayShopActions(options, optionsEng, currentStep){
        this.game.UiModalsHandler.questionOfActions(options, optionsEng, currentStep, "#b8ec4a", "Choose an ingredient that is missing from your recipe", "shop", this);
    }

    shuffle(array) {
        var currentIndex = array.length, temporaryValue, randomIndex;
      
        // While there remain elements to shuffle...
        while (0 !== currentIndex) {
      
          // Pick a remaining element...
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex -= 1;
      
          // And swap it with the current element.
          temporaryValue = array[currentIndex];
          array[currentIndex] = array[randomIndex];
          array[randomIndex] = temporaryValue;
        }
      
      }
    
    randomizeOptions(questionItem){
        var correctAnswer = questionItem.choices[questionItem.answer];
        this.shuffle(questionItem.choices);
        for(var i=0; i<questionItem.choices.length; i++)
            if(questionItem.choices[i]==correctAnswer)
                questionItem.answer = i;
        
    }

    showQuestion(questionItem){
        this.randomizeOptions(questionItem);
        //this.addQuestionTitle(questionItem.question);
        window.socket.emit(PlayerEvent.helpMeAnswer, {image: questionItem.image, question: questionItem.question, 
                                                        hqExist:questionItem.hqExist, helpQuestion:questionItem.helpQuestion, playersTurn: playersTurn, 
                                                        w: this.scaledWidth, h: this.scaledHeight});
        this.game.UiModalsHandler.questionImageModal(questionItem.choices, questionItem.image, questionItem.question, questionItem.answer, playersTurn, this);
        this.game.msgReceiver.msgAlertTween.resume();
    }

    showQuestionAsTeamHelp(quItem){
        this.game.UiModalsHandler.questionImageModal_asTeam( quItem.image, quItem.question, quItem.hqExist, quItem.helpQuestion, this.game.controllingPlayer, quItem.w, quItem.h);
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
        }else
            return 'wrong';
    }

    getQuestionItem(categoryIndex, questionIndex){
        return this.data.categories[categoryIndex].questions[questionIndex];
        //return this.listQuestionsByCategory(categoryIndex)[questionIndex];
    }


    displayTimeRemaining(){
        var time = Math.floor(this.game.time.totalElapsedSeconds());
        var timeLeft = this.timeLimit - time;
        if (timeLeft==10)
            if (this.countDownMusic.isPlaying==false)
                this.countDownMusic.play()
        
        // check if the countdown is over
        if (timeLeft <= 0){
            timeLeft = 0;
            this.timeOver = true;
            console.log("TIME IS UP!");
            if(this.shoptile || this.cooktile)
                this.closeQuestionUI(this, false, -1, -1, true);
            else
                this.closeQuestionUI(this, false, this.categoryIndexSelected, this.currentQuestionIndex, false);
            Swal.close();
        }
        else
            this.timeBar.scale.setTo(timeLeft / this.tLimit, 1);
    }


    displayPointsEarned(context, ctgry, plTurn){
        var player = context.game.playersActive[plTurn-1];
        //console.log(context.game.player2score3Text, context.game.player1score3Text, player.sprite);
        var dirX = context.badgeTargetX[ctgry] - player.worldPosition.x;
        var dirY = context.badgeTargetY[ctgry] - player.worldPosition.y;

        context.game.ptEmitters[ctgry].emitX = player.x;
        context.game.ptEmitters[ctgry].emitY = player.y;
        context.game.ptEmitters[ctgry].setXSpeed(dirX*1.2, dirX*1.2);
        context.game.ptEmitters[ctgry].setYSpeed(dirY*1.2, dirY*1.2);
        context.game.ptEmitters[ctgry].flow(800, 15, 1, 9, true);
        context.game.ptEmitters[ctgry].particleBringToTop = true;
        context.game.world.bringToTop(context.game.ptEmitters[ctgry]);
    }

    setDragDropItem(answerItems){
        //this.game.cursor.loadTexture(item);
        var rcpItem = this.game.add.sprite(0, 0, answerItems[0]+'-recipe');
        rcpItem.scale.set(1.2);
        this.game.cursor.rcpItemKey = rcpItem.key;
        this.game.cursor.rcpItemName = answerItems[1];
        this.game.cursor.addChild(rcpItem);
        rcpItemDropping = true;
    }

    // clear the questions assets with a smooth close-scale tween
    closeQuestionUI(context, answer, ctgry, quIndex, recipeAction){
        //console.log(answer, ctgry, quIndex);
        questionAwaiting = false;
        context.game.UiModalsHandler.closeModal();
        if(answer==true){
            context.displayPointsEarned(context, ctgry, playersTurn)
            //console.log(context.game.emitter);
        }
        context.qtween = context.game.add.tween(context.questComponents.scale).to( { x: 0.01, y: 0.01 }, 400, Phaser.Easing.Elastic.In, true);
        context.qtween.onComplete.add(function() { context.questComponents.destroy(); }, this);
        context.bgBar.destroy();
        context.timeBar.destroy();
        context.timeClock.destroy();
        context.timeLabel.destroy();
        context.game.time.events.remove(context.musicEvent);
        context.timeOver == true;
        pendingMove = false;
        if(recipeAction)
            this.setDragDropItem(answer);
           //window.socket.emit(PlayerEvent.opponentAnswered, {correct:answer, category:ctgry, quIndex:quIndex, rcpAction:true});
        else
            window.socket.emit(PlayerEvent.opponentAnswered, {correct:answer, category:ctgry, quIndex:quIndex, rcpAction:false });
        context.game.msgReceiver.msgAlertTween.pause();
        context.game.msgReceiver.msgAlertTween.tint = 0xffffff;

        setTimeout( function(){
            for(var i=0; i<context.game.helpClouds.length; i++)
                context.game.helpClouds[i].destroy();
            } , 400);
        
        if(context.countDownMusic.isPlaying)
            context.countDownMusic.stop();
        if(recipeAction==false)
            togglePlayerTurn();
    }

    update(){
        if (this.timeBar && this.timeOver == false && this.answered == false) 
            this.displayTimeRemaining();
        this.game.world.bringToTop(this.questComponents);
        this.game.world.bringToTop(this.answerComponents);
    }
}