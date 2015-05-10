$(function(){
	var GameScreenView = Backbone.View.extend({
		initialize: function() {
			$('#game-container').prepend("<div id='game-screen' class='row'></div>");
			$('canvas').appendTo($("#game-screen"));
			$('#game-screen').append("<div id='player-info'></div>");
			this.el = '#game-screen';

			/*Set up canvas to display  Score and player lives*/
			this.canvas =  document.createElement('canvas');
			this.canvas.width = 505;
    		this.canvas.height = 606;

        	this.infoCanvasContext = this.canvas.getContext('2d');
        	this.infoCanvasContext.font = '20pt Calibri';
        	$(this.canvas).appendTo($('#player-info'));
		},
		render: function(options) {
			/*Update game info display if changes occur. */
			if(options === undefined) {
				options = {lives:3,score:0};
			}
			this.infoCanvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
			var heart_xOrigin = 430;
			var heart_yOrigin = 40;
			var heart_xScale = 40;
			var heart_yScale = 60;
			var heart_dx = 42;
			for(var x=0; x < options.lives ; x++) {
				var heart_pos = heart_xOrigin - (heart_dx * x);
				this.infoCanvasContext.drawImage(window.Resources.get('images/Heart.png'),heart_pos,heart_yOrigin,heart_xScale ,heart_yScale);
			}
      		this.infoCanvasContext.fillText('Score:  ' + options.score , 30, 85);
        	return this;
		},
		hide: function() {
			$("#player-info").hide();
		}
	});

	var GameActionsRouter = Backbone.Router.extend({
		routes: {
			'game': 'game',
			'leaderboard':'leaderboard',
			'about':'about'
		}
 	});


	var GameScreen = new GameScreenView();

	/*Global var to handle game events.*/
	var dispatcher = _.clone(Backbone.Events);

	/*Call if player score or lives changes.*/
	dispatcher.on("player-info-render",function(options){
		GameScreen.render(options);
	});
	dispatcher.on("player-info-hide",function(){
		GameScreen.hide();
	});

	window.GameScreenDispatcher = dispatcher;

	var GameActions = new GameActionsRouter;
	$("#game-new").on('click',function() {
		GameActions.navigate("#");
		GameActions.navigate("newgame", {trigger: true});
	});
	Backbone.history.start();
});