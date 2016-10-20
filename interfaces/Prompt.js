function Prompt(context, x, y, cw, ch, l, bg){
	var canvasW = cw;
	var canvasH = ch;
	var maxWidth = cw - x - 400 - 10;	//400 as size of graphs	//10 = padding
	var lineHeight = 25;
	var styleMarker = '§';
	
	// table code style --> font style
	var styleCodeToStyle = {
	    r: '',
	    i: 'italic',
	    b: 'bold',
	    l: 'lighter'
	};

	var promptsList = [
	   	{level:1,
		instruction:"",
		//instruction:" ",
		connection:""
		},
		{level:2,
		instruction:"In level 1, you created a food chain. Here you'll be creating an 'Interaction Web'. Drag the species into the work area.",
		connection:"What do you think the arrows represent? In an 'Interaction Web' an arrow with a + sign, means that when the population of one species increases, the other also increases. A \u2013 sign means the opposite. When the population of one species increases, the population of the other species decreases."
		},
		{level:3,
		instruction:"There's a new species. How do they relate to one another? Drag the species into the work area.",
		connection:"Remember: An arrow with a + sign, means that when the population of one species increases, the other also increases. A \u2013 sign means the opposite. When the population of one species increases, the population of the other species decreases."
		},
		{level:4,
		instruction:"There's more species now. How do they relate to one another? Drag the species into the work area.",
		connection:"Remember: An arrow with a + sign, means that when the population of one species increases, the other also increases. A \u2013 sign means the opposite. When the population of one species increases, the population of the other species decreases."
		}
	];

	this.level = l;
	this.ctx = context;
	this.name = "prompt";
	this.x = x;
	this.y = y;
	this.height = 100;	//need x, y, height and width properties to be same as graphs and mouse to detect mouse up
	this.width = this.ctx.canvas.width; 
	this.message = "" ;
	this.EVENT_CLICKED = "clicked";	
	
	var itemList = [];
	var mcMarginX = this.x + 100;
	var mcMarginY = this.y + 10;

	var background = bg;
	var textColour;
	if ( background == "dark" ){
		textColour = "#FFFFFF";
	} else {
		textColour = "black";
	}
	/*
	var mc1 = new MultipleChoice("lion", mcMarginX, mcMarginY, context);
	mc1.addEventListener(mc1.EVENT_CLICKED, onMultipleChoiceClick);
	itemList.push( mc1 );
	*/
	if ( this.level ){
		this.message = promptsList[ this.level-1 ].instruction;	
	} else {
		this.message = "Error";
	}
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
	function onMultipleChoiceClick(e){
		//console.log("onMultipleChoiceClick");
	}
	this.setText = function(m){
		this.message = m;
	}
	this.setMaxWidth = function( cw ){
		this.maxWidth = cw - this.x - 400 - 10;
	}
	this.onMouseUp = function (mouseX,mouseY) {
		/*
		//this is being called by DisplayList when the mouse/touch on canvas is UP
		console.log("prompt clicked: "+mouseX+", "+mouseY);
		mc1.onMouseUp();

		//calls onPromptClicked in FoodWeb.js
		//this.dispatch(this.EVENT_CLICKED);
		
		//runs through all the clickable items and see which one was clicked
		for (i=0; i< itemList.length; i++) {
		    var to = itemList[i];
		    if ( (mouseY >= to.y) && (mouseY <= to.y+to.height)
		            && (mouseX >= to.x) && (mouseX <=
		         to.x+to.width) ) {
		         to.onMouseUp(mouseX,mouseY);
		    }
		}
		*/
	}
	
	this.setConnectionPrompt = function(){

		if ( this.level ){
			this.message = promptsList[ this.level-1 ].connection;	
		} else {
			this.message = "Error";
		}
	}
	this.draw = function() {
		this.ctx.shadowBlur=0;
		this.ctx.shadowOffsetX = 0;
		this.ctx.shadowOffsetY = 0
		this.ctx.font = "300 12pt 'Roboto'";
		this.ctx.textAlign = "center";//"left";
		this.ctx.textBaseline = "top";
		this.ctx.fillStyle = textColour;
		//wrapText(this.ctx, this.message, this.x, this.y, maxWidth, lineHeight);
		drawStyledBreakedWrappedText( this.ctx, this.message, this.x, this.y, 'Roboto', 16 );
	}
}
Prompt.prototype = new EventDispatcher();
Prompt.prototype.constructor = Prompt;