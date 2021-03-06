
/**
 *   Creates game setting object. Holds game session info.
 **/
var GameSetting = function(playerRef) {
    this.score = 0;
    this.deltaScore = 0;
    this.lives = 3;
    this.playerXpos = 0; //not sure if needed

    this.gemsAdded = 0;
    this.gameWon = false;

    if (playerRef) {
        this.playerRef = playerRef;
    }

    this.characterChosen = 0;
    this.gamePaused = false;
    this.gameState = 0; //0:choosing,1:playing

    this.gameInfoDisplay = false;

};

/** GAMEAI BEGIN **/

/**
 *   Creates instance of game artificial intelligence. Takes care of enemy creation.
 *   @ param enemyArray: reference to array that holds all active game enemies.
 *   @ param setting:    reference to game setting object, used to store and check game state.
 **/
var GameAI = function(enemyArray, itemArray, settings) {
    if (enemyArray === undefined) {
        enemyArray = [];
    }
    if (itemArray === undefined) {
        itemArray = [];
    }
    if (settings === undefined) {
        settings = {};
    }

    //Items related to Enemy row instantiation
    this.prevRowCalled = 0;
    this.lastAddedRow = 0;

    //Items related to Enemy creation and reuse
    this.activeEnemyArray = enemyArray;
    this.inactiveEnemyArray = [];

    //Items affecting game state
    this.settings = settings;
    this.numberOfAllowedEnemies = 3;
    this.numberOfCreatedEnemies = 0;
};
/**
 *   Function called in game loop to update GameAI in each game step.
 *   @param dt:  time constant.
 **/
GameAI.prototype.update = function(dt) {
    //if there's no enemies on screen, add one.
    if (this.activeEnemyArray.length === 0) {
        this.activeEnemyArray.push(this.newEnemyCallback());
    }
};

/**
 *   Returns numerical row value, in which to create next enemy.
 *   @returns Numercal value in set{012}.
 **/
GameAI.prototype.getNextRow = function() {
    var temp = this.prevRowCalled;
    this.prevRowCalled++;
    if (this.prevRowCalled > 2) {
        this.prevRowCalled = 0;
    }
    return temp;
};

/**
*   Callback to summon enemies
    @param row:  row.  Numerical value of row in which to put enemy.
**/
GameAI.prototype.addNewEnemyCallback = function(row) {
    if (row === undefined) {
        row = 0;
    }

    //Reuse enemies already created but not in use.
    if (this.inactiveEnemyArray.length > 0) {
        var topEnemy = this.inactiveEnemyArray.pop();
        this.activeEnemyArray.push(this.updateEnemyCallback(topEnemy));
    }
    //Create new enemy if allowed by game constraint
    else if (this.numberOfCreatedEnemies < this.numberOfAllowedEnemies - 1) {
        this.activeEnemyArray.push(this.newEnemyCallback());
        this.numberOfCreatedEnemies++;
    }
};

/**
 *   Stores enemy for reuse.
 *   @param enemy: instances of enemy to retire.
 **/
GameAI.prototype.resetEnemyCallback = function(enemy) {
    if (enemy !== undefined) {
        var indexOfEnemy = this.activeEnemyArray.indexOf(enemy);
        this.activeEnemyArray.splice(indexOfEnemy, 1);
        this.inactiveEnemyArray.push(enemy);
    }
};

/** CALLBACKS TO BE DEFINED LATER, addressing objects outside of GameAI scope.

/**
*   Callback to create a New Enemy instance.
    @returns reference of new enemy.
**/
GameAI.prototype.newEnemyCallback = undefined;

/**
 *   Callback which updates given enemy with new constraits according to game state.
 *   For example: increase speed.
 *   @param enemy: reference of enemy to update.
 **/
GameAI.prototype.updateEnemyCallback = undefined;

/** GAMEAI END **/

/** COLLIDEABLE BEGIN **/

/**
*   Base to class to provide collision detection mechanism.
*   @param paramXOffSet
    @param paramYOffSet
    @param paramWidth
    @param paramHeight
**/
var Collideable = function(paramXOffSet, paramYOffSet, paramWidth, paramHeight) {

    /**
     *   Object Box
     *   (x,y)
     *   +-------------+
     *   |             |
     *   |             |
     *   +=============|
     *   |(x,y)Offsets |
     *   |             -paramHeight
     *   |             |
     *   +------|------+
     *      paraWeight
     **/
    this.x = 0;
    this.y = 0;
    this.xOffSet = paramXOffSet;
    this.yOffSet = paramYOffSet;
    this.width = paramWidth;
    this.height = paramHeight;
};

/**
*   Detects if calling object has collided with Another colliding object.
    @param collideableObj
    @returns true, objects have collided, false if not, undefined if not possible to compute.
**/
Collideable.prototype.haveCollidedWith = function(collideableObj) {
    /*
     *    DeltaX
     *   |    |
     *   +----|--+ --------
     *   |    |  |         DeltaY
     *   |    +--+------+ -
     *   |    |  |      |
     *   +----+--+      |
     *        |         |
     *        +---------+
     */
    if (collideableObj !== undefined) {
        var x0 = this.x + this.xOffSet;
        var y0 = this.y + this.yOffSet;
        var x1 = collideableObj.x + collideableObj.xOffSet;
        var y1 = collideableObj.y + collideableObj.yOffSet;

        var deltaY;
        if (this.y > collideableObj.y) {
            deltaY = y0 - y1 - collideableObj.height;
        } else {
            deltaY = y1 - y0 - this.height;
        }
        if (deltaY <= 0) {
            var deltaX;
            if (x0 > x1) {
                deltaX = x0 - x1 - collideableObj.width;
            } else {
                deltaX = x1 - x0 - this.width;
            }
            if (deltaX <= 0) {
                return true;
            }
        }
        return false;
    }
    return undefined;
};

/** COLLIDEABLE END **/

/** ITEM BEGIN **/
/**
 * Base class for collectable items, subclass of Collieable
 **/
var Item = function(x, y, type, options) {
    if (options === undefined) {
        options = {};
    }
    //if (options.scaleWidth !== undefined && options.scaleHeight !== undefined) {
    //   this.scaleHeight = options.scaleHeight;
    // this.scaleWidth = options.scaleWidth;
    //}
    switch (type) {
        case 'gem':
            switch (options.color) {
                case 'blue':
                    this.sprite = 'images/Gem-Blue.png';
                    this.value = 10;
                    break;
                case 'green':
                    this.sprite = 'images/Gem-Green.png';
                    this.value = 20;
                    break;
                case 'orange':
                    this.sprite = 'images/Gem-Orange.png';
                    this.value = 30;
                    break;
                default:
                    this.sprite = 'images/Gem-Blue.png';
                    this.value = 10;
                    break;
            }
            Collideable.call(this, 3, 50, 60, 45);
            this.x = x;
            this.y = y;
            this.type = 'gem';
            if (options.scaleWidth === undefined && options.scaleHeight === undefined) {
                this.scaleHeight = 100;
                this.scaleWidth = 65;
            }
            break;
        case 'heart':
            Collideable.call(this, 5, 50, 55, 25);
            this.x = x;
            this.y = y;
            this.type = 'heart';
            this.sprite = 'images/Heart.png';
            if (options.scaleWidth === undefined && options.scaleHeight === undefined) {
                this.scaleHeight = 120;
                this.scaleWidth = 65;
            }
            break;
        case 'key':
            Collideable.call(this, 20, 75, 27, 28);
            this.x = x;
            this.y = y;
            this.type = 'key';
            this.sprite = 'images/Key.png';
            if (options.scaleWidth === undefined && options.scaleHeight === undefined) {
                this.scaleHeight = 120;
                this.scaleWidth = 65;
            }
            break;
        case 'star':
            Collideable.call(this, 15, 45, 50, 52);
            this.x = x;
            this.y = y;
            this.type = 'star';
            this.sprite = 'images/Star.png';
            if (options.scaleWidth === undefined && options.scaleHeight === undefined) {
                this.scaleHeight = 120;
                this.scaleWidth = 80;
            }
            break;
        case 'rock':
            Collideable.call(this, 15, 50, 55, 52);
            this.x = x;
            this.y = y;
            this.type = 'rock';
            this.sprite = 'images/Rock.png';
            if (options.scaleWidth === undefined && options.scaleHeight === undefined) {
                this.scaleHeight = 120;
                this.scaleWidth = 80;
            }
            break;
    }
};

/**
 * Draw item to screen.
 **/
Item.prototype.render = function(screen, imageResources) {
    if (screen && imageResources) {
        switch (this.type) {
            default: screen.drawImage(imageResources.get(this.sprite), this.x, this.y, this.scaleWidth, this.scaleHeight);
            break;
        }
    }

    //ctx.rect(this.x + this.xOffSet, this.y + this.yOffSet, this.width,this.height); //Use to get colliding values.
    //ctx.stroke();
};

/** ITEM END **/

/** ENEMY BEGIN **/

/**
 *   Creates instance of Enemy. Keeps track of speed, steps taken, displaying to screen.
 *   @param row.
 **/
var Enemy = function(row, paramXOffSet, paramYOffSet, paramWidth, paramHeight) {
    Collideable.call(this, paramXOffSet, paramYOffSet, paramWidth, paramHeight);
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    if (row === undefined) {
        row = 0;
    }

    this.stepCount = 0;
    this.stepDeltaX = 100; //Brodcast self info every DeltaX step.
    this.stepSpeed = 100;
    this.row = -1; //Numerical value of row in which to walk.

    //Following numbers depend on canvas size. Figure out new numbers if canvas size is changed.
    this.xLeftLimit = -98; //left and right most x limits on screen
    this.xRightLimit = 505;
    this.x = this.xLeftLimit;

    switch (row) {
        case 0:
            this.y = 60;
            this.row = 0;
            break;
        case 1:
            this.y = 145;
            this.row = 1;
            break;
        case 2:
            this.y = 225;
            this.row = 2;
            break;
        default:
            this.y = 60;
            this.row = 0;
    }
    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
};
//Setting up inheritance.
Enemy.prototype = Object.create(Collideable.prototype);
Enemy.prototype.constructor = Enemy;

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    if (this.x >= this.xRightLimit) {
        this.x = this.xLeftLimit; //go back to the beginning when end of row is reached.
    } else {
        this.x = this.x + (this.stepSpeed * dt); //with increase of game difficulty, increase enemy speed.
    }

    //Set up enemy broadcast when certain conditions are met.
    this.stepCount++;
    if (this.stepCount >= this.stepDeltaX) {
        this.stepCount = 0;
        this.stepCountChangedCallback(this);
    }
    if (this.x >= this.xRightLimit) {
        this.xRightLimitReachedCallback(this);
    }
};

/**
 *   Setter function to set enemy row variable.
 *   @param row.
 **/
Enemy.prototype.setRow = function(row) {
    if (row === undefined) {
        row = 0;
    }
    /* Following row values are dependent on canvas size.*/
    switch (row) {
        case 0:
            this.y = 60;
            this.row = 0;
            break;
        case 1:
            this.y = 145;
            this.row = 1;
            break;
        case 2:
            this.y = 225;
            this.row = 2;
            break;
        default:
            this.y = 60;
            this.row = 0;
    }
};

/**
 *   Setter function to set enemy row speed.
 *   @param speed.
 **/
Enemy.prototype.setSpeed = function(speed) {
    if (speed === undefined) {
        speed = 100;
    }
    this.stepSpeed = speed;
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function(screen, imageResources) {
    if (screen && imageResources && this.x >= this.xLeftLimit || this.x <= this.xRightLimit) {
        screen.drawImage(imageResources.get(this.sprite), this.x, this.y);
        //ctx.rect(this.collisionHandler.x(), this.collisionHandler.y(), this.collisionHandler.width,this.collisionHandler.height);
        //ctx.stroke();
    }
};

/** ENEMY END **/

/** PLAYER BEGIN **/

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.

/**
 *   Creates instance of Player.
 **/
var Player = function(paramXOffSet, paramYOffSet, paramWidth, paramHeight) {
    Collideable.call(this, paramXOffSet, paramYOffSet, paramWidth, paramHeight);
    //this.sprite = 'images/char-boy.png';
    this.x = 200;
    this.y = 320;
    this.stepPowerUp = 0;
};

//Setup inheritance from Collideable.
Player.prototype = Object.create(Collideable.prototype);
Player.prototype.constructor = Player;

Player.prototype.update = function(dt, stateOfGame) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    if (stateOfGame && stateOfGame === 1 && this.y <= -15) { //-5 Canvas dependent Top Goal value.
        this.reachedGoalCallback();
    }
};

Player.prototype.render = function(screen, imageResources) {
    if (screen && imageResources) {
        screen.drawImage(imageResources.get(this.sprite), this.x, this.y);
    }

    /*ctx.beginPath();
    ctx.arc(this.x+50, this.y+103,36, 0, 2 * Math.PI, false);
    ctx.stroke();
    ctx.closePath();
    */
    //ctx.rect(this.x + this.xOffSet, this.y+this.yOffSet, this.width,this.height);
    //ctx.stroke();

};

/*
 *   Sets player back to starting point.
 *   @params none.
 */
Player.prototype.reset = function() {
    //Values dependent on canvas size.
    this.x = 200;
    this.y = 300;
};

/*
 *   Handles Player movement.
 *   @param: movement
 */
Player.prototype.handleInput = function(movement) {
    //Player movement distance will be determined by stepPowerUp variable.
    //var TAKE_WHOLE_STEP = 30 + (10*this.stepPowerUp); //60 limit
    var horizontalStep = 101; //Previous value given: 100
    var verticalStep = 83; //Previous value given: 80
    /*
       screen
                 upperYLimit
                 ----------
                |          |
    lowerXLimit |          | upperXLimit
                |          |
                |          |
                 ----------
                 lowerYLimit
    */

    var upperYLimit = -15;
    var lowerYLimit = 360;
    var lowerXlimit = -10;
    var upperXLimit = 412;

    switch (movement) {
        case 'left':
            if (this.x - horizontalStep >= lowerXlimit) {
                this.x -= horizontalStep;
            } else {
                this.x = lowerXlimit;
            }
            break;
        case 'up':
            if (this.y - verticalStep >= upperYLimit) {
                this.y -= verticalStep;
            } else {
                this.y = upperYLimit;
            }
            break;
        case 'right':
            if (this.x + horizontalStep <= upperXLimit) {
                this.x += horizontalStep;
            } else {
                this.x = upperXLimit;
            }
            break;
        case 'down':
            if (this.y + verticalStep <= lowerYLimit) {
                this.y += verticalStep;
            } else {
                this.y = lowerYLimit;
            }
            break;
        case 'space':
            if (gameSetting.getGamePaused() === true) {
                gameSetting.setGamePaused(false);
            } else {
                gameSetting.setGamePaused(true);
            }
            break;
    }
    this.changedPositionCallback();
};

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player

var player = new Player(30, 113, 44, 27);

/*
 *   Call to handle player reaching goal: water.
 */
player.reachedGoalCallback = function() {
    gameSetting.addToScore(10);
    var tempGameScore = gameSetting.getScore();

    if (tempGameScore >= 40 && tempGameScore < 80) {
        this.stepPowerUp = 1;
        gameAI.numberOfAllowedEnemies = 4;
    } else if (tempGameScore >= 80 && tempGameScore < 120) {
        this.stepPowerUp = 2;
        gameAI.numberOfAllowedEnemies = 5;
    } else if (tempGameScore >= 120) {
        this.stepPowerUp = 3;
        gameAI.numberOfAllowedEnemies = 6;
    }

    this.reset(); //place player back to origin
};

/*
 *   Todo: will use this callback to update gameSetting player position.
 */
player.changedPositionCallback = function() {
    gameSetting.playerXpos = this.x;
};

var allEnemies = [];
var allItems = [];

var gameSetting = new GameSetting(player);

/*
 *   Update player score, update player info display.
 */
gameSetting.addToScore = function(inc) {
    this.score += inc;
    this.deltaScore += inc;
    if (!this.gameWon && this.score >= 100) {
        this.getnextLevelTokenCallback(); //render key to win level.
        this.gameWon = true;
    }
    this.addNewItemCallback(); //decided if player deserves a new item or not.

    //update player info display
    gameSetting.gameInfoDisplayUpdate();
};

/*
 * Callback to display game Info. Calls global var.
 */
gameSetting.gameInfoDisplayUpdate = function() {
    if (!this.gameInfoDisplay) {
        this.gameInfoDisplay = window.GameScreenDispatcher;
    }
    this.gameInfoDisplay.trigger('player-info-render', gameSetting);
};

/*
 * BEGIN getters/setters
 */

gameSetting.getScore = function() {
    return this.score;
};

gameSetting.getCharacterChosen = function() {
    return this.characterChosen;
};

gameSetting.setCharacterChosen = function(character) {
    if (character !== undefined) { //Must compare to undefined, since 0 is a possible value
        this.characterChosen = character;
    }
};

gameSetting.getGamePaused = function() {
    return this.gamePaused;
};

gameSetting.setGamePaused = function(paused) {
    if (paused !== undefined) {
        this.gamePaused = paused;
    }
};

gameSetting.getGameState = function() {
    return this.gameState;
};

gameSetting.setGameState = function(state) {
    if (state !== undefined) {
        this.gameState = state;
    }
};

/*
 * END getters/setters
 */

/*
 * Call when player has reached a winning score, and render key item.
 */
gameSetting.getnextLevelTokenCallback = function() {
    allItems.push(new Item(350, 90, 'key'));
};

/*
 * When player collides with an item, decided what todo based on item.
 */
gameSetting.itemCollidedCallback = function(type, item) {
    var removeItem = true;
    switch (type) {
        case 'key': //make the key appear to pass level.
            this.wonLevelCallback();
            break;
        case 'bug':
            this.lives = this.lives - 1;
            if (this.playerRef && this.lives > 0) {
                this.playerRef.reset();
            } else {
                this.lostLevelCallback();
            }
            removeItem = false;
            break;
        case 'heart':
            this.lives++;
            this.deltaScore = 0;
            break;
        case 'gem':
            if (item !== undefined) {
                this.score += item.value;
                this.deltaScore = 0;
            }
            break;
    }

    //remove item from allItems array.
    if (removeItem) {
        var indexOfItem = allItems.indexOf(item);
        allItems.splice(indexOfItem, 1);
        this.gemsAdded--;
    }

    //Player score or hearts may have affected, update player info display.
    gameSetting.gameInfoDisplayUpdate();
};

//Todo: come up with a descriptive object to hold gameState codes: {'playing', 'choosing','wonGame', 'lostGame'}.
gameSetting.wonLevelCallback = function() {
    this.gamePaused = true;
    this.gameState = 3;
};

gameSetting.lostLevelCallback = function() {
    this.gamePaused = true;
    this.gameState = 2;
};

gameSetting.addNewItemCallback = function() {
    //random range: random() * (max-min) + min
    var randX = Math.random() * (380) + 10; // values between 10 390
    var randY = Math.random() * (200) + 60; //values betwwen 60 , 260

    var randMax = 2;

    var item;
    if (this.deltaScore >= 40 && this.deltaScore <= 70 && this.gemsAdded === 0) {
        if (this.score >= 40 && this.score < 79) {
            randMax = 2;
        } else if (this.score >= 80 && this.score < 99) {
            randMax = 3;
        } else if (this.score >= 100) {
            randMax = 4;
        }
        randMax = Math.round(Math.random() * randMax);
        switch (randMax) {
            case 1:
                item = new Item(randX, randY, 'gem', {
                    color: 'blue'
                });
                this.gemsAdded++;
                break;
            case 2:
                item = new Item(randX, randY, 'gem', {
                    color: 'green'
                });
                this.gemsAdded++;
                break;
            case 3:
                item = new Item(randX, randY, 'gem', {
                    color: 'orange'
                });
                this.gemsAdded++;
                break;
        }
    } else if (this.deltaScore > 70) {
        if (this.lives < 3) {
            item = new Item(randX, randY, 'heart');
        } else {
            item = new Item(randX, randY, 'star');
        }
    }

    if (item) {
        allItems.push(item);
    }
};

var gameAI = new GameAI(allEnemies, allItems, gameSetting);

/* Enemy instance callbacks shared by enemies. BEGIN*/
function stepCountChanged(me) {
    if (me.x > 150) {
        gameAI.addNewEnemyCallback(me.row);
    }
}

function xRightLimitReached(me) {
        gameAI.resetEnemyCallback(me);
    }
    /* Enemy instance callbacks shared by enemies. END*/

gameAI.newEnemyCallback = function() {
    var newEnemy = new Enemy(this.getNextRow(), 3, 103, 95, 25);
    newEnemy.stepCountChangedCallback = stepCountChanged;
    newEnemy.xRightLimitReachedCallback = xRightLimitReached;
    return newEnemy;
};

/*
 * Call when enemy reaches the end.
 */
gameAI.updateEnemyCallback = function(enemy) {
    enemy.setRow(this.getNextRow());
    var currentScore = gameSetting.score;

    if (currentScore >= 0 && currentScore < 40) {
        enemy.setSpeed(100);
    } else if (currentScore >= 40 && currentScore < 80) {
        enemy.setSpeed(130);
    } else if (currentScore >= 80 && currentScore < 120) {
        enemy.setSpeed(150);
    } else if (currentScore >= 120) {
        enemy.setSpeed(170);
    }
    return enemy;
};



/*
 * Handle keyboard input in main menu.
 */
function choosingCharacters(movement) {
    var totalNumOfPlayableChars = 4;
    var character = gameSetting.getCharacterChosen();
    switch (movement) {
        case 'right':
            character++;
            if (character >= totalNumOfPlayableChars) {
                character = 0;
            }
            break;
        case 'left':
            character--;
            if (character < 0) {
                character = totalNumOfPlayableChars;
            }
            break;
        case 'enter':
            if (character >= 4) {
                character = 0;
            } else {
                character++;
            }
            switch (character) {
                case 0:
                    player.sprite = 'images/char-boy.png';
                    break;
                case 1:
                    player.sprite = 'images/char-cat-girl.png';
                    break;
                case 2:
                    player.sprite = 'images/char-horn-girl.png';
                    break;
                case 3:
                    player.sprite = 'images/char-pink-girl.png';
                    break;
                case 4:
                    player.sprite = 'images/char-princess-girl.png';
                    break;
            }

            gameSetting.setGameState(1); //playing
            gameSetting.gameInfoDisplayUpdate();
            player.reset();
            break;
    }
    gameSetting.setCharacterChosen(character);
}

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down',
        13: 'enter',
        32: 'space'
    };

    if ((e.keyCode >= 37 && e.keyCode <= 40) || e.keyCode === 13 || e.keyCode === 32) {
        var stateOfGame = gameSetting.getGameState();
        if (stateOfGame === 1) {
            player.handleInput(allowedKeys[e.keyCode]);
        } else if (stateOfGame === 0) {
            choosingCharacters(allowedKeys[e.keyCode]);
        }
    }
});