function Prompt(context,x,y,l){
	
	var maxWidth = 700;
	var lineHeight = 25;

	var promptsList = [
	   	{level:1,
		instruction:"Drag the species into the work area to get started.",
		connection:"You've created a food chain. Lions eat zebras. When this happens, the zebra gives energy to the lion. When the population of one species increases, what happens to the other? Click on the 'arrow up' buttons to find out."
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
	/*[
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
	this.x = x;
	this.y = y; 
	this.message = "" ;
	this.EVENT_CLICKED = "clicked";

	//this.message = promptsList[ this.level-1 ];
	/*
	switch(this.level){
		case 1:
			this.message = level1.instruction;
			break;
		case 2:
			this.message = level2.instruction;
			break;
		case 3:
			this.message = level3.instruction;
			break;
		default:
			this.message = "Error";
	}*/
	if ( this.level ){
		this.message = promptsList[ this.level-1 ].instruction;	
	} else {
		this.message = "Error";
	}

	function wrapText(context, text, x, y, maxWidth, lineHeight) {
		var words = text.split(' ');
		var line = '';

		for(var n = 0; n < words.length; n++) {
		  var testLine = line + words[n] + ' ';
		  var metrics = context.measureText(testLine);
		  var testWidth = metrics.width;
		  if (testWidth > maxWidth && n > 0) {
		    context.fillText(line, x, y);
		    line = words[n] + ' ';
		    y += lineHeight;
		  }
		  else {
		    line = testLine;
		  }
		}
		context.fillText(line, x, y);
	}
	this.setText = function(m){
		this.message = m;
	}
	this.onMouseUp = function (mouseX,mouseY) {
		//this.dispatch(this.EVENT_CLICKED);
		//do nothing
	}
	this.setConnectionPrompt = function(){

		if ( this.level ){
			this.message = promptsList[ this.level-1 ].connection;	
		} else {
			this.message = "Error";
		}
		/*
		switch(this.level){
		case 1:
			this.message = level1.connection;
			break;
		case 2:
			this.message = level2.connection;
			break;
		case 3:
			this.message = level3.connection;
			break;
		default:
			this.message = "Error";
		}
		*/
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
		this.ctx.shadowBlur=0;
		this.ctx.shadowOffsetX = 0;
		this.ctx.shadowOffsetY = 0
		this.ctx.font = "16pt Helvetica";
		this.ctx.textAlign = "left";
		this.ctx.textBaseline = "bottom";
		this.ctx.fillStyle = "#263238";
		wrapText(this.ctx, this.message, this.x, this.y, maxWidth, lineHeight);
		//this.ctx.fillText(this.message, this.x, this.y);
	}
}
Prompt.prototype = new EventDispatcher();
Prompt.prototype.constructor = Prompt;