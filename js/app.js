/*
Global Game Settings
*/
var GameSetting = function() {
    this.score = 0;
    this.xpos = 0;
}

var GameAI = function(enemyArray, settings) {
    if (enemyArray == 'undefined') {
        enemyArray = [];
    }
    if(settings == 'undefined') {
        settings = {};
    }
    this.nextRowCalled = 0;
    this.lastAddedRow = 0;
    this.activeEnemyArray = enemyArray;
    this.settings = settings;
    this.inactiveEnemyArray = [];
    this.numberOfAllowedEnemies = 3;
    this.numberOfCreatedEnemies = 0;
}

GameAI.prototype.getNextRow = function() {
    var temp = this.nextRowCalled;
    this.nextRowCalled++;
    if(this.nextRowCalled > 2) {
        this.nextRowCalled = 0;
    }
    return temp;
}
GameAI.prototype.update = function(dt) {
    if(this.activeEnemyArray.length === 0){
       this.activeEnemyArray.push(this.newEnemyCallback());
    }
}
GameAI.prototype.addNewEnemyCallback = function(row) {
    if (this.inactiveEnemyArray.length > 0) {
        //console.log("insert from inactiveEnemyArray");
        var topEnemy = this.inactiveEnemyArray.pop();
        this.activeEnemyArray.push(this.updateEnemyCallback(topEnemy));
    }
    else if ( this.numberOfCreatedEnemies < this.numberOfAllowedEnemies - 1) {
        console.log("new Enemy created");
        this.activeEnemyArray.push(this.newEnemyCallback());
        this.numberOfCreatedEnemies++;
    }
}
GameAI.prototype.resetEnemyCallback = function(enemy){
    var indexOfEnemy = this.activeEnemyArray.indexOf(enemy);
    this.activeEnemyArray.splice(indexOfEnemy,1);
    this.inactiveEnemyArray.push(enemy);
}

var CollisionHandler = function(obj, paramXOffSet, paramYOffSet, paramWidth, paramHeight) {
    this.xOffSet = paramXOffSet;
    this.yOffSet = paramYOffSet;
    this.width = paramWidth;
    this.height = paramHeight;
    this.obj = obj;
}

CollisionHandler.prototype.x = function() {
    return this.obj.x + this.xOffSet;
}
CollisionHandler.prototype.y = function() {
    return this.obj.y + this.yOffSet;
}

function haveCollided(entity0, entity1) {
    if (entity0!= undefined && entity1 != undefined ) {
        var x0 = entity0.x();
        var y0 = entity0.y();
        var x1 = entity1.x();
        var y1 = entity1.y();

        var deltaY;
        if (entity0.y > entity1.y) {
            deltaY = y0 - y1 - entity1.height;
        }
        else {
            deltaY = y1 - y0 - entity0.height;
        }
        if (deltaY <= 0) {
            var deltaX;
            if (x0 > x1) {
                deltaX = x0 - x1 - entity1.width;
            }
            else {
                deltaX = x1 - x0 - entity0.width;
            }
            if (deltaX <= 0) {
                return true;
            }
        }
        return false;
    }
    return undefined;
}

// Enemies our player must avoid
var Enemy = function(row=0) {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started
    this.stepCount = 0;
    this.stepDeltaX = 100;
    this.stepSpeed = 100;
    this.row = -1;

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
var Player = function(){
    this.sprite = 'images/char-boy.png';
    this.x = 200;
    this.y = 320;
    this.stepPowerUp = 0;
}

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

var player = new Player();
player.collisionHandler =  new CollisionHandler(player,30,113,44,27);
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
    gameSetting.xpos = this.x;
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
    var newEnemy = new Enemy(this.getNextRow());
    newEnemy.collisionHandler = new CollisionHandler(newEnemy,3,103,95,25);
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

/*
for(var numberOfEnemies = 0; numberOfEnemies < gameSetting.numberOfEnemies ; numberOfEnemies++) {
    var newEnemy = new Enemy(numberOfEnemies%3);
    newEnemy.collisionHandler = new CollisionHandler(newEnemy,3,103,95,25);
    allEnemies.push(newEnemy);
}
*/


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
