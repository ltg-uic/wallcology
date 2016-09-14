function MultipleChoice(n, cH, cW, c, sp, num, type, colour, heading, text){
	var upFile = "graphincrease.png";
	var downFile = "graphdecrease.png";
	var sameFile = "graphsame.png";
	var backgroundColor = "#FFFFFF";
	var accentColour = "#00BCD4";
	var accentColourDark = "#0097A7";
	var headingText = heading;
	var lineHeight = 18;
	var styleMarker = '§';
	// table code style --> font style
	var styleCodeToStyle = {
	    r: '',
	    i: 'italic',
	    b: 'bold',
	    l: 'lighter'
	};
	var canvasHeight = cH;
	var canvasWidth = cW;
	var headingYoffset = 20;
	var headingXoffset = 20;
	var iconHeight = 30;
	var iconWidth = 30;	//default
	var graphHeight = 51;	//original: 156;
	var graphWidth = 240;	//original: 726;
	var btnHeight = 36;
	var btnWidth = 65;
	var contBtnWidth = 100;
	var padding = 10;
	var paddingY = 10;
	var yOffset = 26;
	var topBarH = 75;
	var marginTop = topBarH + 8;
	var marginBottom = 20;
	//var marginLeft = 400; 	//414;	//graphs margin //not used
	var choices = [];
	var textblock = text.split("<br>");
	var prompt = {x:0, y:0};

	this.STATE = "question"; 	//or "answer"
	this.colour = colour;
	this.species = sp;
	this.num = num;
	this.type = type;
	this.message = "";
	
	this.rows = [];
	this.context = c;
	this.name = "multiple choice";
	this.height = n.length * (graphHeight+paddingY) + yOffset + marginTop+ marginBottom + btnHeight + paddingY;
	this.width = canvasWidth; //cW from FoodWeb.js 
	//console.log("w: "+w+", this.width: "+this.width);
	this.x = 0; 	//x;
	this.y = canvasHeight - this.height;	//y = canvasHeight, not reliable
	this.canvasWidth = canvasWidth; 
	this.canvasHeight = canvasHeight;
	
	var maxWidth;
	var graphSetWidth;
	var graphSetHeight;
	var upX;
	var downX;
	var sameX;
	var btnX; 
	var btnY; 
	var contBtnX;
	var prompt;
	/*
	var graphSetWidth = padding + iconWidth + 3*(padding + graphWidth) + padding;
	var graphSetHeight = n.length * (graphHeight+paddingY) + yOffset + marginTop;
	
	var upX = this.width - graphSetWidth + padding + iconWidth + padding;
	var downX = this.width - graphSetWidth + padding + iconWidth + padding + padding + graphWidth;
	var sameX = this.width - graphSetWidth + padding + iconWidth + padding + 2*(padding + graphWidth);

	var btnX = this.width - btnWidth - padding; 
	var btnY = y - btnHeight - paddingY - marginBottom; 
	var contBtnX = this.width - contBtnWidth - padding;
	var maxWidth = this.width - graphSetWidth - headingXoffset; //360
	
	var prompt ={x:0, y:0};
	if ( maxWidth > 10 ){
		prompt.x = this.x + headingXoffset;
		prompt.y = this.y + marginTop + paddingY;
	} else {
		padding = 4;
		prompt.x = padding;
		prompt.y = btnY;
		maxWidth = this.width - btnWidth - 10;
		graphSetWidth = padding + iconWidth + 3*(padding + graphWidth) + padding;
		lineHeight = 10;
	}
	*/
	//this.setCanvasWidthHeight( this.width, y );

	setupVars("init", this.x, this.y);

	this.button = new GenericButton("Run", btnX, btnY, btnHeight, btnWidth, c, this.colour, "#FFFFFF", "12pt 'Roboto'", 8);
	this.continueBtn = new GenericButton("Continue",contBtnX,btnY,btnHeight,contBtnWidth,c,accentColour, "#FFFFFF", "12pt 'Roboto'", 8);
	
	this.EVENT_CLICKED = "clicked";
	this.EVENT_REDRAW = "redraw";
	this.EVENT_CONTINUE = "continue";

	for( var i=0; i<n.length; i++){
		var rowY = this.y + yOffset + marginTop + (graphHeight+paddingY)*i;
		var row = {
			name: n[i].name,
			iconWidth: n[i].width,
			iconHeight: n[i].height,
			iconX: this.width - graphSetWidth + padding + 15 - n[i].width/2,
			y: rowY,
			icon: loadImage( n[i].name + ".png" ),
			selection: "none",
			up: 	new Choice( "graphincrease", upX, rowY, graphWidth, graphHeight, this.context, this.colour),
			down: 	new Choice( "graphdecrease", downX,rowY, graphWidth, graphHeight, this.context, this.colour),
			same: 	new Choice( "graphsame", sameX, rowY, graphWidth, graphHeight, this.context, this.colour),
			}
		//console.log("upX: " + upX + ", downX: " + downX + ", sameX: " +sameX+ ", rowY: " + rowY + ", iconX: " + row.iconX +", iconWidth: "+row.iconWidth);
		this.rows.push(row);
	}
	this.dispatch(this.EVENT_REDRAW);
	function hitTest(mouseX, mouseY, to){
		if ( (mouseY >= to.y) && (mouseY <= to.y+to.height)
		            && (mouseX >= to.x) && (mouseX <=
		         to.x+to.width) ) {
		         return true;
		} else {
		    	return false;
		}
	}
	function drawStyledText(context, text, x, y, font, fontSize) {
	    // start with regular style
	    var fontCodeStyle = 'r';
	    do {
	        // set context font
	        context.font = buildFont(font, fontSize, fontCodeStyle);
	        // find longest run of text for current style
	        var ind = text.indexOf(styleMarker);
	        // take all text if no more marker
	        if (ind == -1) ind = text.length;
	        // fillText current run
	        var run = text.substring(0, ind);
	        context.fillText(run, x, y);
	        // return if ended
	        if (ind == text.length) return;
	        // move forward
	        x += context.measureText(run).width;
	        // update current style
	        fontCodeStyle = text[ind + 1];
	        // keep only remaining part of text
	        text = text.substring(ind + 2);
	    } while (text.length > 0)
	}
	function buildFont(font, fontSize, fontCodeStyle) {
	    var style = styleCodeToStyle[fontCodeStyle];
	    return style + ' ' + fontSize + 'px' + ' ' + font;
	}
	function wrapText(context, text, x, y, maxWidth, lineHeight) {
		var words = text.split(' ');
		var line = '';
		for( var n=0;n<words.length;n++){
			var testLine = line + words[n] + ' ';
			var metrics = context.measureText(testLine);
			var testWidth = metrics.width;
			if (testWidth > maxWidth && n > 0) {
				//context.fillText(line, x, y);
				drawStyledText(context, line, x, y,'Roboto', 14);
				line = words[n] + ' ';
				y += lineHeight;
			} else {
				line = testLine;
			}
		}
		drawStyledText(context, line, x, y,'Roboto', 14);
		//context.fillText(line, x, y);
		return y;
	}
	function loadImage( file ){
		var icon = new Image();
		//icon.addEventListener('load', imageLoaded , false);
		icon.src = file;
		return icon;
	}
	function imageLoaded(event) {
		icon.loaded = true;
	}
	function checkSelectionComplete( arr ){
		//console.log("this.rows.length: "+arr.length);
		var complete = true;
		for (i=0; i< arr.length; i++) {
			var r = arr[i];
			if( r.selection == "none" ){
			//if( r.selection == "none" ){
				//console.log("no selection made for " + r.name + "'s population.");
				complete = false;
			}
		}
		return complete;
	}
	//setupVars("orientation", this.x, this.y, this.rows );
	function setupVars(state, x, y, rows, runBtn, contBtn){
		//console.log("x: "+x+", y: "+y+", rows:"+rows);
		graphSetWidth = padding + iconWidth + 3*(padding + graphWidth) + padding;
		maxWidth = canvasWidth - graphSetWidth - headingXoffset;
		
		if ( maxWidth > 10 ){
			prompt.x = x + headingXoffset;
			prompt.y = y + marginTop + paddingY;
		} else {
			padding = 4;
			prompt.x = padding;
			prompt.y = btnY;
			maxWidth = this.width - btnWidth - 10;
			graphSetWidth = padding + iconWidth + 3*(padding + graphWidth) + padding;
			lineHeight = 10;
		}

		btnX = canvasWidth - btnWidth - padding;
		btnY = canvasHeight - btnHeight - paddingY - marginBottom;
		contBtnX = canvasWidth - contBtnWidth - padding;

		upX = canvasWidth - graphSetWidth + padding + iconWidth + padding;
		downX = canvasWidth - graphSetWidth + padding + iconWidth + padding + padding + graphWidth;
		sameX = canvasWidth - graphSetWidth + padding + iconWidth + padding + 2*(padding + graphWidth);
		
		if ( state != "init" ){
			for( var i=0; i< rows.length;i++){
		    	var r = rows[i];
		    	var rowY = parseInt(y + yOffset+marginTop+(graphHeight+paddingY)*i);
		    	r.iconX = canvasWidth - graphSetWidth + padding + 15 - r.iconWidth/2;
		    	r.y = y+yOffset+marginTop+(graphHeight+paddingY)*i,
		    	r.up.x = upX;
		    	r.down.x = downX;
		    	r.same.x = sameX;
		    	r.up.y = r.down.y = r.same.y = rowY;
		    }
		    runBtn.x = btnX;
		    runBtn.y = btnY;
		    contBtn.x = contBtnX;
		    contBtn.y = btnY;
		}
		//console.log("btnX: "+btnX+", btnY: "+btnY+", contBtnX: "+contBtnX);
	}
	this.setCanvasWidthHeight = function(cw, ch){
		//console.log("this.rows: "+this.rows);
		canvasWidth = cw; 
		canvasHeight = ch;
		this.width = cw;
		this.x = 0;
		this.y = ch - this.height;
		setupVars("orientation", this.x, this.y, this.rows, this.button, this.continueBtn );
	}
	this.onMouseUp = function (mouseX,mouseY) {
		for (i=0; i< this.rows.length; i++) {
		    var r = this.rows[i];
		    if (hitTest(mouseX, mouseY, r.up)){
		    	//console.log("up");
		    	r.up.setSelected(true);
		    	r.down.setSelected(false);
		    	r.same.setSelected(false);
		    	r.selection = "up";
		    	this.message = "";
		    	//redraw canvas
				this.dispatch(this.EVENT_REDRAW);
		    } else if (hitTest(mouseX, mouseY, r.down)){
		    	//console.log("down");
		    	r.up.setSelected(false);
		    	r.down.setSelected(true);
		    	r.same.setSelected(false);
		    	r.selection = "down";
		    	this.message = "";
		    	this.dispatch(this.EVENT_REDRAW);
		    } else if (hitTest(mouseX, mouseY, r.same)){
		    	//console.log("same");
		    	r.up.setSelected(false);
		    	r.down.setSelected(false);
		    	r.same.setSelected(true);
		    	r.selection = "same";
		    	this.message = "";
		    	this.dispatch(this.EVENT_REDRAW);
		    }
		}
		if( hitTest(mouseX, mouseY, this.button) || hitTest(mouseX, mouseY, this.continueBtn) ){
			var oldState = this.STATE;
			if ( oldState == "question" ){
				if ( checkSelectionComplete( this.rows )){
					//this.dispatch(this.EVENT_CLICKED);
					var text = headingText.split(":");
					var actionText = text[1].toLowerCase();
					textblock[0] = "§bWatch the population graphs above§r to see what happens when the population of"+actionText+".";
					textblock[1] = "Were you surprised by the results?"
					this.STATE = "answer";
					this.dispatch(this.EVENT_CLICKED);
				} else {
					this.message = "Complete your prediction, then click 'Run'";
					this.dispatch(this.EVENT_REDRAW);
				}
			} else if ( oldState == "answer" ){
				this.dispatch(this.EVENT_CONTINUE);
			}
		}
	}
	this.getSelectionArray = function(){
		var arr = [];
		for (i=0; i< this.rows.length; i++) {
			var r = this.rows[i];
			arr.push({name:r.name, selection:r.selection, species:this.species, num:this.num, type:this.type});
		}
		return arr;
	}
	this.draw = function(){
		//draw a box masking the work area
		//this.context.clearRect(0,0,this.width,this.y);
		this.context.fillStyle = "black";
		this.context.globalAlpha = 0.2;
		this.context.fillRect(0,0,this.width,this.y);
		if (this.STATE == "answer"){
			this.context.clearRect(this.width-400,0,400,(this.rows.length+1)*80);
		}
		this.context.globalAlpha = 1;
		//draw header
		this.context.fillStyle = accentColour;
		this.context.fillRect(this.x,this.y,this.width,topBarH);
		//draw background
		this.context.fillStyle = backgroundColor;
		this.context.fillRect(this.x,this.y+topBarH,this.width,this.height-topBarH);
		//header text
	    this.context.shadowBlur=0;
	    this.context.shadowOffsetX = 0;
	    this.context.shadowOffsetY = 0;
	    this.context.font = "300 24pt 'Roboto'";
		this.context.textAlign = "left";
	    this.context.textBaseline = "top";
	    this.context.fillStyle = "#FFFFFF";
	    this.context.fillText(headingText, this.x + headingXoffset, this.y + headingYoffset);
	    //prompt text
	   	this.context.font = "10pt 'Roboto'";
	    this.context.fillStyle = "black";
	    //var textY = wrapText(this.context, textblock[0], this.x + headingXoffset, this.y + marginTop + paddingY, maxWidth, lineHeight);
	    //var textY2 = wrapText(this.context, textblock[1], this.x + headingXoffset, textY+lineHeight*2, maxWidth, lineHeight);
	    var textY = wrapText(this.context, textblock[0], prompt.x, prompt.y, maxWidth, lineHeight);
	    var textY2 = wrapText(this.context, textblock[1], prompt.x, textY+lineHeight*2, maxWidth, lineHeight);
	    //graph
	    this.context.font = "500 12pt 'Roboto'";
	    this.context.fillStyle = accentColourDark;
	    this.context.fillText("Goes up", upX, this.y+marginTop);
	    this.context.fillText("Goes down", downX, this.y+marginTop);
	    this.context.fillText("Stays the same", sameX, this.y+marginTop);
	    //this.width - graphSetWidth + padding + iconWidth + padding + graphWidth + padding
	    //this.width - graphSetWidth + padding + iconWidth + 2*(padding + graphWidth) + padding
	    this.context.font = "8pt 'Roboto'";
	    this.context.textAlign = "right";
	    this.context.fillStyle = this.colour; //"#666666";
	    this.context.fillText(this.message, btnX-padding, btnY);

	    for( var i=0; i<this.rows.length;i++){
	    	var r = this.rows[i];
	    	//console.log("row "+i+": "+r.name+" , "+r.y+" , "+r.up+" , "+r.down+" , "+r.same);
	    	//console.log("iconWidth: "+iconWidth+", iconHeight: "+iconHeight );
	    	this.context.drawImage(r.icon, r.iconX,r.y+graphHeight/2-r.iconHeight/2,r.iconWidth,r.iconHeight);	
	    	r.up.draw();
	    	r.down.draw();
	    	r.same.draw();
	    }
	    //console.log("btnX: "+btnX+", btnY: "+btnY+", contBtnX: "+contBtnX);
	    //console.log("this.button.x: "+this.button.x+", this.button.y: "+this.button.y+", this.continueBtn.x: ")
	    if (this.STATE == "question"){
	    	this.button.draw();
	    } else if (this.STATE == "answer"){
	    	this.continueBtn.draw();
	    }
	}
}
MultipleChoice.prototype = new EventDispatcher();
MultipleChoice.prototype.constructor = MultipleChoice;