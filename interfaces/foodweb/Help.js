function Help(context, cw, ch, tbw, bg){
	var toolbarWidth = tbw;
	var padding = 10;
	var maxWidth = 400;//cw - x - 400 - 10;	//400 as size of graphs	//10 = padding
	var lineHeight = 18;
	var styleMarker = '§';
	var promptsList;
	var background = bg;
	var textColour;
	var styleCodeToStyle; 

	this.ctx = context;
	this.name = "help";
	this.x = 0;
	this.y = 0;
	this.height = ch;
	this.width = cw; 
	this.message = "" ;
	this.EVENT_CLICKED = "clicked";	
	
	if ( background == "dark" ){
		textColour = "#FFFFFF";
	} else {
		textColour = "black";
	}
	// table code style --> font style
	styleCodeToStyle = {
	    r: '',
	    i: 'italic',
	    b: 'bold',
	    l: 'lighter'
	};

	promptsList = [
	   	{name:"save",
		instruction:"Click 'Save' to store a version in the database. You can access prior versions with the \u23EA and \u23E9 buttons below.",
		x: this.width - toolbarWidth - maxWidth - padding + 100,
		y: 30
		},
		{name:"add arrow",
		instruction:"Click on the 'Add' button to activate tool. Select one species in the<br>work area, then choose another to add relationship between the species.",
		x: this.width - toolbarWidth - maxWidth - padding + 14,
		y: 100
		},
		{name:"remove arrow",
		instruction:"Click on the 'Remove' button to activate tool.<br>Select the midpoint of the arrow to remove.",
		x: this.width - toolbarWidth - maxWidth - padding + 134,
		y: 174
		},
		{name:"delete",
		instruction:"To delete an annotation, drag and release<br>the annotation over the 'Delete' button.",
		x: this.width - toolbarWidth - maxWidth - padding + 168,
		y: 240
		},
		{name:"annotate",
		instruction:"To add an annotation, enter text and click 'Create Annotation', then drag and drop it anywhere in the work area. To delete it, drag and release it over the 'Delete' button.",
		x: toolbarWidth + padding + 10,
		y: this.height - 106
		},
		{name:"versions",
		instruction:"To view saved food webs, click on the \u23EA button, to see successively<br>older versions. Click on the \u23E9 button to see newer saved versions. The last food web will be your working version. Remember to save it before<br>you leave the program. §bNOTE§r: only the buttons for navigating versions will work in 'View Only' mode.",
		x: this.width - toolbarWidth - maxWidth - padding + 20,
		y: this.height - 136
		}
	];
	function drawStyledBreakedWrappedText(context, text, x, y, font, fontSize){
		var textblock = text.split("<br>");
		var lastY = y;
		for ( var i = 0; i<textblock.length; i++ ){
			var tb = textblock[i];
			lastY = wrapText(context, tb, x, lastY, maxWidth, lineHeight, font, fontSize);
			//console.log( tb + ", x: "+x+", y: "+lastY+", maxWidth: "+maxWidth+", lineHeight: "+lineHeight);
			lastY += lineHeight;
		}
		//return textblock;
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
	function wrapText(context, text, x, y, maxWidth, lineHeight, font, fontSize) {
		var words = text.split(' ');
		var line = '';

		for(var n = 0; n < words.length; n++) {
		  var testLine = line + words[n] + ' ';
		  var metrics = context.measureText(testLine);
		  var testWidth = metrics.width;
		  if (testWidth > maxWidth && n > 0) {
		    //context.fillText(line, x, y);
		    drawStyledText(context, line, x, y, font, fontSize);
		    line = words[n] + ' ';
		    y += lineHeight;
		  }
		  else {
		    line = testLine;
		  }
		}
		//context.fillText(line, x, y);
		drawStyledText(context, line, x, y, font, fontSize);
		return y;
	}
	this.updateCanvasSize = function( cw, ch ){
		this.width = cw;
		this.height = ch;

		promptsList[0].x = this.width - toolbarWidth - maxWidth - padding + 100;
		promptsList[1].x = this.width - toolbarWidth - maxWidth - padding + 14;
		promptsList[2].x = this.width - toolbarWidth - maxWidth - padding + 134;
		promptsList[3].x = this.width - toolbarWidth - maxWidth - padding + 168;
		promptsList[4].y = this.height - 106;
		promptsList[5].x = this.width - toolbarWidth - maxWidth - padding + 10;
		promptsList[5].y = this.height - 136;
	}
	this.setMaxWidth = function( cw ){
		this.maxWidth = cw - this.x - 400 - 10;
	}
	this.onMouseUp = function (mouseX,mouseY) {		
	}
	this.drawHelp = function(){
		this.ctx.save();
		this.draw();
		this.ctx.restore();
	}
	this.draw = function() {
		this.ctx.shadowBlur=0;
		this.ctx.shadowOffsetX = 0;
		this.ctx.shadowOffsetY = 0
		this.ctx.font = "300 12pt 'Roboto'";
		this.ctx.textAlign = "left";
		this.ctx.textBaseline = "top";
		this.ctx.fillStyle = textColour;
		this.ctx.globalAlpha = 0.8;
		//wrapText(this.ctx, this.message, this.x, this.y, maxWidth, lineHeight);
		for ( var i=0; i < promptsList.length; i++ ){
			var message = promptsList[i].instruction;
			var xPos = promptsList[i].x;
			var yPos = promptsList[i].y;
			//console.log("xPos: "+xPos+", yPos: "+yPos+", message: "+message);
			drawStyledBreakedWrappedText( this.ctx, message, xPos, yPos, 'Roboto', 12 );
		}
		this.ctx.globalAlpha = 1;
	}
}
Help.prototype = new EventDispatcher();
Help.prototype.constructor = Help;