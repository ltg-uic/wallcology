function FoodWeb(){
    //Nutella 
    var mode = "deploy"; //"develop" or "deploy"

    if ( mode == "deploy"){
        var query_parameters = NUTELLA.parseURLParameters();
        var nutella = NUTELLA.init(query_parameters.broker, query_parameters.app_id, query_parameters.run_id, NUTELLA.parseComponentId());
    }

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
    
    var cW = window.innerWidth;
    var cH = window.innerHeight;
    
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
    var speciesNames = []; 
    var speciesSize = 100;
    var speciesMargin = 25;
    var speciesSpacing = 50;

    var levels = [
        ["green", "yellow", "orange", "pink"], 
        ["lion", "zebra"],
        ["lion", "zebra", "leopard"],
        ["lion", "zebra", "grass", "tree"]];
    var level = new Level(1, ctx);
    var obj = [];
    var connections = [];
    var movingConnections = [];
    var graphs = [];
    var plusButtons = [];
    var minusButtons = [];
    var multipleChoice = [];
    
    initalizeDataCollection();
    setupSpecies();
    setupLevel(1, true, levels[0]);
    setTimeout(draw, 1000);

    // Add eventlistener to canvas
    canvas.addEventListener("mousemove", onMouseMove, false); 
    canvas.addEventListener("mousedown", onMouseDown, false);
    canvas.addEventListener("mouseup", onMouseUp, false);
    canvas.addEventListener("touchstart", onTouchDown, false);
    canvas.addEventListener("touchmove", onTouchMove, true);
    canvas.addEventListener("touchend", onTouchUp, false);
    
    document.body.addEventListener("mouseup", onMouseUp, false);
    document.body.addEventListener("touchcancel", onTouchUp, false);

    //SETUP
    function initalizeDataCollection(){
        //group: query_parameters.INSTANCE
        if ( mode == "deploy"){
            nutella.net.publish('add_to_lionking_log',['Group '+query_parameters.INSTANCE+': log entry 1']);
            nutella.net.publish('add_to_lionking_log',['Group 2: log entry 2','Group 4: log entry 3']);
        } else {
            console.log("initalizeDataCollection");    
        }
    }
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
        prompt = new Prompt(ctx, pbwidth+20, 20, num);
        prompt.addEventListener(prompt.EVENT_CLICKED, onPromptClicked);
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
            /*
            if( type == "plus"){
                tempBtn.addEventListener(tempBtn.EVENT_CLICKED, onPlusButtonClicked);
            } else if (type == "minus"){
                tempBtn.addEventListener(tempBtn.EVENT_CLICKED, onMinusButtonClicked);
            }
            */
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
        /*
        for (var j = 0; j<plusButtons; j++){
            var pb = plusButtons[j];
            pb.removeEventListener(pb.EVENT_CLICKED, onPlusButtonClicked);
        }
        for (var k = 0; k<minusButtons; k++){
            var mb = minusButtons[k];
            mb.removeEventListener(mb.EVENT_CLICKED, onMinusButtonClicked);
        }
        */
        for (var l=0; l<multipleChoice.length; l++){
            var mc = multipleChoice[l];
            mc.removeEventListener(mc.EVENT_REDRAW, handleRedraw);
            mc.removeEventListener(mc.EVENT_CLICKED, onMultipleChoiceClick);
        }
       if( prompt ){
            prompt.removeEventListener(prompt.EVENT_CLICKED, onPromptClicked);
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
    /*
    function onLevelClick(e){
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
    }
    */
    function onMultipleChoiceClick(e){
        var sp;
        var num;
        var type;
        for(var i=0; i<multipleChoice.length; i++){
            var mc = multipleChoice[i];
            var arr = mc.getSelectionArray();
            for(var j=0; j<arr.length; j++){
                var item = arr[j];
                console.log("name: "+item.name+", selection: "+item.selection); 
                sp = item.species;
                num = item.num;
                type = item.type;
            }
            displayList.removeChild( mc );
            mc.removeEventListener(mc.EVENT_REDRAW, handleRedraw);
            mc.removeEventListener(mc.EVENT_CLICKED, onMultipleChoiceClick);
            mc = {};
            multipleChoice.splice(i, 1);
        }
        handlePopulationChange( sp, num, type );
        draw();
    }
    function handleRedraw(e){
        draw();   
    }
    function onPromptClicked(e){
        //console.log("onPromptClicked: "+e);
    }
    function onSpeciesClicked(e){
        //console.log("onSpeciesClicked: "+e);
    }
    /*
    function onPlusButtonClicked(e){
        console.log("onPlusButtonClicked: "+e);
        //prompt.advancePrompt();
    }
    function onMinusButtonClicked(e){
        console.log("onMinusButtonClicked: "+e);
    }
    */
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
                    //create function to make temporary lines, only if there are more than 2 active objects
                    var activeObj = getActiveObj();
                    if ( activeObj.length >= 1 && !r.active){
                        setupMovingConnections(r);
                    }
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
                if( detectHit(mx,my,plusButtons[j])){
                    setupPopulationChange(obj[j], j, "plus");
                }
            }
            for (var k = 0; k < minusButtons.length; k++) {
                if( detectHit(mx,my,minusButtons[k])){
                    setupPopulationChange(obj[k], k, "minus");
                }
            }
        }else if (detectHit(mx,my,pickerHit)){
            console.log("picker");
            setActiveProperty(pickerHit, false);
            resetObjPos();
        } else {
            console.log("nothing");
        }
        setConnection();
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
                s.active = b;
                pb.active = b;
                if( mb ){
                    mb.active = b;
                }
            }
        }
    }
    function getActiveObj(){
        var activeSpeciesList = [];
        for (var i=0; i<obj.length; i++){
            var s = obj[i];
            if( s.active ){
                activeSpeciesList.push( s );
            }
        }
        return activeSpeciesList;
    }
    function setConnection(){
        var activeObjList = getActiveObj();
        for ( var i=0; i<movingConnections.length; i++){
            var movingConnection = movingConnections[i];
            connections.push( movingConnection );
        }
        movingConnections = [];
    }
    function setupMovingConnections( o ){
        //console.log("moving: " + o.name);
        var movingObj = o;
        var activeObjList = getActiveObj();
        //create a line between closest obj and moving obj
        var closestObj = getClosestObj( movingObj, activeObjList );
        if ( closestObj ){
            if ( closestObj.name == movingObj.name ){
                return;
            }
            var tempConnection = movingObj.name+"-"+closestObj.name;
            var connectType = "eatenby"
            var line = new Line( tempConnection, movingObj, closestObj, ctx, level.num, connectType );
            for( var j=0; j<movingConnections.length;j++){
                //console.log( "connection removed: "+movingConnections[j].name );
                displayList.removeChild( movingConnections[j] );
                movingConnections.splice(j, 1);
            }
            movingConnections.push(line);
            displayList.addChild( line );
            //console.log("closest: "+ closestObj.name );
        }
    }
    function getClosestObj( moving, objList ){
        var movingObj = moving;
        var activeObjList = objList;
        var shortestDist;
        var closestObj;
        //calculate distance from other active objects and moving object
        for (var i=0; i<activeObjList.length; i++){
            var activeObj = activeObjList[i];
            var dist = getDistance( movingObj, activeObj );
            if ( shortestDist ){
                if ( dist < shortestDist ){
                    shortestDist = dist;
                    closestObj = activeObj;
                }
            } else {
                shortestDist = dist;
                closestObj = activeObj;
            }
        }
        return closestObj;
    }
    function getDistance( o1, o2 ){
        var obj1 = o1;
        var obj2 = o2;
        var x1 = obj1.x;
        var x2 = obj2.x;
        var y1 = obj1.y;
        var y2 = obj2.y;
        // Determine line lengths
        var xlen = x2 - x1;
        var ylen = y2 - y1;
        // Determine hypotenuse length
        var hlen = Math.sqrt(Math.pow(xlen,2) + Math.pow(ylen,2));
        return hlen;  
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
        for (var i = 0; i < obj.length; i++) {
            var s = obj[i];
            if( s.active ){
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
                        graphs[k].clearGraph();
                        graphs.splice(k, 1);
                    }
                }
            }
        }
        //draw graphs
        //clear canvas
        gctx.clearRect(0, 0, gcanvas.width, gcanvas.height);
        var total = graphs.length
        resizeGraphCanvas( total );

        for (var m = 0; m < graphs.length; m++) {
            graphs[m].drawBarGraph(m);
        }
    }
    function setupPopulationChange(  species, num, type  ){
        var direction = type; //"plus" or "minus"
        var newdata = new GraphData();
        
        //find out if graphs are running
        for(var i=0; i<graphs.length; i++){
            var graphsRunning = graphs[i].getRunning();
            //console.log("graphs["+o+"] running: "+ graphsRunning );
            if( graphsRunning ){
                //write a message to let users know that graphs are running
                prompt.setText("Populations are in flux. Wait until they are stabilized to continue manipulation.")
                return;
            }
        }
        //find out if more than one species are on work area
        var activeObjList = getActiveObj();
        var activeObjNum = activeObjList.length;
        //if there's only one species, then change population
        if ( activeObjNum == 1 ){
            if ( type == "plus" ){
                prompt.setText("What happens to the population of the other circles if the "+ species.name + " population increases? Drag another circle into the work area.");
            } else if ( type == "minus" ){
                prompt.setText("What happens to the population of the other circles if the " + species.name + " population decreases? Drag another circle into the work area.");
            }
            for(var k=0; k<graphs.length; k++){
                var graph = graphs[k];
                //replace data for object clicked's graph
                if( graph.name == species.name ){   
                    var id = k;
                    if ( direction == "plus" ){
                        graph.replace( newdata.increase, id );
                    } else if ( direction == "minus" ){
                        graph.replace( newdata.decrease, id );
                    }
                }
            }
        } else {    //if there are more than one species
            if ( type == "plus" ){
                prompt.setText("What happens to the population of the other circle(s) if the "+ species.name + " population increases? (A) Goes up, (B) Goes down, (C) Stays the same. Make your selection and click 'run' to test your theory.");
            } else if ( type == "minus" ){
                prompt.setText("What happens to the population of the other circle(s) if the " + species.name + " population decreases? (A) Goes up, (B) Goes down, (C) Stays the same. Make your selection and click 'run' to test your theory.");
            }
            var namesArr = [];
            for(var l=0; l<graphs.length; l++){
                var graph = graphs[l];
                if ( graph.name != species.name ){
                    namesArr.push(graph.name)
                }
            }
            //setup multple choice and prompts
            var mc = new MultipleChoice( namesArr, pbwidth, cH, ctx, species, num, direction, level.getColour() );
            mc.addEventListener(mc.EVENT_REDRAW, handleRedraw);
            mc.addEventListener(mc.EVENT_CLICKED, onMultipleChoiceClick);
            displayList.addChild(mc);
            multipleChoice.push(mc);
        }
        //set delay to draw 1/2 second from now to load multiple choice items
        setTimeout(draw, 500);
    }
    function handlePopulationChange( object, num, type ){
        var direction = type; //"plus" or "minus"
        var data1 = new GraphData();
        //loops through all the graphs being displayed
        for(var i=0; i<graphs.length; i++){
            var graph = graphs[i];
            //replace data for object clicked's graph
            var id = i;
            if( graph.name == object.name ){   
                if ( type == "plus" ){
                    graph.replace( data1.increase, id );
                } else if ( type == "minus" ){
                    graph.replace( data1.decrease, id );
                }
            } else {
                //find out relationship between object and graph target, should return
                //"goes up", "goes down", or "same"
                var r = getRelationship( object.name , graph.name, direction );
                //console.log("r: "+ r);
                var data2 = new GraphData();
                var dataset;
                switch (r){
                    case "goes up":
                        dataset = data2.laggedincrease;
                        break;
                    case "goes down":
                        dataset = data2.laggeddecrease;
                        break;
                    case "same":
                        dataset = data2.baseline;
                        break;
                    default:
                        dataset = data2.baseline;
                }
                graph.replace( dataset, id );
            }
        }
    }
    //returns 1, -1, or 0
    function getMultiplier( object, connection, direction ){
        var c = connection;
        var type = c.type;
        var object = object;
        var result;
        //direct relationship, return connection
        if ( object == c.obj1.name ){
            if ( type == "eatenby" ){
                if ( direction == "plus" ){
                    result = 1;
                } else {    //direction == "minus"
                    result = -1;
                }
            } else if ( type == "competition" ){
                if ( direction == "plus" ){
                    result = -1;
                } else {    //direction == "minus"
                    result = 1;
                }
            } else if ( type == "eats" ){
                if ( direction == "plus" ){
                    result = -1;
                } else {    //direction == "minus"
                    result = 1;
                }
            } else if ( type == "mutualism" ){
                if ( direction == "plus" ){
                    result = 1;
                } else {    //direction == "minus"
                    result = -1;
                }
            }
        } else if ( object == c.obj2.name ){
            if ( type == "eatenby" ){
                if ( direction == "plus" ){
                    result = -1;
                } else {    //direction == "minus"
                    result = 1;
                }
            } else if ( type == "competition" ){
                if ( direction == "plus" ){
                    result = -1;
                } else {    //direction == "minus"
                    result = 1;
                }
            } else if ( type == "eats" ){
                if ( direction == "plus" ){
                    result = 1;
                } else {    //direction == "minus"
                    result = -1;
                }
            } else if ( type == "mutualism" ){
                if ( direction == "plus" ){
                    result = 1;
                } else {    //direction == "minus"
                    result = -1;
                }
            }
        } 
        return result;
    }
    //returns "goes up", "goes down", or "same" or 1, -1, 0
    //direction: "plus" or "minus"
    function getRelationship( name1, name2, direction ){
        //var r = [];
        var clicked = name1;
        var graph = name2; 
        var effects = [];
        var result = ""; 
        var index = 0;

        var r = getDirectRelationship( clicked, graph );     
        //console.log( name1 + " & " + name2 + ", direct: " + r.direct );
        if ( r.direct ){
            var c = r.connection;
            effects.push( getMultiplier( clicked, c, direction ));
            index =  getMultiplier( clicked, c, direction );
            //console.log("if "+clicked+" "+ direction+" then "+graph+" "+effects[effects.length-1]);
        } else {
            //test for secondary connection
            var r2;
            var connectedList = r.connection;
            for (var i=0; i<connectedList.length; i++){
                var connected = connectedList[i];
                var source = connected.obj1;
                var destination = connected.obj2;
                var testObj;
                //one of the direct connections of clicked
                if( clicked == source.name ){
                    testObj = destination.name;         
                } else if ( clicked == destination.name ){
                    testObj = source.name;
                }
                var m = getMultiplier( clicked, connected, direction );
                effects.push( m );
                r2 = getDirectRelationship( testObj, graph );
                //console.log( name1 + " & " + name2 + ", secondary: " + r2.direct );
                if ( r2.direct ){
                    //get multiplier and translate it into d2 (direction2)
                    var d2 = translateMultiplier( m );
                    effects.push( getMultiplier( testObj, r2.connection, d2 ));
                    index = getMultiplier( testObj, r2.connection, d2 );
                    //console.log("if "+testObj+" "+ d2+" then "+graph+" "+effects[effects.length-1]);
                } else {                    
                    //test for teritary connection
                    var r3;
                    var connectedList2 = r2.connection;
                    for (var j=0; j<connectedList2.length; j++){
                        var connected2 = connectedList2[j];
                        var source2 = connected2.obj1;
                        var destination2 = connected2.obj2;
                        var testObj2;
                        //one of the direct connections of testObj
                        if( testObj == source2.name ){
                            testObj2 = destination2.name;         
                        } else if ( testObj == destination2.name ){
                            testObj2 = source2.name;
                        }
                        var d2 = translateMultiplier( m );
                        var m2 = getMultiplier( testObj, connected2, d2 );
                        effects.push( m2 );
                        r3 = getDirectRelationship( testObj2, graph );
                        //console.log( name1 + " & " + name2 + ", teritary: " + r3.direct );
                        if ( r3.direct ){
                            //get multiplier and translate it into d2 (direction2)
                            var d3 = translateMultiplier( m2 ); //====> WRONG, but d3 and m2 wrong
                            //console.log("testObj: " + testObj + ", connected2: "+connected2+" , d2: "+d2);
                            effects.push( getMultiplier( testObj2, r3.connection, d3 ));
                            index = getMultiplier( testObj2, r3.connection, d3 );
                            //console.log("if "+testObj2+" "+ d3+" then "+graph+" "+effects[effects.length-1]);
                        } else {
                            //test for quartary connection
                        }
                    }
                    
                }
            }
        }
        /*
        var directEffect = effects[effects.length-1];
        for (var k=0; k<effects.length; k++){
            console.log("effects["+k+"]: "+effects[k]);
        }

        console.log("index: "+index);*/
        switch (index){
            case 1:
                result = "goes up";
                break;
            case -1:
                result = "goes down";
                break;
            case 0:
                result = "same";
                break;
            default:
                result = "error";
        }
        console.log( "clicked "+clicked+" "+direction+": "+ graph + " " + result);
        return result;
    }
    function getDirectRelationship( name1, name2 ){
        var relationship = {};
        var directConnections = [];

        for ( var i=0; i<connections.length; i++ ){
            var c = connections[i];
            var source = c.obj1;
            var destination = c.obj2;
            if( (name1 == source.name || name1 == destination.name) && 
                (name2 == source.name || name2 == destination.name) ){
                //direct relationship
                relationship = {direct: true, connection: c};
                return relationship;
            } else {
                //not direct, return direct relationships of obj1
                if (name1 == source.name || name1 == destination.name){
                    //it is a direct connection of obj1
                    directConnections.push(c)
                }
            }
        }
        relationship = {direct: false, connection: directConnections};
        return relationship;
    }
    function translateMultiplier( m ){
        var direction = "";
        //var multiplier = m;
        switch ( m ){
            case 1:
                direction = "plus";
                break;
            case -1:
                direction = "minus";
                break;
            default:
                direction = "error";
        }
        return direction;
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
        //level.draw();        
        displayList.draw();
    }
}