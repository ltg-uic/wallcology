//MODELER
function FoodWeb(){
    //
    var mode = "deploy"; //"develop" or "deploy"
    var fullscreen = true;
    var app = "wallcology";
    var background = "dark";   //"light" or "dark"
    var versionID = "20160929-1400";
    var query_parameters;
    var nutella;
    
    //canvas variables
    //var gcanvas;
    //var gctx;
    var canvas;
    var ctx;
    var scaleFactor;
    var canvasWidth;
    var canvasHeight;
    var preScaledWidth;   //canvas width before retina screen resize
    var preScaledHeight;

	//Drag related variables
	var dragok = false;    //for mouse events
    var startX;
    var startY;
    var mouseIsDown = 0;   //for showPos
    var canX = 0;           
    var canY = 0;

    //setup objects
    var version;
    var iconsUrl = "http://ltg.cs.uic.edu/WC/icons/"
    var species = [
        {name:"species_00", width:50, height:50}, {name:"species_01", width:70, height:70}, 
        {name:"species_02", width:50, height:50}, {name:"species_03", width:50, height:50},
        {name:"species_04", width:50, height:50}, {name:"species_05", width:50, height:50}, 
        {name:"species_06", width:50, height:50}, {name:"species_07", width:50, height:50},
        {name:"species_08", width:50, height:50}, {name:"species_09", width:50, height:50}, 
        {name:"species_10", width:50, height:50}]; 
    var fakeSpecies;    //fake species created for adding arrows, so that lines have a target
    var speciesSize = 50;
    var speciesMargin = 30;
    var speciesSpacing = 8;
    var palette;
    var paletteWidth = 70;
    var paletteColour;// = "#2B323F";
    var buttonColour = "#FF5722";
    var toolbar;
    var toolbarWidth = 80;
    var toolbarColour = "#344559";
    var backgroundColour; 
    var shadowColour;   

    var activeArea;
    var displayList; 
    var prompt;
    var data;
    var currentDrawing;
    var initialized = false;

    var obj = [];
    var connections = [];
    var movingConnections = [];
    var potentialConnections = [];
    var newConnectionObjs = [];
    
    var addArrowBtn;
    var removeArrowBtn;
    var saveBtn;
    var annotateBtn;
    var savedVersionsNum;
    var viewOnly = false;

    if ( mode == "deploy" ){
        query_parameters = NUTELLA.parseURLParameters();
        nutella = NUTELLA.init(query_parameters.broker, query_parameters.app_id, query_parameters.run_id, NUTELLA.parseComponentId());
    } else {
        query_parameters = { INSTANCE: "null" };
    }
    WebFont.load({
        google: {
          families: ['Roboto']
        }
    });
    //load colours
    if ( background == "dark" ){
        backgroundColour = "#3d5168";
        shadowColour = "#253240";
        lineColour = "#39b54a";
        paletteColour = "#2b394a";
    } else {
        backgroundColour = "#FFFFFF";
        shadowColour = "#BFBFBF";
        lineColour = "#22B573";
        paletteColour = "#2b394a";//"#2B323F";
    }
    //resize canvas
    onResizeWindow("init");

    data = new DataLog( nutella, app, query_parameters.INSTANCE, mode );
    data.save("FOODWEB_INIT",versionID+"; window.innerWidth; "+preScaledWidth+"; window.innerHeight; "+preScaledHeight);
    
    //setup display list items
    displayList = new DisplayList( canvas );
    palette = { x:0, y:0, width:paletteWidth, height: preScaledHeight };
    toolbar = { x:preScaledWidth-toolbarWidth, y:0, width:toolbarWidth, height: preScaledHeight };
    activeArea = { x: palette.x + paletteWidth, y:0, width: preScaledWidth-palette.width-palette.x-toolbarWidth, height: preScaledHeight };
    obj = setupSpecies( species );
    setupButtons();
    prompt = new Prompt(ctx, paletteWidth+20, 20, preScaledWidth, preScaledHeight, 1, background);
    displayList.addChild(prompt);
    setupVersions();
    currentDrawing = data.getCurrentDrawing();
    retrieveDrawing( currentDrawing );
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

    window.addEventListener("orientationchange", onResizeWindow);

    //SETUP
    function onResizeWindow( init ){
        if ( !initialized ){
            canvasWidth = 1000;
            canvasHeight = 760;
        }
        canvasWidth = window.innerWidth;
        canvasHeight = window.innerHeight;
        //console.log("window.innerHeight: "+canvasHeight+", window.innerWidth: "+canvasWidth);
        //Canvas for graphs
        //gcanvas = document.getElementById("graphs-layer");
        //gctx = gcanvas.getContext("2d");
        //Canvas for drag and drop
        canvas = document.getElementById("ui-layer");
        ctx = canvas.getContext("2d");

        //allow for top wallcology buttons and left margin if mode is not set to "fullscreen"
        if ( fullscreen ){
            canvas.width = canvasWidth;
            canvas.height = canvasHeight;
            //gcanvas.width = canvasWidth;
            //gcanvas.height = canvasHeight;
        } else if ( !fullscreen ){
            var distFromTop = 20; //58 //95
            var distFromLeft = 20;
            canvas.width = canvasWidth-distFromLeft;
            canvas.height = canvasHeight-distFromTop;
            //gcanvas.width = canvasWidth-distFromLeft;
            //gcanvas.height = canvasHeight-distFromTop;
        }

        //Scaling a canvas with a backing store multipler
        scaleFactor = backingScale(ctx);  
        preScaledWidth = canvas.width;
        preScaledHeight = canvas.height;
        
        if (scaleFactor > 1) {
            canvas.width = canvas.width * scaleFactor;
            canvas.height = canvas.height * scaleFactor;
            canvas.style.width = preScaledWidth + "px";
            canvas.style.height = preScaledHeight + "px";
            // update the context for the new canvas scale
            ctx.scale( scaleFactor, scaleFactor );
            /*
            gcanvas.width = gcanvas.width * scaleFactor;
            gcanvas.height = gcanvas.height * scaleFactor;
            gcanvas.style.width = preScaledWidth + "px";
            gcanvas.style.height = preScaledHeight + "px";
            // update the context for the new canvas scale
            gctx.scale( scaleFactor, scaleFactor );
            */
        }
        if ( init != "init" ){
            if ( prompt ){
                prompt.setMaxWidth( preScaledWidth );
            }
            if ( toolbar ){
                toolbar.x = preScaledWidth-toolbarWidth;
            }
            if ( addArrowBtn ){
                var btnX = preScaledWidth-toolbarWidth+11;
                addArrowBtn.x = btnX;
                removeArrowBtn.x = btnX;
                saveBtn = btnX;
                annotateBtn = btnX;
            }
            if( version ){
                version.updateCanvasSize( preScaledWidth, preScaledHeight)
            }
            data.save("FOODWEB_ORIENTATION","window.innerWidth; "+preScaledWidth+"; window.innerHeight; "+preScaledHeight);
        }
        setTimeout(draw, 500);
    }
    function setupSpecies( speciesArr ){
        var tempArr = [];
        var tempY = speciesMargin;
        for(var i=0; i<speciesArr.length; i++){
            var sp = speciesArr[i];
            var tempObj = new Species( iconsUrl, sp.name, 
                (paletteWidth-sp.width)/2, tempY+speciesSpacing-sp.height/2, 
                sp.height, sp.width, ctx, shadowColour );
            tempArr.push(tempObj);
            displayList.addChild(tempObj);
            tempY += speciesSize+speciesSpacing;        }
        //y = speciesMargin+((sp.height+speciesMargin)*i)
        return tempArr;
    }
    //Set up toolbar buttons
    function setupButtons(){
        var btnHeight = 60;
        var btnWidth = 48;
        var btnX = preScaledWidth-toolbarWidth+11;//((toolbarWidth-btnWidth)/3);
        var btnY = speciesMargin;

        addArrowBtn = new ImageTextButton("Add ⇄", btnX, btnY, btnHeight, btnWidth, ctx, toolbarColour, "#FFFFFF", "300 8pt 'Roboto'", 28, background);
        btnY += speciesMargin + btnHeight;
        displayList.addChild( addArrowBtn );

        removeArrowBtn = new ImageTextButton("Remove ⇄", btnX, btnY, btnHeight, btnWidth, ctx, toolbarColour, "#FFFFFF", "300 8pt 'Roboto'", 28, background);
        btnY += speciesMargin + btnHeight;
        displayList.addChild( removeArrowBtn );
        
        annotateBtn = new ImageTextButton("Annotate", btnX, btnY, btnHeight, btnWidth, ctx, toolbarColour, "#FFFFFF", "300 8pt 'Roboto'", 28, background);
        btnY += speciesMargin + btnHeight;
        displayList.addChild( annotateBtn );
        
        saveBtn = new ImageTextButton("Save", btnX, btnY, btnHeight, btnWidth, ctx, toolbarColour, "#FFFFFF", "300 8pt 'Roboto'", 28, background);
        btnY += speciesMargin + btnHeight;
        displayList.addChild( saveBtn );
        //one event listener works for all ImageTextButtons
        saveBtn.addEventListener( saveBtn.EVENT_CLICKED, handleToobarClicks ); 
    }
    //get nubmer of saved version from server
    function setupVersions(){
        savedVersionsNum = data.getSavedFoodwebNum();
        version = new Version(ctx, preScaledWidth, preScaledHeight, toolbarWidth, toolbarColour, savedVersionsNum);
        version.changeVersion();
    }
    //EVENTLISTENERS    
    function handleToobarClicks(e){
        //console.log(e.type+", "+e.target.name);
        var clicked = e.target;
        switch( clicked.name ){
            case "Add ⇄":
                newConnectionObjs = [];
                removeArrowBtn.active = false;
                removeArrowBtn.drawButton();
                saveBtn.active = false;
                saveBtn.drawButton();
                annotateBtn.active = false;
                annotateBtn.drawButton();
                break;
            case "Remove ⇄":
                newConnectionObjs = [];
                addArrowBtn.active = false;
                addArrowBtn.drawButton();
                saveBtn.active = false;
                saveBtn.drawButton();
                annotateBtn.active = false;
                annotateBtn.drawButton();
                break;
            case "Save":
                newConnectionObjs = [];
                addArrowBtn.active = false;
                addArrowBtn.drawButton();
                removeArrowBtn.active = false;
                removeArrowBtn.drawButton();
                annotateBtn.active = false;
                annotateBtn.drawButton();
                saveFoodWeb();
                break;
            case "Annotate":
                newConnectionObjs = [];
                addArrowBtn.active = false;
                addArrowBtn.drawButton();
                removeArrowBtn.active = false;
                removeArrowBtn.drawButton();
                saveBtn.active = false;
                saveBtn.drawButton();
                break;
            default:
                newConnectionObjs = [];
                addArrowBtn.active = false;
                addArrowBtn.drawButton();
                removeArrowBtn.active = false;
                removeArrowBtn.drawButton();
                saveBtn.active = false;
                saveBtn.drawButton();
                annotateBtn.active = false;
                annotateBtn.drawButton();
        }
    }
    /*
    function handleRemoveArrowBtn(e){
        console.log("handleRemoveArrowBtn");
        newConnectionObjs = [];
        addArrowBtn.active = false;
        addArrowBtn.drawButton();
    }
    function handleSaveBtn(e){
        console.log("handleSaveBtn");
    }
    function handleAnnotateBtn(e){
        console.log("handleAnnotateBtn");
    }*/
    function handleVersionChange( direction ){
        //console.log("handleVersionChange");
        var oldVersion = version.num;
        var newVersion;
        if ( direction == "next" ){
            newVersion = oldVersion + 1;
        } else if ( direction == "back" ){
            newVersion = oldVersion - 1;
        }
        
        if ( newVersion == (version.saved + 1) ){
            viewOnly = false;
        } else {
            viewOnly = true;
        }
        //cycle through versions **** 
        if( newVersion > savedVersionsNum + 1 || newVersion < 1){
            return;
        }
        version.num = newVersion;

        //retrieve saved versions
        var oldDrawing = data.getPreviousDrawing();
        //need to save current state before retrieveDrawing
        clearFoodWeb();
        retrieveDrawing( oldDrawing );
        console.log("savedVersionsNum: "+savedVersionsNum+", version.num: "+version.num+", version.saved: "+version.saved+", viewOnly: "+viewOnly);
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
        if ( !initialized ){
            onResizeWindow( "init" );
            initialized = true;
        }
        /*if ( viewOnly ){
            return;
        }*/
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
                    //test to see if object is within boundary
                    if( r.x + r.width + dx >= preScaledWidth-toolbarWidth ){
                        return;
                        //r.x = preScaledWidth-toolbarWidth-r.width;
                    } else if ( r.y + r.height + dy >= preScaledHeight ){
                        return;
                        //r.y = preScaledHeight - r.height;
                    } else if ( r.y + dy < 0 ){
                        return;
                        //r.y = 0;
                    } else if ( r.x + dx < 0 ){
                        return;
                        //r.x = 0;
                    }                    
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
            // reset the starting mouse position for the next mousemove
            startX = mx;
            startY = my;
        }

        //if removeArrow button is active, then when mouse over lines, make it 50% opacity
        if ( removeArrowBtn.active ){
            for( var k=0; k<connections.length; k++){
                var c = connections[k];
                if (detectHit( x, y, c )){
                    //console.log("mouse over "+ c.name);
                    c.updateAlpha(0.5);
                } else {
                    c.updateAlpha(1);
                }
            }
        }
        if ( addArrowBtn.active ){
            if( newConnectionObjs.length >= 1 ){
                //console.log("source obj: "+newConnectionObjs[0].name+", looking for lines");
                showPotentialConnections( x, y );
            }
        }
        draw();
    }
    function startMove(x,y,isTouch){
        /*if ( viewOnly ){
            return;
        }*/
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
            if( o.isDragging ){
                //prompt.setText(" ");
                if( detectHit(newx,newy,activeArea)){
                    setActiveProperty( activeArea, true );
                    if ( o.active ){
                        //then just moving around
                        to = "active";
                        from = "active";
                    } else {
                        //then moving from palette to active
                        to = "active";
                        from = "palette";
                    }
                } else if( detectHit( newx,newy,palette )){
                    if ( o.active ){
                        //move from active to palette
                        setActiveProperty( palette, false );
                        to = "palette";
                        from = "active";
                    } else {
                        //then moving from palette to palette
                        to = "palette";
                        from = "palette";   
                    }
                } else {
                    setActiveProperty( palette, false );
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
                data.save("FOODWEB_MOVE","object ;"+o.name+" ; x;"+o.x+" ;y ;"+o.y+" ;from ;"+from+" ;to ;"+to);
            }
            o.isDragging = false;
        }

        //detectHit 
        var mx = parseInt(newx - canvas.offsetLeft);
        var my = parseInt(newy - canvas.offsetTop);

        //check to see if version buttons are clicked
        if( detectHit(mx,my,version) ){
            if( detectHit(mx,my,version.nextBtn) && version.nextBtn.active ){
                //
                handleVersionChange(version.nextBtn.name);
                version.changeVersion(mx,my,version.nextBtn.name);
            } else if ( detectHit(mx,my,version.backBtn) && version.backBtn.active ){
                //
                handleVersionChange(version.backBtn.name);
                version.changeVersion(mx,my,version.backBtn.name);
            }
        }

        //if addArrow button is active, add source/destination objects to the array
        //flag checks if user clicked on species
        if ( addArrowBtn.active ){
            var flag = false;
            for (var j = 0; j < obj.length; j++) {
                var o = obj[j];
                //only add source/destination species if it is active (i.e. in work area)
                if( detectHit( mx, my, o ) && o.active ){
                    newConnectionObjs.push(o);
                    flag = true;
                    //console.log( "addArrowBtn.active, newConnectionObjs.length: " + newConnectionObjs.length );
                }
            }
            //if add arrow is on and user did not click on a species, reset source object and button
            if ( !flag ){
                for( var m=0; m<potentialConnections.length;m++){
                    var c = potentialConnections[m];
                    displayList.removeChild( c );
                }
                potentialConnections = [];
                newConnectionObjs = [];
                //toggle add button "off"
                addArrowBtn.active = false;
                addArrowBtn.drawButton();   
            }
        }

        //if removeArrow button is active, remove line if mouse/touch is over line 
        if ( removeArrowBtn.active ){
            //console.log("remove line clicked: "+canX+", "+canY);
            for( var k=0; k<connections.length; k++){
                var c = connections[k];
                if (detectHit( mx, my, c )){
                    //remove connection
                    data.save("FOODWEB_CONNECTION_REMOVED","remove arrow tool ;x ;"+mx+" ;y ;"+my+" ;connection ;"+c.name);
                    displayList.removeChild( c );
                    connections.splice(k, 1);
                    //reset remove arrow button
                    removeArrowBtn.active = false;
                    removeArrowBtn.drawButton();
                } else {
                    //nothing
                }
            }
        }
        //if save button is active, upon mouse click, change it back to inactive
        if ( saveBtn.active ){
            saveBtn.active = false;
        }
        evalNewConnection();
        evalConnection();        
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
    //Detect whether x,y position within area 'a', assumes x, y is at top left of object
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
            //var pb = plusButtons[i];
            //var mb = minusButtons[i];
            if( detectHit(s.x,s.y,h) ){
                //species active
                s.active = b;
                //pb.active = b;
                //mb.active = b;
            }
            //console.log( s.name + ", x: "+s.x+", y: "+s.y );
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
            data.save("FOODWEB_CONNECTION_MADE","source ;"+movingConnection.obj1.name+" ;destination ;"+movingConnection.obj2.name+" ;connection ;"+movingConnection.type);
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
                    data.save("FOODWEB_CONNECTION_REMOVED","inactive object ;"+s1+" ;connection ;"+tempConnection);
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
    function evalNewConnection(){
        if( addArrowBtn.active ){
            if( newConnectionObjs.length >= 2 ){
                var obj1 = newConnectionObjs[0];
                var obj2 = newConnectionObjs[1];
                //if the new objects are the same, return
                if ( obj1.name == obj2.name ){
                    //console.log("same object, no connection necessary");
                    newConnectionObjs = [];
                    displayList.removeChild( potentialConnections[0] );
                    potentialConnections = [];
                    newConnectionObjs[0] = obj1;
                    return;
                }
                //if the new objects already have a connection, return
                for ( var i = 0; i<connections.length; i++ ){
                    var c = connections[i];
                    if((c.obj1.name == obj1.name && c.obj2.name == obj2.name) || (c.obj1.name == obj2.name && c.obj2.name == obj1.name)){
                        console.log("connection already exists");
                        displayList.removeChild( potentialConnections[0] );
                        newConnectionObjs = [];
                        potentialConnections = [];
                        return;
                    }
                }
                //setup new connection
                console.log("Setup new connection between "+newConnectionObjs[0].name+" and "+newConnectionObjs[1].name);
                var tempConnection = obj1.name+"-"+obj2.name;
                var connectType = "eatenby"
                var line = new Line( tempConnection, obj1, obj2, ctx, 1, connectType, data, shadowColour, backgroundColour, lineColour);
                connections.push( line );
                displayList.addChild( line );
                data.save("FOODWEB_CONNECTION_ADDED","source ;"+obj1.name+" ;destination ;"+obj2.name+" ;connection ;"+connectType);

                //turn add arrow buttn off and reset array
                for(var j=0;j<potentialConnections.length; j++){
                    displayList.removeChild( potentialConnections[j] );
                    potentialConnections.splice(j, 1);
                }
                potentialConnections = [];
                newConnectionObjs = [];
                addArrowBtn.active = false;
                addArrowBtn.drawButton();
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
            var line = new Line( tempConnection, movingObj, closestObj, ctx, 1, connectType, data, shadowColour, backgroundColour, lineColour);
            for( var j=0; j<movingConnections.length;j++){
                displayList.removeChild( movingConnections[j] );
                movingConnections.splice(j, 1);
            }
            movingConnections.push(line);
            displayList.addChild( line );
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
    /*
    function getTwoClosestObjs( mx, my ){
        var movingPt = {x:mx, y:my};
        var activeObjList = getActiveObj();
        var shortestDist;
        var shortestDist2;
        var closestObj;
        var closestObj2;
        var closestObjIndex;
        //calculate distance from other active objects and moving object
        for (var i=0; i<activeObjList.length; i++){
            var activeObj = activeObjList[i];
            var dist = getDistance( movingPt, activeObj );
            if ( shortestDist ){
                if ( dist < shortestDist ){
                    shortestDist = dist;
                    closestObj = activeObj;
                    closestObjIndex = i;
                }
            } else {
                shortestDist = dist;
                closestObj = activeObj;
                closestObjIndex = i;
            }
        }
        //remove closest object from array and rerun for loop to find second closest object
        activeObjList.splice( closestObjIndex, 1 );
        for (var j=0; j<activeObjList.length; j++){
            var activeObj2 = activeObjList[j];
            var dist2 = getDistance( movingPt, activeObj2 );
            if ( shortestDist2 ){
                if ( dist2 < shortestDist2 ){
                    shortestDist2 = dist2;
                    closestObj2 = activeObj2;
                }
            } else {
                shortestDist2 = dist2;
                closestObj2 = activeObj2;
            }
        }
        return [closestObj, closestObj2];
    }
    */
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
    //if objects back at palette, place them in correct position
    function resetObjPos(){
        for (var i = 0; i < obj.length; i++) {
            var s = obj[i];
            if(!s.active){
                s.x = s.px;
                s.y = s.py;
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
    //if add arrow button is active, and a source species is chosen, then show potenial connections
    function showPotentialConnections( mx, my ){
        //create fake species if source object is clicked when add arrow function is on
        if( fakeSpecies ){
            fakeSpecies.x = mx;
            fakeSpecies.y = my;

        } else {
            fakeSpecies = new Species( iconsUrl, "species_00", mx, my, 10, 10, ctx, shadowColour );    
            //displayList.addChild( fakeSpecies );
        }
        
        var sourceObj = newConnectionObjs[0];
        
        //console.log("sourceObj: " + sourceObj.name);
        //console.log("fakeSpecies: " + fakeSpecies.x+", "+fakeSpecies.y+", "+fakeSpecies.height+", "+fakeSpecies.width);
        //fakeSpecies = new Species( iconsUrl, "species_00", x, y, sp.height, sp.width, ctx, shadowColour );

        var tempConnection = "mouseXY-"+sourceObj.name;
        var connectType = "eatenby"
        var line = new Line( tempConnection, fakeSpecies, sourceObj, ctx, 1, connectType, data, shadowColour, backgroundColour, lineColour);
        line.updateXY( mx, my );
        for( var i=0; i<potentialConnections.length;i++){
            displayList.removeChild( potentialConnections[i] );
            potentialConnections.splice(i, 1);
        }
        potentialConnections.push(line);
        displayList.addChild( line );
        //console.log("line: " + potentialConnections[0].x1+", "+potentialConnections[0].y1+", "+potentialConnections[0].x2+", "+potentialConnections[0].y2+", "+potentialConnections[0].height+", "+potentialConnections[0].width);
    }
    function saveFoodWeb(){
        //handle versions
        savedVersionsNum += 1;
        version.saveVersion( savedVersionsNum );
    
        //save drawing 
        var d = getDrawing();
        data.saveDrawing( d.drawing, d.message );

        //draw "Saved" button state
        saveBtn.drawSavedButton();
        console.log("savedVersionsNum: "+savedVersionsNum+", version.num: "+version.num+", version.saved: "+version.saved);
    }
    function getDrawing(){
        var nodes = [];
        var links = [];
        var message = "";
        var drawing;

        for(var i=0; i<obj.length; i++){
            var o = obj[i];
            var node = { name: o.name, x: o.x, y: o.y, active: o.active };
            message += "{ name: " + o.name + ", x: " + o.x +", y:"+o.y+", active: "+o.active+" }, ";
            nodes.push( node );
        }

        for(var j=0; j<connections.length; j++){
            var c = connections[j];
            var link = { name: c.name, source: c.obj1.name, destination: c.obj2.name, type: c.type };
            message += "{ name: " + c.name + ", source: " + c.obj1.name +", destination:"+c.obj2.name+", type: "+c.type+" }, ";
            links.push( link );
        }
        
        message = message.slice(0, -2);
        currentDrawing = { nodes: nodes, links: links };
        return {drawing: currentDrawing, message: message};
    }
    //clear drawing
    function clearFoodWeb(){
        var d = getDrawing();
        currentDrawing = d.drawing;

        for(var i=0; i<obj.length; i++){
            var o = obj[i];
            o.active = false;
            o.x = o.px;
            o.y = o.py;
        }
        for(var j=0; j<connections.length; j++){
            var c = connections[j];
            displayList.removeChild( c );
        }
        connections = [];
        movingConnections = [];
        potentialConnections = [];
        newConnectionObjs = [];
    }
    //retrieve drawing
    function retrieveDrawing( drawing ){
        //var drawing = data.getDrawing();
        var nodes = drawing.nodes;
        var links = drawing.links;

        for(var i=0; i<nodes.length; i++){
            var n = nodes[i];
            //var node = { name: o.name, x: o.x, y: o.y, active: o.active };
            for (var k=0; k<obj.length; k++){
                var o = obj[k];
                if( n.name == o.name ){
                    o.x = n.x;
                    o.y = n.y;
                    o.active = n.active;
                }
            }
            
        }
        for(var j=0; j<links.length; j++){
            var l = links[j];
            //var link = { name: c.name, source: c.obj1.name, destination: c.obj2.name, type: c.type };
            //create connections
            var tempConnection = l.obj1.name+"-"+l.obj2.name;
            var connectType = l.type;
            var obj1;
            var obj2;
            //get obj1 and obj2 by name
            for( var m=0; m<obj.length; m++){
                var o = obj[m];
                if ( o.name == l.obj1.name ){
                    obj1 = o;
                } else if ( o.name == l.obj2.name ){
                    obj2 = o;
                }
            }
            var line = new Line( tempConnection, obj1, obj2, ctx, 1, connectType, data, shadowColour, backgroundColour, lineColour);
            connections.push( line );
            displayList.addChild( line );
            //data.save("FOODWEB_CONNECTION_ADDED","source ;"+obj1.name+" ;destination ;"+obj2.name+" ;connection ;"+connectType);
        }
    }
    /*
    function endEditArrows(){
        editArrowMode = false;
    }
    */
    function draw() {
        //clear canvas
        ctx.clearRect(0, 0, preScaledWidth, preScaledHeight);
        ctx.fillStyle = backgroundColour;
        ctx.fillRect(0, 0, preScaledWidth, preScaledHeight);
        //clear area so graphs will show through; graph width = 400
        //ctx.clearRect(preScaledWidth-400,0,400,graphs.length*80);
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
        //draw palette
        ctx.fillStyle = paletteColour;
        ctx.fillRect(palette.x, palette.y, palette.width, palette.height);
        //draw toolbar
        ctx.fillStyle = toolbarColour;
        ctx.fillRect(toolbar.x, toolbar.y, toolbar.width, toolbar.height);
        version.draw();
        displayList.draw();
    }
}