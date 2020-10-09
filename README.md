# robo-cook
robo-cook's path  -  board game in Phaser.js


### to do
 - IMPORTANT: add cameraFollow() of playing character
 - add fixedCamera frame UI
 - fix ongoing little bugs (items positioning etc.)

### done
 - fixed the robo-cook's position return - *03/06*
 - added random-selector for questions items - *03/06*
 - fixed random-selector's range - *04/06*
 - added RoboCook sprite extension and fixed playing-marker to background position - *04/06*
 - added new questions (check *qualitative* doc) - *04/06*
 - added smooth pop-up effect for questions - *05/06*
 - added automatic reposition of question items when out-of-bounds (left and bottom margins) - *05/06*
 - added an *answer* popUp element after player responds to a question - *09/06*
 - IMPORTANT: added pathfind() verification on dice-total after onDragStop - *11/06*
 - added new target-frame of tiles on middle (tile per ingredient) - *11/06*
 - added highlighting to board tiles after dice roll - *12/06*
 - changed movement from draggable to clicked-tile move - *17/06*
 - changed/added badges for player's progress & added PlayerScores.js class for handling them - *17/06*
 - fixed bug in playerturn change & added a new instructions page on start menu - *19/06*
 - MAJOR: implement the multiple-choice questions' popup-card with nicer UI using [sweetalert2](https://sweetalert2.github.io/) - *27/09*