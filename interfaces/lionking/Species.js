function Species ( n, x, y, h, w, c, up, down ){
	
	this.name = n;
	this.file = this.name + ".png";
    var placeholderFile = this.name + "_grey.png";

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
    this.placeholder = loadImage(placeholderFile);
    this.up = up;
    this.down = down;

    this.onMouseUp = function (mouseX,mouseY) {
    	this.dispatch(this.EVENT_CLICKED);
    }
    
    this.draw = function() {
        this.context.shadowColor= "#2B323F";
        this.context.shadowBlur=0;
        this.context.shadowOffsetX = 0;
        this.context.shadowOffsetY = 0;
        this.context.drawImage(this.placeholder,this.px,this.py, this.width,this.height);
        if ( this.active ){
            this.context.shadowBlur=4;
            this.context.shadowColor= "#BFBFBF";
            this.context.shadowOffsetX = 0;
            this.context.shadowOffsetY = 4;
        } else {
            this.context.shadowBlur=0;
            this.context.shadowOffsetX = 0;
            this.context.shadowOffsetY = 0;
        }
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