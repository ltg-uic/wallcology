function Level(n,c){
	var radius = 40;
	var centerX = 75;
	var centerY = 75;
	var colours = ["#FF5722", "#29ABE2", "#FF9800", "#00BCD4"]; // //22B573 - green

	this.colour;
	this.num = n;
	this.ctx = c;
	this.x = centerX - radius;
	this.y = centerY - radius;
	this.width = radius * 2;
	this.height = radius * 2;
	this.EVENT_CLICKED = "clicked";

	this.getColour = function(){
		var colour = colours[ this.num-1 ];
		return colour;
	}
	this.onMouseUp = function (mouseX,mouseY) {
	   	this.dispatch(this.EVENT_CLICKED);
	}
	this.changeLevel = function(){
		this.dispatch(this.EVENT_CLICKED);	
	}
	this.draw = function(){
		//this.colour = colour;
		this.ctx.beginPath();
		this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
		this.ctx.shadowBlur=4;
		this.ctx.shadowColor="#BFBFBF";
		this.ctx.shadowOffsetX = 0;
		this.ctx.shadowOffsetY = 4;
		this.ctx.globalAlpha = 1;
		this.ctx.fillStyle = this.getColour();
		this.ctx.fill();

		this.ctx.font = "bold 36px Helvetica"
		this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
		this.ctx.shadowBlur=0;
		this.ctx.shadowOffsetX = 0;
		this.ctx.shadowOffsetY = 0;
		this.ctx.globalAlpha = 1;
		this.ctx.fillStyle = "#FFFFFF";//"#009245";
		this.ctx.shadowBlur=0;
		this.ctx.shadowColor="#BFBFBF";
		this.ctx.shadowOffsetX = 0;
		this.ctx.shadowOffsetY = 0;
		this.ctx.fillText (this.num, centerX, centerY);
	}
}
Level.prototype = new EventDispatcher();
Level.prototype.constructor = Level;