function Line(n,o1,o2,c,l,t){
    this.name=n;
    this.type = t;
    this.ctx = c;
    this.level = 2;//l; //1 or 2, corresponds to level.num
    this.obj1 = o1;
    this.obj2 = o2;
    this.x1 = o1.x+o1.width/2;
    this.y1 = o1.y+o1.height/2;
    this.x2 = o2.x+o2.width/2;
    this.y2 = o2.y+o2.height/2;
    this.height = Math.abs(this.y2 - this.y1)
    this.x = 0;
    this.y = 0;
    this.height = this.ctx.canvas.height;
    this.width = this.ctx.canvas.width;
    if( this.level > 1 ){
        if( this.type == "eatenby" ){
            this.sourceBtn = new ToggleButton("source", "plus", 0, 0, this.ctx);
            this.destinationBtn = new ToggleButton("destination", "minus", 0, 0, this.ctx);
        } else if ( this.type == "competition" ){
            this.sourceBtn = new ToggleButton("source", "minus", 0, 0, this.ctx);
            this.destinationBtn = new ToggleButton("destination", "minus", 0, 0, this.ctx);
        } else if ( this.type == "eats" ){
            this.sourceBtn = new ToggleButton("source", "minus", 0, 0, this.ctx);
            this.destinationBtn = new ToggleButton("destination", "plus", 0, 0, this.ctx);
        } else if ( this.type == "mutualism" ){
            this.sourceBtn = new ToggleButton("source", "plus", 0, 0, this.ctx);
            this.destinationBtn = new ToggleButton("destination", "plus", 0, 0, this.ctx);            
        }
        
    }
    //PRIVATE METHODS
    function getLineType(source, destination){
        var type = "";
        if ( source == "plus" && destination == "minus" ){
            type = "eatenby";
        } else if ( source == "plus" && destination == "plus" ){
            type = "mutualism";
        } else if ( source == "minus" && destination == "plus" ){
            type = "eats";
        } else if ( source == "minus" && destination == "minus" ){
            type = "competition";
        }
        return type;
    }
    function hitTest(mouseX, mouseY, to){
        if ( (mouseY >= to.y) && (mouseY <= to.y+to.height)
                    && (mouseX >= to.x) && (mouseX <=
                 to.x+to.width) ) {
                 return true;
        } else {
                return false;
        }
    }
    // Find all transparent/opaque transitions between two points
    // Uses http://en.wikipedia.org/wiki/Bresenham's_line_algorithm
    function edges(ctx,p1,p2,cutoff){

        //create canvas dynamically
        createCanvas = function(w, h, ratio) {
            var can = document.createElement("canvas");
            can.width = w * ratio;
            can.height = h * ratio;
            can.style.width = w + "px";
            can.style.height = h + "px";
            can.getContext("2d").setTransform(ratio, 0, 0, ratio, 0, 0);
            return can;
        }

        var ecanvas = createCanvas(1280, 960, 1);
        var ectx = ecanvas.getContext('2d');
        var sourceCanvas = ctx.canvas;
        var ratio = 0.5;
        ectx.scale( ratio, ratio );
        ectx.drawImage(sourceCanvas, 0, 0);

      if (!cutoff) cutoff = 220; // alpha threshold
      var dx = Math.abs(p2.x - p1.x), dy = Math.abs(p2.y - p1.y),
          sx = p2.x > p1.x ? 1 : -1,  sy = p2.y > p1.y ? 1 : -1;
      var x0 = Math.min(p1.x,p2.x), y0=Math.min(p1.y,p2.y);
      var pixels = ectx.getImageData(x0,y0,dx+1,dy+1).data;
        
        //var gcanvas = document.getElementById("canvas2");
        //var gctx = gcanvas.getContext("2d");
        //see image data for troubleshooting
        //var imgData=ectx.getImageData(x0,y0,dx+1,dy+1);
        //var imgData=ectx.getImageData(0,0,ecanvas.width,ecanvas.height);
        //gctx.putImageData(imgData,0,0);

      var hits=[], over=null;
      for (x=p1.x,y=p1.y,e=dx-dy; x!=p2.x||y!=p2.y;){
        var alpha = pixels[((y-y0)*(dx+1)+x-x0)*4 + 3];
        if (over!=null && (over ? alpha<cutoff : alpha>=cutoff)){
          hits.push({x:x,y:y});
        }
        var e2 = 2*e;
        if (e2 > -dy){ e-=dy; x+=sx }
        if (e2 <  dx){ e+=dx; y+=sy  }
        over = alpha>=cutoff;
      }
      //console.log("hits.length: "+hits.length);
      return hits;
    }
    function getLineXY(p1,p2,r){
        var x1 = p1.x;
        var x2 = p2.x;
        var y1 = p1.y;
        var y2 = p2.y;

        // Determine line lengths
        var xlen = x2 - x1;
        var ylen = y2 - y1;

        // Determine hypotenuse length
        var hlen = Math.sqrt(Math.pow(xlen,2) + Math.pow(ylen,2));

        // The variable identifying the length of the `shortened` line.
        // In this case 50 units.
        //var smallerLen = d;

        // Determine the ratio between they shortened value and the full hypotenuse.
        var ratio = r;//smallerLen / hlen;

        var smallerXLen = xlen * ratio;
        var smallerYLen = ylen * ratio;

        // The new X point is the starting x plus the smaller x length.
        var smallerX = x1 + smallerXLen;

        // Same goes for the new Y.
        var smallerY = y1 + smallerYLen;
        var smallerXY = {x: smallerX, y:smallerY};
        return smallerXY;
    }
    function drawArrowhead(ctx,x,y,radians){
        ctx.save();
        ctx.beginPath();
        ctx.translate(x,y);
        ctx.rotate(radians);
        ctx.moveTo(0,0);
        ctx.lineTo(5,20);
        ctx.lineTo(-5,20);
        ctx.closePath();
        ctx.restore();
        ctx.fill();
    }
    function drawSingleArrow(ctx,p1,p2){
        // draw the line
        ctx.shadowBlur=4;
        ctx.shadowColor="#BFBFBF";
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 2;
        ctx.beginPath();
        ctx.moveTo(p1.x,p1.y);
        ctx.lineTo(p2.x,p2.y);
        ctx.stroke();

        // draw the ending arrowhead
        var endRadians=Math.atan((p2.y-p1.y)/(p2.x-p1.x));
        endRadians+=((p2.x>p1.x)?90:-90)*Math.PI/180;
        drawArrowhead(ctx,p2.x,p2.y,endRadians);
    }
    function drawDoubleArrow(ctx,p1,p2,d,t,sb,db){
        var lineDiff = d;
        var lineType = t;
        // draw the line
        ctx.shadowBlur=4;
        ctx.shadowColor="#BFBFBF";
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 2;
        ctx.beginPath();
        ctx.moveTo(p1.x,p1.y);
        ctx.lineTo(p2.x,p2.y);
        ctx.stroke();

        var startRadians=Math.atan((p2.y-p1.y)/(p2.x-p1.x));
        startRadians+=((p2.x>p1.x)?-90:90)*Math.PI/180;
        drawArrowhead(ctx,p1.x,p1.y,startRadians);
        
        //draw +/- competition arrow
        var plusXY = getLineXY(p1,p2,0.875);
        var minusXY = getLineXY(p1,p2,0.125);
        var dy = 36;    //distance between '-' and line
        lineDiff = -14;  //distance between '+' and line
        
        sb.updateXY( plusXY.x, plusXY.y+dy+lineDiff );
        db.updateXY( minusXY.x, minusXY.y-dy );
        sb.draw();
        db.draw();
        /*
        if ( lineType == "eatenby" ){
            sb.updateXY( plusXY.x, plusXY.y+dy+lineDiff );
            db.updateXY( minusXY.x, minusXY.y-dy );
            sb.draw();
            db.draw();
        } else if ( lineType == "competition" ){
            sb.updateXY( plusXY.x, plusXY.y+dy+lineDiff );
            db.updateXY( minusXY.x, minusXY.y-dy );
            sb.draw();
            db.draw();
        } else if ( lineType == "eats" ){
            sb.updateXY( plusXY.x, plusXY.y+dy+lineDiff );
            db.updateXY( minusXY.x, minusXY.y-dy );
            sb.draw();
            db.draw();
        }
        */
    }
    //PUBLIC METHODS
    this.onMouseUp = function (mouseX,mouseY) {
        if( hitTest(mouseX, mouseY, this.sourceBtn) ){
            this.sourceBtn.onMouseUp(mouseX, mouseY);
        } else if( hitTest(mouseX, mouseY, this.destinationBtn) ){
            this.destinationBtn.onMouseUp(mouseX, mouseY);
        }
        this.type = getLineType( this.sourceBtn.symbol, this.destinationBtn.symbol );
        console.log("source: "+this.obj1.name + ", destination: "+ this.obj2.name + ", type: "+ this.type );
    }
    this.getLength = function(){
        var x1 = this.x1;
        var x2 = this.x2;
        var y1 = this.y1;
        var y2 = this.y2;

        // Determine line lengths
        var xlen = x2 - x1;
        var ylen = y2 - y1;

        // Determine hypotenuse length
        var hlen = Math.sqrt(Math.pow(xlen,2) + Math.pow(ylen,2));
        return hlen;  
    }
    this.updateXY = function(){
        var o1 = this.obj1;
        var o2 = this.obj2;
        this.x1 = o1.x+o1.width/2;
        this.y1 = o1.y+o1.height/2;
        this.x2 = o2.x+o2.width/2;
        this.y2 = o2.y+o2.height/2;
    }
    this.draw = function(){
        var p1 = {x:this.x1,y:this.y1};
        var p2 = {x:this.x2,y:this.y2};
        
        // arbitrary styling
        this.ctx.strokeStyle = "#22B573";    //"#00E5FF";
        this.ctx.fillStyle = "#22B573";     //"#00E5FF";
        this.ctx.lineWidth = 2;
        
        var points = edges(this.ctx,p1,p2);
        if (points.length < 2) return 
        p1 = points[0], p2=points[points.length-1];
        
        if( this.level != 1 ){
            var dx = 6;
            var dy = 6;
            var p1a = {x:p1.x+dx, y:p1.y+dx};
            var p2a = {x:p2.x+dx, y:p2.y+dx};

            var p1b = {x:p1.x-dx, y:p1.y-dx};
            var p2b = {x:p2.x-dx, y:p2.y-dx};
            
            drawSingleArrow(this.ctx,p1a,p2a);
            drawDoubleArrow(this.ctx,p1b,p2b,dy,this.type, this.sourceBtn, this.destinationBtn);
        } else {
            drawSingleArrow(this.ctx,p1,p2);
        }   
    }   
}
