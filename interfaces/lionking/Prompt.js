function Prompt(context, x, y, cw, ch, l, bg){
	var canvasW = cw;
	var canvasH = ch;
	this.maxWidth = cw - x - 400 - 10;	//400 as size of graphs	//10 = padding

	var lineHeight = 18;
	var breakHeight = 25;
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
		instruction:"Drag the species into the work area to get started.",
		connection:"You've created a food chain: §bLions eat zebras§r.<br>When this happens, the zebra gives energy to the lion.<br>Right now, the ‘population over time’ graphs (on the right) show that populations are stable.<br>Based on the food chain, what do you think happens to the §bzebra§r population if the §blion§r population goes §bup§r?<br>Click the 'up' button above the lion to make a prediction and find out.",
		continue1:"What if the §bzebra§r population goes §bup§r? What do you think happens to the §blion§r population?<br>Click the 'up' button above the zebra to make a prediction and find out.",
		continue2:"Now we’re going to look at populations going §bdown§r.<br>If the §blion§r population goes §bdown§r, what happens to the zebra population?<br>Click the 'down' button below the lion to make a prediction and find out.",
		continue3:"What happens to the §blion§r population if the §bzebra§r population goes down?<br>Click the 'down' button below the zebra to make a prediction and find out.",
		continue4:"You've completed the first level! Click \u2192 (on the screen's lower left) to move on."
		},
		/*{level:2,
		instruction:"Earlier you created a food chain. Here you'll be creating a §bPopulation Interaction Web§r.<br>Drag the species into the work area to get started.",
		connection:"In a §bPopulation Interaction Web§r, each relationship is described by a pair of arrows.<br>An arrow with a §b+§r sign means that when one species’ population goes §bup§r, the other goes §bup§r (+: if X goes up \u2192 Y goes up).<br>A §b\u2013§r sign means the opposite. When one species’ population goes §bup§r, the other species’ population goes §bdown§r (–: if X goes up \u2192 Y goes down).<br>Based on this representation, what do you think happens to the §bzebra§r population when the §blion§r population goes §bup§r?<br>Click the 'up' button above the lion to make a prediction and find out.",
		continue1:"Did you notice that the §b\u2013§r sign on the arrow going from the §blion§r to the §bzebra§r shows their population relationship?<br>This §bopposite§r relationship directly translates to:<br>'When the lion population goes §bup§r, the zebra population goes §bdown§r'<br>What happens when you §bincrease§r the population of §bzebras§r?<br>Click the 'up' button above the zebra to make a prediction and find out.",
		continue2:"The §b+§r sign on the arrow going from the §bzebra§r to the §blion§r describes the §bsame§r relationship, directly translating to:<br>When the zebra population goes §bup§r, the lion population also goes §bup§r.<br>A pair of +/\u2013 arrows represents a prey/predator or producer/consumer relationship.<br>Now let’s look at populations going §bdown§r.<br>Click the 'down' button below the §blion§r to §bdecrease§r the its population.",
		continue3:"Since the arrow going from the §blion§r to the §bzebra§r has a §b\u2013§r sign, it means that:<br>‘When the population of lion goes §bup§r, the zebra population goes §bdown§r’<br>With this §bopposite§r relationship, it also means that:<br>‘When the lion population goes §bdown§r, the zebra population goes §bup§r’<br>Now, what do you think happens to the §bzebra§r population when the §blion§r population goes §bdown§r?<br>Click the 'down' button below the zebra to make a prediction and find out.",
		continue4:"You've now learned the basics about §bPopulation Interaction Webs§r. Next, you will create more complex relationships with three and (later) four species<br>Click \u2192 to continue."
		},*/
		{level:2,
		instruction:"There's a new species.<br>How do they relate to one another? And what does it mean when one species’ population changes?<br>Drag the species into the work area to start.",
		connection:"Click on the ‘up’ and ‘down’ buttons to make changes and predict the species’ populations.",
		continue1:"",
		continue2:"Good Job! You’ve changed and predicted all of the species’ populations. Click \u2192 to continue."
		},
		{level:3,
		instruction:"There's four species now: lion, zebra, grass and the acacia tree. Drag the species into the work area to start.",
		connection:"There a different kind of relationship in this food web. Pay careful attention to the lines to find it.<br>Continue changing and predicting all of the species’ populations in the food web. You’ll be creating many more in the weeks to come.",
		//continue1:"Level 3 complete, click \u2192 to continue."
		continue1:"Congratulations, You’re done! Feel free go back and try them again if you like."
		}/*,		
		{level:4,
		instruction:"There's five species now: lion, zebra, giraffe, grass and the acacia tree. Drag the species into the work area to start.",
		connection:"",
		continue1:"Congratulations, You’re done! Feel free go back and try them again if you like."
		}*/
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
	
	var background = bg;
	var textColour;
	var itemList = [];
	var mcMarginX = this.x + 100;
	var mcMarginY = this.y + 10;

	if ( this.level ){
		this.message = promptsList[ this.level-1 ].instruction;	
	} else {
		this.message = "Error";
	}
	if ( background == "dark" ){
		textColour = "#FFFFFF";
	} else {
		textColour = "black";
	}
	function drawStyledBreakedWrappedText(context, text, x, y, font, fontSize, maxWidth){
		var textblock = text.split("<br>");
		var lastY = y;
		for ( var i = 0; i<textblock.length; i++ ){
			var tb = textblock[i];
			lastY = wrapText(context, tb, x, lastY, maxWidth, lineHeight, font, fontSize);
			//console.log( tb + ", x: "+x+", y: "+lastY+", maxWidth: "+maxWidth+", lineHeight: "+lineHeight);
			//lastY += lineHeight;
			lastY += breakHeight;
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
	this.setContinuePrompt = function(num){
		if ( this.level ){
			switch (num){
				case 1:
					this.message = promptsList[ this.level-1 ].continue1;
					break;
				case 2: 
					this.message = promptsList[ this.level-1 ].continue2;
					break;
				case 3: 
					this.message = promptsList[ this.level-1 ].continue3;
					break;
				case 4: 
					this.message = promptsList[ this.level-1 ].continue4;
					break;
				default:
					this.message = "Error";
			}

		} else {
			this.message = "Error";
		}
	}
	this.draw = function() {
		this.ctx.shadowBlur=0;
		this.ctx.shadowOffsetX = 0;
		this.ctx.shadowOffsetY = 0
		this.ctx.font = "300 16pt 'Roboto'";
		this.ctx.textAlign = "left";
		this.ctx.textBaseline = "top";
		this.ctx.fillStyle = textColour; "black"; //"#FFFFFF";
		//wrapText(this.ctx, this.message, this.x, this.y, maxWidth, lineHeight);
		drawStyledBreakedWrappedText( this.ctx, this.message, this.x, this.y, 'Roboto', 16, this.maxWidth );
		//this.ctx.fillText(this.message, this.x, this.y);
	}
}
Prompt.prototype = new EventDispatcher();
Prompt.prototype.constructor = Prompt;