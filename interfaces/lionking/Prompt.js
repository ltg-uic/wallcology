function Prompt(context, x, y, cw, ch, l){
	var canvasW = cw;
	var canvasH = ch;
	//var maxWidth = 700;
	//console.log("canvasW: "+canvasW+", canvasH: "+canvasH);
	this.maxWidth = cw - x - 400 - 10;	//400 as size of graphs	//10 = padding
	//console.log("maxWidth: "+maxWidth);

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
		continue4:"Do you think the §bone-way§r energy relationship represented in a basic food chain tells the full story about the lion and the zebra’s population relationship?<br>Ecologists use a richer representation to describe §btwo-way§r relationships in an ecosystem. Click \u2192 (on the screen's lower left) to learn about it."
		},
		{level:2,
		instruction:"Earlier you created a food chain. Here you'll be creating a §bPopulation Interaction Web§r.<br>Drag the species into the work area to get started.",
		connection:"In a §bPopulation Interaction Web§r, each relationship is described by a pair of arrows.<br>An arrow with a §b+§r sign means that when one species’ population goes §bup§r, the other goes §bup§r (+: if X goes up \u2192 Y goes up).<br>A §b\u2013§r sign means the opposite. When one species’ population goes §bup§r, the other species’ population goes §bdown§r (–: if X goes up \u2192 Y goes down).<br>Based on this representation, what do you think happens to the §bzebra§r population when the §blion§r population goes §bup§r?<br>Click the 'up' button above the lion to make a prediction and find out.",
		continue1:"Did you notice that the §b\u2013§r sign on the arrow going from the §blion§r to the §bzebra§r shows their population relationship?<br>This §bopposite§r relationship directly translates to:<br>'When the lion population goes §bup§r, the zebra population goes §bdown§r'<br>What happens when you §bincrease§r the population of §bzebras§r?<br>Click the 'up' button above the zebra to make a prediction and find out.",
		continue2:"The §b+§r sign on the arrow going from the §bzebra§r to the §blion§r describes the §bsame§r relationship, directly translating to:<br>When the zebra population goes §bup§r, the lion population also goes §bup§r.<br>A pair of +/\u2013 arrows represents a prey/predator or producer/consumer relationship.<br>Now let’s look at populations going §bdown§r.<br>Click the 'down' button below the §blion§r to §bdecrease§r the its population.",
		continue3:"Since the arrow going from the §blion§r to the §bzebra§r has a §b\u2013§r sign, it means that:<br>‘When the population of lion goes §bup§r, the zebra population goes §bdown§r’<br>With this §bopposite§r relationship, it also means that:<br>‘When the lion population goes §bdown§r, the zebra population goes §bup§r’<br>Now, what do you think happens to the §bzebra§r population when the §blion§r population goes §bdown§r?<br>Click the 'down' button below the zebra to make a prediction and find out.",
		continue4:"You've now learned the basics about §bPopulation Interaction Webs§r. Next, you will create more complex relationships with three and (later) four species<br>Click \u2192 to continue."
		},
		{level:3,
		instruction:"There's a new species.<br>How do they relate to one another? And what does it mean when one species’ population changes?<br>Drag the species into the work area to start.",
		connection:"§bRemember§r:<br>An arrow with a + sign means that when the population of one species goes up, the other also goes up (+: if X goes §bup§r \u2192 Y goes §bup§r).<br>A \u2013 sign means the opposite. When the population of one species goes up, the population of the other species goes down (\u2013: if X goes §bup§r \u2192 Y goes §bdown§r).<br>Click on the ‘up’ and ‘down’ buttons to make changes and predict the lion, zebra and leopard’s populations.",
		continue1:"§bHint§r:<br>+: If X goes up \u2192 Y goes up<br>\u2013: If X goes up \u2192 Y goes down",
		continue2:"Good Job! You’ve changed and predicted all of the species’ populations. Click \u2192 to continue."
		},
		{level:4,
		instruction:"There's four species now: lion, zebra, grass and acacia tree. Drag the species into the work area to start.",
		connection:"There a different kind of relationship in this Population Interaction Web. Pay careful attention to the arrow signs to find it.<br>Continue changing and predicting all of the species’ populations to get really familiar with Population Interaction Webs. You’ll be creating many more in the weeks to come.",
		continue1:"Congratulations! You’ve completed all of the modules. Feel free go back and try them again or move on to the §b‘Food Web Modeler’§r to create your own Population Interaction Webs."
		}
	];

	/*
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
	[
		"Hello! Drag the species into the white area to get started.",
		"In this food chain, the zebra gives energy to the lion. What happens to the lion population if the zebra population doubles? (A) Goes up, (B) Goes down, (C) Stays the same. Test your theory.",
		"What happens to the zebra population if the lion population doubles? (A) Goes up, (B) Goes down, (C) Stays the same. Test your theory."
		];
	var level2 = [
		"Instead of a food chain, you're creating an 'Interaction Web' Drag the species into the white area to get started.",
		"What do you think this arrow means?"
		];
	*/
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
		/*
		this.ctx.fillStyle = "#546E7A";
		this.ctx.shadowColor="#BFBFBF";
        this.ctx.shadowBlur=4;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 4
		this.ctx.fillRect(0,960-h,this.ctx.canvas.width-150,h);
		*/
		//draws a square for testing mouse click propagation
		//this.ctx.fillStyle = "#546e7a";
		//this.ctx.fillRect(this.x,this.y,this.width,this.height);

		this.ctx.shadowBlur=0;
		this.ctx.shadowOffsetX = 0;
		this.ctx.shadowOffsetY = 0
		//this.ctx.font = "16pt Helvetica";
		this.ctx.font = "300 12pt 'Roboto'";
		//this.ctx.font = "16pt 'Roboto'";
		this.ctx.textAlign = "left";
		this.ctx.textBaseline = "top";
		this.ctx.fillStyle = "black"; //"#FFFFFF";
		//wrapText(this.ctx, this.message, this.x, this.y, maxWidth, lineHeight);
		//console.log("maxWidth: "+this.maxWidth);
		drawStyledBreakedWrappedText( this.ctx, this.message, this.x, this.y, 'Roboto', 14, this.maxWidth );
		//mc1.draw();
		//this.ctx.fillText(this.message, this.x, this.y);
	}
}
Prompt.prototype = new EventDispatcher();
Prompt.prototype.constructor = Prompt;