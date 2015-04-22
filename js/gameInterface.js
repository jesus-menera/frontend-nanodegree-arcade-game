$(function(){
	var GameScreenView = Backbone.View.extend({
		initialize: function() {
			$('body').prepend("<div id='game-screen'></div>")
			$('canvas').appendTo($("#game-screen"));
		}
	});

	var GameScreen = new GameScreenView();
});