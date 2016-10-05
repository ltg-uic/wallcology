function Version(c, cw, ch, tbw, bc, n){
	var canvasHeight = ch;
	var canvasWidth = cw;
	var toolbarWidth = tbw;
	var xOffset = 8;
	var padding = 8;
	var backBtnH = 30;
	var backBtnW = 30;
	var backBtnX = canvasWidth - toolbarWidth + xOffset;
	var backBtnY = canvasHeight - backBtnH - padding;
	var nextBtnH = 30;
	var nextBtnW = 30;
	var nextBtnX = canvasWidth - toolbarWidth + xOffset + padding + backBtnW;
	var nextBtnY = canvasHeight - nextBtnH - padding;
	var btnColour = bc;
	
	this.colour;
	this.num = n + 1;
	this.saved = n;
	//this.currentDrawing = true;
	//this.data = d;
	this.ctx = c;
	this.x = canvasWidth - toolbarWidth + xOffset;
	this.y = nextBtnY;
	this.width = nextBtnW + backBtnW + padding;
	this.height = nextBtnH;
	this.EVENT_CLICKED = "clicked";

	this.nextBtn = new ImageButton("next", nextBtnX, nextBtnY, nextBtnH, nextBtnW, c, btnColour);
	this.backBtn = new ImageButton("back", backBtnX, backBtnY, backBtnH, backBtnW, c, btnColour);
	this.nextBtn.active = false;
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
	this.updateCanvasSize = function(cw,ch){
		canvasHeight = ch;
		canvasWidth = cw;
		backBtnX = canvasWidth - toolbarWidth + xOffset;
		backBtnY = canvasHeight-backBtnH-padding;
		nextBtnX = canvasWidth - toolbarWidth + xOffset + padding + backBtnW;
		nextBtnY = canvasHeight - nextBtnH - padding;
		
		this.x = canvasWidth - toolbarWidth + xOffset;
		this.y = nextBtnY;
		this.width = nextBtnW + backBtnW + padding;
		this.height = nextBtnH;

		this.nextBtn.updateXY( nextBtnX, nextBtnY );
		this.backBtn.updateXY( backBtnX, backBtnY ); 
	}
	this.saveVersion = function( v ){
		this.num += 1;
        this.saved = v;
        this.changeVersion();
        this.drawButtons();
	}
	this.changeVersion = function(mouseX,mouseY,direction){
		//if there are no saved versions, disable buttons
		if( this.saved == 0 ){
			this.backBtn.active = false;
			this.nextBtn.active = false;
		//between this.num is between 1 and (this.saved + 1),view only
		} else if( this.num > 1 && this.num < (this.saved + 1) ){
			this.backBtn.active = true;
			this.nextBtn.active = true;
		//this.num is the last saved version
		} else if( this.num == 1 && this.saved >= 1 ){
			this.backBtn.active = false;
			this.nextBtn.active = true;
		//if there are saved versions and this.num is > saved
		} else if ( this.saved >= 1 && this.num >= (this.saved + 1) ){
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
Version.prototype = new EventDispatcher();
Version.prototype.constructor = Version;