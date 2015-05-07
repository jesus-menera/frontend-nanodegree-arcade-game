$(function(){
	var GameScreenView = Backbone.View.extend({
		initialize: function() {
			$('#game-container').prepend("<div id='game-screen' class='row'></div>");
			$('canvas').appendTo($("#game-screen"));
			$('#game-screen').append("<div id='player-info'></div>");
			this.el = '#game-screen';

			this.canvas =  document.createElement('canvas');
			this.canvas.width = 505;
    		this.canvas.height = 606;

        	this.infoCanvasContext = this.canvas.getContext('2d');
        	this.infoCanvasContext.font = '20pt Calibri';
        	$(this.canvas).appendTo($('#player-info'));
		},
		render: function(options) {
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
		}
	});

	var GameActionsRouter = Backbone.Router.extend({
		routes: {
			'game': 'game',
			'leaderboard':'leaderboard',
			'about':'about'
			/*'playing','playing',
			'about': 'about',
			'leaderboard':'leaderboard'*/
		}
 	});


	var GameScreen = new GameScreenView();

	var dispatcher = _.clone(Backbone.Events);
	dispatcher.on("player-info-render",function(options){
		GameScreen.render(options);
	})

	window.GameScreenDispatcher = dispatcher;

	var GameActions = new GameActionsRouter;
	$("#game-new").on('click',function() {
		GameActions.navigate("#");
		GameActions.navigate("newgame", {trigger: true});
	});
	Backbone.history.start();
});