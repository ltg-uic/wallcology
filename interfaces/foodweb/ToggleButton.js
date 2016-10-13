function ToggleButton(n, s, x, y, c, bg, tc){
	this.name = n; //"source" or "destination"
	this.x = x;
	this.y = y;
	this.width = 30;
	this.height = 30;
	this.alpha = 1;
	//this.colour = bg;
	this.backgroundColour = bg;
	this.context = c;
	this.textcolour = tc;
	this.yOffset = 0;
	this.font = "500 22px 'Roboto'";
	this.symbol = s;	//"plus" or "minus" later trnaslates into "+" and "\u2013"

	this.EVENT_CLICKED = "clicked";
	this.EVENT_REDRAW = "redraw";

	this.onMouseUp = function (mouseX,mouseY) {
		var ns = "";
		if( this.symbol == "plus" ){
			ns = "minus";
		} else if ( this.symbol == "minus" ){
			//ns = "plus";
			ns = "question";
		} else if ( this.symbol == "question"){
			ns = "plus";
		}
		this.symbol = ns;
		this.drawButton();
		//this.dispatch(this.EVENT_REDRAW);
	}
	this.updateXY = function(x,y){
		this.x = x;
		this.y = y;
	}
	this.updateAlpha = function(v){
		//console.log(this.name + " updateAlpha");
		this.alpha = v;
	}
	this.drawButton = function() {
		this.context.save();
		//this.context.clearRect(this.x+8, this.y+8, 13, 18);
		this.context.fillStyle = this.backgroundColour;
		this.context.fillRect(this.x+8, this.y+6, 13, 18);
		this.draw();
		this.context.restore();
	}
	this.draw = function() {
	    this.context.shadowBlur=0;
	    this.context.shadowOffsetX = 0;
	    this.context.shadowOffsetY = 0;
	    this.context.globalAlpha = 0;
	    this.context.fillStyle = this.backgroundColour;//"#FF5722"; //this.colour; //"#FF5722"; 
	    this.context.fillRect(this.x, this.y, this.width, this.height);
	    this.context.globalAlpha = this.alpha;

	    this.context.shadowBlur=0;
	    this.context.shadowOffsetX = 0;
	    this.context.shadowOffsetY = 0;
	    this.context.font = this.font;
	    this.context.textAlign = "center";
	    this.context.textBaseline = "top";
	    this.context.fillStyle = this.textcolour;
	    var message = "";
	    if ( this.symbol == "plus" ){
	    	message = "+";
	    } else if ( this.symbol == "minus" ){
	    	message = "\u2013";
	    } else if ( this.symbol == "question" ){
	    	message = "?";
	    }
	    this.context.fillText(message, this.x+this.width/2, this.y+this.yOffset);
	    this.context.globalAlpha = 1;
	}
}
ToggleButton.prototype = new EventDispatcher();
ToggleButton.prototype.constructor = ToggleButton;