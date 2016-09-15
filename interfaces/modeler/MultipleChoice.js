function MultipleChoice(n, x, y, w, c, sp, num, type, colour, heading, text){
	var upFile = "graphincrease.png";
	var downFile = "graphdecrease.png";
	var sameFile = "graphsame.png";
	var backgroundColor = "#FFFFFF"; //EFEBE9
	var accentColour = "#00BCD4";
	var accentColourDark = "#0097A7";
	
	var headingText = heading;
	//var promptText = text;
	var lineHeight = 18;
	var styleMarker = '§';
	// table code style --> font style
	var styleCodeToStyle = {
	    r: '',
	    i: 'italic',
	    b: 'bold',
	    l: 'lighter'
	};
	var headingYoffset = 20;
	var headingXoffset = 20;
	var iconHeight = 30;
	var iconWidth = 30;
	var graphHeight = 51;	//156;
	var graphWidth = 240;	//726;
	var btnHeight = 36;
	var btnWidth = 65;
	var contBtnWidth = 100;
	var padding = 10;
	var paddingY = 10;
	var yOffset = 26;
	var topBarH = 75;
	var marginTop = topBarH + 8;
	var marginBottom = 20;
	var marginLeft = 400; 	//414;	//graphs margin //not used
	var choices = [];
	var textblock = text.split("<br>");
	//var text1 = textblock[0];
	//var text2 = textblock[1];
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
	this.width = w; //cW from FoodWeb.js 
	this.x = 0; 	//x;
	this.y = y - this.height;	//y = canvasHeight, not reliable

	var graphSetWidth = padding + iconWidth + 3*(padding + graphWidth) + padding;//marginLeft + iconWidth + padding * 5 + graphWidth * 3 + btnWidth;
	var graphSetHeight = n.length * (graphHeight+paddingY) + yOffset + marginTop;

	var btnX = this.width - btnWidth - padding; //this.x + marginLeft + padding + iconWidth + 3*(padding + graphWidth);
	var btnY = y - btnHeight - paddingY - marginBottom; //this.height + graphSetHeight + yOffset + marginTop; //graphHeight/2-iconHeight/2; //this.y+yOffset+marginTop
	var contBtnX = this.width - contBtnWidth - padding;
	var maxWidth = this.width - graphSetWidth - headingXoffset; //360;
	
	this.button = new GenericButton("Run", btnX, btnY, btnHeight, btnWidth, c, this.colour, "#FFFFFF", "12pt 'Roboto'", 8);
	this.continueBtn = new GenericButton("Continue",contBtnX,btnY,btnHeight,contBtnWidth,c,accentColour, "#FFFFFF", "12pt 'Roboto'", 8);
	
	this.EVENT_CLICKED = "clicked";
	this.EVENT_REDRAW = "redraw";
	this.EVENT_CONTINUE = "continue";

	for( var i=0; i<n.length; i++){
		var row = {
			name: n[i],
			y: this.y+yOffset+marginTop+(graphHeight+paddingY)*i,
			icon: loadImage( n[i] + ".png" ),
			//graphSetWidth
			/*
			up: new Choice( "graphincrease", this.x + marginLeft + padding + iconWidth, this.y+yOffset+marginTop+(graphHeight+paddingY)*i, graphWidth, graphHeight, this.context, this.colour),
			down: new Choice( "graphdecrease", this.x + marginLeft + padding + iconWidth + padding + graphWidth,this.y+yOffset+marginTop+(graphHeight+paddingY)*i, graphWidth, graphHeight, this.context, this.colour),
			same: new Choice( "graphsame", this.x + marginLeft + padding + iconWidth + 2*(padding + graphWidth),this.y+yOffset+marginTop+(graphHeight+paddingY)*i, graphWidth, graphHeight, this.context, this.colour),
			*/
			selection: "none",
			up: new Choice( "graphincrease", this.width - graphSetWidth + padding + iconWidth + padding, this.y+yOffset+marginTop+(graphHeight+paddingY)*i, graphWidth, graphHeight, this.context, this.colour),
			down: new Choice( "graphdecrease", this.width - graphSetWidth + padding + iconWidth + padding + padding + graphWidth,this.y+yOffset+marginTop+(graphHeight+paddingY)*i, graphWidth, graphHeight, this.context, this.colour),
			same: new Choice( "graphsame", this.width - graphSetWidth + padding + iconWidth + padding + 2*(padding + graphWidth),this.y+yOffset+marginTop+(graphHeight+paddingY)*i, graphWidth, graphHeight, this.context, this.colour),
			}
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
	/*
	function onGraphsLoaded(e){
		console.log("onGraphsLoaded");
		this.dispatch(this.EVENT_REDRAW);
	}
	this.clearEventListeners = function(){
		for (var i=0; i<this.rows.length; i++){
			var row = this.rows[i];
			row.up.removeEventListener(row.up.EVENT_REDRAW, onGraphsLoaded);
			row.down.removeEventListener(row.up.EVENT_REDRAW, onGraphsLoaded);
			row.same.removeEventListener(row.up.EVENT_REDRAW, onGraphsLoaded);
		}
	}
	*/
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
			//console.log("this.STATE: "+this.STATE);
			//console.log("checkSelectionComplete: "+checkSelectionComplete( this.rows ));
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
	    var textY = wrapText(this.context, textblock[0], this.x + headingXoffset, this.y + marginTop + paddingY, maxWidth, lineHeight);
	    //console.log("textY: "+textY);
	    var textY2 = wrapText(this.context, textblock[1], this.x + headingXoffset, textY+lineHeight*2, maxWidth, lineHeight);
	    //graph
	    this.context.font = "500 12pt 'Roboto'";
	    this.context.fillStyle = accentColourDark;
	    this.context.fillText("Goes up", this.width - graphSetWidth + padding + iconWidth + padding, this.y+marginTop);
	    this.context.fillText("Goes down", this.width - graphSetWidth + padding + iconWidth + padding + graphWidth + padding, this.y+marginTop);
	    this.context.fillText("Stays the same", this.width - graphSetWidth + padding + iconWidth + 2*(padding + graphWidth) + padding, this.y+marginTop);

	    this.context.font = "8pt 'Roboto'";
	    this.context.textAlign = "right";
	    this.context.fillStyle = this.colour; //"#666666";
	    this.context.fillText(this.message, btnX-padding, btnY);

	    for( var i=0; i<this.rows.length;i++){
	    	var r = this.rows[i];
	    	//console.log("row "+i+": "+r.name+" , "+r.y+" , "+r.up+" , "+r.down+" , "+r.same);
	    	this.context.drawImage(r.icon, this.width - graphSetWidth + padding,r.y+graphHeight/2-iconHeight/2,iconWidth,iconHeight);	
	    	r.up.draw();
	    	r.down.draw();
	    	r.same.draw();
	    }
	    if (this.STATE == "question"){
	    	this.button.draw();
	    } else if (this.STATE == "answer"){
	    	this.continueBtn.draw();
	    }
	}
}
MultipleChoice.prototype = new EventDispatcher();
MultipleChoice.prototype.constructor = MultipleChoice;