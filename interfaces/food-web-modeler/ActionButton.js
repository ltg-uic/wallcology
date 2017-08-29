	function ActionButton(context, t, w, h, c, sc, bc){
	var that = this;
	var dx = 8;
	var dy = 8;
	var radius = 20;

	var centerX = dx;
	var centerY = dy;
	var objWidth = w;
	var objHeight = h;
	var colour = c;
	var mainColour = c;
	var accentColour = "#00BCD4";
	var shadowColour = sc;
	var backgroundColour = bc;
	
	//for animation
	var looping = false;
	var counter = 0;
    var counterVelocity = 2;
    var ratio = 1;
    var multiplier = 0;
    var PI2 = Math.PI * 2;

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

	//FUNCTIONS
	// the animation loop
	var animate = function() {
		//console.log("animate ratio: "+multiplier);
		ratio = 1 + multiplier;
	    // return if the animation is complete
	    if ( counter > 200) {
	        //return;
	        counter = 0;
	    }
	    if ( !looping ){
	    	return;
	    }
	    // otherwise request another animation loop
	    requestAnimationFrame(animate);

	    // counter<100 means the ring is expanding
	    // counter>=100 means the ring is shrinking
	    if (counter < 100) {
	        // expand the ring using easeInCubic easing
	        multiplier = easeInCubic(counter, 0, 0.3, 100);
	    } else {
	        // shrink the ring using easeOutCubic easing
	        multiplier = easeOutCubic(counter - 100, 0.3, -0.3, 100);
	    }
	    that.drawTriangle();
	    /*
	    that.ctx.beginPath();
		that.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
		that.ctx.shadowBlur=0;
		//this.ctx.shadowColor="#999";
		that.ctx.shadowOffsetX = 0;
		that.ctx.shadowOffsetY = 0;
		//that.ctx.globalAlpha = 0;
		that.ctx.fillStyle = backgroundColour;
		that.ctx.fill();

		that.ctx.fillStyle = colour;
		that.ctx.shadowBlur = 4;
		that.ctx.shadowColor = shadowColour;
		that.ctx.shadowOffsetX = 0;
		that.ctx.shadowOffsetY = 4;

	    if( that.type == "plus" ){
		//up
			that.ctx.beginPath();
			that.ctx.moveTo(centerX-(8*ratio),centerY+(5*ratio));
			that.ctx.lineTo(centerX,centerY-(5*ratio));
			that.ctx.lineTo(centerX+(8*ratio),centerY+(5*ratio));
			that.ctx.fill();
		} else if ( that.type == "minus"){
			//down
			that.ctx.beginPath();
			that.ctx.moveTo(centerX-(8*ratio),centerY-(5*ratio));
			that.ctx.lineTo(centerX,centerY+(5*ratio));
			that.ctx.lineTo(centerX+(8*ratio),centerY-(5*ratio));
			that.ctx.fill();
		}*/
	    /*that.ctx.strokeStyle = "gold";
	    that.ctx.beginPath();
	    that.ctx.arc(centerX, centerY, multiplier, 0, PI2);
	    that.ctx.closePath();
	    that.ctx.stroke();
		*/
		counter += counterVelocity;
	    //this.drawTriangle;
	    //counter++;
	    
	    // draw using the easing functions
	    /*
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
			this.ctx.moveTo(centerX-(8*ratio),centerY+(5*ratio));
			this.ctx.lineTo(centerX,centerY-(5*ratio));
			this.ctx.lineTo(centerX+(8*ratio),centerY+(5*ratio));
			this.ctx.fill();
		} else if ( this.type == "minus"){
			//down
			this.ctx.beginPath();
			this.ctx.moveTo(centerX-(8*ratio),centerY-(5*ratio));
			this.ctx.lineTo(centerX,centerY+(5*ratio));
			this.ctx.lineTo(centerX+(8*ratio),centerY-(5*ratio));
			this.ctx.fill();
		}
	    */
	    // increment the ringCounter for the next loop
	    //counter += counterVelocity;

	}

	function easeInCubic(now, startValue, deltaValue, duration) {
	    return deltaValue * (now /= duration) * now * now + startValue;
	}

	function easeOutCubic(now, startValue, deltaValue, duration) {
	    return deltaValue * ((now = now / duration - 1) * now * now + 1) + startValue;
	}

	//PUBLIC FUNCTIONS
	this.startAnimate = function(){
		console.log("startAnimate");
		looping = true;
		colour = accentColour;
		requestAnimationFrame(animate);
	}
	this.stopAnimate = function(){
		looping = false;
		console.log("stopAnimate");
		colour = mainColour;
	}
	this.onMouseUp = function (mouseX,mouseY) {
		this.dispatch(this.EVENT_CLICKED);
	}
	this.drawTriangle = function() {
		//ratio = multiplier + 1;
		if(this.active){
			this.ctx.beginPath();
			this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
			this.ctx.shadowBlur=0;
			//this.ctx.shadowColor="#999";
			this.ctx.shadowOffsetX = 0;
			this.ctx.shadowOffsetY = 0;
			this.ctx.globalAlpha = 1;
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
				this.ctx.moveTo(centerX-(8*ratio),centerY+(5*ratio));
				this.ctx.lineTo(centerX,centerY-(5*ratio));
				this.ctx.lineTo(centerX+(8*ratio),centerY+(5*ratio));
				this.ctx.fill();
			} else if ( this.type == "minus"){
				//down
				this.ctx.beginPath();
				this.ctx.moveTo(centerX-(8*ratio),centerY-(5*ratio));
				this.ctx.lineTo(centerX,centerY+(5*ratio));
				this.ctx.lineTo(centerX+(8*ratio),centerY-(5*ratio));
				this.ctx.fill();
			}
		}
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
			this.ctx.shadowOffsetY = 2;
			
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