function Species ( n, x, y, h, w, c, sc, l){
	
    // var url = u;
    this.file = n + ".png";
    //var file = url + n + ".png";
    //var placeholderFile = url + n + ".png";
    var shadowColour = sc;

    var image = loadImage( this.file );
    //var placeholder = loadImage( placeholderFile );


    this.name = n;  //unique name for identifying object
    this.nickname = l;
    this.x = x;   //where image is placed at, dynamic
    this.y = y;
    this.px = x;  //location in palette
    this.py = y;    
    this.width = w;
    this.height = h;
    this.isDragging = false;
    this.active = false;
    this.context = c;
    this.EVENT_CLICKED = "clicked";
    this.EVENT_REDRAW = "redraw";

    this.onMouseUp = function (mouseX,mouseY) {
    	this.dispatch(this.EVENT_CLICKED);
    }
    
    this.draw = function() {
        this.context.shadowColor = shadowColour;
        this.context.shadowBlur = 0;
        this.context.shadowOffsetX = 0;
        this.context.shadowOffsetY = 0;
        //this.context.globalAlpha = 0.5;
        //this.context.drawImage( placeholder, this.px, this.py, this.width, this.height );
        //this.context.globalAlpha = 1;
        if ( this.active ){
            this.context.shadowBlur = 4;
            this.context.shadowColor = shadowColour;
            this.context.shadowOffsetX = 0;
            this.context.shadowOffsetY = 4;
        } else {
            this.context.shadowBlur = 0;
            this.context.shadowOffsetX = 0;
            this.context.shadowOffsetY = 0;
        }
    	this.context.drawImage( image, this.x, this.y, this.width, this.height );
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