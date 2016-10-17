function ImageTextButton(n, x, y, w, h, c, colour, textcolour, font, yo, s){
	var imageW = 24;
	var imageH = 24;
	var imageX = x + (w-imageW)/2;
	var imageY = y;
	var image;
	var image2;

	var fileName;
	var fileName2;
	var backgroundStyle = s;
	var inactiveAlpha = 0.5;
	var activeAlpha = 1;

	this.name = n;
	this.x = x;
	this.y = y;
	this.width = w;
	this.height = h;
	this.colour = colour;
	this.context = c;
	this.textcolour = textcolour;
	this.yOffset = yo;	//text offset
	this.font = font;
	this.active = false;
	this.EVENT_CLICKED = "clicked";

	switch( this.name ){
		case "Add ⇄":
			fileName = "ic_add_white_48dp_2x.png";
			break;
		case "Remove ⇄":
			fileName = "ic_remove_white_48dp_2x.png";
			break;
		case "Save":
			fileName = "ic_cloud_upload_white_48dp_2x.png";
			fileName2 = "ic_cloud_done_white_48dp_2x.png";
			image2 = loadImage( fileName2 );
			break;
		/*case "Annotate":
			fileName = "ic_insert_comment_white_48dp_2x.png";
			break;*/
		case "Delete":
			fileName = "ic_delete_white_48dp_2x.png";
			break;
		case "View Only":
			fileName = "ic_visibility_white_48dp_2x.png";
			//this.x -= 6;
			//imageX -= 6;
			break;
		default:
			fileName = "";
	}
	image = loadImage( fileName );
	
	function loadImage( file ){
		var icon = new Image();
		icon.addEventListener('load', imageLoaded , false);
		icon.src = file;
		return icon;
	}

	function imageLoaded(event) {
		image.loaded = true;
	}

	this.onMouseUp = function (mouseX,mouseY) {		
		this.active = !this.active;
		this.drawButton();
		this.dispatch(this.EVENT_CLICKED);
	}
	this.updateXY = function(x,y){
		this.x = x;
		this.y = y;
	}
	this.drawButton = function(){
		this.context.save();
		this.draw();
		this.context.restore();
	}
	this.drawSavedButton = function(){
		this.context.save();
		this.context.shadowBlur=0;
		this.context.shadowOffsetX = 0;
		this.context.shadowOffsetY = 0;
		this.context.fillStyle = this.colour;
		this.context.fillRect(this.x, this.y, this.width, this.height);
		/*		
		//change alpha based on whether button is active or not
		if( this.active ){
			this.context.globalAlpha = activeAlpha;
		} else {
			this.context.globalAlpha = inactiveAlpha;
		}
		*/		
		this.context.globalAlpha = inactiveAlpha;
		this.context.drawImage(image2,imageX,imageY,imageW,imageH);

		this.context.shadowBlur=0;
		this.context.shadowOffsetX = 0;
		this.context.shadowOffsetY = 0;
		this.context.font = this.font;
		this.context.textAlign = "center";
		this.context.textBaseline = "top";
		this.context.fillStyle = this.textcolour;
		this.context.fillText("Saved", this.x+this.width/2, this.y+this.yOffset);
		this.context.globalAlpha = 1;
		this.context.restore();
	}
	this.draw = function() {
	    this.context.shadowBlur=0;
	    this.context.shadowOffsetX = 0;
	    this.context.shadowOffsetY = 0;
	    this.context.fillStyle = this.colour;
	    this.context.fillRect(this.x, this.y, this.width, this.height);
	    
	    //change alpha based on whether button is active or not
	    if( this.active ){
	    	this.context.globalAlpha = activeAlpha;
	    } else {
	    	this.context.globalAlpha = inactiveAlpha;
	    }
	    
	    //this.context.drawImage(image,imageX,imageY,imageW,imageH);
	    this.context.shadowBlur=0;
	    this.context.shadowOffsetX = 0;
	    this.context.shadowOffsetY = 0;
	    this.context.font = this.font;
	    this.context.textAlign = "center";
	    this.context.textBaseline = "top";
	    this.context.fillStyle = this.textcolour;
	    //draw "Saved" state if saveBtn is active
	    if( this.active && this.name == "Save" ){
	    	this.context.drawImage(image2,imageX,imageY,imageW,imageH);
	    	this.context.fillText("Saved", this.x+this.width/2, this.y+this.yOffset);
	    } else {
			this.context.drawImage(image,imageX,imageY,imageW,imageH);
			this.context.fillText(this.name, this.x+this.width/2, this.y+this.yOffset);
			if( this.name == "View Only"){
				var tempX = this.x+this.width/2;
			}
	    }
	    //this.context.fillText(this.name, this.x+this.width/2, this.y+this.yOffset);
	    this.context.globalAlpha = 1;
	}

}
ImageTextButton.prototype = new EventDispatcher();
ImageTextButton.prototype.constructor = ImageTextButton;