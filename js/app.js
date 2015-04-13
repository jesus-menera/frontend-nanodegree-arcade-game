/**
*   Creates game setting object. Holds game session info.
**/
var GameSetting = function() {
    this.score = 0;
    this.playerXpos = 0; //not sure if needed
}

/** GAMEAI BEGIN **/

/**
*   Creates instance of game artificial intelligence. Takes care of enemy creation.
*   @ param enemyArray: reference to array that holds all active game enemies.
*   @ param setting:    reference to game setting object, used to store and check game state.
**/
var GameAI = function(enemyArray, settings) {
    if (enemyArray == 'undefined') {
        enemyArray = [];
    }
    if(settings == 'undefined') {
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
}
/**
*   Function called in game loop to update GameAI in each game step.
*   @param dt:  time constant.
**/
GameAI.prototype.update = function(dt) {
    if(this.activeEnemyArray.length === 0){
       this.activeEnemyArray.push(this.newEnemyCallback());
    }
}

/**
*   Returns numerical row value, in which to create next enemy.
*   @returns Numercal value in set{012}.
**/
GameAI.prototype.getNextRow = function() {
    var temp = this.prevRowCalled;
    this.prevRowCalled++;
    if(this.prevRowCalled > 2) {
        this.prevtRowCalled = 0;
    }
    return temp;
}

/**
*   Callback to summon enemies
    @param row:  row.  Numerical value of row in which to put enemy.
**/
GameAI.prototype.addNewEnemyCallback = function(row) {
    if (row == 'undefined') {
        row = 0;
    }

    //Reuse enemies already created but not in use.
    if (this.inactiveEnemyArray.length > 0) {
        var topEnemy = this.inactiveEnemyArray.pop();
        this.activeEnemyArray.push(this.updateEnemyCallback(topEnemy));
    }
    //Create new enemy if allowed by game constraint
    else if ( this.numberOfCreatedEnemies < this.numberOfAllowedEnemies - 1) {
        this.activeEnemyArray.push(this.newEnemyCallback());
        this.numberOfCreatedEnemies++;
    }
}

/**
*   Stores enemy for reuse.
*   @param enemy: instances of enemy to retire.
**/
GameAI.prototype.resetEnemyCallback = function(enemy){
    if (enemy !== 'undefined') {
        var indexOfEnemy = this.activeEnemyArray.indexOf(enemy);
        this.activeEnemyArray.splice(indexOfEnemy,1);
        this.inactiveEnemyArray.push(enemy);
    }
}

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
}

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

    if (collideableObj != undefined ) {
        var x0 = this.x + this.xOffSet;
        var y0 = this.y + this.yOffSet;
        var x1 = collideableObj.x + collideableObj.xOffSet;
        var y1 = collideableObj.y + collideableObj.yOffSet;

        var deltaY;
        if (this.y > collideableObj.y) {
            deltaY = y0 - y1 - collideableObj.height;
        }
        else {
            deltaY = y1 - y0 - this.height;
        }
        if (deltaY <= 0) {
            var deltaX;
            if (x0 > x1) {
                deltaX = x0 - x1 - collideableObj.width;
            }
            else {
                deltaX = x1 - x0 - this.width;
            }
            if (deltaX <= 0) {
                return true;
            }
        }
        return false;
    }
    return undefined;
}

/** COLLIDEABLE END **/

/** ENEMY BEGIN **/

/**
*   Creates instance of Enemy. Keeps track of speed, step taken, displaying to screen.
    @param row.
**/
var Enemy = function(row, paramXOffSet, paramYOffSet, paramWidth, paramHeight) {
    Collideable.call(this, paramXOffSet, paramYOffSet, paramWidth, paramHeight);
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    if(row !== 'undefined') {
        row = 0;
    }

    this.stepCount = 0;
    this.stepDeltaX = 100; //Brodcast self info every DeltaX step.
    this.stepSpeed = 100;
    this.row = -1;  //Numerical value of row in which to walk.

    //Following numbers depend on canvas size. Figure out new numbers if canvas size is changed.
    this.xLeftLimit = -98; //left and right most x limits on screen
    this.xRightLimit = 505;
    this.x = this.xLeftLimit;
    switch(row){
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
}
Enemy.prototype = Object.create(Collideable.prototype);
Enemy.prototype.constructor = Enemy;

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    if (this.x >= this.xRightLimit) {
        this.x = this.xLeftLimit;
    }
    else{
        this.x = this.x + (this.stepSpeed * dt); //possible difficult var inplace of 100;
    }

    this.stepCount++;
    if(this.stepCount >= this.stepDeltaX) {
        this.stepCount=0;
        this.stepCountChangedCallback(this);
    }
    if (this.x >= this.xRightLimit) {
        console.log('x reached');
        this.xRightLimitReachedCallback(this);
    }
}


Enemy.prototype.setRow = function(row) {
    switch(row){
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
}

Enemy.prototype.setSpeed = function(speed) {
    this.stepSpeed = speed;
}

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    if (this.x >= this.xLeftLimit || this.x <= this.xRightLimit) {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
        //ctx.rect(this.collisionHandler.x(), this.collisionHandler.y(), this.collisionHandler.width,this.collisionHandler.height);
        //ctx.stroke();
    }
}

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function(paramXOffSet, paramYOffSet, paramWidth, paramHeight){
    Collideable.call(this, paramXOffSet, paramYOffSet, paramWidth, paramHeight);
    this.sprite = 'images/char-boy.png';
    this.x = 200;
    this.y = 320;
    this.stepPowerUp = 0;
}
Player.prototype = Object.create(Collideable.prototype);
Player.prototype.constructor = Player;

Player.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    if(this.y == -5) {
        this.reachedGoalCallback();
    }
}
Player.prototype.render = function(){
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    /*ctx.beginPath();
    ctx.arc(this.x+50, this.y+103,36, 0, 2 * Math.PI, false);
    ctx.stroke();
    ctx.closePath();
    */
    //ctx.rect(this.collisionHandler.x(), this.collisionHandler.y(), this.collisionHandler.width,this.collisionHandler.height);
    //ctx.stroke();

}
Player.prototype.reset = function(){
    this.x = 200;
    this.y = 320;
}
Player.prototype.handleInput = function(movement){
    var TAKE_WHOLE_STEP = 30 + (10*this.stepPowerUp); //60 limit
    var TAKE_TINY_STEP = 5;
    switch(movement){
        case 'left':
            if( this.x - TAKE_WHOLE_STEP > -10){
                this.x -= TAKE_WHOLE_STEP;
            }
            else if( this.x - TAKE_TINY_STEP > -10){
                this.x -= TAKE_TINY_STEP;
            }
            break;
        case 'up':
            if( this.y - TAKE_WHOLE_STEP > -10){
                this.y -= TAKE_WHOLE_STEP;
            }
            else if( this.y - TAKE_TINY_STEP > -10){
                this.y -= TAKE_TINY_STEP;
            }
            break;
        case 'right':
            if( this.x + TAKE_WHOLE_STEP < 412){
                this.x += TAKE_WHOLE_STEP;
            }
            else if( this.x + TAKE_TINY_STEP < 412){
                this.x += TAKE_TINY_STEP;
            }
            break;
        case 'down':
            if( this.y + TAKE_WHOLE_STEP < 430){
                this.y += TAKE_WHOLE_STEP;
            }
            else if( this.y + TAKE_TINY_STEP < 430){
                this.y += TAKE_TINY_STEP;
            }
            break;
    }
    this.changedPositionCallback();
}
// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player

var player = new Player(30,113,44,27);
player.reachedGoalCallback = function() {
    gameSetting.addToScore(10);
    var tempGameScore = gameSetting.getScore();
    if(tempGameScore >= 40 && tempGameScore <80) {
        this.stepPowerUp = 1;
        gameAI.numberOfAllowedEnemies = 4;
    }
    else if (tempGameScore >= 80 && tempGameScore <120) {
        this.stepPowerUp = 2;
        gameAI.numberOfAllowedEnemies = 5;
    }
    else if (tempGameScore >= 120) {
        this.stepPowerUp = 3;
        gameAI.numberOfAllowedEnemies = 6;
    }
    this.reset();
}

player.changedPositionCallback = function() {
    gameSetting.playerXpos = this.x;
}

var allEnemies = [];

var gameSetting = new GameSetting();
gameSetting.addToScore = function(inc) {
    this.score += inc;
}
gameSetting.getScore = function() {
    return this.score;
}

var gameAI = new GameAI(allEnemies,gameSetting);

gameAI.newEnemyCallback = function() {
    var newEnemy = new Enemy(this.getNextRow(),3,103,95,25);
    newEnemy.stepCountChangedCallback = function(me) {
        if (me.x > 150) {
            gameAI.addNewEnemyCallback(me.row);
        }
    }
    newEnemy.xRightLimitReachedCallback = function(me) {
        gameAI.resetEnemyCallback(me);
    }
    return newEnemy;
};
gameAI.updateEnemyCallback = function(enemy) {
    enemy.setRow(this.getNextRow());
    var currentScore = gameSetting.score;

    if(currentScore >= 0 && currentScore < 40) {
        enemy.setSpeed(100);
    }

    else if (currentScore >= 40 && currentScore < 80) {
        enemy.setSpeed(130);
    }

    else if (currentScore >= 80 && currentScore < 120) {
        enemy.setSpeed(150);
    }

    else if (currentScore >= 120) {
        enemy.setSpeed(170);
    }
    return enemy;
}


// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    if(e.keyCode >=37 || e.keyCode <=40) {
        player.handleInput(allowedKeys[e.keyCode]);
    }

});
