# robo-cook
robo-cook's path  -  A board game in Phaser.js


### latest changes (February 2021)
 - check the new updated file ["latest-updates.md"](https://github.com/thanassisKalv/robo-cook/blob/online-multiplayer-eng/latest-changes.md/)

### done (initial version)
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
 - added left and right fixedCamera frame UIs - *24/10*
 - added mechanisms and graphics for RPG - *24/10*
 - team-players now help the answering player (see the question without options) - *24/10*
 - manage answered questions [server and frontend] to not appear again till all answers have been given for a category - *10/11*