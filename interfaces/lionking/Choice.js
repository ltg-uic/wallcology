function Choice( n, x, y, w, h, c, color ){
	
	this.name = n;
	this.file = this.name + ".png";

    this.x = x;
	this.y = y;
	this.width = w;
	this.height = h;
    this.context = c;
    this.colour = color;
    this.EVENT_CLICKED = "clicked";
    this.EVENT_REDRAW = "redraw";

    this.selected = false;

    this.onMouseUp = function (mouseX,mouseY) {
        console.log(this.name + " clicked")
    	//this.dispatch(this.EVENT_CLICKED);
        this.selected = true;
    }
    this.setSelected = function(v){
        this.selected = v;
    }
    this.draw = function() {
        /*
    	console.log("this.file: "+this.file);
        this.context.shadowBlur=4;
        this.context.shadowColor="#BFBFBF";
        this.context.shadowOffsetX = 0;
        this.context.shadowOffsetY = 4;
        */
    	this.context.drawImage(this.image,this.x,this.y, this.width,this.height);
        if (this.selected){
            //console.log("this.colour: "+this.colour);
            this.context.strokeStyle = this.colour;//"#FF5722"
            this.context.lineWidth = 4;
            this.context.strokeRect(this.x, this.y, this.width, this.height);
        }

    }
    /*
    this.loadImage = function (file) {
    	this.image = new Image();
    	//this.image.onload = this.imageLoaded;
        this.image.addEventListener('load', imageLoaded , false);
    	this.image.src = file;
    }*/
    function loadImage( file ){
        var image = new Image();
        //this.image.onload = this.imageLoaded;
        //image.addEventListener('load', imageLoaded , false);
        image.src = file;    
        return image;
    }	
    function imageLoaded(e) {
    	//this.image.loaded = true;
        //console.log("this.EVENT_REDRAW: "+this.EVENT_REDRAW);
    }
    //this.loadImage(this.file);
    this.image = loadImage(this.file);
}
Choice.prototype = new EventDispatcher();
Choice.prototype.constructor = Choice;