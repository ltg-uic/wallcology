function Level(n,c,cH){
	var canvasHeight = cH;
	var xOffset = 22;
	var padding = 10;
	var backBtnH = 48;
	var backBtnW = 48;
	var backBtnX = xOffset;
	var backBtnY = canvasHeight-backBtnH-padding;
	var nextBtnH = 48;
	var nextBtnW = 48;
	var nextBtnX = xOffset + padding + backBtnW;
	var nextBtnY = canvasHeight-nextBtnH-padding;
	var btnColour = "#2B323F";
	
	this.colour;
	this.num = n;
	this.ctx = c;
	this.x = xOffset; //centerX - radius;
	this.y = nextBtnY; //centerY - radius;
	this.width = nextBtnW + backBtnW + padding;
	this.height = nextBtnH;
	this.EVENT_CLICKED = "clicked";
	this.STATE = "A";

	this.nextBtn = new ImageButton("next", nextBtnX, nextBtnY, nextBtnH, nextBtnW, c, btnColour);
	this.backBtn = new ImageButton("back", backBtnX, backBtnY, backBtnH, backBtnW, c, btnColour);
	this.backBtn.active = false;

	function hitTest(mouseX, mouseY, to){
		if ( (mouseY >= to.y) && (mouseY <= to.y+to.height)
		            && (mouseX >= to.x) && (mouseX <=
		         to.x+to.width) ) {
		         return true;
		} else {
		    	return false;
		}
	}
	this.onMouseUp = function (mouseX,mouseY) {
		/*
		if ( hitTest(mouseX, mouseY, this.nextBtn) ){
			console.log("nextBtn");
			this.dispatch(this.EVENT_CLICKED);	
		} else if ( hitTest(mouseX, mouseY, this.backBtn) ){
			console.log("backBtn");
		}
	   	//this.dispatch(this.EVENT_CLICKED);
	   	*/
	}
	this.updateCanvasHeight = function(cH){
		canvasHeight = cH;
		backBtnY = canvasHeight-backBtnH-padding;
		nextBtnY = canvasHeight-nextBtnH-padding;
		
		this.x = xOffset;
		this.y = nextBtnY;
		this.width = nextBtnW + backBtnW + padding;
		this.height = nextBtnH;

		this.nextBtn.updateXY( nextBtnX, nextBtnY );
		this.backBtn.updateXY( backBtnX, backBtnY ); 
	}
	this.changeLevel = function(mouseX,mouseY,direction){
		if( this.num <= 1 ){
			this.backBtn.active = false;
			this.nextBtn.active = true;
		} else if( this.num > 1 && this.num < 4 ){
			this.backBtn.active = true;
			this.nextBtn.active = true;
		} else if ( this.num >= 4){
			this.backBtn.active = true;
			this.nextBtn.active = false;
		}	
	}
	this.drawButtons = function(){
		this.ctx.save();
		this.nextBtn.draw();
		this.backBtn.draw();
		this.ctx.restore();
	}
	this.draw = function(){
		this.nextBtn.draw();
		this.backBtn.draw();
	}
}
Level.prototype = new EventDispatcher();
Level.prototype.constructor = Level;