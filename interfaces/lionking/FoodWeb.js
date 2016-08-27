function FoodWeb(){
    //Canvas for graphs
    var gcanvas = document.getElementById("canvas2");
    var gctx = gcanvas.getContext("2d");
    //Canvas for drag and drop
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");

    //Scaling a canvas with a backing store multipler
    var scaleFactor = backingScale(ctx);  
    var oldWidth = canvas.width;
    var oldHeight = canvas.height;
    var oldWidth2 = gcanvas.width;
    var oldHeight2 = gcanvas.height;

    if (scaleFactor > 1) {
        canvas.width = canvas.width * scaleFactor;
        canvas.height = canvas.height * scaleFactor;
        canvas.style.width = oldWidth + "px";
        canvas.style.height = oldHeight + "px";
        // update the context for the new canvas scale
        var ctx = canvas.getContext("2d");
        ctx.scale( scaleFactor, scaleFactor );

        gcanvas.width = gcanvas.width * scaleFactor;
        gcanvas.height = gcanvas.height * scaleFactor;
        gcanvas.style.width = oldWidth2 + "px";
        gcanvas.style.height = oldHeight2 + "px";
        // update the context for the new canvas scale
        var gctx = gcanvas.getContext("2d");
        gctx.scale( scaleFactor, scaleFactor );
    }
    
	//Drag related variables
	var dragok = false;    //for mouse events
    var startX;
    var startY;
    var mouseIsDown = 0;   //for showPos
    var canX = 0;           
    var canY = 0;

    //Setup display list
    var offsetX = canvas.offsetLeft;
    var offsetY = canvas.offsetTop;
    var displayList = new DisplayList(canvas);
    var prompt;

    //setup picker and active/work areas
    var pbpadding = 0;
    var pbwidth = 150;
    var pickerbox = {x:pbpadding,y:pbpadding,width:pbwidth, height:canvas.height-pbpadding*2};
    var pickerHit = {x:0,y:0, width:pbpadding+pickerbox.width, height:canvas.height};
    var activeHit = {
        x:pickerbox.x+pickerbox.width, 
        y:0,
        width:canvas.width-pickerbox.width-pickerbox.x,
        height:canvas.height};

    //setup objects
    var speciesNames = []; //= ["lion", "zebra"];
    var speciesSize = 100;
    var speciesMargin = 25;
    var speciesSpacing = 50;

    var levels = [
        ["lion", "zebra"], 
        ["lion", "zebra"],
        ["lion", "zebra", "leopard"],
        ["lion", "zebra", "grass", "tree"]];
    var level = new Level(1, ctx);
    var obj = [];
    var connections = [];
    var graphs = [];
    var plusButtons = [];
    var minusButtons = [];
    
    setupSpecies();
    setupLevel(1, false, levels[0]);
    draw();

    // Add eventlistener to canvas
    canvas.addEventListener("mousemove", onMouseMove, false); 
    canvas.addEventListener("mousedown", onMouseDown, false);
    canvas.addEventListener("mouseup", onMouseUp, false);
    canvas.addEventListener("touchstart", onTouchDown, false);
    canvas.addEventListener("touchmove", onTouchMove, true);
    canvas.addEventListener("touchend", onTouchUp, false);

    level.addEventListener(level.EVENT_CLICKED, onLevelClick);
    
    document.body.addEventListener("mouseup", onMouseUp, false);
    document.body.addEventListener("touchcancel", onTouchUp, false);

    //SETUP
    function setupLevel( num, minus, species ){
        clearListeners();
        removeGraphs();
        speciesNames = species;
        displayList.objectList = [];
        obj = [];
        connections = [];
        graphs = [];     
        setupSpecies();
        plusButtons = [];
        minusButtons = [];
        plusButtons = setupButtons("plus");
        if( minus ){
            minusButtons = setupButtons("minus");
        }
        prompt = new Prompt(ctx, pbwidth+20, 50, num);
        displayList.addChild(prompt);
    }
    function setupSpecies(){
        for(var i=0; i<speciesNames.length; i++){
            var name = speciesNames[i];
            var tempObj = new Species( name, 
                speciesMargin, speciesMargin+((speciesSize+speciesMargin)*i), 
                speciesSize, speciesSize, ctx );
            tempObj.addEventListener(tempObj.EVENT_CLICKED, onSpeciesClicked );
            obj.push(tempObj);
            displayList.addChild(tempObj);
        }
    }
    //Set up action buttons
    function setupButtons(type){
        var tempArr = [];
        var t = type;
        for (var i = 0; i < obj.length; i++) {
            var tempBtn = new ActionButton(ctx, t, level.getColour() );
            if( type == "plus"){
                tempBtn.addEventListener(tempBtn.EVENT_CLICKED, onActionButtonClicked);
            } else if (type == "minus"){
                tempBtn.addEventListener(tempBtn.EVENT_CLICKED, onMinusButtonClicked);
            }
            tempBtn.index = i;
            tempArr.push( tempBtn );
            displayList.addChild(tempBtn);
        }
        return tempArr;
    }
    //clear all the event listeners before removing object
    function clearListeners(){
        for (var i = 0; i < obj.length; i++) {
            var o = obj[i];
            o.removeEventListener(o.EVENT_CLICKED, onSpeciesClicked);
        }
        for (var j = 0; j<plusButtons; j++){
            var pb = plusButtons[j];
            pb.removeEventListener(pb.EVENT_CLICKED, onActionButtonClicked);
        }
        for (var k = 0; k<minusButtons; k++){
            var mb = minusButtons[k];
            mb.removeEventListener(mb.EVENT_CLICKED, onMinusButtonClicked);
        }
    }
    //remove all graphs
    function removeGraphs(){
        for (var i=0; i<graphs.length; i++){
            graphs[i].clearGraph();
        }
        gctx.clearRect(0, 0, gcanvas.width, gcanvas.height);
    }
    //EVENTLISTENERS
    function onLevelClick(e){
        //console.log("e target: " + e.target );
        //console.log("e type: " + e.type );
        //cycle through levels
        var oldlevel = level.num;
        var newlevel = oldlevel+1;
        if( newlevel > levels.length ){
            //reset
            newlevel = 1;
        }
        var mb = true;
        if( newlevel == 1 ){
            mb = false;
        }
        level.num = newlevel;
        setupLevel(newlevel, mb, levels[newlevel-1]);
        console.log("newlevel: "+newlevel);
    }
    function onSpeciesClicked(e){
        //console.log("onSpeciesClicked: "+e);
    }
    function onActionButtonClicked(e){
        //console.log("onActionButtonClicked: "+e);
        //prompt.advancePrompt();
    }
    function onMinusButtonClicked(e){
        //console.log("onMinusButtonClicked: "+e);
    }
    function onTouchUp(e){
        endMove(e.changedTouches[0].pageX, e.changedTouches[0].pageY,true);
        displayList.onMouseUp(event);
    }
    function onTouchDown(e){
        startMove(e.targetTouches[0].pageX,e.targetTouches[0].pageY,true);
    }
    function onTouchMove(e){
        if(!e)
            var e = event;
        // tell the browser we're handling this mouse event
        e.preventDefault();
        e.stopPropagation();
        moveXY(e.targetTouches[0].pageX, e.targetTouches[0].pageY);
    }
    function onMouseDown(e) {
        // tell the browser we're handling this mouse event
        e.preventDefault();
        e.stopPropagation();
        startMove(e.clientX,e.clientY,false);
    }
    // handle mouseup events
    function onMouseUp(e) {  
        // tell the browser we're handling this mouse event
        e.preventDefault();
        e.stopPropagation();
        endMove(e.clientX,e.clientY,false);
        displayList.onMouseUp(event);
    }
    // handle mouse moves
    function onMouseMove(e) {
        // if we're dragging anything...
        if(!e)
            var e = event;
        moveXY(e.clientX,e.clientY);
    }
    function moveXY(x,y){
        var newx = x;
        var newy = y;        
        canX = newx - canvas.offsetLeft;
        canY = newy - canvas.offsetTop;
        
        if (dragok) {
            // get the current mouse position
            var mx = canX;
            var my = canY;

            // calculate the distance the mouse has moved
            // since the last mousemove
            var dx = mx - startX;
            var dy = my - startY;

            // move each rect that isDragging 
            // by the distance the mouse has moved
            // since the last mousemove
            for (var i = 0; i < obj.length; i++) {
                var r = obj[i];
                if (r.isDragging) {
                    r.x += dx;
                    r.y += dy;

                }
            }
            for (var j = 0; j < connections.length; j++) {
                connections[j].updateXY();
            }
            for (var k = 0; k < plusButtons.length; k++) {
                plusButtons[k].updateXY( obj[k].x, obj[k].y );
            }
            for (var l = 0; l < minusButtons.length; l++) {
                minusButtons[l].updateXY( obj[l].x, obj[l].y );
            }
            // reset the starting mouse position for the next mousemove
            startX = mx;
            startY = my;
        }
        draw();
    }
    function startMove(x,y,isTouch){
        // get the current mouse position
        var newx = x;
        var newy = y;
        var mx = parseInt(newx - canvas.offsetLeft);
        var my = parseInt(newy - canvas.offsetTop);

        // test each obj to see if mouse is inside
        dragok = false;
        for (var i = 0; i < obj.length; i++) {
            var r = obj[i];
            if (mx > r.x && mx < r.x + r.width && my > r.y && my < r.y + r.height) {
                // if yes, set that obj isDragging=true
                dragok = true;
                r.isDragging = true;
            }
        }
        // save the current mouse position
        startX = mx;
        startY = my;
        mouseIsDown = 1;
        
        if(isTouch){
            onTouchMove();    
        } else {
            onMouseMove();
        }
    }
    function endMove(x,y,isTouch){
        var newx = x;
        var newy = y;
        mouseIsDown = 0;
        // clear all the dragging flags
        dragok = false;
        for (var i = 0; i < obj.length; i++) {
            obj[i].isDragging = false;
        }
        //detectHit 
        var mx = parseInt(newx - canvas.offsetLeft);
        var my = parseInt(newy - canvas.offsetTop);
        if(detectHit(mx,my,activeHit)){
            console.log("active");
            setActiveProperty(activeHit, true);
            for (var j = 0; j < plusButtons.length; j++) {
                //console.log("mx: "+mx + ", my: " + my + ", button.x: "+plusButtons[j].x + ", button.y: " + plusButtons[j].y + ", button.width: "+plusButtons[j].width + ", button.height: "+plusButtons[j].height);
                if( detectHit(mx,my,plusButtons[j])){
                    //console.log(obj[j].name + " button");
                    handlePopulationChange(obj[j], j, "plus");
                }
            }
            for (var k = 0; k < minusButtons.length; k++) {
                //console.log("mx: "+mx + ", my: " + my + ", button.x: "+plusButtons[j].x + ", button.y: " + plusButtons[j].y + ", button.width: "+plusButtons[j].width + ", button.height: "+plusButtons[j].height);
                if( detectHit(mx,my,minusButtons[k])){
                    //console.log(obj[j].name + " button");
                    handlePopulationChange(obj[k], k, "minus");
                }
            }
        }else if (detectHit(mx,my,pickerHit)){
            console.log("picker");
            setActiveProperty(pickerHit, false);
            resetObjPos();
             if(detectHit(mx,my,level)){
             	level.changeLevel();
             }
        } else {
            console.log("nothing");
        }
        //evaluate species - if both zebra and lion are on the map, then draw line
        evalActiveObjs();
        //if objects are on the map then draw graphs, buttons
        evalGraphs();
        mouseIsDown = 0;
        draw();
    }

    //FUNCTIONS
    //Determining a backing store multiplier
    function backingScale(context) {
        if ('devicePixelRatio' in window) {
            if (window.devicePixelRatio > 1) {
                return window.devicePixelRatio;
            }
        }
        return 1;
    }
    //Detect whether x,y position is within picker or active areas
    function detectHit(x,y,a){
        var mx = x;
        var my = y;
        var r = a;
        if (mx > r.x && mx < r.x + r.width && my > r.y && my < r.y + r.height)
            return 1;
    }
    //set active property of species objects to either true or false;
    function setActiveProperty(hitObj, isActive){
        var h = hitObj;
        var b = Boolean(isActive);
        for (var i = 0; i < obj.length; i++) {
            var s = obj[i];
            var pb = plusButtons[i];
            var mb = minusButtons[i];
            if(detectHit(s.x,s.y,h)){
                //species active
                //console.log(s.name + ".active: " + b);
                s.active = b;
                pb.active = b;
                if( mb ){
                    mb.active = b;
                }
            }
        }
    }
    //evaluate which species are active and draws line between active ones
    function evalActiveObjs(){
        //create array of false flag items for each species in the level
        /*
        var speciesActiveFlag = [];
        for (var i=0;i<speciesNames.length;i++){
            var tempFlag = false;
            speciesActiveFlag.push(tempFlag);
        }
        */
        var r = new Relationship();
        var connectionsList = r.arrows;
        var activeSpeciesList = [];

        //run through object array and find active species, if active then see if any of the other active objects have direct relationship
        for (var i=0; i<obj.length; i++){
            var s = obj[i];
            if( s.active ){
                activeSpeciesList.push( s );
            }
        }
        //ADD CONNECTION
        //first loop runs through all the active species
        for (var j=0; j<activeSpeciesList.length; j++){
            var s1 = activeSpeciesList[j];
            var tempStr;
            //second loop runs through all the active species again and creates a temporary string "X-Y" for all possibilities
            for (var k=0; k<activeSpeciesList.length;k++){
                var s2 = activeSpeciesList[k];
                tempStr = s1.name.concat("-",s2.name);
                //console.log("["+j+"]["+k+"]: "+tempStr);
                //third loop runs through list of valid connections
                for( var l=0; l<connectionsList.length;l++){
                    var tempConnection = connectionsList[l].name;
                    var connectType = connectionsList[l].type;
                    if( tempStr == tempConnection ){
                        //forth loop runs through list of established connections to see if a line has been created
                        var connectionCreated = false;
                        for( var m=0; m<connections.length; m++ ){
                            if (connections[m].name == tempConnection){
                                //no need to create connection
                                connectionCreated = true;
                            }
                        }
                        if (!connectionCreated){
                            //create connection if flag is still false
                            console.log("create connection: "+tempConnection+" between "+s1.name +" and "+s2.name);
                            var line = new Line( tempConnection, s1, s2, ctx, level.num, connectType );
                            prompt.setConnectionPrompt();
                            connections.push( line );
                            displayList.addChild( line );
                        }
                    }
                }
            }
        }
        //REMOVE CONNECTION
        //for every connection, check to see if both species are active
        //first loop runs through all the created connections
        for( var j=0; j<connections.length;j++){
            var tempConnection = connections[j].name;
            var tempObj = tempConnection.split("-");
            //second look runs through the names of species in each created connection
            for (var k=0; k<tempObj.length; k++){
                var s1 = tempObj[k];
                var speciesActive = false;
                //third loop runs through all the active species
                for (var l=0; l<activeSpeciesList.length; l++){
                    var s2 = activeSpeciesList[l].name;
                    if ( s1 == s2 ){
                        //active
                        speciesActive = true;
                    }
                }
                if(!speciesActive){
                    //one of the objects in a created connection is no longer active
                    console.log("remove connection: "+tempConnection+" b/c "+s1+" is not active.");
                    for (var m = 0; m < connections.length; m++) {
                        if( connections[m].name == tempConnection ){
                            //remove
                            displayList.removeChild( connections[j] );
                            connections.splice(j, 1);
                        }
                    }
                }
            }
        }
    }
    
    //if objects are set to picker, place them in correct pos
    function resetObjPos(){
        for (var i = 0; i < obj.length; i++) {
            var s = obj[i];
            if(!s.active){
                s.x = s.px;
                s.y = s.py;
            } 
        }
    }
    //Graphing
    //if objects are active, draw graph, add buttons
    function evalGraphs(){
        //console.log("evalGraphs")
        //console.log("graphs.length: "+graphs.length);
        /*
        for (var l = 0; l < graphs.length; l++) {
            console.log("graphs["+l+"]: "+graphs[l].name);
        }
        */
        for (var i = 0; i < obj.length; i++) {
            var s = obj[i];
            if( s.active ){
                //drawGraph(s, graphs.length);
                var isGraph = false;
                for (var j = 0; j < graphs.length; j++) {
                    var g = graphs[j];
                    if (s.name == g.name){
                        //then there is already a graph
                        isGraph = true;
                    }
                }
                if(!isGraph){
                    //addGraph
                    var graph = new BarGraph(gctx, s);
                    var data = new GraphData();
                    graph.curArr = data.baseline;
                    graphs.push(graph);
                }
            } else {
                //if s.active is false but there is a graph, remove it
                for (var k = 0; k < graphs.length; k++) {
                    var g = graphs[k];
                    if (s.name == g.name){
                        //then there is already a graph
                        //console.log("remove graph: " + s.name );
                        graphs.splice(k, 1);
                    }
                }
            }
        }
        //draw graphs
        //console.log("graphs.length: " + graphs.length);
        //if (graphs.length == 0){
            //clear canvas
        gctx.clearRect(0, 0, gcanvas.width, gcanvas.height);
        var total = graphs.length
        resizeGraphCanvas( total );

        for (var m = 0; m < graphs.length; m++) {
            graphs[m].drawBarGraph(m);
        }
        //}
    }
    function handlePopulationChange( obj, num, type ){
        
        var direction = type; //"plus" or "minus"
        var newdata = new GraphData();
        var r = new Relationship();
        var rArr = [];

        console.log("update graph: "+obj.name+" "+direction);
        //get array of relationships for object clicked
        for( var j=0; j<r.graphs.length; j++){
            if( obj.name == r.graphs[j].name){
                if ( type == "plus" ){
                    rArr = r.graphs[j].increase;
                    prompt.setText("What happens to the other species' population if the "+ obj.name + " population doubles? (A) Goes up, (B) Goes down, (C) Stays the same. Click 'run' to test your theory.");
                } else if ( type == "minus" ){
                    rArr = r.graphs[j].decrease;
                    prompt.setText("What happens to the other species' population if the " + obj.name + " population decreases? (A) Goes up, (B) Goes down, (C) Stays the same. Click 'run' to test your theory.");
                }
            }    
        }
        
        //loops through all the graphs being displayed
        for(var i=0; i<graphs.length; i++){
            var graph = graphs[i];
            //replace data for object clicked's graph
            if( graph.name == obj.name ){   
                var id = i;
                if ( type == "plus" ){
                    graph.replace( newdata.increase, id );
                } else if ( type == "minus" ){
                    graph.replace( newdata.decrease, id );
                }
            } else {
                //replace data for linked objects' graphs
                for( var k=0; k<rArr.length; k++){
                    if( rArr[k].name == graph.name ){
                        //update graph only if species are connected, otherwise, add baseline data
                        var connectionList = rArr[k].connections;
                        var connectedList = [];
                        console.log("connectionList.length: "+connectionList.length);
                        for( var l=0; l<connectionList.length; l++ ){
                            var c = false;
                            console.log("checking "+connectionList[l]+" connection");
                            for( var m=0; m<connections.length; m++ ){
                                if( connectionList[l] == connections[m].name ){
                                    //there is a connection
                                    console.log(connections[m].name+" is present");
                                    c = true;
                                }
                            }
                            connectedList.push(c);
                        }
                        var connected = true;
                        for ( var n=0; n<connectedList.length; n++ ){
                            //if both are true then update graph according to relationship 
                            if( !connectedList[n] ){
                                connected = false;
                            }
                        }
                        var result;
                        var data2 = new GraphData();
                        if ( connected ){
                            console.log(graph.name+"'s graph updated: " + rArr[k].result);
                            //console.log("rArr.result: "+ rArr[k].result );
                            if( rArr[k].result == "laggeddecrease" ){
                                result = data2.laggeddecrease;
                            } else if ( rArr[k].result == "laggedincrease" ){
                                result = data2.laggedincrease;
                            }
                        } else {
                            result = data2.baseline; 
                            console.log(graph.name+"'s graph updated: baseline");
                        }
                        graph.replace( result, i );
                    }
                }
            }             
        }
    }
    function resizeGraphCanvas( total ){
        /*
        if( graphs.length > 0 ){
            var totalGraphs = total;
            var graphHeight = graphs[0].height;
            
            if ( gctx.canvas.height < graphHeight * scaleFactor * totalGraphs){
                //gctx.canvas.height += graphHeight * totalGraphs;
                console.log("gtx needs to be: " + (graphHeight * scaleFactor * totalGraphs)+ " but is: "+gctx.canvas.height);
            }  
            console.log("total: " + total+", graphHeight: "+graphs[0].height+" gctx.height: "+gctx.canvas.height);
        } else {
            gctx.canvas.height = 0;
        }
        /*        
        if( total > 0 ){
            var totalGraphs = total;
            var graphHeight = graphs[0].height;
            if ( gctx.canvas.height !== graphHeight * totalGraphs ){
                gctx.canvas.height = graphHeight * totalGraphs;
            }
        } else {
            gctx.canvas.height = 0;
        }
        */
        
    }
    function draw() {
        canvas = document.getElementById("canvas");
        var ctx = canvas.getContext('2d');
        // Clear canvas
        //ctx.clearRect(0, 0, canvas.width, canvas.height);
        //ctx.fillStyle = "#FAF7F8";
        //ctx.fillRect(0, 0, canvas.width, canvas.height);
        //showPos
        ctx.font = "24pt Helvetica";
        ctx.shadowBlur=0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "rgb(64,255,64)";
        var str = canX + ", " + canY;
        if (mouseIsDown)
            str += " down";
        if (!mouseIsDown)
            str += " up";
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        /*
        // draw text at center, max length to fit on canvas
        ctx.fillText(str, (canvas.width/2)/scaleFactor, (canvas.height/2)/scaleFactor, canvas.width - 10);
        // plot cursor
        ctx.fillStyle = "blue";//"white";
        ctx.fillRect(canX -5, canY -5, 10, 10);
        */
        //Draw picker box
        ctx.fillStyle = "#DBDADA";
        ctx.shadowBlur=0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0
        ctx.fillRect(pickerbox.x,pickerbox.y,pickerbox.width,pickerbox.height);
        // Draw level badge
        ctx.globalAlpha = 1;
        level.draw();        
        displayList.draw();
    }
}