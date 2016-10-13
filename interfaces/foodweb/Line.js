function Line(n,o1,o2,c,l,t,d,sc,bg,lc){
    this.datalog = d;
    this.name = n;
    this.type = t;
    this.ctx = c;
    this.obj1 = o1;     //source
    this.obj2 = o2;     //destination
    this.x1 = o1.x + o1.width/2;
    this.y1 = o1.y + o1.height/2;
    this.x2 = o2.x + o2.width/2;
    this.y2 = o2.y + o2.height/2;
    this.height = Math.abs(this.y2 - this.y1);
    this.alpha = 1;
    this.shadowColour = sc;
    this.backgroundColour = bg;
    this.colour = lc;
    this.lastHit;
    //hit object for detecting +, -, ? symbols associated with each line
    var hit = getHitObject(this.obj1,this.obj2);
    this.x = hit.x;
    this.y = hit.y;
    this.height = hit.height;
    this.width = hit.width;

    this.EVENT_RELATIONSHIP = "relationship";
    this.EVENT_REDRAW = "redraw";

    switch (this.type){
        case "eatenby":
            this.sourceBtn = new ToggleButton("source", "minus", 0, 0, this.ctx, this.backgroundColour, this.colour);
            this.destinationBtn = new ToggleButton("destination", "plus", 0, 0, this.ctx, this.backgroundColour, this.colour);
            break;
        case "competition":
            this.sourceBtn = new ToggleButton("source", "minus", 0, 0, this.ctx, this.backgroundColour, this.colour);
            this.destinationBtn = new ToggleButton("destination", "minus", 0, 0, this.ctx, this.backgroundColour, this.colour);
            break;
        case "eats":
            this.sourceBtn = new ToggleButton("source", "plus", 0, 0, this.ctx, this.backgroundColour, this.colour);
            this.destinationBtn = new ToggleButton("destination", "minus", 0, 0, this.ctx, this.backgroundColour, this.colour);
            break;
        case "mutualism":
            this.sourceBtn = new ToggleButton("source", "plus", 0, 0, this.ctx, this.backgroundColour, this.colour);
            this.destinationBtn = new ToggleButton("destination", "plus", 0, 0, this.ctx, this.backgroundColour, this.colour);            
            break;
        case "eatsOrMutualism":
            this.sourceBtn = new ToggleButton("source", "plus", 0, 0, this.ctx, this.backgroundColour, this.colour);
            this.destinationBtn = new ToggleButton("destination", "question", 0, 0, this.ctx, this.backgroundColour, this.colour);            
            break;
        case "eatenbyOrCompetition":
            this.sourceBtn = new ToggleButton("source", "minus", 0, 0, this.ctx, this.backgroundColour, this.colour);
            this.destinationBtn = new ToggleButton("destination", "question", 0, 0, this.ctx, this.backgroundColour, this.colour);            
            break;
        case "eatenbyOrMutualism":
            this.sourceBtn = new ToggleButton("source", "question", 0, 0, this.ctx, this.backgroundColour, this.colour);
            this.destinationBtn = new ToggleButton("destination", "plus", 0, 0, this.ctx, this.backgroundColour, this.colour);            
            break;
        case "eatsOrCompetition":
            this.sourceBtn = new ToggleButton("source", "question", 0, 0, this.ctx, this.backgroundColour, this.colour);
            this.destinationBtn = new ToggleButton("destination", "minus", 0, 0, this.ctx, this.backgroundColour, this.colour);            
            break;
        case this.type == "unknown":
            this.sourceBtn = new ToggleButton("source", "question", 0, 0, this.ctx, this.backgroundColour, this.colour);
            this.destinationBtn = new ToggleButton("destination", "question", 0, 0, this.ctx, this.backgroundColour, this.colour);            
            break;
        default:
            this.sourceBtn = new ToggleButton("source", "question", 0, 0, this.ctx, this.backgroundColour, this.colour);
            this.destinationBtn = new ToggleButton("destination", "question", 0, 0, this.ctx, this.backgroundColour, this.colour);
    }

    //PRIVATE METHODS
    function getHitObject(o1,o2){
        var x;
        var y;
        var h;
        var w;
        var padding = 10;
        if ( o2.x > o1.x ){
            x = o1.x - padding;
            w = o2.x - o1.x + o2.width + padding*2;
        } else {
            x = o2.x - padding;
            w = o1.x - o2.x + o1.width + padding*2;
        }
        if ( o2.y > o1.y ){
            y = o1.y - padding;
            h = o2.y - o1.y + o1.height + padding*2;
        } else {
            y = o2.y - padding;
            h = o1.y - o2.y + o2.height + padding*2;
        }
        return {x:x, y:y, height:h, width:w};
    }
    function getLineType(source, destination){
        var type = "";
        if ( source == "minus" && destination == "plus" ){
            type = "eatenby";
        } else if ( source == "plus" && destination == "plus" ){
            type = "mutualism";
        } else if ( source == "plus" && destination == "minus" ){
            type = "eats";
        } else if ( source == "minus" && destination == "minus" ){
            type = "competition";
        } else if ( source == "plus" && destination == "question" ){
            type = "eatsOrMutualism";
        } else if ( source == "minus" && destination == "question" ){
            type = "eatenbyOrCompetition";
        } else if ( source == "question" && destination == "plus" ){
            type = "eatenbyOrMutualism";
        } else if ( source == "question" && destination == "minus" ){
            type = "eatsOrCompetition";
        } else if ( source == "question" && destination == "question" ){
            type = "unknown";
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
    function getAngle(p1,p2){
        // angle in radians
        var angleRadians = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        // angle in degrees
        var angleDeg = Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
        return angleDeg;
    }
    //function determines a new xy coordinate based on two points and a distance in px
    function getPoint(p1,p2,d){
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
        var smallerLen = d;

        // Determine the ratio between they shortened value and the full hypotenuse.
        var ratio = smallerLen / hlen;

        var smallerXLen = xlen * ratio;
        var smallerYLen = ylen * ratio;

        // The new X point is the starting x plus the smaller x length.
        var smallerX = x1 + smallerXLen;

        // Same goes for the new Y.
        var smallerY = y1 + smallerYLen;
        var smallerXY = {x: smallerX, y:smallerY};
        return smallerXY;
    }
    //function determines a new xy coordinate based on two points and a ratio (i.e., r = 0.5 returns point halfway between points given)
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
    // returns radians
    function findAngle(sx, sy, ex, ey) {
        // make sx and sy at the zero point
        return Math.atan((ey - sy) / (ex - sx));
    }
    function drawArrowhead(ctx,x,y,radians){
        ctx.save();
        ctx.fillStyle = this.colour;
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
        ctx.shadowColor= this.shadowColour;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 2;
        ctx.strokeStyle = this.colour;
        ctx.beginPath();
        ctx.moveTo(p1.x,p1.y);
        //ctx.quadraticCurveTo(control.x, control.y, p2.x, p2.y);   //sx and sy = x,y of control point
        ctx.lineTo(p2.x,p2.y);
        ctx.stroke();

        //var ang = findAngle(control.x, control.y, p2.x, p2.y);
        //var a = getAngle(p1,p2);
        //drawCurvedArrowhead(p2.x, p2.y, ang, 20, 10, ctx);
        //drawArrowhead(ctx,p2.x,p2.y,ang);
        
        // draw the ending arrowhead for straight line
        var endRadians=Math.atan((p2.y-p1.y)/(p2.x-p1.x));
        endRadians+=((p2.x>p1.x)?90:-90)*Math.PI/180;
        drawArrowhead(ctx,p2.x,p2.y,endRadians);
        
        /*
        //p1: moving obj, p2: closest obj
        // draw the ending arrowhead for curved line
        var endRadians=Math.atan((p2.y-control.y)/(p2.x-control.x));
        endRadians+=((p2.x>control.x)?90:-90)*Math.PI/180;
        drawArrowhead(ctx,p2.x,p2.y,endRadians);
        */
    }
    function findPerpendicularPoint(p1,p2,l,r,o){
        var lineID = l;
        var linePoint = getLineXY(p1,p2,r);
        var ax = linePoint.x; //p1.x;
        var bx = p2.x;
        var ay = linePoint.y;
        var by = p2.y;
        // Calculate perpendicular offset
        var dx = ax - bx;
        var dy = ay - by;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if( o ){
            var offset = o;
        } else {
            var offset = dist / 8; //length of perpendicular line
        }
        var normX = dx / dist;
        var normY = dy / dist;
        var xPerp = offset * normX;
        var yPerp = offset * normY;
        var angleInDegs = getAngle(p1,p2);
        var cx;
        var cy;
        if ( lineID == "line1" ){
            cx = ax + yPerp;
            cy = ay - xPerp;            
        } else if ( lineID == "line2" ){
            cx = ax - yPerp;
            cy = ay + xPerp;
        }
        return {x:cx,y:cy}
    }
    function findParallelPoints(p1,p2){
        var ax = p1.x;
        var bx = p2.x;
        var ay = p1.y;
        var by = p2.y;
        // Calculate perpendicular offset
        var dx = ax - bx;
        var dy = ay - by;
        var dist = Math.sqrt(dx * dx + dy * dy);
        var offset = 10;//dist / 8; //length of perpendicular line
        var normX = dx / dist;
        var normY = dy / dist;
        var xPerp = offset * normX;
        var yPerp = offset * normY;
        //assuming point B x and y are both > point A
        var cx = ax + yPerp; //C-E is one line, D-F is another
        var cy = ay - xPerp;
        var dx = ax - yPerp;
        var dy = ay + xPerp;
        var ex = bx - yPerp;
        var ey = by + xPerp;
        var fx = bx + yPerp;
        var fy = by - xPerp;
        //p1: moving obj, p2: closest obj
        var l1 = {p1:{x:cx,y:cy},p2:{x:fx, y:fy}};
        var l2 = {p1:{x:dx,y:dy},p2:{x:ex, y:ey}};
        return {line1:l1, line2:l2}
    }
    //draw parallel lines on either side of original line created by p1 and p2
    function drawDoubleArrow(ctx,p1,p2,sb,db){  //sb = sourceBtn, db = destinationBtn
        //calculate points of parallel lines
        var pp = findParallelPoints(p1,p2);
        var line1 = pp.line1;
        var line2 = pp.line2;

        //calculate control points of parallel lines
        var control1 = findPerpendicularPoint(line1.p1,line1.p2,"line1",0.5);
        var control2 = findPerpendicularPoint(line2.p1,line2.p2,"line2",0.5);

        //var lineDiff = d;       //may not need this...
        //var lineType = t;     //remove t
        // draw the line
        ctx.shadowBlur=4;
        ctx.shadowColor= this.shadowColour;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 2;
        ctx.beginPath();    //draw line1, "-" line, top
        ctx.moveTo(line1.p1.x, line1.p1.y);
        ctx.quadraticCurveTo(control1.x, control1.y, line1.p2.x, line1.p2.y);   //curved line
        //ctx.lineTo(line1.p2.x, line1.p2.y);   //straight line
        ctx.stroke();
        
        ctx.beginPath();    //draw line2, "+" line, bottom
        ctx.moveTo(line2.p1.x, line2.p1.y);
        ctx.quadraticCurveTo(control2.x, control2.y, line2.p2.x, line2.p2.y);   //curved line
        //ctx.lineTo(line2.p2.x, line2.p2.y);   //straight line
        ctx.stroke();
        /*
        //draw the starting arrowhead for straight line        
        var startRadians=Math.atan((line1.p2.y-line1.p1.y)/(line1.p2.x-line1.p1.x));
        startRadians+=((line1.p2.x>line1.p1.x)?-90:90)*Math.PI/180; //straight line
        drawArrowhead(ctx,line1.p1.x,line1.p1.y,startRadians);
        //draw the ending arrowhead for straight line
        var endRadians=Math.atan((line2.p2.y-line2.p1.y)/(line2.p2.x-line2.p1.x));
        endRadians+=((line2.p2.x>line2.p1.x)?90:-90)*Math.PI/180; 
        drawArrowhead(ctx,line2.p2.x,line2.p2.y,endRadians);
        */
        // draw the starting arrowhead for curved line
        var startRadians=Math.atan((control1.y-line1.p1.y)/(control1.x-line1.p1.x));
        startRadians+=((control1.x>line1.p1.x)?-90:90)*Math.PI/180;
        drawArrowhead(ctx,line1.p1.x,line1.p1.y,startRadians);

        // draw the ending arrowhead for curved line
        var endRadians=Math.atan((line2.p2.y-control2.y)/(line2.p2.x-control2.x));
        endRadians+=((line2.p2.x>control2.x)?90:-90)*Math.PI/180;
        drawArrowhead(ctx,line2.p2.x,line2.p2.y,endRadians);

        //draw +/- buttons
        var plusXY = findPerpendicularPoint(line2.p1,line2.p2,"line2",0.8,20); //getLineXY(line2.p1,line2.p2,0.875);
        var minusXY = findPerpendicularPoint(line1.p1,line1.p2,"line1",0.2,20); //getLineXY(line1.p1,line1.p2,0.125);
        sb.updateXY( minusXY.x-db.width/2, minusXY.y-db.height/2 );
        db.updateXY( plusXY.x-sb.width/2, plusXY.y-sb.height/2 );
        sb.draw();
        db.draw();
    }
    //PUBLIC METHODS
    this.onMouseUp = function (mouseX,mouseY) {
        var hit = "";
        if( hitTest(mouseX, mouseY, this.sourceBtn) ){
            this.sourceBtn.onMouseUp(mouseX, mouseY);
            hit = "source";
        } else if( hitTest(mouseX, mouseY, this.destinationBtn) ){
            this.destinationBtn.onMouseUp(mouseX, mouseY);
            hit = "destination";
        }
        this.type = getLineType( this.sourceBtn.symbol, this.destinationBtn.symbol );
        this.lastHit = hit;
        if ( hit == "source" || hit == "destination" ){
            this.datalog.save("FOODWEB_RELATIONSHIP","source ;"+this.obj1.name+" ;destination ;"+this.obj2.name+" ;line type ;"+this.type+" ;clicked ;"+this.lastHit+" ;ss ;"+this.sourceBtn.symbol+" ;ds ;"+this.destinationBtn.symbol);
        }
    }
    this.updateAlpha = function( v ){
        this.alpha = v;
        this.sourceBtn.updateAlpha(v);
        this.destinationBtn.updateAlpha(v);
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
    //updates the xy coordinates of the centre point of obj1 and obj2
    this.updateXY = function(){
        var o1 = this.obj1;
        var o2 = this.obj2;
        this.x1 = o1.x+o1.width/2;
        this.y1 = o1.y+o1.height/2;
        this.x2 = o2.x+o2.width/2;
        this.y2 = o2.y+o2.height/2;
        var hit = getHitObject(o1,o2);
        //console.log("hit: "+hit.x+", "+hit.y+", "+hit.height+", "+hit.width);
        this.x = hit.x;
        this.y = hit.y;
        this.height = hit.height;
        this.width = hit.width;
    }
    this.draw = function(){
        var p1 = {x:this.x1,y:this.y1};
        var p2 = {x:this.x2,y:this.y2};
        /*
        var hit = getHitObject(this.obj1,this.obj2);
        this.ctx.fillStyle = "#F44336";
        this.ctx.globalAlpha = 0.2;
        this.ctx.fillRect(hit.x, hit.y, hit.width, hit.height);
        this.ctx.globalAlpha = 1;
        */
        // arbitrary styling
        this.ctx.strokeStyle = this.colour;  //"#00E5FF";
        this.ctx.fillStyle = this.colour;     //"#00E5FF";
        this.ctx.lineWidth = 2;
        p1 = getPoint(p1,p2,50);
        p2 = getPoint(p2,p1,50);
        //if mouse over connections and "remove arrow" tool is active, set alpha tp 50%
        this.ctx.globalAlpha = this.alpha;
        drawDoubleArrow(this.ctx,p1,p2,this.sourceBtn,this.destinationBtn);
        this.ctx.globalAlpha = 1;   
    }   
}
Line.prototype = new EventDispatcher();
Line.prototype.constructor = Line;