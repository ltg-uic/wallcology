function GenericButton(n, x, y, h, w, c, colour, textcolour, font, yo){
	this.name = n;
	this.x = x;
	this.y = y;
	this.width = w;
	this.height = h;
	this.colour = colour;
	this.context = c;
	this.textcolour = textcolour;
	this.yOffset = yo;
	this.font = font;

	this.onMouseUp = function (mouseX,mouseY) {
		this.dispatch(this.EVENT_CLICKED);
	}
	this.updateXY = function(x,y){
		this.x = x;
		this.y = y;
	}
	this.draw = function() {
		//console.log("draw GenericButton x: "+this.x+" , y: "+this.y+" , "+this.width+" , "+this.height);
		/*
	    this.context.shadowBlur=4;
	    this.context.shadowColor="#BFBFBF";
	    this.context.shadowOffsetX = 0;
	    this.context.shadowOffsetY = 4;
	    */
	    this.context.shadowBlur=0;
	    this.context.shadowOffsetX = 0;
	    this.context.shadowOffsetY = 0;
	    this.context.fillStyle = this.colour; //"#FF5722";
	    this.context.fillRect(this.x, this.y, this.width, this.height);

	    this.context.shadowBlur=0;
	    this.context.shadowOffsetX = 0;
	    this.context.shadowOffsetY = 0;
	    this.context.font = this.font;
	    this.context.textAlign = "center";
	    this.context.textBaseline = "top";
	    this.context.fillStyle = this.textcolour;
	    this.context.fillText(this.name, this.x+this.width/2, this.y+this.yOffset);
	}
}
GenericButton.prototype = new EventDispatcher();
GenericButton.prototype.constructor = GenericButton;