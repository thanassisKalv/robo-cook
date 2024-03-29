
## latest changes on Italian Version

### 06-05-2021
 - updated server to support the "passcode per classroom" mechanism (not finished)
 - added passcode-generator page (only-teacher page)
 - added main-menu popup element that requests the classroom passcode
 - common server now supports two language versions of the game (copy pasted game files and translated assets)

### 15-02-2021
 - updated server code and game's menu to support 3 levels of difficulty (different sources for questions)
 - changed the fullscreen option because it was buggy with sweetalert modals

### 09-02-2021
 - added a "game-finishing" animation of the target-recipe in the middle of the board
 - removed the english letters (I,M,C) for the roles and added icons to avoid language dependency
 - added *FullScreen option* and disabled a scaleManager function that crashed on *mobile devices*
 - fixed a bug that allowed to move player in-between waiting answer to be revealed

## latest changes on Greek Version

### 09-12-2020
 - added **help tooltips**(*PhaseTips.js*) to certain tiles (questions and actions)
 - fixed a bug in the interaction of QuestionPopup mechanism with sw2-modals

### 08-12-2020
 - added a loading bar view during preloader stage
 - [content] added more recipes - they are to be used as game goals
 - [content] added mechanism for randomly choosing one recipe as game goal
 - upgraded questions mechanism to shuffle the order of the offered options
 
### 30-11-2020
 - after a user answers a thematic question, a slow agony music plays for a litte time and then correct/wrong popup appears
 - after a player gives answer, all other players are also presented with a popup with the correctness for about 3 seconds
 - added some new sound effects (for example during player turn change)
 - added a bonus-movement tile (not mentioned in instructions)
 - all player's dices GUI is updated after a player rolls dice
 - added new starting screen with less instructions and reveaal more upon button click
 - upon turn change, camera focus on playing character
 
