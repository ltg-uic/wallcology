function ImageButton(n, x, y, h, w, c, colour){
	this.name = n;
	this.x = x;
	this.y = y;
	this.width = w;
	this.height = h;
	this.colour = colour;
	this.context = c;
	this.active = true;

	var image = loadImage( n + ".png" );
	var radius = w/2;
	var centerX = this.x + radius;
	var centerY = this.y + radius;

	this.EVENT_CLICKED = "clicked";

	function loadImage( file ){
		var icon = new Image();
		//icon.addEventListener('load', imageLoaded , false);
		icon.src = file;
		return icon;
	}
	function imageLoaded(event) {
		icon.loaded = true;
	}
	this.onMouseUp = function (mouseX,mouseY) {
		this.dispatch(this.EVENT_CLICKED);
	}
	this.updateXY = function(x,y){
		this.x = x;
		this.y = y;
	}
	this.draw = function() {
		if( this.active ){
	    	this.context.fillStyle = this.colour; //"#FF5722";
	    	this.context.fillRect(this.x, this.y, this.width, this.height);
	    	this.context.drawImage(image,this.x,this.y,this.width,this.height);
	    } else {
	    	this.context.fillStyle = this.colour; //"#FF5722";
	    	this.context.globalAlpha = 0.2;
	    	this.context.fillRect(this.x, this.y, this.width, this.height);
	    	this.context.drawImage(image,this.x,this.y,this.width,this.height);
	    	this.context.globalAlpha = 1;
	    }
	}
}
ImageButton.prototype = new EventDispatcher();
ImageButton.prototype.constructor = ImageButton;