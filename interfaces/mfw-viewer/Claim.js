function Claim ( n, a, o1, o2, type, observe, reason, f1, f2, f3 ){
	
    this.name = n;
    this.author = a;
    this.obj1 = o1;
    this.obj2 = o2;
    this.type = type;  //eats, competeswith, doesnoteat, doesnotcompetewith
    this.observation = observe;    
    this.reasoning = reason;
    this.figure1 = f1;
    this.figure2 = f2;
    this.figure3 = f3;

    //this.EVENT_CLICKED = "clicked";
    //this.EVENT_REDRAW = "redraw";
    /*
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
Claim.prototype = new EventDispatcher();
Claim.prototype.constructor = Claim;