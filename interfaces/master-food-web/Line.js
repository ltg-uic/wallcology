function Line(n,o1,o2,c,l,t,s,f,d,sc,bg,lc,v,cl){
    //tempConnection, obj1, obj2, ctx, 1, connectType, status, confirmed, data, shadowColour, backgroundColour, lineColour, thickness, claims
    this.datalog = d;
    this.name = n;
    this.type = t;      //eats, competes with, does not eat, does not compete with
    this.status = s;    //inprogress, inconflict
    this.confirmed = f; //true, false
    this.ctx = c;
    this.obj1 = o1;     //source
    this.obj2 = o2;     //destination
    this.claims = cl;
    this.x1 = o1.x + o1.width/2;
    this.y1 = o1.y + o1.height/2;
    this.x2 = o2.x + o2.width/2;
    this.y2 = o2.y + o2.height/2;
    this.height = Math.abs(this.y2 - this.y1);
    this.alpha = 1;
    this.shadowColour = sc;
    this.backgroundColour = bg;
    this.colours = lc;
    this.colour; //= lc[0];
    this.votes = v;
    this.thickness;
    this.lastHit;
    var arrowRatio = 1;   //for making arrow heads bigger
    //hit object for detecting any mouse clicks in the proximity of the line
    var hit = getHitObject(this.obj1,this.obj2);
    this.x = hit.x;
    this.y = hit.y;
    this.height = hit.height;
    this.width = hit.width;

    //for recording double clicks and taps
    var timeout;
    var lastTap = 0;

    //this.EVENT_RELATIONSHIP = "relationship";
    this.EVENT_REDRAW = "redraw";
    this.EVENT_OPENDIALOG = "openDialog";
    //this.EVENT_CONFIRM = "confirm";
    
    if ( this.status == "inconflict" ){
        this.colour = this.colours[1];
    } else if ( this.confirmed ) {
        this.colour = this.colours[2];
    } else {
        this.colour = this.colours[0];
    }
    //make line red if it's a counter claim and there's only one claim
    if( (this.type == "does not eat" || this.type == "does not compete with") && (this.claims.length == 1) ){
        //override line colour to red
        this.colour = this.colours[1];
    }
    //console.log("this.colour: "+this.colour);
    
    //translate number of votes to how thick the line is
    switch (this.votes){
        case 1:
            this.thickness = 2;
            arrowRatio = 1;
            break;
        case 2:
            this.thickness = 4;
            arrowRatio = 1;
            break;
        case 3: 
            this.thickness = 6;
            arrowRatio = 1;
            break;
        case 4: 
            this.thickness = 8;
            arrowRatio = 1.2;
            break;
        default:
            this.thickness = 10;
            arrowRatio = 1.5;
    }
    //console.log("this.votes: "+this.votes+", this.thickness: "+this.thickness);

    //PRIVATE METHODS
    //larger hit area that encompasses the line and the objects
    function getHitObject(o1,o2){
        var x;
        var y;
        var h;
        var w;
        var padding = 0;//10;
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
    //function for checking if coordinate is in polygon
    function pnpoly( nvert, vertx, verty, testx, testy ) {
        var i, j, c = false;
        for( i = 0, j = nvert-1; i < nvert; j = i++ ) {
            if( ( ( verty[i] > testy ) != ( verty[j] > testy ) ) &&
                ( testx < ( vertx[j] - vertx[i] ) * ( testy - verty[i] ) / ( verty[j] - verty[i] ) + vertx[i] ) ) {
                    c = !c;
            }
        }
        return c;
    }
    //hit test for more specific proximity of line, 10px to each side of the line itself
    function hitTest(mouseX, mouseY, hitarea){   //to is either source or destination button
        //hitarea = {line1:{x,y}, line2:{x,y}};
        //console.log("mouseX: "+mouseX+", mouseY: "+mouseY+", hitarea: "+hitarea);
        var vx = [ hitarea.line2.p1.x, hitarea.line2.p2.x, hitarea.line1.p2.x, hitarea.line1.p1.x ];
        var vy = [ hitarea.line2.p1.y, hitarea.line2.p2.y, hitarea.line1.p2.y, hitarea.line1.p1.y ];
        //console.log("x1: "+hitarea.line2.p1.x+", x2: "+hitarea.line2.p2.x+", x3: "+hitarea.line1.p2.x+", x4: "+hitarea.line1.p1.x);
        //console.log("y1: "+hitarea.line2.p1.y+", y2: "+hitarea.line2.p2.y+", y3: "+hitarea.line1.p2.y+", y4: "+hitarea.line1.p1.y);
        var hit = pnpoly( 4, vx, vy, mouseX, mouseY );
        return hit;
    }
    function getAngle(p1,p2){
        // angle in radians
        var angleRadians = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        // angle in degrees
        var angleDeg = Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
        return angleDeg;
    }
    //function determines a new xy coordinate based on two points and a distance in px (from p1 or p2?????)
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
        ctx.lineTo(5*arrowRatio,20);
        ctx.lineTo(-5*arrowRatio,20);
        ctx.closePath();
        ctx.restore();
        ctx.fill();
    }
    function drawLine(ctx,p1,p2){
        // draw the line
        ctx.shadowBlur=4;
        ctx.shadowColor= this.shadowColour;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 2;
        ctx.strokeStyle = this.colour;
        ctx.beginPath();
        ctx.moveTo(p1.x,p1.y);
        //ctx.quadraticCurveTo(control.x, control.y, p2.x, p2.y);   //sx and sy = x,y of control point
        //ctx.lineTo(p2.x,p2.y);
        ctx.lineTo(p2.x,p2.y);
        ctx.stroke();
    }
    function drawSingleArrow(ctx,p1,p2){
        //determine new p2 point so arrowhead won't overlap
        var p3 = getPoint(p2,p1,19.3649)
        // draw the line
        ctx.shadowBlur=4;
        ctx.shadowColor= this.shadowColour;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 2;
        ctx.strokeStyle = this.colour;
        ctx.beginPath();
        ctx.moveTo(p1.x,p1.y);
        ctx.lineTo(p3.x,p3.y);
        ctx.stroke();
        
        // draw the ending arrowhead for straight line
        var endRadians=Math.atan((p2.y-p1.y)/(p2.x-p1.x));
        endRadians+=((p2.x>p1.x)?90:-90)*Math.PI/180;
        drawArrowhead(ctx,p2.x,p2.y,endRadians);
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
    function getHitArea(p1,p2){
        var p3 = getPoint(p1,p2,30);
        var p4 = getPoint(p2,p1,30);
        var pp = findParallelPoints(p3,p4); //baked in 10px distance between parallel points
        var l1 = pp.line1;
        var l2 = pp.line2;
        return {line1:l1, line2:l2}
    }
    function drawHitArea(ctx,p1,p2){    
        var p3 = getPoint(p1,p2,30);
        var p4 = getPoint(p2,p1,30);
        //var pp = findParallelPoints(p1,p2);
        var pp = findParallelPoints(p3,p4); //baked in 10px distance between parallel points
        var line1 = pp.line1;
        var line2 = pp.line2;

        ctx.beginPath();    //draw line1, "-" line, top
        ctx.moveTo(line1.p1.x, line1.p1.y);
        ctx.lineTo(line1.p2.x, line1.p2.y);   //straight line
        ctx.lineTo(line2.p2.x, line2.p2.y);
        ctx.lineTo(line2.p1.x, line2.p1.y);
        ctx.lineTo(line1.p1.x, line1.p1.y);
        ctx.fillStyle = "#F44336";
        ctx.globalAlpha = 0.2;
        ctx.fill();
        ctx.globalAlpha = 1;
    }
    /*
    //DO NOT NEED THIS FUNCTION
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
        
        // //draw the starting arrowhead for straight line        
        // var startRadians=Math.atan((line1.p2.y-line1.p1.y)/(line1.p2.x-line1.p1.x));
        // startRadians+=((line1.p2.x>line1.p1.x)?-90:90)*Math.PI/180; //straight line
        // drawArrowhead(ctx,line1.p1.x,line1.p1.y,startRadians);
        // //draw the ending arrowhead for straight line
        // var endRadians=Math.atan((line2.p2.y-line2.p1.y)/(line2.p2.x-line2.p1.x));
        // endRadians+=((line2.p2.x>line2.p1.x)?90:-90)*Math.PI/180; 
        // drawArrowhead(ctx,line2.p2.x,line2.p2.y,endRadians);
        
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
    */
    /*
    function openDialog(mouseX,mouseY,o){
        //console.log("this: "+o);
        o.dispatch(o.EVENT_OPENDIALOG);

    }
    */
    function getColour(o){
        if ( o.confirmed ) {
            o.colour = o.colours[2];
        } else if ( o.status == "inconflict" ){
            o.colour = o.colours[1];
        } else if ( (o.type == "does not eat" || o.type == "does not compete with") && (o.claims.length == 1) ){
            o.colour = o.colours[1];
        } else {
            o.colour = o.colours[0];
        }
        console.log("o.status: "+o.status+", o.confirmed: "+o.confirmed+", o.colour: "+o.colour);
    }
    function toggleConfirm(o){
        oldConfirmed = o.confirmed;
        newConfirmed = !o.confirmed;
        o.confirmed = newConfirmed;
        console.log("oldConfirmed: "+oldConfirmed+", newConfirmed: "+newConfirmed);
        getColour(o);
        //o.colour = o.colours[2];
        o.draw();
        //o.dispatch(o.EVENT_REDRAW);
    }
    //PUBLIC METHODS
    this.onMouseUp = function (mouseX,mouseY,e,o) {
        var currentTime = new Date().getTime();
        var tapLength = currentTime - lastTap;
        clearTimeout(timeout);

        var p1 = {x:this.x1,y:this.y1};
        var p2 = {x:this.x2,y:this.y2}; 
        var hitArea = getHitArea(p1,p2);
        var isHitTrue = hitTest(mouseX, mouseY, hitArea);
        //console.log("onMouseUp, x: "+mouseX+", y: "+mouseY+", isHitTrue: "+isHitTrue);
        
        if( isHitTrue ){
            if (tapLength < 500 && tapLength > 0) {
                console.log("Double tap");
                toggleConfirm(o);
                //make line blue
                e.preventDefault();
            } else {
                console.log('Single Tap');
                timeout = setTimeout( function() {
                    console.log('Single Tap (timeout)');
                    //open line dialog
                    //openDialog(mouseX,mouseY,o);
                    o.dispatch(o.EVENT_OPENDIALOG);
                    clearTimeout(timeout);
                }, 500);
            }
            lastTap = currentTime;
        }
        //console.log("line e: "+e.type);
        //console.log("onMouseUp, x: "+mouseX+", y: "+mouseY);
        /*
        var p1 = {x:this.x1,y:this.y1};
        var p2 = {x:this.x2,y:this.y2}; 
        var hitArea = getHitArea(p1,p2);
        var isHitTrue = hitTest(mouseX, mouseY, hitArea);
        if (isHitTrue){
            //onsole.log("open dialog box");
            this.dispatch(this.EVENT_OPENDIALOG)
        }
        */
        /*
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
        */
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

        //drawHitArea(this.ctx,p1,p2);

        // arbitrary styling
        this.ctx.strokeStyle = this.colour;     //"#00E5FF";
        this.ctx.fillStyle = this.colour;     //"#00E5FF";
        this.ctx.lineWidth = this.thickness;
        //console.log("LINE: "+this.name+", colour: "+this.colour);
        //console.log("LINE name: "+this.name+", thickness: "+this.thickness);
        //p1 = getPoint(p1,p2,50);
        //p2 = getPoint(p2,p1,50);
        p1 = getPoint(p1,p2,30); //30 = distance from center of species object
        p2 = getPoint(p2,p1,30);
        //if mouse over connections and "remove arrow" tool is active, set alpha tp 50%
        this.ctx.globalAlpha = this.alpha;
        //drawDoubleArrow(this.ctx,p1,p2,this.sourceBtn,this.destinationBtn);
        if (this.type == "competes with" || this.type == "does not compete with"){
            //draw line
            drawLine(this.ctx,p1,p2);
        } else {
            //this.type == "eatenby";
            //drawSingleArrow(this.ctx,p1,p2);
            //this.type == "eats" || this.type == "doesnoteat";
            drawSingleArrow(this.ctx,p2,p1);    
        }
        this.ctx.globalAlpha = 1;   
    }   
}
Line.prototype = new EventDispatcher();
Line.prototype.constructor = Line;