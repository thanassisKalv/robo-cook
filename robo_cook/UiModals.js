class UiModalsManager {

    constructor(game) {
        this.game = game;
    }

    waitingModal(player){

        Swal.fire({
            title: 'Please wait player #'+player+' to sync!',
            //timer: 500,
            //timerProgressBar: true,
            allowOutsideClick: false,
            position: 'center',
            onBeforeOpen: () => {
                Swal.showLoading()
            },
            onClose: () => {
                //clearInterval(timerInterval)
            }
        })
    }
    
    /*
         optionList: a list of 3 text elements for the possible answers
         imgURL: url string for the question's image
         questionText: the question's actual text
     */
    questionImageModal(optionList, imgUrl, questionText, rightAnswer, playersTurn, context){

        const answersDict = { 0:"isConfirmed", 1:"isDenied", 2:"isDismissed"};

        Swal.fire({
            title: questionText,

            backdrop: true,
            allowOutsideClick: false,
            background: "#eccf75",
            width: 600,

            showDenyButton: true,
            showCancelButton: true,
            position: 'center-start',

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
                //console.log(result);
                if (result.value != null || result.dismiss=="cancel")
                    if( result[answersDict[rightAnswer]]){
                        context.correctMusic.play();
                        context.closeQuestionUI(context, true, context.categoryIndexSelected);
                        if(playersTurn==1)
                            context.game.scoreHandler.increaseScore_P1(context.categoryIndexSelected);
                        else
                            context.game.scoreHandler.increaseScore_P2(context.categoryIndexSelected);
                    }
                    else{
                        context.closeQuestionUI(context, false, context.categoryIndexSelected);
                        context.incorrectMusic.play();
                        if(playersTurn==1)
                            context.game.scoreHandler.decreaseScore_P1(context.categoryIndexSelected);
                        else
                            context.game.scoreHandler.decreaseScore_P2(context.categoryIndexSelected);
                    }

          })

    }

    //programmatically dismiss the active modal
    closeModal(){
        Swal.close();
    }
    
}