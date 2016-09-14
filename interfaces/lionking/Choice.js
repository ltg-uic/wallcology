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
    	this.context.drawImage(this.image,this.x,this.y, this.width,this.height);
        if (this.selected){
            this.context.strokeStyle = this.colour;//"#FF5722"
            this.context.lineWidth = 4;
            this.context.strokeRect(this.x, this.y, this.width, this.height);
        }

    }
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
    this.image = loadImage(this.file);
}
Choice.prototype = new EventDispatcher();
Choice.prototype.constructor = Choice;