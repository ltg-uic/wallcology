//FOOD WEB MODELER
function FoodWeb(){
    var mode = "deploy"; //"develop" or "deploy"
    var fullscreen = true;
    var app = "foodwebmodeler";
    var background = "dark";   //"light" or "dark"
    var versionID = "20170809-1600";
    var query_parameters;
    var nutella;
    var portal;
    var instance;
    var group; //-1, 0, 1, 2, 3, 4, null
    
    //canvas variables
    var gcanvas;
    var gctx;
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
    var species = [
        {name:"species_00", width:40, height:40}, {name:"species_01", width:40, height:40}, 
        {name:"species_02", width:40, height:40}, {name:"species_03", width:40, height:40},
        {name:"species_04", width:40, height:40}, {name:"species_05", width:40, height:40}, 
        {name:"species_06", width:40, height:40}, {name:"species_07", width:40, height:40},
        {name:"species_08", width:40, height:40}, {name:"species_09", width:40, height:40}, 
        {name:"species_10", width:40, height:40}]; 
    var fakeSpecies;    //fake species created for adding arrows, so that lines have a target
    var speciesSize = 40;
    var speciesMargin = 30;
    var speciesSpacing = 8;
    var palette;
    var paletteWidth = 70;
    var paletteColour = "#2b394a";
    var buttonColour = "#FF5722";
    
    var toolbar;
    var toolbarWidth = 0;   //80;
    var toolbarColour = "#344559";
    var toolbarSpacing = 20;
    
    var backgroundColour; 
    var shadowColour;   
    var textboxColour;

    var trophicBox1;
    var trophicBox2;
    var trophicBox1Colour;
    var trophicBox2Colour;

    var activeArea;
    var displayList; 
    var label;
    var prompt;
    //var helpText;
    var data;
    var currentDrawing;
    // var initialized = false;

    var obj = [];
    var placeholderObj = [];
    var connections = [];
    var movingConnections = [];
    var potentialConnections = [];
    var newConnectionObjs = [];
    //for manipulating population levels
    var plusButtons = [];   //increase population
    var minusButtons = [];  //decrease population

    var graphs = [];
    var multipleChoice = [];
    var annotations = [];
    
    //var addArrowBtn;
    //var removeArrowBtn;
    var saveBtn;
    //var trashBtn;
    //var viewOnlyBtn;
    //var helpBtn;
    //var savedVersionsNum;   //number of saved versions retrieved from nutella
    //var viewOnly = false;
    //var input;
    //load nutella
    if ( mode == "deploy" ){
        query_parameters = NUTELLA.parseURLParameters();
        nutella = NUTELLA.init(query_parameters.broker, query_parameters.app_id, query_parameters.run_id, NUTELLA.parseComponentId());

        portal = query_parameters.TYPE;
        instance = query_parameters.INSTANCE;

        /*if( query_parameters.TYPE == "teacher"){
            group = -1;
        } else {
            group = query_parameters.INSTANCE;    
        }*/
    } else {
        // query_parameters = { INSTANCE: "null" };
        // group = "null";
        portal = -1;
        instance = -2;
    }
    //load font
    WebFont.load({
        google: {
          families: ['Roboto']
        }
    });
    //load colours
    if ( background == "dark" ){
        backgroundColour = "#263238";   //"#303030";   //"#3d5168";
        textboxColour = "#56687d";
        shadowColour = "#212121";       //"#253240";
        lineColour = "#39b54a";
        lineColours = ["#39b54a", "#FF5722", "#42A5F5"];    //green, red-orange, blue, yellow
        paletteColour = "#1f292e";      //"#2b394a";   //"#212121";      //"#2b394a";
        toolbarColour = "#212121";      //"#344559";
        dialogColour = "#00BCD4";
        trophicBox1Colour = "#455A64";  //"#616161";
        trophicBox2Colour = "#37474F";  //"#424242";
    } else {
        //light
        backgroundColour = "#CFD8DC";   //"#BDBDBD";
        textboxColour = "#FFFFFF";
        shadowColour = "#757575";       //"#BFBFBF";
        lineColour = "#009688";         //"#009245";         //"#22B573";
        lineColours = ["#009688", "#FF5722", "#2196F3"];
        paletteColour = "#2b394a";      //#37474F";    //"#424242";      //"#2b394a";
        toolbarColour = "#344559";
        dialogColour = "#00BCD4";
        trophicBox1Colour = "#FAFAFA";  //"#FAFAFA";
        trophicBox2Colour = "#ECEFF1";  //"#EEEEEE";
    }
    //resize canvas
    onResizeWindow("init");
    //setup datalog
    data = new DataLog( nutella, app, portal, instance, mode );
    //setup display list items
    displayList = new DisplayList( canvas );
    palette = { x:0, y:0, width:paletteWidth, height: preScaledHeight };
    toolbar = { x:preScaledWidth-toolbarWidth, y:0, width:toolbarWidth, height: preScaledHeight };
    trophicBox1 = { x:0, y:0, width:preScaledWidth, height: Math.round(preScaledHeight/3) };
    trophicBox2 = { x:0, y:trophicBox1.height, width:preScaledWidth, height: Math.round(preScaledHeight/3) };
    activeArea = { x: palette.x + paletteWidth, y:0, width: preScaledWidth-palette.width-palette.x-toolbarWidth, height: preScaledHeight };
    placeholderObj = setupPlaceholderSpecies( species );
    obj = setupSpecies( species );
    plusButtons = setupPopulationButtons("plus");
    minusButtons = setupPopulationButtons("minus");
    setupButtons();
    //label = getLabel( group );
    prompt = new Prompt(ctx, paletteWidth+20, 20, preScaledWidth, preScaledHeight, 1, background);
    //prompt = new Prompt(ctx, preScaledWidth/2, 10, preScaledWidth, preScaledHeight, 1, background);
    prompt.setText( "" );
    //displayList.addChild(prompt);
    //helpText = new Help(ctx, preScaledWidth, preScaledHeight, toolbarWidth, background);
    //input = document.getElementById("textBox");
    //input.style.backgroundColor = textboxColour;
    //setupVersions();
     
    data.save("MODELER_INIT",versionID+"; window.innerWidth; "+preScaledWidth+"; window.innerHeight; "+preScaledHeight+"; savedVersionsNum ;");//+savedVersionsNum+"; label ;"+label);
    //get latest saved drawing
    if ( mode == "deploy"){
        nutella.net.request('get_fw', {portal: portal, instance: instance}, function(message,from){
            //message = drawing
            console.log("get fw: "+message);
            retrieveDrawing( message ); 
            setupEventListeners();
            setTimeout( draw, 1000 );
        });
    } else {
        retrieveDrawing( {} );
        setupEventListeners();
        setTimeout( draw, 1000 );
    }

    //SETUP
    function setupEventListeners(){
        canvas.addEventListener("mousemove", onMouseMove, false); 
        canvas.addEventListener("mousedown", onMouseDown, false);
        canvas.addEventListener("mouseup", onMouseUp, false);
        canvas.addEventListener("touchstart", onTouchDown, false);
        canvas.addEventListener("touchmove", onTouchMove, true);
        canvas.addEventListener("touchend", onTouchUp, false);
        canvas.addEventListener("mouseleave", onMouseLeave, false);

        document.body.addEventListener("mouseup", onMouseUp, false);
        document.body.addEventListener("touchcancel", onTouchUp, false);

        window.addEventListener("orientationchange", onResizeWindow);
        //window.addEventListener("resize", onResizeWindow);
        //var formElement = document.getElementById("submitText");
        //formElement.addEventListener('click', handleSubmitText, false);
    }
    function onResizeWindow( init ){
        canvasWidth = (window.innerWidth == 0)? 980 : window.innerWidth;
        canvasHeight = (window.innerHeight == 0)? 680 : window.innerHeight;
        //Canvas for graphs
        gcanvas = document.getElementById("graphs-layer");
        gctx = gcanvas.getContext("2d");
        //Canvas for drag and drop
        canvas = document.getElementById("ui-layer");
        ctx = canvas.getContext("2d");

        //allow for top wallcology buttons and left margin if mode is not set to "fullscreen"
        //console.log("fullscreen: "+fullscreen+", canvasWidth: "+canvasWidth+", canvasHeight: "+canvasHeight);
        if ( fullscreen ){
            canvas.width = canvasWidth;
            canvas.height = canvasHeight;
            gcanvas.width = canvasWidth;
            gcanvas.height = canvasHeight;
        } else if ( !fullscreen ){
            var distFromTop = 26;
            var distFromLeft = 24;
            canvas.width = canvasWidth-distFromLeft;
            canvas.height = canvasHeight-distFromTop;
            gcanvas.width = canvasWidth-distFromLeft;
            gcanvas.height = canvasHeight-distFromTop;
        }
        //scaling a canvas with a backing store multipler
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

            gcanvas.width = gcanvas.width * scaleFactor;
            gcanvas.height = gcanvas.height * scaleFactor;
            gcanvas.style.width = preScaledWidth + "px";
            gcanvas.style.height = preScaledHeight + "px";
            // update the context for the new canvas scale
            gctx.scale( scaleFactor, scaleFactor );

        }
        //move annotate div
        //var annotateY = preScaledHeight - 40 + "px";
        //document.getElementById("annotate-layer").style.top = annotateY;
        if ( init != "init" ){
            for( var j=0; j<graphs.length; j++ ){
                var g = graphs[j];
                g.x = preScaledWidth - g.width;
                g.drawBarGraph(j);
            }
            if ( prompt ){
                prompt.x = preScaledWidth/2;
                prompt.setMaxWidth( preScaledWidth );
            }
            if ( toolbar ){
                toolbar.x = preScaledWidth-toolbarWidth;
                toolbar.height = preScaledHeight;
            }
            if ( palette ){
                palette.height = preScaledHeight;
            }
            /*
            if ( addArrowBtn ){
                var btnX = preScaledWidth-toolbarWidth+11;
                addArrowBtn.x = btnX;
                removeArrowBtn.x = btnX;
                saveBtn.x = btnX;
                trashBtn.x = btnX;
                helpBtn.x = btnX;
                viewOnlyBtn.x = preScaledWidth-toolbarWidth-viewOnlyBtn.width-10;
            }
            */
            // if( version ){
            //     version.updateCanvasSize( preScaledWidth, preScaledHeight);
            // }
            // if( helpText ){
            //     helpText.updateCanvasSize( preScaledWidth, preScaledHeight );
            // }
            data.save("MODELER_RESIZE","window.innerWidth; "+preScaledWidth+"; window.innerHeight; "+preScaledHeight);
        }
        setTimeout(draw, 500);
    }
    function setupSpecies( speciesArr ){
        var tempArr = [];
        var tempY = speciesMargin;
        for(var i=0; i<speciesArr.length; i++){
            var sp = speciesArr[i];
            var tempObj = new Species( sp.name, 
                (paletteWidth-sp.width)/2, tempY+speciesSpacing-sp.height/2, 
                sp.height, sp.width, ctx, shadowColour );
            tempArr.push(tempObj);
            displayList.addChild(tempObj);
            tempY += speciesSize+speciesSpacing;        
        }
        return tempArr;
    }
    function setupPlaceholderSpecies( speciesArr ){
        var tempArr = [];
        var tempY = speciesMargin;
        for(var i=0; i<speciesArr.length; i++){
            var sp = speciesArr[i];
            var tempObj = new Species( sp.name+"_grey", 
                (paletteWidth-sp.width)/2, tempY+speciesSpacing-sp.height/2, 
                sp.height, sp.width, ctx, shadowColour );
            tempArr.push(tempObj);
            displayList.addChild(tempObj);
            tempY += speciesSize+speciesSpacing;        
        }
        return tempArr;
    }
    //Set up population action buttons
    function setupPopulationButtons( t ){
        var tempArr = [];
        var type = t;
        for (var i = 0; i < obj.length; i++) {
            var tempBtn = new ActionButton(ctx, type, obj[i].width, obj[i].height,  buttonColour, shadowColour, backgroundColour );
            tempBtn.index = i;
            tempArr.push( tempBtn );
            displayList.addChild(tempBtn);
        }
        return tempArr;
    }
    //Set up toolbar buttons
    function setupButtons(){
        var btnHeight = 48;
        var btnWidth = 60;
        //var btnX = preScaledWidth-toolbarWidth+11;//((toolbarWidth-btnWidth)/3);
        //var btnY = speciesMargin;
        var btnX = (paletteWidth - btnWidth)/2;
        var btnY = preScaledHeight - btnHeight - 10;
        //console.log("save button: "+btnX+", "+btnY);
        saveBtn = new ImageTextButton("Save", btnX, btnY, btnWidth, btnHeight, ctx, paletteColour, "#FFFFFF", "300 8pt 'Roboto'", 28, background);
        //btnY += toolbarSpacing + btnHeight;
        displayList.addChild( saveBtn );
        saveBtn.addEventListener( saveBtn.EVENT_CLICKED, handleToobarClicks ); 
        
        /*
        addArrowBtn = new ImageTextButton("Add", btnX, btnY, btnWidth, btnHeight, ctx, toolbarColour, "#FFFFFF", "300 8pt 'Roboto'", 28, background);
        btnY += toolbarSpacing + btnHeight;
        displayList.addChild( addArrowBtn );

        removeArrowBtn = new ImageTextButton("Remove", btnX, btnY, btnWidth, btnHeight, ctx, toolbarColour, "#FFFFFF", "300 8pt 'Roboto'", 28, background);
        btnY += toolbarSpacing + btnHeight;
        displayList.addChild( removeArrowBtn );

        trashBtn = new ImageTextButton("Delete", btnX, btnY, btnWidth, btnHeight, ctx, toolbarColour, "#FFFFFF", "300 8pt 'Roboto'", 28, background);
        trashBtn.active = true;
        btnY += toolbarSpacing + btnHeight;
        displayList.addChild( trashBtn );

        helpBtn =  new ImageTextButton("Help", btnX, btnY, btnWidth, btnHeight, ctx, toolbarColour, "#FFFFFF", "300 8pt 'Roboto'", 28, background);
        displayList.addChild( helpBtn ); 
        */
        //only show view only icon if in view only mode
        //viewOnlyBtn = new ImageTextButton("View Only", preScaledWidth-toolbarWidth-btnWidth-10, 30, btnWidth, btnHeight, ctx, backgroundColour, "#FFFFFF", "300 8pt 'Roboto'", 28, background);
        //one event listener works for all ImageTextButtons
        //saveBtn.addEventListener( saveBtn.EVENT_CLICKED, handleToobarClicks ); 
    }
/*    //get nubmer of saved version from server
    function setupVersions(){
        if ( mode == "deploy"){
            nutella.net.request('get_num_of_saved_foodwebs', group, function( num, from ){
                savedVersionsNum = num;
                version = new Version(ctx, preScaledWidth, preScaledHeight, toolbarWidth, toolbarColour, savedVersionsNum);
                version.changeVersion();
            });
        } else {
            savedVersionsNum = 0;
            version = new Version(ctx, preScaledWidth, preScaledHeight, toolbarWidth, toolbarColour, savedVersionsNum);
            version.changeVersion();
        }
    }
*/
    //EVENTLISTENERS
    function onMCcontinueClick(e){
        for(var i=0; i<multipleChoice.length; i++){
            var mc = multipleChoice[i];
            displayList.removeChild( mc );
            mc.removeEventListener(mc.EVENT_REDRAW, handleRedraw);
            mc.removeEventListener(mc.EVENT_CLICKED, onMCrunClick);
            mc.removeEventListener(mc.EVENT_CONTINUE, onMCcontinueClick);
            mc = {};
            multipleChoice.splice(i, 1);
        }
        draw();   
    }
    function onMCrunClick(e){
        var sp;
        var num;
        var type;
        prompt.setText(" ");
        for(var i=0; i<multipleChoice.length; i++){
            var mc = multipleChoice[i];
            var arr = mc.getSelectionArray();
            for(var j=0; j<arr.length; j++){
                var item = arr[j];
                data.save("MODELER_MC_RUN","object ;"+item.species.name+" ;direction ;"+item.type+" ;graph ;"+item.name+" ;select ;"+item.selection);
                sp = item.species;
                num = item.num;
                type = item.type;
            }
            handlePopulationChange( sp, num, type );
        }
        draw();
    }
    function onMouseLeave(e){
        //console.log("onMouseLeave: startX: "+e.clientX+", startY: "+e.clientY);
        dragok = false;
        startX = e.clientX;
        startY = e.clientY;
        //e.changedTouches[0].pageX, e.changedTouches[0].pageY
        mouseIsDown = 0;
    }    
    function handleToobarClicks(e){
        var clicked = e.target;
        // if ( !viewOnly ){
        switch( clicked.name ){
            case "Save":
                newConnectionObjs = [];
                //addArrowBtn.active = false;
                //addArrowBtn.drawButton();
                //removeArrowBtn.active = false;
                //helpBtn.active = false;
                //helpBtn.drawButton();
                //removeArrowBtn.drawButton();
                saveFoodWeb();
                //handleHelpText();
                break;
            default:
        }
    }
/*
    //direction = "first", "back", "next", or "last"
    function handleVersionChange( direction ){
        //console.log("handleVersionChange: "+direction);
        saveBtn.active = false;
        saveBtn.drawButton();
        var oldVersion = version.num;
        var newVersion;
        var lastVersion = version.saved + 1;
        if ( direction == "next" ){
            newVersion = oldVersion + 1;
        } else if ( direction == "back" ){
            newVersion = oldVersion - 1;
        } else if ( direction == "last" ){
            newVersion = lastVersion;
        } else if ( direction == "first" ){
            newVersion = 1;
        }   
        version.num = newVersion; 

        if ( newVersion == (version.saved + 1) ){
            viewOnly = false;
            //console.log("remove viewOnlyBtn: " + containsObject( viewOnlyBtn, displayList.objectList ));
            if ( containsObject( viewOnlyBtn, displayList.objectList ) ){
                displayList.removeChild( viewOnlyBtn );   
            }
            clearFoodWeb();
            retrieveDrawing( currentDrawing );
            data.save("FOODWEB_RETRIEVE_CURRENT","savedVersionsNum ;"+savedVersionsNum+";version.num ;"+version.num+";version.saved ;"+version.saved+";viewOnly ;"+viewOnly);
        } else {
            if ( !containsObject( viewOnlyBtn, displayList.objectList )){
                displayList.addChild( viewOnlyBtn );
            }
            //need to save current state before retrieveDrawing
            if( !viewOnly ){
                var d = getDrawing();
                currentDrawing = d.drawing;
            }
            clearFoodWeb();
            //retrieve saved versions
            var index = newVersion-1;
            if ( mode == "deploy"){ 
                //earliest = 0, current = n;
                nutella.net.request('get_saved_foodweb',{group: group, index: index}, function(foodweb,from){
                   retrieveDrawing( foodweb.drawing ); 
                   draw();
                });
            } else {      
                retrieveDrawing( {group:group, time:0, nodes:[{ name: "species_00", x: 415, y:202, active: true }, { name: "species_01", x: 247, y:96, active: true }, { name: "species_02", x: 341, y:376, active: true }, { name: "species_03", x: 10, y:187, active: false }, { name: "species_04", x: 338, y:560, active: true }, { name: "species_05", x: 635, y:454, active: true }, { name: "species_06", x: 10, y:361, active: false }, { name: "species_07", x: 10, y:419, active: false }, { name: "species_08", x: 10, y:477, active: false }, { name: "species_09", x: 10, y:535, active: false }, { name: "species_10", x: 10, y:593, active: false }], links:[{ name: "species_01-species_00", source: "species_01", destination:"species_00", type: "eatenby" }, { name: "species_02-species_00", source: "species_02", destination:"species_00", type: "eatenby" }, { name: "species_04-species_02", source: "species_04", destination:"species_02", type: "eatenby" }, { name: "species_05-species_00", source: "species_05", destination:"species_00", type: "eats" }], comments:[{name:"hello world!", x:400, y:100}]});
            }
            viewOnly = true;
            data.save("FOODWEB_RETRIEVE_SAVED","savedVersionsNum ;"+savedVersionsNum+";version.num ;"+version.num+";version.saved ;"+version.saved+";viewOnly ;"+viewOnly);
        }
    }*/

    /*
    function handleSubmitText(e){
        e.preventDefault();
        if( !viewOnly ){
            //create new annotation
            //var message = document.getElementById("submitText");
            var message = input.value;
            input.value = '';
            if ( message != '' ){
                var a = new Annotation( message, ctx, backgroundColour, "#FFFFFF", "300 11pt 'Roboto'" );
                displayList.addChild(a);
                a.drawAnnotation();
                annotations.push(a);
                data.save("FOODWEB_ANNOTATION_ADDED","content ;"+message+";number of annotations ;"+annotations.length);
            }
        }
    }
    function handleHelpText(){
        //console.log("handleHelpText: "+helpBtn.active);
        if ( helpBtn.active ){
            if ( !containsObject( helpText, displayList.objectList ) ){
                displayList.addChild( helpText );   
                helpText.drawHelp();
            }
        } else {
            if ( containsObject( helpText, displayList.objectList ) ){
                displayList.removeChild( helpText );   
                draw();
            }
        }
    }
    */
    function handleRedraw(e){
        draw();   
    }
    function onTouchUp(e){
        //console.log("onTouchUp");
        // tell the browser we're handling this mouse event
        e.preventDefault();
        e.stopPropagation();
        endMove(e.changedTouches[0].pageX, e.changedTouches[0].pageY,true);
        // if( !viewOnly ){
            displayList.onMouseUp(event);
        // }
        //return false to cancel mouse up events from firing
        // return false;
    }
    function onTouchDown(e){
        // tell the browser we're handling this mouse event
        e.preventDefault();
        e.stopPropagation();
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
        //console.log("onMouseUp");
        e.preventDefault();
        e.stopPropagation();
        endMove(e.clientX,e.clientY,false);
        // if( !viewOnly ){
            displayList.onMouseUp(event);
        // }
    }
    // handle mouse moves
    function onMouseMove(e) {
        // if we're dragging anything...
        if(!e)
            var e = event;
        moveXY(e.clientX,e.clientY);
    }
    function moveXY(x,y){
        // if ( !initialized ){
        //     onResizeWindow();
        //     initialized = true;
        // }
        // if ( !viewOnly ){
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
                    if ( r.isDragging ) {
                        //test to see if object is within boundary
                        if( r.x + r.width + dx >= preScaledWidth-toolbarWidth || r.y + r.height + dy >= preScaledHeight || r.y + dy < 0 || r.x + dx < 0 ){
                            //do nothing
                            startX = r.x + r.width/2;
                            startY = r.y + r.height/2;
                        } else {
                            r.x += dx;
                            r.y += dy;
                            startX = mx;
                            startY = my;
                        }
                        //create function to make temporary lines, only if there are more than 2 active objects
                        var activeObj = getActiveObj();
                        if ( activeObj.length >= 1 && !r.active){
                            setupMovingConnections(r);
                        }
                    }
                }
                for (var k = 0; k < plusButtons.length; k++) {
                    plusButtons[k].updateXY( obj[k].x, obj[k].y );
                }
                for (var l = 0; l < minusButtons.length; l++) {
                    minusButtons[l].updateXY( obj[l].x, obj[l].y );
                }
                for (var j = 0; j < connections.length; j++) {
                    connections[j].updateXY();
                }
                /*
                var overTrashBtn = false;
                for ( var k=0; k<annotations.length; k++){
                    var a = annotations[k];
                    if ( a.isDragging ) {
                        movingAnnoation = a;
                        if( a.x + a.width + dx >= preScaledWidth || a.y + a.height + dy >= preScaledHeight || a.y + dy < 0 || a.x + dx < paletteWidth ){
                            //do nothing
                            startX = a.x + a.width/2;
                            startY = a.y + a.height/2;
                        } else {                   
                            a.x += dx;
                            a.y += dy;
                            startX = mx;
                            startY = my;
                        }
                        if( detectHit( mx, my, trashBtn )){
                            overTrashBtn = true;
                        }    
                    }
                }
                */
                /*// reset the starting mouse position for the next mousemove
                var maxDragX = preScaledWidth-toolbarWidth;
                startX = (mx<maxDragX)?mx:maxDragX;
                // startX = mx;
                startY = my;*/
                draw();
            }
            /*
            //set active state of trash button to true if mouse over and dragging annotation, otherwise, set to false
            if ( overTrashBtn ){
                trashBtn.active = false;
                trashBtn.drawButton();
                movingAnnoation.drawAnnotation();
            } else {
                trashBtn.active = true;
            }
            if ( addArrowBtn.active ){
                if( newConnectionObjs.length >= 1 ){
                    //console.log("source obj: "+newConnectionObjs[0].name+", looking for lines");
                    showPotentialConnections( x, y );
                    draw();
                }
            }
            */
        // }
    }
    function startMove(x,y,isTouch){
        // if ( !viewOnly ){
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
            for ( var j=0; j<annotations.length; j++){
                var a = annotations[j];
                if (mx > a.x && mx < a.x + a.width && my > a.y && my < a.y + a.height) {
                    // if yes, set that obj isDragging=true
                    dragok = true;
                    a.isDragging = true;
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
        // }
    }
    function endMove(x,y,isTouch){
        var newx = x;
        var newy = y;
        mouseIsDown = 0;
        //detectHit 
        var mx = parseInt(newx - canvas.offsetLeft);
        var my = parseInt(newy - canvas.offsetTop);
        /*
        //check to see if version buttons are clicked
        if( detectHit( mx, my, version )){
            if( detectHit( mx, my, version.nextBtn ) && version.nextBtn.active ){
                //NEXT
                handleVersionChange( version.nextBtn.name );
                version.changeVersion( mx, my, version.nextBtn.name);
            } else if ( detectHit( mx, my, version.backBtn ) && version.backBtn.active ){
                //BACK
                handleVersionChange( version.backBtn.name );
                version.changeVersion( mx, my, version.backBtn.name );
            } else if ( detectHit( mx, my, version.lastBtn ) && version.lastBtn.active ){
                //LAST
                handleVersionChange( version.lastBtn.name );
                version.changeVersion( mx, my, version.lastBtn.name );
            } else if ( detectHit( mx, my, version.firstBtn ) && version.firstBtn.active ){
                //FIRST
                handleVersionChange( version.firstBtn.name );
                version.changeVersion( mx, my, version.firstBtn.name );
            }
        }*/
        
        // clear all the dragging flags
        dragok = false;
        for (var i = 0; i < obj.length; i++) {
            var o = obj[i];
            var to;
            var from;
            if( o.isDragging ){
                if( detectHit( o.x, o.y, activeArea )){
                    if ( o.active ){
                        //then just moving around
                        to = "active";
                        from = "active";
                        o.active = true;
                    } else {
                        //then moving from palette to active
                        to = "active";
                        from = "palette";
                        o.active = true;
                    }
                    setActiveProperty( activeArea, true );
                    //console.log( "detectHit: work area, name:"+o.name+", from: "+from+", to: "+to+", active: "+o.active );
                } else if( detectHit( o.x, o.y, palette )){
                    if ( o.active ){
                        //move from active to palette
                        to = "palette";
                        from = "active";
                        o.active = false;
                        //console.log("remove connections 1: "+o.name);
                        removeConnectionBySpecies( o );
                    } else {
                        //then moving from palette to palette
                        to = "palette";
                        from = "palette";
                        o.active = false;   
                    }
                    setActiveProperty( palette, false );
                    //console.log( "detectHit: palette, name:"+o.name+", from: "+from+", to: "+to+", active: "+o.active );
                } else {   
                    if ( o.active ){
                        //move from active to palette
                        to = "palette";
                        from = "active";
                        o.active = false;
                        //console.log("remove connections 2: "+o.name);
                        removeConnectionBySpecies( o );
                    } else {
                        //then moving from palette to palette
                        to = "palette";
                        from = "palette";
                        o.active = false;   
                    }
                    setActiveProperty( palette, false );
                    //console.log( "detectHit: unknown, name:"+o.name+", from: "+from+", to: "+to+", active: "+o.active );
                }
                data.save("MODELER_SPECIES_MOVE","object ;"+o.name+" ; x;"+o.x+" ;y ;"+o.y+" ;from ;"+from+" ;to ;"+to);
            }
            o.isDragging = false;
        }
        //check to see if population action buttons are clicked
        if(detectHit( mx, my, activeArea )){
            //console.log("active");
            setActiveProperty( activeArea, true );
            if ( multipleChoice.length < 1 ){
                for (var j = 0; j < plusButtons.length; j++) {
                    if( detectHit(mx,my,plusButtons[j])){
                        handlePopulationChange( obj[j], j, "plus" );
                        //setupPopulationChange(obj[j], j, "plus");
                    }
                }
                for (var k = 0; k < minusButtons.length; k++) {
                    if( detectHit(mx,my,minusButtons[k])){
                        handlePopulationChange( obj[k], k, "minus" );
                        //setupPopulationChange(obj[k], k, "minus");
                    }
                }
            }
        }

        //if addArrow button is active, add source/destination objects to the array
        //flag checks if user clicked on species
        /*
        if ( addArrowBtn.active && !viewOnly ){
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
                //addArrowBtn.active = false;
                //addArrowBtn.drawButton();   
            }
        }
        */
        var tempConnections = [];
        //var trashConnections = false;
        //if removeArrow button is active, remove line if mouse/touch is over line 
        /*
        if ( removeArrowBtn.active && !viewOnly ){
            //console.log("remove line clicked: "+canX+", "+canY);
            for( var k=0; k<connections.length; k++){
                var c = connections[k];
                if ( detectHit( mx, my, c ) ){
                    tempConnections.push( {connection: c, index:k});
                    trashConnections = true;
                }
            }
        }
        if ( trashConnections && !viewOnly ){       
            if( tempConnections.length < 2 ){
                //remove connection
                data.save("FOODWEB_CONNECTION_REMOVED","remove arrow tool ;x ;"+mx+" ;y ;"+my+" ;connection ;"+tempConnections[0].connection.name+" ;type ;"+tempConnections[0].connection.type);
                displayList.removeChild( tempConnections[0].connection );
                connections.splice( tempConnections[0].index, 1 );
                removeArrowBtn.drawButton();
            } else {
                var dist;
                for ( var i = 0; i< tempConnections.length; i++ ){
                    var tc = tempConnections[i];
                    dist = getDistance( {x:mx, y:my}, {x:tc.connection.x+tc.connection.width/2, y:tc.connection.y+tc.connection.height/2} );
                    if ( dist < 30 ){
                        data.save("FOODWEB_CONNECTION_REMOVED","remove arrow tool ;x ;"+mx+" ;y ;"+my+" ;connection ;"+tc.connection.name+" ;type ;"+tc.connection.type);
                        displayList.removeChild( tempConnections[i].connection );
                        removeItem( connections, tempConnections[i].connection );
                        //removeItem( connections, t );
                        //connections.splice( tempConnections[i].index, 1 );
                        removeArrowBtn.drawButton();
                    }
                    //console.log("tempConnections["+i+"]: "+tc.connection.name+", dist: "+dist );
                }
            }
        }
        tempConnections = [];
        removeArrowBtn.active = false;

        var tempAnnotation;
        var tempIndex;
        var trashAnnotation = false;
        for (var l = 0; l < annotations.length; l++) {
            var a = annotations[l];
            if( a.isDragging ){
                data.save("FOODWEB_ANNOTATION_MOVE","content ;"+a.name+" ; x;"+a.x+" ;y ;"+a.y+" ; height;"+a.height+" ;width ;"+a.width);
                if( detectHit( newx, newy, trashBtn )){
                    tempAnnotation = a;
                    tempIndex = l;
                    trashAnnotation = true;
                    //console.log("delete this annotation");
                }
            }
            a.isDragging = false;
        }
        //remove annotation if user moves it to trash button
        if ( trashAnnotation && !viewOnly ){
            displayList.removeChild( tempAnnotation );
            annotations.splice( tempIndex, 1 );
            data.save("FOODWEB_ANNOTATION_REMOVED","content ;"+tempAnnotation.name+";number of annotations ;"+annotations.length);
        }
        trashBtn.active = true;

        //if save button is active, upon mouse click, change it back to inactive
        if ( saveBtn.active && !viewOnly ){
            saveBtn.active = false;
        }
        */
        //evalNewConnection();
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
    //Detect whether x,y position within area 'a', assumes x, y is at top left of object
    function detectHit(x,y,a){
        var mx = x;
        var my = y;
        var r = a;
        if (mx > r.x && mx < r.x + r.width && my > r.y && my < r.y + r.height)
            return 1;
    }
    //detects if object is in array, returns true or false
    function containsObject(obj, list) {
        var i;
        for (i = 0; i < list.length; i++) {
            if (list[i] === obj) {
                return true;
            }
        }
        return false;
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
                mb.active = b;
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
    //g = group, returns label to be placed at the top of the UI
    function getLabel( g ){
        var label;
        var team; 
        switch (g){
            case -1:
                label = "Community Food Web";
                break;
            case "null":
                label = "";//"Master Population Interaction Web";
                break;
            default:
                team = Number(g)+1;
                // label = "";
                label = "Team "+ team;
        }
        return label;
    }
    
    //usage: removeItem( connections, t );
    function removeItem( arr ) {
        var what, a = arguments, L = a.length, ax;
        while (L > 1 && arr.length) {
            what = a[--L];
            while ((ax= arr.indexOf(what)) !== -1) {
                arr.splice(ax, 1);
            }
        }
        return arr;
    }
    
    //if species is moved from active to palette, find all of the connections connected to it and remove it/them
    function removeConnectionBySpecies( sp ){
        var tempArr = []
        for (var i=0; i<connections.length; i++){
            var c = connections[i];
            var str = c.name;
            var pos = str.indexOf(sp.name);
            //console.log("connection["+i+"]: "+c.name+", inactive species: "+sp.name+", pos: "+pos );
            if ( pos >= 0 ){
                tempArr.push(c);
            }
        }
        for ( var j=0; j<tempArr.length; j++){
            var t = tempArr[j];
            data.save("FOODWEB_CONNECTION_REMOVED","inactive object ;"+sp.name+" ;name ;"+t.name+" ;type ;"+t.type);
            displayList.removeChild( t );
            removeItem( connections, t );
        }
    }
    function evalConnection(){
        for ( var i=0; i<movingConnections.length; i++){
            var movingConnection = movingConnections[i];
            data.save("FOODWEB_CONNECTION_ADDED","source ;"+movingConnection.obj1.name+" ;destination ;"+movingConnection.obj2.name+" ;name ;"+movingConnection.name+" ;type ;"+movingConnection.type);
            movingConnection.addEventListener( movingConnection.EVENT_REDRAW, redrawCanvas );
            connections.push( movingConnection );
        }
        movingConnections = [];
        //REMOVE CONNECTION
        //for every connection, check to see if both species are active
        //first loop runs through all the created connections
        var activeObjList = getActiveObj();
        for( var j=0; j<connections.length;j++){
            //console.log("connections["+j+"]: "+connections[j].name+", obj1: "+connections[j].obj1.name+", obj2: "+connections[j].obj2.name );
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
    /*
    function evalNewConnection(){
        if( addArrowBtn.active ){
            if( newConnectionObjs.length >= 2 ){
                var obj1 = newConnectionObjs[0];
                var obj2 = newConnectionObjs[1];
                //if the new objects are the same, return
                if ( obj1.name == obj2.name ){
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
                var tempConnection = obj1.name+"-"+obj2.name;
                var connectType = "eatenby"
                var line = new Line( tempConnection, obj1, obj2, ctx, 1, connectType, data, shadowColour, backgroundColour, lineColour);
                connections.push( line );
                displayList.addChild( line );
                data.save("FOODWEB_CONNECTION_ADDED","add arrow tool ;source ;"+obj1.name+" ;destination ;"+obj2.name+" ;connection ;"+connectType);

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
    */
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
    //if add arrow button is active, and a source species is chosen, then show potenial connections
    function showPotentialConnections( mx, my ){
        //create fake species if source object is clicked when add arrow function is on
        if( fakeSpecies ){
            fakeSpecies.x = mx;
            fakeSpecies.y = my;

        } else {
            fakeSpecies = new Species( "species_00", mx, my, 10, 10, ctx, shadowColour );    
            //displayList.addChild( fakeSpecies );
        }        
        var sourceObj = newConnectionObjs[0];        
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
                    //console.log("background: "+ background+", s.name: "+s.name);
                    var graph = new BarGraph(gctx, s, preScaledWidth, background );
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
        //clear canvas
        gctx.clearRect(0, 0, gcanvas.width, gcanvas.height);
        //draw graphs
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
                prompt.setText("Populations are in flux. Wait until they are stabilized to start a new manipulation.")
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
                mc.removeEventListener(mc.EVENT_CLICKED, onMCrunClick);
                mc.removeEventListener(mc.EVENT_CONTINUE, onMCcontinueClick);
                mc = {};
                multipleChoice.splice(i, 1);
            }

            //setup multple choice and prompts
            data.save("MODELER_MC_START","object ;"+species.name+" ;direction ;"+direction);
            var mc = new MultipleChoice( namesArr, preScaledHeight, preScaledWidth, ctx, species, num, direction, buttonColour, headingText, promptText );
            mc.addEventListener(mc.EVENT_REDRAW, handleRedraw);
            mc.addEventListener(mc.EVENT_CLICKED, onMCrunClick);
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

        if( direction == "plus"){
            prompt.setText(object.name + " population goes up");    
        } else {
            prompt.setText(object.name + " population goes down");
        }

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
    function saveFoodWeb(){
        //handle versions
        // savedVersionsNum += 1;
        // version.saveVersion( savedVersionsNum );
        //save drawing 
        var d = getDrawing();
        //var dataURL = canvas.toDataURL();
        data.saveDrawing( d.drawing, d.message );//, dataURL );
        //draw "Saved" button state
        saveBtn.drawButton();
        saveBtn.active = true;
        setTimeout( resetSavedButton, 2000 );
        data.save("FOODWEB_DRAWING_SAVED","drawing ;"+d.message);
    }
    function resetSavedButton(){
        saveBtn.active = false;
        saveBtn.drawButton();
    }
    function redrawCanvas(e){
        //see which line called the function and then call draw only once
        var lineClicked = e.target; //line clinked
        for ( var i=0; i < connections.length; i++ ){
            var c = connections[i];
            if ( c.name == lineClicked.name ){
                console.log("redrawCanvas");
                draw();   
            }
        }
    }
    function getDrawing(){
        var nodes = [];
        var links = [];
        var comments = [];
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
        for(var k=0; k<annotations.length; k++){
            var a = annotations[k];
            //create annotation
            var comment = { name: a.name, x: a.x, y: a.y };
            message += "{ name: " + a.name + ", x: " + a.x +", y:"+a.y+" }, ";
            comments.push( comment );
        }
        message = message.slice(0, -2);
        currentDrawing = { nodes: nodes, links: links, comments: comments };
        return {drawing: currentDrawing, message: message};
    }
    //clear drawing
    function clearFoodWeb(){
        for(var i=0; i<obj.length; i++){
            var o = obj[i];
            o.active = false;
            o.x = o.px;
            o.y = o.py;
        }
        for(var j=0; j<connections.length; j++){
            var c = connections[j];
            c.removeEventListener( c.EVENT_REDRAW, redrawCanvas );
            displayList.removeChild( c );
        }
        for(var k=0; k<annotations.length; k++){
            var a = annotations[k];
            displayList.removeChild( a );
        }
        connections = [];
        movingConnections = [];
        potentialConnections = [];
        newConnectionObjs = [];
        annotations = [];
    }
    //retrieve drawing
    function retrieveDrawing( drawing ){
        var nodes;
        var links;
        //var comments;
        if ( !drawing ){
            return;
        }
        if ( drawing.hasOwnProperty('nodes') ){
            nodes = drawing.nodes;
        } else {
            nodes = [];
        }
        if ( drawing.hasOwnProperty('links') ){
            links = drawing.links;
        } else {
            links = [];
        }
        /*if ( drawing.hasOwnProperty('comments') ){
            comments = drawing.comments;
        } else {
            comments = [];
        }*/

        for(var i=0; i<nodes.length; i++){
            var n = nodes[i];
            //var node = { name: o.name, x: o.x, y: o.y, active: o.active };
            for (var k=0; k<obj.length; k++){
                var o = obj[k];
                if( n.name == o.name ){
                    o.x = n.x;
                    o.y = n.y;
                    o.active = n.active;
                    if( o.active ){
                        var pb = plusButtons[i];
                        var mb = minusButtons[i];
                        pb.updateXY( o.x, o.y );
                        mb.updateXY( o.x, o.y );
                        pb.active = true;
                        mb.active = true;
                    }
                }
            }
            
        }
        for(var j=0; j<links.length; j++){
            var l = links[j];
            //var link = { name: c.name, source: c.obj1.name, destination: c.obj2.name, type: c.type };
            //create connections
            var tempConnection = l.source+"-"+l.destination;
            var connectType = l.type;
            var obj1;
            var obj2;
            //get obj1 and obj2 by name
            for( var m=0; m<obj.length; m++){
                var o = obj[m];
                if ( o.name == l.source ){
                    obj1 = o;
                } else if ( o.name == l.destination ){
                    obj2 = o;
                }
            }
            var line = new Line( tempConnection, obj1, obj2, ctx, 1, connectType, data, shadowColour, backgroundColour, lineColour);
            line.addEventListener( line.EVENT_REDRAW, redrawCanvas );
            connections.push( line );
            displayList.addChild( line );
        }
        /*for(var k=0; k<comments.length; k++){
            var c = comments[k];
            //create annotation
            var annotation = new Annotation( c.name, ctx, backgroundColour, "#FFFFFF", "300 11pt 'Roboto'" );
            annotation.x = c.x;
            annotation.y = c.y;
            annotations.push( annotation );
            displayList.addChild( annotation );
        }*/
        evalGraphs();
    }
    function draw() {
        //clear canvas
        ctx.clearRect(0, 0, preScaledWidth, preScaledHeight);
        ctx.fillStyle = backgroundColour;
        ctx.fillRect(0, 0, preScaledWidth, preScaledHeight);

        //draw trophicBox
        ctx.shadowBlur=0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.fillStyle = trophicBox1Colour;
        ctx.fillRect(trophicBox1.x, trophicBox1.y, trophicBox1.width, trophicBox1.height);
        ctx.fillStyle = trophicBox2Colour;
        ctx.fillRect(trophicBox2.x, trophicBox2.y, trophicBox2.width, trophicBox2.height);
        
        //clear area so graphs will show through; graph width = 400
        ctx.clearRect(preScaledWidth-400,0,400,graphs.length*80);
        
        /*//showPos
        ctx.font = "24pt Helvetica";
        ctx.shadowBlur=0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "white";//"rgb(64,255,64)";
        var str = canX + ", " + canY;
        if (mouseIsDown)
            str += " down";
        if (!mouseIsDown)
            str += " up";
        // draw text at center, max length to fit on canvas
        ctx.fillText(str, (canvas.width/2)/scaleFactor, (canvas.height/2)/scaleFactor, canvas.width - 10);
        // plot cursor
        ctx.fillStyle = "white";
        ctx.fillRect(canX -5, canY -5, 10, 10);*/

        //draw palette
        ctx.fillStyle = paletteColour;
        ctx.fillRect(palette.x, palette.y, palette.width, palette.height);
        //draw toolbar
        
        ctx.fillStyle = toolbarColour;
        ctx.fillRect(toolbar.x, toolbar.y, toolbar.width, toolbar.height);
        
        if ( preScaledHeight != 0 && preScaledWidth != 0 ){
            //version.draw();
            displayList.draw();
        }
    }
}