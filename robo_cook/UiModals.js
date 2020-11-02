class UiModalsManager {

    constructor(game) {
        this.game = game;
    }

    waitingModal(player){

        Swal.fire({
            title: 'Please wait other players to sync!',
            //timer: 500,
            //timerProgressBar: true,
            allowOutsideClick: false,
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
    

    questionImageModal_asTeam(imgUrl, questionText, rightAnswer, fromPlayer, scaledWidth, scaledHeight, gamesocket){
        Swal.fire({
            title: questionText,

            backdrop: true,
            //allowOutsideClick: false,
            background: "#ece4e4",
            width: 600,
            position: 'center',
            input: 'text',
            inputAttributes: {
                autocapitalize: 'off'
              },
            showCancelButton: true,
            confirmButtonText: 'Send Help',
            showLoaderOnConfirm: true,
            
            imageUrl: imgUrl,
            imageWidth: scaledWidth,
            imageHeight: scaledHeight,
            imageAlt: 'Answer image',
            preConfirm: (helpText) => {
                console.log(helpText);
                window.socket.emit(PlayerEvent.sendHelp, {helpText:helpText, fromPlayer: fromPlayer-1});
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
            width: 600,

            showDenyButton: true,
            showCancelButton: true,
            position: 'center',

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
                        context.correctMusic.play();
                        context.closeQuestionUI(context, true, context.categoryIndexSelected, context.currentQuestionIndex);
                        context.game.scoreHandler.updateScore(context.categoryIndexSelected, true, teamsTurn[playersTurn])
                    }
                    else{
                        context.incorrectMusic.play();
                        context.closeQuestionUI(context, false, context.categoryIndexSelected, context.currentQuestionIndex);
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