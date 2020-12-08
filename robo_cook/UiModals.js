class UiModalsManager {

    constructor(game) {
        this.game = game;
    }

    waitingModal(player){

        Swal.fire({
            title: 'Wait for your teammates to sync!',
            //timer: 500,
            //timerProgressBar: true,
            allowOutsideClick: false,
            showConfirmButton: false,
            background: '#00000000 url(/assets/images/waiting.png)',
            position: 'center',
            "willOpen": () => {
                Swal.showLoading()
            },
            "willClose": () => {
                //clearInterval(timerInterval)
            }
        })
    }
    
    questionOfActions(options, optionsEng, currentStep, bgColor, actionTitle, role, context){

        const items = {"0": optionsEng[0], "1":optionsEng[1], "2": optionsEng[2]};
        console.log(currentStep);
        Swal.fire({
            title: actionTitle,
            html:  '<div style="color:#2196f3;font-size: 24px;font-family:Handlee;font-weight:bold;">' + currentStep.replaceAll("-?-", '<img class="inline-img" src="assets/recipe-items/recipe-inline-'+role+'.png">') + '</div>',
            backdrop: true,
            allowOutsideClick: false,
            background: bgColor,

            showDenyButton: true,
            showCancelButton: true,
            confirmButtonText: options[0],
            denyButtonText: options[1],
            cancelButtonText: options[2],

            confirmButtonColor: '#8bc34a94',
            denyButtonColor: '#f4ba36ad',
            cancelButtonColor: '#4d62d6ba',
            width: 600,
            position: 'center'

        }).then((result) => {
            //console.log(result);
            if(result.isConfirmed)
                context.closeQuestionUI(context, [items[0], options[0]], -1, -1, true);
            if(result.isDenied)
                context.closeQuestionUI(context, [items[1], options[1]], -1, -1, true);
            if(result.isDismissed)
                context.closeQuestionUI(context, [items[2], options[2]], -1, -1, true);
            //context.game.correctMusic.play();
        });

    }

    questionImageModal_asTeam(imgUrl, questionText, helpExists, helpQuText, fromPlayer, scaledWidth, scaledHeight){
        //console.log(helpExists, helpQuText);
        Swal.fire({
            title: questionText,
            html: helpExists? '<div style="color:coral;font-size: 21px;font-family:Handlee;"><i class="fa fa-info-circle"></i> ' +
                                    helpQuText + "</div>" : '<b></b>',
            backdrop: true,
            //allowOutsideClick: false,
            background: "#ece4e4",
            width: 800,
            position: 'center',
            input: 'text',
            inputAttributes: {
                autocapitalize: 'off'
              },
            showCancelButton: true,
            showDenyButton: true,
            confirmButtonText: 'Help your teammate',
            denyButtonText: 'Help (low confidence)',
            cancelButtonText: "Don't send",
            confirmButtonColor: "#27c437",
            denyButtonColor: '#f4ba36ad',
            showLoaderOnConfirm: true,
            focusConfirm: false,
            
            imageUrl: imgUrl,
            imageWidth: scaledWidth,
            imageHeight: scaledHeight,
            imageAlt: 'Answer image',
            preConfirm: (helpText) => {
                console.log(helpText);
                window.socket.emit(PlayerEvent.sendHelp, {helpText:helpText, confident:'sure', fromPlayer: fromPlayer-1});
              },
            preDeny: (helpText) => {
                var notConfidentHelp = document.getElementsByClassName('swal2-input')[0].value;
                window.socket.emit(PlayerEvent.sendHelp, {helpText: notConfidentHelp, confident:'doubt', fromPlayer: fromPlayer-1});
              },
            allowOutsideClick: () => !Swal.isLoading()
            }).then((result) => {

          })
    }
    /*
        optionList: a list of 3 text elements for the possible answers
        imgURL: url string for the question's image
        questionText: the question's actual text
     */
    questionImageModal(optionList, imgUrl, questionText, rightAnswer, playersTurn, context){

        // event-tags returned by SweetAlert2 after answer is chosen
        const answersDict = { 0:"isConfirmed", 1:"isDenied", 2:"isDismissed"};
        const answersText = { "isConfirmed":optionList[0], "isDenied":optionList[1], "isDismissed":optionList[2]};

        Swal.fire({
            title: questionText,

            backdrop: true,
            allowOutsideClick: false,
            background: "#eccf75",
            width: 800,

            showDenyButton: true,
            showCancelButton: true,
            position: 'center',
            focusConfirm: false,

            confirmButtonText: optionList[0],
            denyButtonText: optionList[1],
            cancelButtonText: optionList[2],

            confirmButtonColor: '#8bc34a94',
            denyButtonColor: '#f4ba36ad',
            cancelButtonColor: '#4d62d6ba',

            imageUrl: imgUrl,
            imageWidth: context.scaledWidth,
            imageHeight: context.scaledHeight,
            imageAlt: 'Answer image',

            preConfirm: false ,
            preDeny: false ,


            }).then((result) => {
                //console.log(result);
                context.game.answerReveal.play();
                window.socket.emit(PlayerEvent.revealMusicPlay, {});
                setTimeout( function(){ 
                    
                    if (result.value != null || result.dismiss=="cancel"){
                        if( result[answersDict[rightAnswer]]){
                            context.game.correctMusic.play();
                            context.closeQuestionUI(context, true, context.categoryIndexSelected, context.currentQuestionIndex, false);
                            context.game.scoreHandler.updateScore(context.categoryIndexSelected, true, teamsTurn[playersTurn]);
                            showResult(true, questionText, answersText[answersDict[rightAnswer]]);
                        }
                        else{
                            context.game.incorrectMusic.play();
                            context.closeQuestionUI(context, false, context.categoryIndexSelected, context.currentQuestionIndex, false);
                            context.game.scoreHandler.updateScore(context.categoryIndexSelected, false, teamsTurn[playersTurn]);
                            if(result.isConfirmed)
                                showResult(false, questionText,  optionList[0]);
                            if(result.isDenied)
                                showResult(false, questionText,  optionList[1]);
                            if(result.isDismissed)
                                showResult(false, questionText,  optionList[2]);
                        }
                    }
                 } , 2700);
          })

          function showResult(result, quText, answerText){
            var iconR = 'error';
            if (result)
            iconR = 'success';
            window.socket.emit(PlayerEvent.showAnswer, {result: result, quText:quText, answerText: answerText});
            Swal.fire({
                icon: iconR,
                title: quText,
                html: "<b style='color:grey;font-size: 24px;'>" + answerText + "</b>",
                timer: 3500,
                allowOutsideClick: false,
                showConfirmButton: false
          }).then((result) => {
            /* Read more about handling dismissals below */
            if (result.dismiss === Swal.DismissReason.timer) {
              //console.log('I was closed by the timer')
            }
          })
        }
    }

    showTeamPlayerResult(result, quText, answerText){
        var iconR = 'error';
        if (result)
        iconR = 'success'
        
        Swal.fire({
            icon: iconR,
            title: quText,
            html: "Your teammate answered:<br><b style='color:grey;font-size: 24px;'>" + answerText + "</b>",
            timer: 6500,
            allowOutsideClick: false,
            showConfirmButton: false
      }).then((result) => {
        /* Read more about handling dismissals below */
        if (result.dismiss === Swal.DismissReason.timer) {
          //console.log('I was closed by the timer')
        }
      })
    }

    showStepFinished(no, stepTxt){
        Swal.fire({
            title: "Νο"+(no+1)+" step is complete!",
            html: "<b style='color:green;font-size: 24px;'>" + stepTxt + "</b>",
            timer: 7000,
            allowOutsideClick: false,
            showConfirmButton: false
      }).then((result) => {
        /* Read more about handling dismissals below */
        if (result.dismiss === Swal.DismissReason.timer) {
          //console.log('I was closed by the timer')
        }
      })
    }

    //programmatically dismiss the active modal
    closeModal(){
        //Swal.close();
    }
    
}