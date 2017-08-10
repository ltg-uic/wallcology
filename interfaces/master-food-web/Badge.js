function Badge(n, x, y, w, h, c, colour, textcolour, font, yo){
	/*var imageW = 24;
	var imageH = 24;
	// var imageX = x + (w-imageW)/2;
	// var imageY = y;
	var image;
	// var image2;
	var fileName;
	// var fileName2;
	var backgroundStyle = s;
	var inactiveAlpha = 1;
	var activeAlpha = 0.5;
*/
	this.name = n;
	this.x = x;
	this.y = y;
	this.width = w;
	this.height = h;
	this.colour = colour;
	this.context = c;
	this.textcolour = textcolour;
	this.yOffset = yo;	//text offset
	this.font = font;
	this.isDragging = false;
	//this.active = false;
	this.EVENT_CLICKED = "clicked";

	/*image = loadImage( fileName );
	
	function loadImage( file ){
		var icon = new Image();
		icon.addEventListener('load', imageLoaded , false);
		icon.src = file;
		return icon;
	}

	function imageLoaded(event) {
		image.loaded = true;
	}*/

	this.onMouseUp = function (mouseX,mouseY) {		
		this.active = !this.active;
		this.drawButton();
		//this.dispatch(this.EVENT_CLICKED);
	}
	this.updateXY = function(x,y){
		this.x = x;
		this.y = y;
	}
	this.drawButton = function(){
		this.context.save();
		this.draw();
		this.context.restore();
	}
	this.draw = function() {
	    this.context.shadowBlur=4;
	    this.context.shadowOffsetX = 0;
	    this.context.shadowOffsetY = 4;
	    this.context.fillStyle = this.colour;

		var centerX = this.x + this.width / 2;
      	var centerY = this.y + this.height / 2;
      	var radius = this.width / 2;

		this.context.beginPath();
		this.context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
		this.context.fill();

	    this.context.shadowBlur=0;
	    this.context.shadowOffsetX = 0;
	    this.context.shadowOffsetY = 0;
		this.context.lineWidth = 3;
		this.context.strokeStyle = '#FFFFFF';
		this.context.stroke();
	    //this.context.drawImage(image,imageX,imageY,imageW,imageH);
	    this.context.font = this.font;
	    this.context.textAlign = "center";
	    this.context.textBaseline = "top";
	    this.context.fillStyle = this.textcolour;
		//this.context.drawImage(image,this.x+(this.width-imageW)/2,this.y,imageW,imageH);
		this.context.fillText(this.name, this.x+this.width/2, this.y+this.yOffset);
/*
		//draw hit area
		this.context.globalAlpha = 0.5;
		this.context.fillStyle = "red";
		this.context.fillRect(this.x, this.y, this.width, this.height);
		this.context.globalAlpha = 1;

*/	}

}
Badge.prototype = new EventDispatcher();
Badge.prototype.constructor = Badge;