function Species ( n, x, y, h, w, c ){
	
	this.name = n;
	this.file = this.name + ".png";

    this.px = x;  //pickerbox location
    this.py = y;
	this.x = x;   //where image is placed at, dynamic
	this.y = y;
	this.width = w;
	this.height = h;
	this.isDragging = false;
    this.active = false;
    this.context = c;
    this.EVENT_CLICKED = "clicked";
    this.EVENT_REDRAW = "redraw";
    this.image = loadImage(this.file);

    this.onMouseUp = function (mouseX,mouseY) {
    	this.dispatch(this.EVENT_CLICKED);
    }
    
    this.draw = function() {
        this.context.shadowBlur=4;
        this.context.shadowColor="#BFBFBF";
        this.context.shadowOffsetX = 0;
        this.context.shadowOffsetY = 4;
    	this.context.drawImage(this.image,this.x,this.y, this.width,this.height);
    }
    
    function loadImage(file) {
    	var image = new Image();
    	//image.onload = this.imageLoaded;
    	image.src = file;
        return image
    }
    /*		
    this.imageLoaded = function() {
    	this.loaded = true;
    }
    */
}
Species.prototype = new EventDispatcher();
Species.prototype.constructor = Species;