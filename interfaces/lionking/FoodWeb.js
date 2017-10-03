//LION KING
function FoodWeb(){
    //Nutella 
    var mode = "deploy"; //"develop" or "deploy"
    var fullscreen = false;
    var background = "dark"; //light or dark
    var app = "lion king";
    this.versionID = "20171002-2030"
    var portal;
    var instance;

    var query_parameters;
    var nutella
    if ( mode == "deploy"){
        query_parameters = NUTELLA.parseURLParameters();
        nutella = NUTELLA.init(query_parameters.broker, query_parameters.app_id, query_parameters.run_id, NUTELLA.parseComponentId());
        nutella.net.subscribe('ping',function(message,from){});
        portal = query_parameters.TYPE;
        instance = query_parameters.INSTANCE;
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
    //console.log("window.innerHeight: "+cH+", window.innerWidth: "+cW);
    //console.log("canvas.height: "+canvas.height+", canvas.width: "+canvas.width);    
    //console.log("cW: "+cW +", cH: "+cH);
	//Drag related variables
	var dragok = false;    //for mouse events
    var startX;
    var startY;
    var mouseIsDown = 0;   //for showPos
    var canX = 0;           
    var canY = 0;

    //Setup display list
    var offsetX;
    var offsetY;
    var displayList;
    var prompt;

    //setup palette and work areas
    var paletteColour = "#2B323F";//"#DBDADA";//"#2B323F";
    var buttonColour = "#FF5722";
    var backgroundColour; 
    var shadowColour;

    var pbpadding = 0;
    var pbwidth = 150;
    var pickerbox;
    var pickerHit;
    var activeHit;

    //setup objects
    var speciesNames = []; //= ["lion", "zebra"];
    var speciesSize = 100;
    var speciesMargin = 25;
    var speciesSpacing = 50;
/*    var levels = [
        [{name:"lion", height:100, width:100, up: true, down: false},{name:"zebra", height:100, width:64, up: false, down: false}], 
        // [{name:"lion", height:100, width:100, up: true, down: false},{name:"zebra", height:100, width:64, up: false, down: false}],
        [{name:"lion", height:100, width:100, up: true, down: true},{name:"zebra", height:100, width:64, up: true, down: true},{name:"leopard", height:100, width:100, up: true, down: true}],
        [{name:"lion", height:100, width:100, up: true, down: true},{name:"zebra", height:100, width:64, up: true, down: true},{name:"grass", height:100, width:100, up: true, down: true},{name:"tree", height:100, width:125, up: true, down: true}]//,
        //[{name:"lion", height:100, width:100, up: true, down: true},{name:"zebra", height:100, width:64, up: true, down: true},{name:"leopard", height:100, width:100, up: true, down: true},{name:"giraffe", height:100, width:100, up: true, down: true},{name:"grass", height:100, width:100, up: true, down: true},{name:"tree", height:100, width:125, up: true, down: true}]
        ];*/
    var levels = [
        [{name:"lion", height:100, width:100, up: true, down: false},{name:"zebra", height:100, width:64, up: false, down: false}], 
        [{name:"lion", height:100, width:100, up: true, down: true},{name:"zebra", height:100, width:64, up: true, down: true},{name:"leopard", height:100, width:100, up: true, down: true}],
        [{name:"lion", height:100, width:100, up: true, down: true},{name:"zebra", height:100, width:64, up: true, down: true},{name:"grass", height:100, width:100, up: true, down: true},{name:"tree", height:100, width:125, up: true, down: true}]
        ];

    var level;;
    var obj = [];
    var connections = [];
    var graphs = [];
    var plusButtons = [];
    var minusButtons = [];
    var multipleChoice = [];
    var data;

    onResizeWindow("init");
    loadColours( background );
    initDataCollection();
    setupSpecies();
    setupLevel(1, false, levels[0], oldWidth, oldHeight);

    // Add eventlistener to canvas
    canvas.addEventListener("mousemove", onMouseMove, false); 
    canvas.addEventListener("mousedown", onMouseDown, false);
    canvas.addEventListener("mouseup", onMouseUp, false);
    canvas.addEventListener("touchstart", onTouchDown, false);
    canvas.addEventListener("touchmove", onTouchMove, true);
    canvas.addEventListener("touchend", onTouchUp, false);

    //level.addEventListener(level.EVENT_CLICKED, onLevelClick);
    
    document.body.addEventListener("mouseup", onMouseUp, false);
    document.body.addEventListener("touchcancel", onTouchUp, false);

    window.addEventListener("orientationchange", onResizeWindow);

    //SETUP
    function initDataCollection(){
        data.save("INIT LION KING",this.versionID+"; window.innerWidth; "+oldWidth+"; window.innerHeight; "+oldHeight);
    }
    function loadColours( background ){
        if ( background == "dark" ){
            backgroundColour = "#3d5168";
            shadowColour = "#253240";
        } else {
            backgroundColour = "#FFFFFF";
            shadowColour = "#BFBFBF";
        }
    }
    function setupLevel( num, minus, species, cw, ch ){
        level.STATE = "A";
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
    function setupBstate(){
        displayList.removeChild( plusButtons[0] );
        var tempBtn = new ActionButton(ctx, obj[1].name, "plus", buttonColour, shadowColour, backgroundColour, obj[1].width, obj[1].height );
        tempBtn.index = 1;
        tempBtn.updateXY( obj[1].x, obj[1].y );
        displayList.addChild(tempBtn);
        plusButtons.push( tempBtn );
        endMove( obj[1].x, obj[1].y, false);
        //console.log("connections: "+connections.length);
    }
    function setupCstate(){
        displayList.removeChild( plusButtons[1] );
        var tempBtn = new ActionButton(ctx, obj[0].name, "minus", buttonColour, shadowColour, backgroundColour, obj[0].width, obj[0].height );
        tempBtn.index = 0;
        tempBtn.updateXY( obj[0].x, obj[0].y );
        displayList.addChild(tempBtn);
        minusButtons.push( tempBtn );
        endMove( obj[0].x, obj[0].y, false);
    }
    function setupDstate(){
        displayList.removeChild( minusButtons[0] );
        var tempBtn = new ActionButton(ctx, obj[1].name, "minus", buttonColour, shadowColour, backgroundColour, obj[1].width, obj[1].height );
        tempBtn.index = 1;
        tempBtn.updateXY( obj[1].x, obj[1].y );
        displayList.addChild(tempBtn);
        minusButtons.push( tempBtn );
        endMove( obj[1].x, obj[1].y, false);
    }
    function setupSpecies(){
        for(var i=0; i<speciesNames.length; i++){
            var sp = speciesNames[i];
            var tempObj = new Species( 
                sp.name, 
                pbwidth/2-sp.width/2, 
                speciesMargin+((speciesSize+speciesMargin)*i), 
                sp.height, 
                sp.width, ctx, sp.up, sp.down, shadowColour );
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
            var o = obj[i];
            if( type == "plus"){
                if( o.up ){
                    var tempBtn = new ActionButton(ctx, obj[i].name, t, buttonColour, shadowColour, backgroundColour, obj[i].width, obj[i].height );    
                    tempBtn.index = i;
                    tempArr.push( tempBtn );
                    displayList.addChild(tempBtn);
                }
            } else if (type == "minus"){
                if( o.down ){
                    var tempBtn = new ActionButton(ctx, obj[i].name, t, buttonColour, shadowColour, backgroundColour, obj[i].width, obj[i].height );    
                    tempBtn.index = i;
                    tempArr.push( tempBtn );
                    displayList.addChild(tempBtn);
                }
            }
        }
        return tempArr;
    }
    //clear all the event listeners before removing object
    function clearListeners(){
        for (var l=0; l<multipleChoice.length; l++){
            var mc = multipleChoice[l];
            mc.removeEventListener(mc.EVENT_REDRAW, handleRedraw);
            mc.removeEventListener(mc.EVENT_CLICKED, onMultipleChoiceClick);
            mc.removeEventListener(mc.EVENT_CONTINUE, onMCcontinueClick);
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

        // cW = window.innerWidth;
        // cH = window.innerHeight;

        cW = (parent.document.body.clientWidth == 0)? 980 : parent.document.body.clientWidth;
        cH = (parent.document.body.clientHeight == 0)? 680 : parent.document.body.clientHeight;

        //allow for top wallcology buttons and left margin if mode is set to "deploy"
        if ( mode == "deploy" || !fullscreen ){
            cW -= 20;
            cH -= 30;
        }
        //console.log("window.innerHeight: "+cH+", window.innerWidth: "+cW);
        //Canvas for graphs
        gcanvas = document.getElementById("graphs-layer");
        gctx = gcanvas.getContext("2d");
        //Canvas for drag and drop
        canvas = document.getElementById("ui-layer");
        ctx = canvas.getContext("2d");

        canvas.width = cW;
        canvas.height = cH
        gcanvas.width = cW;
        gcanvas.height = cH

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
        //console.log("oldWidth: "+oldWidth+", oldHeight: "+oldHeight);
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
            level = new Level(1, ctx, oldHeight);
            data = new DataLog( nutella, app, portal, instance, mode );
            console.log("portal: "+ portal+", instance: "+instance);
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
            level.updateCanvasHeight( oldHeight );
            data.save("ORIENTATION","window.innerWidth; "+oldWidth+"; window.innerHeight; "+oldHeight);
        }
        setTimeout(draw, 500);
    }
    function onLevelClick(direction){
        var oldlevel = level.num;
        var newlevel;
        if (direction == "next"){
            newlevel = oldlevel+1;
        } else if (direction == "back"){
            newlevel = oldlevel-1;
        }
        //cycle through levels
        if( newlevel > levels.length || newlevel < 1){
            return;
            //reset
            //newlevel = 1;
        }
        var mb = true;  //minus buttons
        if( newlevel == 1 ){
            mb = false;
        }
        level.num = newlevel;
        setupLevel(newlevel, mb, levels[newlevel-1], oldWidth, oldHeight);
        //console.log("newlevel: "+newlevel);
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
        //console.log("level.STATE: "+level.STATE);
        if( level.num == 1 || level.num == 2 ){
            var newState;
            if (level.STATE == "A"){
                newState = "B";
                setupBstate();
                prompt.setContinuePrompt(1);
            } else if ( level.STATE == "B" ){
                newState = "C";
                setupCstate();
                prompt.setContinuePrompt(2);
            } else if ( level.STATE == "C" ){
                newState = "D";
                setupDstate();
                prompt.setContinuePrompt(3);
            } else if ( level.STATE == "D" ){
                newState = "A";
                //setupLevel1C();
                //activate next button
                prompt.setContinuePrompt(4);
            }
            level.STATE = newState;
        } else if( level.num == 3 ){
            var newState;
            if (level.STATE == "A"){
                newState = "B";
                prompt.setContinuePrompt(1);
                
            } /*else if ( level.STATE == "B" ){
                newState = "A";
                prompt.setContinuePrompt(2);
                ////activate next button

            }
        } else if( level.num == 4 ){
            var newState;
            if (level.STATE == "A"){
                newState = "A";
                prompt.setContinuePrompt(1);
                //activate next button  
            }*/
        }
        //prompt.setText("When you are ready, click \u2192 to continue.");
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
                data.save("MC_RUN","object ;"+item.species.name+" ;direction ;"+item.type+" ;graph ;"+item.name+" ;select ;"+item.selection);
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
        //setTimeout(draw, 500);
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
        //detectHit 
        var mx = parseInt(newx - canvas.offsetLeft);
        var my = parseInt(newy - canvas.offsetTop);

        // clear all the dragging flags
        dragok = false;
        for (var i = 0; i < obj.length; i++) {
            var o = obj[i];
            var to;
            var from;
            if( obj[i].isDragging ){
                if( detectHit(mx,my,activeHit)){
                    if ( o.active ){
                        //then just moving around
                        to = "active";
                        from = "active";
                    } else {
                        //then moving from palette to active
                        to = "active";
                        from = "palette";
                    }
                } else if( detectHit(mx,my,pickerHit)){
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
                data.save("MOVE","level ;"+level.num+" ;object ;"+o.name+" ; x;"+o.x+" ;y ;"+o.y+" ;from ;"+from+" ;to ;"+to);
            }
            obj[i].isDragging = false;
        }
        
        if(detectHit(mx,my,activeHit)){
            //console.log("active");
            //deactivate up and down buttons when mc on screen
            if( multipleChoice.length == 0 ){
                setActiveProperty(activeHit, true);
                for (var j = 0; j < plusButtons.length; j++) {
                    //console.log("mx: "+mx + ", my: " + my + ", button.x: "+plusButtons[j].x + ", button.y: " + plusButtons[j].y + ", button.width: "+plusButtons[j].width + ", button.height: "+plusButtons[j].height);
                    if( detectHit(mx,my,plusButtons[j])){
                        //console.log(obj[j].name + " button");
                        setupPopulationChange(obj[j], j, "plus");
                        //handlePopulationChange(obj[j], j, "plus");
                    }
                }
                for (var k = 0; k < minusButtons.length; k++) {
                    //console.log("mx: "+mx + ", my: " + my + ", button.x: "+plusButtons[j].x + ", button.y: " + plusButtons[j].y + ", button.width: "+plusButtons[j].width + ", button.height: "+plusButtons[j].height);
                    if( detectHit(mx,my,minusButtons[k])){
                        //console.log(obj[j].name + " button");
                        setupPopulationChange(obj[k], k, "minus");
                        //handlePopulationChange(obj[k], k, "minus");
                    }
                }
            }
        }else if (detectHit(mx,my,pickerHit)){
            //console.log("picker");
            setActiveProperty(pickerHit, false);
            
             if(detectHit(mx,my,level)){
                if( detectHit(mx,my,level.nextBtn) ){
                    onLevelClick(level.nextBtn.name);
                    level.changeLevel(mx,my,level.nextBtn.name);
                } else if ( detectHit(mx,my,level.backBtn) ){
                    onLevelClick(level.backBtn.name);
                    level.changeLevel(mx,my,level.backBtn.name);
                }
             }
        } else {
            //console.log("nothing");
        }
        //evaluate species - if both zebra and lion are on the map, then draw line
        evalActiveObjs();
        //if objects are on the map then draw graphs, buttons
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
                if( pb ){
                    pb.active = b;    
                }
                if( mb ){
                    mb.active = b;
                }
            }
        }
    }
    //evaluate which species are active and draws line between active ones
    function evalActiveObjs(){
        var r = new Relationship();
        var connectionsList = r.arrows;
        var activeSpeciesList = [];
        //there is a function for below already - for later refactoring
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
                            data.save("CONNECTION_MADE","level ;"+level.num+" ;object1 ;"+s1.name+" ;object2 ;"+s2.name+" ;connection ;"+tempConnection);
                            //console.log("create connection: "+tempConnection+" between "+s1.name +" and "+s2.name);
                            var line = new Line( tempConnection, s1, s2, ctx, level.num, connectType, shadowColour );
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
                    //console.log("remove connection: "+tempConnection+" b/c "+s1+" is not active.");
                    data.save("CONNECTION_REMOVED","level ;"+level.num+" ;inactive object ;"+s1+" ;connection ;"+tempConnection);
                    for (var m = 0; m < connections.length; m++) {
                        if( connections[m].name == tempConnection ){
                            //remove
                            displayList.removeChild( connections[j] );
                            connections.splice(j, 1);
                        }
                    }
                    /*
                    for (var n = 0; n < connections.length; n`++) {
                        //check to see if s1 is present in other connections
                        var testConnection = connections[n].name;
                        var removeConnection = false;
                        //search for s1 in connection via string search
                        console.log("object not active: "+s1+", connections["+n+"]: "+testConnection)
                        /*
                        if( connections[n].name == tempConnection ){
                            //remove
                            displayList.removeChild( connections[j] );
                            connections.splice(j, 1);
                        }
                        
                    }
                    */
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
                    var graph = new BarGraph(gctx, s, oldWidth2);
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
                        graphs[k].clearGraph();
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

        for (var m = 0; m < graphs.length; m++) {
            graphs[m].drawBarGraph(m);
        }
        //}
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
                prompt.setText("Populations are in flux. Wait until they are stabilized to start a new manipulation.")
                return;
            }
        }
        //find out if more than one species are on work area
        var activeObjNum = 0;
        for(var j=0; j<obj.length; j++){
            var sp = obj[j];
            if( sp.active ){
                activeObjNum++
            }
        }
        //if there's only one species, then change population
        if ( activeObjNum == 1 ){
        //console.log("Number of active species: "+activeObjNum);
        //console.log("update graph: "+obj.name+" "+direction);
        //get array of relationships for object clicked
            if ( type == "plus" ){
                prompt.setText("What happens to the other species' population if the "+ species.name + " population increases? Drag another species into the work area.");
            } else if ( type == "minus" ){
                prompt.setText("What happens to the other species' population if the " + species.name + " population decreases? Drag another species into the work area.");
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
        } else {
            if ( type == "plus" ){
                //prompt.setText("What happens to the population of the other shape(s) if the "+ species.name + " population increases? (A) Goes up, (B) Goes down, (C) Stays the same. Make your selection and click 'run' to test your theory.");
                prompt.setText(" ");
                var txt = species.name
                var titleCase = txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                headingText = "Prediction: "+ titleCase + " goes up";
                promptText = "What happens to the population of other species if the §b"+ species.name + "§r population §bincreases§r?<br>Make your prediction and click 'run' to test your theory.";
            } else if ( type == "minus" ){
                prompt.setText(" ");
                var txt = species.name
                var titleCase = txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                headingText = "Prediction: "+ titleCase + " goes down";
                promptText = "What happens to the population of other species if the §b"+ species.name + "§r population §bdecreases§r?<br>Make your prediction and click 'run' to test your theory.";
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
            //console.log("level: "+level+", "+level.getColour());
            data.save("MC_START","level ;"+level.num+" ;object ;"+species.name+" ;direction ;"+direction);
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
    function handlePopulationChange( obj, num, type ){
        var direction = type; //"plus" or "minus"
        var newdata = new GraphData();
        var r = new Relationship();
        var rArr = [];
        /*
        //find out if graphs are running
        for(var o=0; o<graphs.length; o++){
            var graphsRunning = graphs[o].getRunning();
            //console.log("graphs["+o+"] running: "+ graphsRunning );
            if( graphsRunning ){
                //write a message to let users know that graphs are running
                prompt.setText("Populations are in flux. Wait until they are stabilized to continue manipulation.")
                return;
            }
        }
        */
        //console.log("update graph: "+obj.name+" "+direction);
        //get array of relationships for object clicked
        for( var j=0; j<r.graphs.length; j++){
            if( obj.name == r.graphs[j].name){
                if ( type == "plus" ){
                    rArr = r.graphs[j].increase;
                    //prompt.setText("What happens to the other species' population if the "+ obj.name + " population doubles? (A) Goes up, (B) Goes down, (C) Stays the same. Click 'run' to test your theory.");
                } else if ( type == "minus" ){
                    rArr = r.graphs[j].decrease;
                    //prompt.setText("What happens to the other species' population if the " + obj.name + " population decreases? (A) Goes up, (B) Goes down, (C) Stays the same. Click 'run' to test your theory.");
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
                        //console.log("connectionList.length: "+connectionList.length);
                        for( var l=0; l<connectionList.length; l++ ){
                            var c = false;
                            //console.log("checking "+connectionList[l]+" connection");
                            for( var m=0; m<connections.length; m++ ){
                                if( connectionList[l] == connections[m].name ){
                                    //there is a connection
                                    //console.log(connections[m].name+" is present");
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
                            //console.log(graph.name+"'s graph updated: " + rArr[k].result);
                            //console.log("rArr.result: "+ rArr[k].result );
                            if( rArr[k].result == "laggeddecrease" ){
                                result = data2.laggeddecrease;
                            } else if ( rArr[k].result == "laggedincrease" ){
                                result = data2.laggedincrease;
                            }
                        } else {
                            result = data2.baseline; 
                            //console.log(graph.name+"'s graph updated: baseline");
                        }
                        graph.replace( result, i );
                    }
                }
            }             
        }
    }
    function draw() {
        // console.log("backgroundColour: "+backgroundColour);
        //clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = backgroundColour;
        ctx.shadowBlur=0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
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
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        */
        /*
        // draw text at center, max length to fit on canvas
        ctx.fillText(str, (canvas.width/2)/scaleFactor, (canvas.height/2)/scaleFactor, canvas.width - 10);
        // plot cursor
        ctx.fillStyle = "blue";//"white";
        ctx.fillRect(canX -5, canY -5, 10, 10);
        */
        //Draw picker box
        ctx.fillStyle = paletteColour; //"#DBDADA";
        ctx.shadowBlur=0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.fillRect(pickerbox.x,pickerbox.y,pickerbox.width,pickerbox.height);
        // Draw level badge
        ctx.globalAlpha = 1;
        level.draw();        
        displayList.draw();
    }
}