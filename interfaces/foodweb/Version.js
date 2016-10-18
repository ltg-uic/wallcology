function Version(c, cw, ch, tbw, bc, n){
	var canvasHeight = ch;
	var canvasWidth = cw;
	var toolbarWidth = tbw;
	var xOffset = 8;
	var padding = 6;
	var btnH = 30;
	var btnW = 30;
	var topBtnY = canvasHeight - btnH - padding - 34;
	var bottomBtnY = canvasHeight - btnH - padding;
	var firstBtnX = canvasWidth - toolbarWidth + xOffset;
	var lastBtnX = canvasWidth - toolbarWidth + xOffset + padding + btnW;
	var backBtnX = canvasWidth - toolbarWidth + xOffset;
	var nextBtnX = canvasWidth - toolbarWidth + xOffset + padding + btnW;
	
	var btnColour = bc;
	
	this.colour;
	this.num = n + 1;
	this.saved = n;
	this.ctx = c;
	this.x = canvasWidth - toolbarWidth + xOffset;
	this.y = topBtnY;
	this.width = (btnW + padding)*4;
	this.height = btnH + 36;
	this.EVENT_CLICKED = "clicked";

	this.nextBtn = new ImageButton("next", nextBtnX, topBtnY, btnH, btnW, c, btnColour);
	this.backBtn = new ImageButton("back", backBtnX, topBtnY, btnH, btnW, c, btnColour);
	this.lastBtn = new ImageButton("last", lastBtnX, bottomBtnY, btnH, btnW, c, btnColour);
	this.firstBtn = new ImageButton("first", firstBtnX, bottomBtnY, btnH, btnW, c, btnColour);

	this.nextBtn.active = false;
	this.backBtn.active = false;
	this.firstBtn.active = false;
	this.lastBtn.active = false;

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

		firstBtnX = canvasWidth - toolbarWidth + xOffset;
		lastBtnX = canvasWidth - toolbarWidth + xOffset + padding + btnW;
		backBtnX = canvasWidth - toolbarWidth + xOffset;
		nextBtnX = canvasWidth - toolbarWidth + xOffset + padding + btnW;

		topBtnY = canvasHeight - btnH - padding - 34;
		bottomBtnY = canvasHeight - btnH - padding;
		
		this.x = canvasWidth - toolbarWidth + xOffset;
		this.y = topBtnY;
		this.width = btnW + btnW + padding;
		this.height = btnH + 34;

		this.nextBtn.updateXY( nextBtnX, topBtnY );
		this.backBtn.updateXY( backBtnX, topBtnY ); 
		this.lastBtn.updateXY( lastBtnX, bottomBtnY );
		this.firstBtn.updateXY( firstBtnX, bottomBtnY ); 
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
			this.firstBtn.active = false;
			this.lastBtn.active = false;
		//between this.num is between 1 and (this.saved + 1),view only
		} else if( this.num > 1 && this.num < (this.saved + 1) ){
			this.backBtn.active = true;
			this.nextBtn.active = true;
			this.firstBtn.active = true;
			this.lastBtn.active = true;
		//this.num is the last saved version
		} else if( this.num == 1 && this.saved >= 1 ){
			this.backBtn.active = false;
			this.nextBtn.active = true;
			this.firstBtn.active = false;
			this.lastBtn.active = true;
		//if there are saved versions and this.num is > saved
		} else if ( this.saved >= 1 && this.num >= (this.saved + 1) ){
			this.backBtn.active = true;
			this.nextBtn.active = false;
			this.firstBtn.active = true;
			this.lastBtn.active = false;
		}
	}
	this.drawButtons = function(){
		this.ctx.save();
		this.nextBtn.draw();
		this.backBtn.draw();
		this.firstBtn.draw();
		this.lastBtn.draw();
		this.ctx.restore();
	}
	this.draw = function(){
		this.nextBtn.draw();
		this.backBtn.draw();
		this.firstBtn.draw();
		this.lastBtn.draw();
	}
}
Version.prototype = new EventDispatcher();
Version.prototype.constructor = Version;