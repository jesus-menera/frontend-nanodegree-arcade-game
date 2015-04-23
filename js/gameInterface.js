$(function(){
	var GameScreenView = Backbone.View.extend({
		initialize: function() {
			$('body').prepend("<div id='game-screen'></div>");
			$('canvas').appendTo($("#game-screen"));
			$('#game-screen').append("<div id='player-info'></div>");

			this.canvas =  document.createElement('canvas');
			this.canvas.width = 505;
    		this.canvas.height = 110;

        	this.infoCanvasContext = this.canvas.getContext('2d');
        	this.infoCanvasContext.font = '20pt Calibri';
        	$(this.canvas).appendTo($('#player-info'));
        	//this.infoCanvas.font="30px Vernada";
        	//this.infoCanvas.fillText("hello!",20,40);
		},
		render: function(options) {
			if(options === undefined) {
				options = {heartNum:3,score:0};
			}

			this.infoCanvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
			var heart_xOrigin = 430;
			var heart_yOrigin = 40;
			var heart_xScale = 40;
			var heart_yScale = 60;
			var heart_dx = 42;

			for(var x=0; x < options.heartNum ; x++) {
				var heart_pos = heart_xOrigin - (heart_dx * x);
				this.infoCanvasContext.drawImage(window.Resources.get('images/Heart.png'),heart_pos,heart_yOrigin,heart_xScale ,heart_yScale);
			}

      		this.infoCanvasContext.fillText('Score:  ' + options.score , 30, 85);
			//this.infoCanvas.font="30px Vernada";
        	//this.infoCanvas.fillText("hello!",20,40);
        	//console.log(window.Resources.get(""))
        	return this;
		}
	});

	var GameScreen = new GameScreenView();
	GameScreen.render();
});