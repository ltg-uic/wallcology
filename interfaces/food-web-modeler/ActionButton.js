	function ActionButton(context, t, w, h, c, sc, bc){
	var dx = 8;
	var dy = 8;
	var radius = 20;

	var centerX = dx;
	var centerY = dy;
	var objWidth = w;
	var objHeight = h;
	var colour = c;
	var shadowColour = sc;
	var backgroundColour = bc;
	
	this.symbol;
	this.ctx = context;
	this.index = 0;
	this.x = centerX - radius;
	this.y = centerY - radius;
	this.width = radius * 2;
	this.height = radius * 2;
	this.EVENT_CLICKED = "clicked";
	this.active = false;

	this.type = t;
	if( this.type == "plus" ){
		//console.log("plus");
		dx = -1*objWidth/2;
		dy = 20;
		this.symbol = "+";
	} else if( this.type == "minus" ){
		//console.log("minus");
		dx = -1*objWidth/2;
		dy = -20 - objHeight;
		this.symbol = "-";
	}

	this.onMouseUp = function (mouseX,mouseY) {
		this.dispatch(this.EVENT_CLICKED);
	}
	this.draw = function() {
		if(this.active){
			this.ctx.beginPath();
			this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
			this.ctx.shadowBlur=0;
			//this.ctx.shadowColor="#999";
			this.ctx.shadowOffsetX = 0;
			this.ctx.shadowOffsetY = 0;
			this.ctx.globalAlpha = 0;
			this.ctx.fillStyle = backgroundColour;
			this.ctx.fill();

			this.ctx.font = "bold 24px sans"
			this.ctx.textAlign = "center";
	        this.ctx.textBaseline = "middle";
			this.ctx.globalAlpha = 1;
			this.ctx.fillStyle = colour;
			this.ctx.shadowBlur=4;
			this.ctx.shadowColor=shadowColour;
			this.ctx.shadowOffsetX = 0;
			this.ctx.shadowOffsetY = 4;
			
			if( this.type == "plus" ){
			//up
				this.ctx.beginPath();
				this.ctx.moveTo(centerX-8,centerY+5)
				this.ctx.lineTo(centerX,centerY-5);
				this.ctx.lineTo(centerX+8,centerY+5);;
				this.ctx.fill();
			} else if ( this.type == "minus"){
				//down
				this.ctx.beginPath();
				this.ctx.moveTo(centerX-8,centerY-5);
				this.ctx.lineTo(centerX,centerY+5);
				this.ctx.lineTo(centerX+8,centerY-5);
				this.ctx.fill();
			}
		}
	}
	this.updateXY = function(x,y){
		centerX = x - dx;
		centerY = y - dy;
		//update properties
		this.x = centerX - radius;
		this.y = centerY - radius;
		this.width = radius * 2;
		this.height = radius * 2;

		this.draw();
	}
}
ActionButton.prototype = new EventDispatcher();
ActionButton.prototype.constructor = ActionButton;