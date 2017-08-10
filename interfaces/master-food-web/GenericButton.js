function GenericButton(n, x, y, h, w, c, colour){
	this.name = n;
	this.x = x;
	this.y = y;
	this.width = w;
	this.height = h;
	this.colour = colour;
	this.context = c;

	this.onMouseUp = function (mouseX,mouseY) {
		this.dispatch(this.EVENT_CLICKED);
	}
	this.draw = function() {
	    this.context.fillStyle = this.colour;
	    this.context.fillRect(this.x, this.y, this.width, this.height);

	    this.context.shadowBlur=0;
	    this.context.shadowOffsetX = 0;
	    this.context.shadowOffsetY = 0;
	    this.context.font = "12pt 'Roboto'";
	    this.context.textAlign = "center";
	    this.context.textBaseline = "top";
	    this.context.fillStyle = "#FFFFFF"
	    this.context.fillText(this.name, this.x+this.width/2, this.y+8);
	}
}
GenericButton.prototype = new EventDispatcher();
GenericButton.prototype.constructor = GenericButton;