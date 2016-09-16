//MODELER
function FoodWeb(){
    //Nutella 
    var mode = "deploy"; //"develop" or "deploy"
    var fullscreen = false;
    var app = "modeler";
    var background = "dark";
    this.versionID = "20160916-1146f";

    var query_parameters;
    var nutella;
    if ( mode == "deploy"){
        query_parameters = NUTELLA.parseURLParameters();
        nutella = NUTELLA.init(query_parameters.broker, query_parameters.app_id, query_parameters.run_id, NUTELLA.parseComponentId());
    } else {
        query_parameters = { INSTANCE: "null" };
    }
    WebFont.load({
        google: {
          families: ['Droid Sans', 'Roboto']
        }
    });

    var cW;
    var cH;
    var gcanvas;
    var gctx;
    var canvas;
    var ctx;
    var scaleFactor;
    var oldWidth;   //canvas width before retina screen resize
    var oldHeight;
    var oldWidth2;
    var oldHeight2;

    //Setup display list
    var offsetX; 
    var offsetY; 
    var displayList; 
    var prompt;

	//Drag related variables
	var dragok = false;    //for mouse events
    var startX;
    var startY;
    var mouseIsDown = 0;   //for showPos
    var canX = 0;           
    var canY = 0;

    //setup palette and work areas
    var paletteColour = "#2B323F";
    var buttonColour = "#FF5722";
    var backgroundColour; 
    var shadowColour;

    var pbpadding = 0;
    var pbwidth = 150;
    var pickerbox;
    var pickerHit;
    var activeHit;

    //setup objects
    var speciesNames = []; 
    var speciesSize = 100;
    var speciesMargin = 25;
    var speciesSpacing = 50;

    var levels = [["triangle", "square", "circle", "diamond"]];
    var level;
    var obj = [];
    var connections = [];
    var movingConnections = [];
    var graphs = [];
    var plusButtons = [];
    var minusButtons = [];
    var multipleChoice = [];
    var data;
    
    onResizeWindow("init");
    loadColours( background );
    initDataCollection();
    setupSpecies();
    setupLevel(1, true, levels[0], oldWidth, oldHeight);

    // Add eventlistener to canvas
    canvas.addEventListener("mousemove", onMouseMove, false); 
    canvas.addEventListener("mousedown", onMouseDown, false);
    canvas.addEventListener("mouseup", onMouseUp, false);
    canvas.addEventListener("touchstart", onTouchDown, false);
    canvas.addEventListener("touchmove", onTouchMove, true);
    canvas.addEventListener("touchend", onTouchUp, false);
    
    document.body.addEventListener("mouseup", onMouseUp, false);
    document.body.addEventListener("touchcancel", onTouchUp, false);

    window.addEventListener("orientationchange", onResizeWindow);

    //SETUP
    function initDataCollection(){
        data.save("MODELER_INIT",this.versionID+"; window.innerWidth; "+oldWidth+"; window.innerHeight; "+oldHeight);
    }
    function loadColours( background ){
        if ( background == "dark" ){
            backgroundColour = "#3d5168";
            shadowColour = "#253240";
            lineColour = "#CDDC39";
        } else {
            backgroundColour = "#FFFFFF";
            shadowColour = "#BFBFBF";
            lineColour = "#CDDC39";
        }
    }
    function setupLevel( num, minus, species, cw, ch ){
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
        prompt = new Prompt(ctx, pbwidth+20, 20, cw, ch, num, background);
        displayList.addChild(prompt);
        setTimeout(draw, 500);
    }
    function setupSpecies(){
        for(var i=0; i<speciesNames.length; i++){
            var name = speciesNames[i];
            var tempObj = new Species( name, 
                speciesMargin, speciesMargin+((speciesSize+speciesMargin)*i), 
                speciesSize, speciesSize, ctx, shadowColour );
            obj.push(tempObj);
            displayList.addChild(tempObj);
        }
        draw();
    }
    //Set up action buttons
    function setupButtons(type){
        var tempArr = [];
        var t = type;
        for (var i = 0; i < obj.length; i++) {
            var tempBtn = new ActionButton(ctx, t, buttonColour, shadowColour, backgroundColour );
            tempBtn.index = i;
            tempArr.push( tempBtn );
            displayList.addChild(tempBtn);
        }
        return tempArr;
    }
    //clear all the event listeners before removing object
    function clearListeners(){
        for (var l=0; l<multipleChoice.length; l++){
            var mc = multipleChoice[l];
            mc.removeEventListener(mc.EVENT_REDRAW, handleRedraw);
            mc.removeEventListener(mc.EVENT_CONTINUE, onMCcontinueClick);
            mc.removeEventListener(mc.EVENT_CLICKED, onMultipleChoiceClick);
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
    function onResizeWindow( i ){
        cW = 1000;
        cH = 680;  
        //cW = window.innerWidth;
        //cH = window.innerHeight;
        console.log("window.innerHeight: "+cH+", window.innerWidth: "+cW);
        //Canvas for graphs
        gcanvas = document.getElementById("graphs-layer");
        gctx = gcanvas.getContext("2d");
        //Canvas for drag and drop
        canvas = document.getElementById("ui-layer");
        ctx = canvas.getContext("2d");

        //allow for top wallcology buttons and left margin if mode is set to "deploy"
        if ( fullscreen ){
            canvas.width = cW;
            canvas.height = cH
            gcanvas.width = cW;
            gcanvas.height = cH
        } else if ( !fullscreen ){
            var distFromTop = 58;
            var distFromLeft = 40;
            canvas.width = cW-distFromLeft;
            canvas.height = cH-distFromTop;
            gcanvas.width = cW-distFromLeft;
            gcanvas.height = cH-distFromTop;
        }

        //Scaling a canvas with a backing store multipler
        scaleFactor = backingScale(ctx);  
        oldWidth = canvas.width;
        oldHeight = canvas.height;
        oldWidth2 = gcanvas.width;
        oldHeight2 = gcanvas.height;

        if (scaleFactor > 1) {
            canvas.width = canvas.width * scaleFactor;
            canvas.height = canvas.height * scaleFactor;
            canvas.style.width = oldWidth + "px";
            canvas.style.height = oldHeight + "px";
            // update the context for the new canvas scale
            ctx.scale( scaleFactor, scaleFactor );

            gcanvas.width = gcanvas.width * scaleFactor;
            gcanvas.height = gcanvas.height * scaleFactor;
            gcanvas.style.width = oldWidth2 + "px";
            gcanvas.style.height = oldHeight2 + "px";
            // update the context for the new canvas scale
            gctx.scale( scaleFactor, scaleFactor );
        }

        if ( i == "init" ){
            offsetX = canvas.offsetLeft;
            offsetY = canvas.offsetTop;
            displayList = new DisplayList(canvas);
            pickerbox = {x:pbpadding,y:pbpadding,width:pbwidth, height:canvas.height-pbpadding*2};
            pickerHit = {x:0,y:0, width:pbpadding+pickerbox.width, height:canvas.height};
            activeHit = {
                x:pickerbox.x+pickerbox.width, 
                y:0,
                width:canvas.width-pickerbox.width-pickerbox.x,
                height:canvas.height};
            level = new Level(1, ctx);
            data = new DataLog( nutella, app, query_parameters.INSTANCE, mode );
        } else {
            for( var j=0; j<graphs.length; j++ ){
                var g = graphs[j];
                g.x = oldWidth2 - g.width;
                g.drawBarGraph(j);
            }
            if ( prompt ){
                prompt.setMaxWidth( oldWidth );
            }
            for (var k=0; k<multipleChoice.length; k++){
                var mc = multipleChoice[k];
                mc.setCanvasWidthHeight( oldWidth, oldHeight );
            }
            data.save("MODELER_ORIENTATION","window.innerWidth; "+oldWidth+"; window.innerHeight; "+oldHeight);
        }
        setTimeout(draw, 500);
    }
    function onMCcontinueClick(e){
        //console.log("onMCcontinueClick");
        for(var i=0; i<multipleChoice.length; i++){
            var mc = multipleChoice[i];
            displayList.removeChild( mc );
            mc.removeEventListener(mc.EVENT_REDRAW, handleRedraw);
            mc.removeEventListener(mc.EVENT_CLICKED, onMultipleChoiceClick);
            mc.removeEventListener(mc.EVENT_CONTINUE, onMCcontinueClick);
            mc = {};
            multipleChoice.splice(i, 1);
        }
        draw();   
    }
    function onMultipleChoiceClick(e){
        //console.log("onMultipleChoiceClick");   
        var sp;
        var num;
        var type;
        prompt.setText(" ");
        for(var i=0; i<multipleChoice.length; i++){
            var mc = multipleChoice[i];
            //console.log("mc.STATE: "+mc.STATE);
            var arr = mc.getSelectionArray();
            for(var j=0; j<arr.length; j++){
                var item = arr[j];
                data.save("MODELER_MC_RUN","object ;"+item.species.name+" ;direction ;"+item.type+" ;graph ;"+item.name+" ;select ;"+item.selection);
                //console.log("name: "+item.name+", selection: "+item.selection); 
                sp = item.species;
                num = item.num;
                type = item.type;
            }
            handlePopulationChange( sp, num, type );
        }
        draw();
    }
    function handleRedraw(e){
        draw();   
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
        canX = newx; //- canvas.offsetLeft;
        canY = newy; //- canvas.offsetTop;
        
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
            var o = obj[i];
            var to;
            var from;
            if( obj[i].isDragging ){
                //prompt.setText(" ");
                if( detectHit(newx,newy,activeHit)){
                    setActiveProperty(activeHit, true);
                    if ( o.active ){
                        //then just moving around
                        to = "active";
                        from = "active";
                    } else {
                        //then moving from palette to active
                        to = "active";
                        from = "palette";
                    }
                } else if( detectHit(newx,my,pickerHit)){
                    if ( o.active ){
                        //move from active to palette
                        to = "palette";
                        from = "active";
                    } else {
                        //then moving from palette to palette
                        to = "palette";
                        from = "palette";   
                    }
                } else {
                    setActiveProperty(pickerHit, false);
                    if ( o.active ){
                        //move from active to palette
                        to = "palette";
                        from = "active";
                    } else {
                        //then moving from palette to palette
                        to = "palette";
                        from = "palette";   
                    }
                }
                data.save("MODELER_MOVE","object ;"+o.name+" ; x;"+o.x+" ;y ;"+o.y+" ;from ;"+from+" ;to ;"+to);
            }
            obj[i].isDragging = false;
        }
        //detectHit 
        var mx = parseInt(newx - canvas.offsetLeft);
        var my = parseInt(newy - canvas.offsetTop);
        if(detectHit(mx,my,activeHit)){
            //console.log("active");
            setActiveProperty(activeHit, true);
            if ( multipleChoice.length < 1 ){
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
            }
        }
        evalConnection();
        evalGraphs();
        resetObjPos();
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
    //Detect whether x,y position is within picker or active areas, assumes x, y is at top left of object
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
            if( detectHit(s.x,s.y,h) ){
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
    function evalConnection(){
        for ( var i=0; i<movingConnections.length; i++){
            var movingConnection = movingConnections[i];
            prompt.setConnectionPrompt();
            data.save("MODELER_CONNECTION_MADE","source ;"+movingConnection.obj1.name+" ;destination ;"+movingConnection.obj2.name+" ;connection ;"+movingConnection.type);
            connections.push( movingConnection );
        }
        movingConnections = [];

        //REMOVE CONNECTION
        //for every connection, check to see if both species are active
        //first loop runs through all the created connections
        var activeObjList = getActiveObj();
        for( var j=0; j<connections.length;j++){
            var tempConnection = connections[j].name;
            var tempObj = tempConnection.split("-");
            //second look runs through the names of species in each created connection
            for (var k=0; k<tempObj.length; k++){
                var s1 = tempObj[k];
                var speciesActive = false;
                //third loop runs through all the active species
                for (var l=0; l<activeObjList.length; l++){
                    var s2 = activeObjList[l].name;
                    if ( s1 == s2 ){
                        //active
                        speciesActive = true;
                    }
                }
                if(!speciesActive){
                    //one of the objects in a created connection is no longer active
                    //console.log("remove connection: "+tempConnection+" b/c "+s1+" is not active.");
                    data.save("MODELER_CONNECTION_REMOVED","inactive object ;"+s1+" ;connection ;"+tempConnection);
                    for (var m = 0; m < connections.length; m++) {
                        if( connections[m].name == tempConnection ){
                            //remove
                            var line = connections[j];
                            displayList.removeChild( connections[j] );
                            connections.splice(j, 1);
                        }
                    }
                }
            }
        }
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
            var line = new Line( tempConnection, movingObj, closestObj, ctx, level.num, connectType, data, shadowColour, backgroundColour);
            //line.addEventListener( line.EVENT_RELATIONSHIP, handleRelationship );
            //line.addEventListener( line.EVENT_REDRAW, handleRedraw );
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
        //console.log("oldWidth2: "+oldWidth2);
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
                    var graph = new BarGraph(gctx, s, oldWidth2 );
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
        //var total = graphs.length
        //resizeGraphCanvas( total );

        for (var m = 0; m < graphs.length; m++) {
            graphs[m].drawBarGraph(m);
        }
    }
    function setupPopulationChange(  species, num, type  ){
        var direction = type; //"plus" or "minus"
        var newdata = new GraphData();
        var promptText;
        var headingText;
        
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
                prompt.setText("What happens to the population of the other shapes if the "+ species.name + " population increases? Drag another shape into the work area.");
            } else if ( type == "minus" ){
                prompt.setText("What happens to the population of the other shapes if the " + species.name + " population decreases? Drag another shape into the work area.");
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
                //prompt.setText("What happens to the population of the other shape(s) if the "+ species.name + " population increases? (A) Goes up, (B) Goes down, (C) Stays the same. Make your selection and click 'run' to test your theory.");
                prompt.setText(" ");
                var txt = species.name
                var titleCase = txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                headingText = "Prediction: "+ titleCase + " goes up";
                promptText = "What happens to the population of the other shape(s) if the §b"+ species.name + "§r population §bincreases§r?<br>Make your prediction and click 'run' to test your theory.";
            } else if ( type == "minus" ){
                prompt.setText(" ");
                var txt = species.name
                var titleCase = txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                headingText = "Prediction: "+ titleCase + " goes down";
                promptText = "What happens to the population of the other shape(s) if the §b"+ species.name + "§r population §bdecreases§r?<br>Make your prediction and click 'run' to test your theory.";
                //prompt.setText("What happens to the population of the other shape(s) if the " + species.name + " population decreases? (A) Goes up, (B) Goes down, (C) Stays the same. Make your selection and click 'run' to test your theory.");
            }
            var namesArr = [];
            for(var l=0; l<graphs.length; l++){
                var graph = graphs[l];
                if ( graph.name != species.name ){
                    namesArr.push({name: graph.name, height: graph.iconHeight, width: graph.iconWidth})
                }
            }
            //clear mc first
            for ( var i = 0; i<multipleChoice.length; i++){
                var mc = multipleChoice[i];                
                displayList.removeChild( mc );
                mc.removeEventListener(mc.EVENT_REDRAW, handleRedraw);
                mc.removeEventListener(mc.EVENT_CLICKED, onMultipleChoiceClick);
                mc.removeEventListener(mc.EVENT_CONTINUE, onMCcontinueClick);
                mc = {};
                multipleChoice.splice(i, 1);
            }

            //setup multple choice and prompts
            data.save("MODELER_MC_START","object ;"+species.name+" ;direction ;"+direction);
            var mc = new MultipleChoice( namesArr, oldHeight, oldWidth, ctx, species, num, direction, buttonColour, headingText, promptText );
            mc.addEventListener(mc.EVENT_REDRAW, handleRedraw);
            mc.addEventListener(mc.EVENT_CLICKED, onMultipleChoiceClick);
            mc.addEventListener(mc.EVENT_CONTINUE, onMCcontinueClick);
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
                data.save("MODELER_GRAPH","object ;"+object.name+" ;direction ;"+type+" ;graph ;"+graph.name+" ;result ;"+r);
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
        //console.log( "clicked "+clicked+" "+direction+": "+ graph + " " + result);
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
    function draw() {
        //clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = backgroundColour;
        ctx.fillRect(pickerbox.x, 0, canvas.width-pickerbox.width, canvas.height);
        //clear area so graphs will show through
        ctx.clearRect(oldWidth2-400,0,400,graphs.length*80);
        /*
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
        //gctx.clearRect(0, 0, gcanvas.width, gcanvas.height);
        
        // draw text at center, max length to fit on canvas
        ctx.fillText(str, (canvas.width/2)/scaleFactor, (canvas.height/2)/scaleFactor, canvas.width - 10);
        // plot cursor
        ctx.fillStyle = "blue";//"white";
        ctx.fillRect(canX -5, canY -5, 10, 10);
        */
        //Draw palette
        ctx.fillStyle = paletteColour; //"#DBDADA";
        ctx.shadowBlur=0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0
        ctx.fillRect(pickerbox.x,pickerbox.y,pickerbox.width,pickerbox.height);
        ctx.globalAlpha = 1;
        displayList.draw();
    }
}