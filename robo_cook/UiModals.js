class UiModalsManager {

    constructor(game) {
        this.game = game;
    }

    waitingModal(player){

        Swal.fire({
            title: 'Περίμενε τους συμπαίκτες σου να συγχρονιστούν!',
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
    
    questionOfActions(options, optionsEng, currentStep, bgColor, actionTitle, context){

        const items = {"0": optionsEng[0], "1":optionsEng[1], "2": optionsEng[2]};
        Swal.fire({
            title: actionTitle,
            html:  '<div style="color:#2196f3;font-size: 24px;font-family:Handlee;font-weight:bold;">' + currentStep.replaceAll("-?-", '<img class="inline-img" src="assets/recipe-items/recipe-inline.png">') + '</div>',
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
                context.closeQuestionUI(context, items[0], -1, -1, true);
            if(result.isDenied)
                context.closeQuestionUI(context, items[1], -1, -1, true);
            if(result.isDismissed)
                context.closeQuestionUI(context, items[2], -1, -1, true);
            //context.game.correctMusic.play();
        });

    }

    questionImageModal_asTeam(imgUrl, questionText, helpExists, helpQuText, fromPlayer, scaledWidth, scaledHeight){
        //console.log(helpExists, helpQuText);
        Swal.fire({
            title: questionText,
            html: helpExists? '<div style="color:coral;font-size: 21px;font-family:Handlee;"><i class="fa fa-info-circle"></i> ' +
                                    helpQuText + "</div>" : 'Μπορείς να βασιστείς <b>σε μια βοηθητική ερώτηση</b>',
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
            confirmButtonText: 'Send your help',
            denyButtonText: 'Send your help (low confidence)',
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
                window.socket.emit(PlayerEvent.sendHelp, {helpText:helpText, confident:true, fromPlayer: fromPlayer-1});
              },
            preDeny: (helpText) => {
                var notConfidentHelp = document.getElementsByClassName('swal2-input')[0].value;
                window.socket.emit(PlayerEvent.sendHelp, {helpText: notConfidentHelp, confident:false, fromPlayer: fromPlayer-1});
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

            }).then((result) => {

                if (result.value != null || result.dismiss=="cancel"){
                    if( result[answersDict[rightAnswer]]){
                        context.game.correctMusic.play();
                        context.closeQuestionUI(context, true, context.categoryIndexSelected, context.currentQuestionIndex, false);
                        context.game.scoreHandler.updateScore(context.categoryIndexSelected, true, teamsTurn[playersTurn])
                    }
                    else{
                        context.game.incorrectMusic.play();
                        context.closeQuestionUI(context, false, context.categoryIndexSelected, context.currentQuestionIndex, false);
                        context.game.scoreHandler.updateScore(context.categoryIndexSelected, false, teamsTurn[playersTurn])
                    }
                }
          })

    }

    //programmatically dismiss the active modal
    closeModal(){
        Swal.close();
    }
    
}