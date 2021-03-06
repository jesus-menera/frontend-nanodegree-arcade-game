/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in your app.js).
 *
 * A game engine works by drawing the entire game screen over and over, kind of
 * like a flipbook you may have created as a kid. When your player moves across
 * the screen, it may look like just that image/character is moving or being
 * drawn but that is not the case. What's really happening is the entire "scene"
 * is being drawn over and over, presenting the illusion of animation.
 *
 * This engine is available globally via the Engine variable and it also makes
 * the canvas' context (ctx) object globally available to make writing app.js
 * a little simpler to work with.
 */
var Engine = (function(global) {
    /* Predefine the variables we'll be using within this scope,
     * create the canvas element, grab the 2D context for that canvas
     * set the canvas elements height/width and add it to the DOM.
     */
    var doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        lastTime;

    canvas.width = 505;
    canvas.height = 606;
    doc.body.appendChild(canvas);

    /* This function serves as the kickoff point for the game loop itself
     * and handles properly calling the update and render methods.
     */
    function main() {
        /* Get our time delta information which is required if your game
         * requires smooth animation. Because everyone's computer processes
         * instructions at different speeds we need a constant value that
         * would be the same for everyone (regardless of how fast their
         * computer is) - hurray time!
         */
        var now = Date.now(),
            dt = (now - lastTime) / 1000.0;

        /* Call our update/render functions, pass along the time delta to
         * our update function since it may be used for smooth animation.
         */
        update(dt);
        render();

        /* Set our lastTime variable which is used to determine the time delta
         * for the next time this function is called.
         */
        lastTime = now;

        /* Use the browser's requestAnimationFrame function to call this
         * function again as soon as the browser is able to draw another frame.
         */
        win.requestAnimationFrame(main);
    };

    /* This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop.
     */
    function init() {
        reset();
        lastTime = Date.now();
        main();
    }

    /* This function is called by main (our game loop) and itself calls all
     * of the functions which may need to update entity's data. Based on how
     * you implement your collision detection (when two entities occupy the
     * same space, for instance when your character should die), you may find
     * the need to add an additional function call here. For now, we've left
     * it commented out - you may or may not want to implement this
     * functionality this way (you could just implement collision detection
     * on the entities themselves within your app.js file).
     */
    function update(dt) {
        gameAI.update(dt);
        updateEntities(dt);
        checkCollisions();
    }

    function checkCollisions() {
        allEnemies.forEach(function(enemy) {
            if (player.haveCollidedWith(enemy)) {
                gameSetting.itemCollidedCallback('bug');
            }
        });
        allItems.forEach(function(item) {
            if (player.haveCollidedWith(item)) {
                gameSetting.itemCollidedCallback(item.type,item);
            }
        });
    }

    /* This is called by the update function  and loops through all of the
     * objects within your allEnemies array as defined in app.js and calls
     * their update() methods. It will then call the update function for your
     * player object. These update methods should focus purely on updating
     * the data/properties related to  the object. Do your drawing in your
     * render methods.
     */
    function updateEntities(dt) {
        if (gameSetting.getGamePaused() === false) {
            allEnemies.forEach(function(enemy) {
                enemy.update(dt);
            });
            player.update(dt, gameSetting.getGameState());
        }
    }

    /* BEGIN Possible screens to render */
    function playing() {
        var rowImages = [
                'images/water-block.png',   // Top row is water
                'images/stone-block.png',   // Row 1 of 3 of stone
                'images/stone-block.png',   // Row 2 of 3 of stone
                'images/stone-block.png',   // Row 3 of 3 of stone
                'images/grass-block.png',   // Row 1 of 2 of grass
                'images/grass-block.png'    // Row 2 of 2 of grass
            ],
            numRows = 6,
            numCols = 5,
            row, col;

        /* Loop through the number of rows and columns we've defined above
         * and, using the rowImages array, draw the correct image for that
         * portion of the "grid"
         */
        for (row = 0; row < numRows; row++) {
            for (col = 0; col < numCols; col++) {
                /* The drawImage function of the canvas' context element
                 * requires 3 parameters: the image to draw, the x coordinate
                 * to start drawing and the y coordinate to start drawing.
                 * We're using our Resources helpers to refer to our images
                 * so that we get the benefits of caching these images, since
                 * we're using them over and over.
                 */
                ctx.drawImage(Resources.get(rowImages[row]), col * 101, row * 83);
            }
        }
        renderEntities();
    }

    //blacken screen.
    function screenOverlay() {
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.rect(0, 0, ctx.canvas.width, 585);
        ctx.fillStyle = 'black';
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    function clearScreen() {
        ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
    }

    function wonGame() {
        screenOverlay();
        ctx.drawImage(Resources.get('images/YouWon.png'), 85,280);
    }

    function lostGame() {
        screenOverlay();
        ctx.drawImage(Resources.get('images/YouLost.png'), 85,280);
    }
    function pausedGame(){
        //render paused screen.
        screenOverlay();
        ctx.drawImage(Resources.get('images/Paused.png'),100,250);
    }

    function choosing() {
        var t = gameSetting.getCharacterChosen();
        var x_pos = 100;
        var y_pos = 230;
        ctx.drawImage(Resources.get('images/Frogger.png'), 85,120);
        ctx.drawImage(Resources.get('images/Selector.png'), 200, y_pos);
        ctx.drawImage(Resources.get('images/Character-Select.png'),150,430);
        ctx.drawImage(Resources.get('images/leftIndicator.png'), 75,330);
        ctx.drawImage(Resources.get('images/rightIndicator.png'), 400,330);

        var count = 0;
        while(count < 3) {
            switch(t){
                case 0:
                    ctx.drawImage(Resources.get('images/char-boy.png'), x_pos, y_pos);
                    break;
                case 1:
                    ctx.drawImage(Resources.get('images/char-cat-girl.png'), x_pos, y_pos);
                    break;
                case 2:
                    ctx.drawImage(Resources.get('images/char-horn-girl.png'), x_pos, y_pos);
                    break;
                case 3:
                    ctx.drawImage(Resources.get('images/char-pink-girl.png'), x_pos, y_pos);
                    break;
                case 4:
                    ctx.drawImage(Resources.get('images/char-princess-girl.png'), x_pos, y_pos);
                    break;
            }
            t+=1;
            x_pos += 100;
            if(t===5){
                t=0;
            }
            count++;
        }
    }

    /* END Possible screens to render */

    /* This function initially draws the "game level", it will then call
     * the renderEntities function. Remember, this function is called every
     * game tick (or loop of the game engine) because that's how games work -
     * they are flipbooks creating the illusion of animation but in reality
     * they are just drawing the entire screen over and over.
     */
    function render() {
        /* This array holds the relative URL to the image used
         * for that particular row of the game level.
         */
        clearScreen();
        switch(gameSetting.getGameState()) {
            case 1://playing
                playing();
                if(gameSetting.getGamePaused()){
                    pausedGame();
                }
                break;
            case 0://choosing
                choosing();
                break;
            case 2://endGame
                playing();
                lostGame();
                break;
            case 3://wonGame
                playing();
                wonGame();
                break;
        }
    }

    /* This function is called by the render function and is called on each game
     * tick. It's purpose is to then call the render functions you have defined
     * on your enemy and player entities within app.js
     */
    function renderEntities() {
        /* Loop through all of the objects within the allEnemies array and call
         * the render function you have defined.
         */

        allEnemies.forEach(function(enemy) {
            enemy.render(this.ctx,Resources);
        });

        allItems.forEach(function(item) {
            item.render(this.ctx,Resources);
        });

        player.render(this.ctx,Resources);
    }

    /* This function does nothing but it could have been a good place to
     * handle game reset states - maybe a new game menu or a game over screen
     * those sorts of things. It's only called once by the init() method.
     */
    function reset() {
        // noop
    }

    /* Go ahead and load all of the images we know we're going to need to
     * draw our game level. Then set init as the callback method, so that when
     * all of these images are properly loaded our game will start.
     */
    Resources.load([
        'images/stone-block.png',
        'images/water-block.png',
        'images/grass-block.png',
        'images/enemy-bug.png',
        'images/char-boy.png',
        'images/char-cat-girl.png',
        'images/char-horn-girl.png',
        'images/char-pink-girl.png',
        'images/char-princess-girl.png',
        'images/Gem-Blue.png',
        'images/Gem-Green.png',
        'images/Gem-Orange.png',
        'images/Heart.png',
        'images/Key.png',
        'images/Rock.png',
        'images/Star.png',
        'images/Selector.png',
        'images/Frogger.png',
        'images/YouWon.png',
        'images/YouLost.png',
        'images/Character-Select.png',
        'images/Paused.png',
        'images/leftIndicator.png',
        'images/rightIndicator.png'
    ]);
    Resources.onReady(init);

    /* Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that developer's can use it more easily
     * from within their app.js files.
     */
    global.ctx = ctx;
})(this);
