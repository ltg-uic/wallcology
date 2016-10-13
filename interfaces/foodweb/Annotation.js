function Annotation(m, c, colour, textcolour, font){
	//private variables
 	var textcolour = textcolour;
 	var colour = colour;
 	var font = font;
 	//var message = m;
	var maxWidth = 200;
	var lineHeight = 18;

	//public variables
	this.name = m;
	this.context = c;
	this.x = 90;
	this.y = 300;
	this.width = 10;
	this.height = 10;
	this.isDragging = false;
    this.active = false;
    
	this.EVENT_CLICKED = "clicked";

	this.context.font = font;
	var size = getSize( this.context, this.name );
	this.width = size.width;
	this.height = size.height;

	function getSize( context, text ){
		var words = text.split(' ');
		var line = '';
		var textWidth = 0;
		var textHeight;
		var totalLines = 0;

		for(var n = 0; n < words.length; n++) {
		  var testLine = line + words[n] + ' ';
		  var metrics = context.measureText(testLine);
		  var testWidth = metrics.width;
		  //console.log("testWidth: "+testWidth);
		  if (testWidth > maxWidth && n > 0) {
		    line = words[n] + ' ';
		    totalLines += 1;
		    textWidth = maxWidth;
		  } else {
		    line = testLine;
		    if( textWidth < testWidth ){
		    	textWidth = testWidth;
		    }
		  }
		}
		totalLines += 1;
		//console.log("testWidth 1: "+testWidth);
		textWidth = parseInt(textWidth);
		var textWidthInt = parseInt(textWidth);
		textHeight = totalLines * lineHeight;
		//console.log("textWidthInt: "+textWidthInt);
		return {width: textWidthInt, height: textHeight};
	}
	function wrapText(context, text, x, y){
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
		return y;
	}
	this.onMouseUp = function (mouseX,mouseY) {		
		/*
		this.active = !this.active;
		this.drawAnnotation();
		this.dispatch(this.EVENT_CLICKED);
		*/
	}

	this.updateXY = function(x,y){
		this.x = x;
		this.y = y;
	}
	this.drawAnnotation = function(){
		this.context.save();
		this.draw();
		this.context.restore();
	}
	this.draw = function() {
	    this.context.shadowBlur=0;
	    this.context.shadowOffsetX = 0;
	    this.context.shadowOffsetY = 0;
	    this.context.fillStyle = colour;
	    //console.log( "this.width: "+this.width );
	    this.context.fillRect(this.x, this.y, this.width, this.height);

	    this.context.font = font;
	    this.context.textAlign = "left";
	    this.context.textBaseline = "top";
	    this.context.fillStyle = textcolour;
	    wrapText( this.context, this.name, this.x, this.y );
	}
}
Annotation.prototype = new EventDispatcher();
Annotation.prototype.constructor = Annotation;