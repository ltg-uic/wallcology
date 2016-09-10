function MultipleChoice(n, x, y, c, sp, num, type, colour){
	var upFile = "graphincrease.png";
	var downFile = "graphdecrease.png";
	var sameFile = "graphsame.png";
	var backgroundColor = "#F5F5F5"; //EFEBE9
	var yOffset = 0;
	var iconHeight = 30;
	var iconWidth = 30;
	var graphHeight = 51;	//156;
	var graphWidth = 240;	//726;
	var btnHeight = 40;
	var btnWidth = 65;
	var padding = 10;
	var paddingY = 10;
	var yOffset = 26;
	var marginTop = 8;
	var marginBottom = 8;
	var marginLeft = 4;
	var choices = [];

	this.colour = colour;
	this.species = sp;
	this.num = num;
	this.type = type;
	this.message = "";
	
	this.rows = [];
	this.context = c;
	this.name = "multiple choice";

	this.height = n.length * (graphHeight+paddingY) + yOffset + marginTop; //+ marginBottom;
	this.width = marginLeft + iconWidth + padding * 5 + graphWidth * 3 + btnWidth;
	this.x = x;
	//this.y = y;
	this.y = y - this.height;

	var btnX = x + marginLeft + padding + iconWidth + 3*(padding + graphWidth);
	var btnY = y - this.height + yOffset + marginTop; //graphHeight/2-iconHeight/2; //this.y+yOffset+marginTop
	this.button = new GenericButton("Run", btnX, btnY, btnHeight, btnWidth, c, this.colour);

	//console.log("btnX: "+btnX+", btnY: "+btnY);
	this.EVENT_CLICKED = "clicked";
	this.EVENT_REDRAW = "redraw";

	//console.log("this.colour: "+this.colour);
	//console.log("colour: "+colour);
	for( var i=0; i<n.length; i++){
		//console.log("n["+i+"]: "+n[i]);
		var row = {
			name: n[i],
			y: this.y+yOffset+marginTop+(graphHeight+paddingY)*i,
			icon: loadImage( n[i] + ".png" ),
			up: new Choice( "graphincrease", this.x + marginLeft + padding + iconWidth, this.y+yOffset+marginTop+(graphHeight+paddingY)*i, graphWidth, graphHeight, this.context, this.colour),
			down: new Choice( "graphdecrease", this.x + marginLeft + padding + iconWidth + padding + graphWidth,this.y+yOffset+marginTop+(graphHeight+paddingY)*i, graphWidth, graphHeight, this.context, this.colour),
			same: new Choice( "graphsame", this.x + marginLeft + padding + iconWidth + 2*(padding + graphWidth),this.y+yOffset+marginTop+(graphHeight+paddingY)*i, graphWidth, graphHeight, this.context, this.colour),
			selection: "none"
			}
			//row.up.addEventListener(row.up.EVENT_REDRAW, onGraphsLoaded);
			//row.down.addEventListener(row.up.EVENT_REDRAW, onGraphsLoaded);
			//row.same.addEventListener(row.up.EVENT_REDRAW, onGraphsLoaded);
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
		if( hitTest(mouseX, mouseY, this.button) ){
			console.log("run button clicked");
			if ( checkSelectionComplete( this.rows )){
				this.dispatch(this.EVENT_CLICKED);
			} else {
				this.message = "Selection incomplete";
				this.dispatch(this.EVENT_REDRAW);
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
		//draws a square for testing mouse click propagation
		//this.context.fillStyle = "#9E9E9E";
		//this.context.fillRect(this.x,this.y,this.width,this.height);

	    this.context.shadowBlur=0;
	    this.context.shadowOffsetX = 0;
	    this.context.shadowOffsetY = 0;
	    this.context.font = "12pt 'Roboto'";
	    this.context.textAlign = "left";
	    this.context.textBaseline = "top";
	    this.context.fillStyle = "#263238";
	    this.context.fillText("Goes up", this.x + marginLeft + padding + iconWidth, this.y+marginTop);
	    this.context.fillText("Goes down", this.x + marginLeft + padding + iconWidth + padding + graphWidth, this.y+marginTop);
	    this.context.fillText("Stays the same", this.x + marginLeft + padding + iconWidth + 2*(padding + graphWidth), this.y+marginTop);

	    this.context.font = "8pt Roboto";
	    this.context.textAlign = "right";
	    this.context.fillStyle = "#666666";
	    this.context.fillText(this.message, btnX+btnWidth, this.y+marginTop);

	    for( var i=0; i<this.rows.length;i++){
	    	var r = this.rows[i];
	    	//console.log("row "+i+": "+r.name+" , "+r.y+" , "+r.up+" , "+r.down+" , "+r.same);
	    	this.context.drawImage(r.icon,this.x + marginLeft,r.y+graphHeight/2-iconHeight/2,iconWidth,iconHeight);	
	    	r.up.draw();
	    	r.down.draw();
	    	r.same.draw();
	    }
	    this.button.draw();
	}
}
MultipleChoice.prototype = new EventDispatcher();
MultipleChoice.prototype.constructor = MultipleChoice;