//WALLCOLOGY FOOD WEB
function FoodWeb(){
    var mode = "deploy"; //"develop" or "deploy"
    var fullscreen = true;
    var app = "wallcology";
    var background = "dark";   //"light" or "dark"
    var versionID = "20161007-0940";
    var query_parameters;
    var nutella;
    var group; //-1, 0, 1, 2, 3, 4, null
    
    //canvas variables
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
        {name:"species_00", width:50, height:50}, {name:"species_01", width:50, height:50}, 
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
    var paletteColour;
    var buttonColour = "#FF5722";
    var toolbar;
    var toolbarWidth = 80;
    var toolbarColour = "#344559";
    var toolbarSpacing = 20;
    var backgroundColour; 
    var shadowColour;   
    var textboxColour;

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
    var annotations = [];
    
    var addArrowBtn;
    var removeArrowBtn;
    var saveBtn;
    //var annotateBtn;
    var trashBtn;
    var viewOnlyBtn;
    var savedVersionsNum;
    var viewOnly = false;
    var input;
    //var isAnnotating = false;

    //load nutella
    if ( mode == "deploy" ){
        query_parameters = NUTELLA.parseURLParameters();
        nutella = NUTELLA.init(query_parameters.broker, query_parameters.app_id, query_parameters.run_id, NUTELLA.parseComponentId());
        if( query_parameters.TYPE == "teacher"){
            group = -1;
        } else {
            group = query_parameters.INSTANCE;    
        }
    } else {
        query_parameters = { INSTANCE: "null" };
        group = "null";
    }
    //load font
    WebFont.load({
        google: {
          families: ['Roboto']
        }
    });
    //load colours
    if ( background == "dark" ){
        backgroundColour = "#3d5168";
        textboxColour = "#56687d";
        shadowColour = "#253240";
        lineColour = "#39b54a";
        paletteColour = "#2b394a";
    } else {
        backgroundColour = "#FFFFFF";
        textboxColour = "#FFFFFF";
        shadowColour = "#BFBFBF";
        lineColour = "#22B573";
        paletteColour = "#2b394a";
    }
    //resize canvas
    onResizeWindow("init");
    //setup datalog
    data = new DataLog( nutella, app, query_parameters.INSTANCE, mode );
    data.save("FOODWEB_INIT",versionID+"; window.innerWidth; "+preScaledWidth+"; window.innerHeight; "+preScaledHeight);
    //setup display list items
    displayList = new DisplayList( canvas );
    palette = { x:0, y:0, width:paletteWidth, height: preScaledHeight };
    toolbar = { x:preScaledWidth-toolbarWidth, y:0, width:toolbarWidth, height: preScaledHeight };
    activeArea = { x: palette.x + paletteWidth, y:0, width: preScaledWidth-palette.width-palette.x-toolbarWidth, height: preScaledHeight };
    obj = setupSpecies( species );
    setupButtons();
    prompt = new Prompt(ctx, preScaledWidth/2, 10, preScaledWidth, preScaledHeight, 1, background);
    prompt.setText( getLabel( group ) );
    displayList.addChild(prompt);
    input = document.getElementById("textBox");
    input.style.backgroundColor = textboxColour;
    setupVersions();
    //get latest saved drawing
    if ( this.mode == "deploy"){
        this.nutella.net.request('get_current_foodweb', group, function(drawing,from){
            retrieveDrawing( drawing ); alert('here');
        });
    } else {
        //console.log('Group ;'+ this.group +' ;Time ;'+t+' ;' + "FOODWEB_RETRIEVE_CURRENT");
        retrieveDrawing( {} );
    }
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

    var formElement = document.getElementById("submitText");
    formElement.addEventListener('click', handleSubmitText, false);

    //SETUP
    function onResizeWindow( init ){
        if ( !initialized ){
            canvasWidth = 1000;
            canvasHeight = 760;
        }
        canvasWidth = window.innerWidth;
        canvasHeight = window.innerHeight;
        canvas = document.getElementById("ui-layer");
        ctx = canvas.getContext("2d");

        //allow for top wallcology buttons and left margin if mode is not set to "fullscreen"
        if ( fullscreen ){
            canvas.width = canvasWidth;
            canvas.height = canvasHeight;
        } else if ( !fullscreen ){
            var distFromTop = 20; //58 //95
            var distFromLeft = 20;
            canvas.width = canvasWidth-distFromLeft;
            canvas.height = canvasHeight-distFromTop;
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
        }
        if ( init != "init" ){
            if ( prompt ){
                prompt.x = preScaledWidth/2;
                prompt.setMaxWidth( preScaledWidth );
            }
            if ( toolbar ){
                toolbar.x = preScaledWidth-toolbarWidth;
            }
            if ( addArrowBtn ){
                var btnX = preScaledWidth-toolbarWidth+11;
                addArrowBtn.x = btnX;
                removeArrowBtn.x = btnX;
                saveBtn.x = btnX;
                viewOnlyBtn.x = preScaledWidth/2-viewOnlyBtn.width/2;
                //annotateBtn = btnX;
            }
            if( version ){
                version.updateCanvasSize( preScaledWidth, preScaledHeight)
            }
            data.save("FOODWEB_ORIENTATION","window.innerWidth; "+preScaledWidth+"; window.innerHeight; "+preScaledHeight);
        }
        //move annotate div
        var annotateY = preScaledHeight - 40 + "px";
        document.getElementById("annotate-layer").style.top = annotateY;
    
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
        return tempArr;
    }
    //Set up toolbar buttons
    function setupButtons(){
        var btnHeight = 48;
        var btnWidth = 60;
        var btnX = preScaledWidth-toolbarWidth+11;//((toolbarWidth-btnWidth)/3);
        var btnY = speciesMargin;

        saveBtn = new ImageTextButton("Save", btnX, btnY, btnWidth, btnHeight, ctx, toolbarColour, "#FFFFFF", "300 8pt 'Roboto'", 28, background);
        btnY += toolbarSpacing + btnHeight;
        displayList.addChild( saveBtn );

        addArrowBtn = new ImageTextButton("Add ⇄", btnX, btnY, btnWidth, btnHeight, ctx, toolbarColour, "#FFFFFF", "300 8pt 'Roboto'", 28, background);
        btnY += toolbarSpacing + btnHeight;
        displayList.addChild( addArrowBtn );

        removeArrowBtn = new ImageTextButton("Remove ⇄", btnX, btnY, btnWidth, btnHeight, ctx, toolbarColour, "#FFFFFF", "300 8pt 'Roboto'", 28, background);
        btnY += toolbarSpacing + btnHeight;
        displayList.addChild( removeArrowBtn );
        /*
        annotateBtn = new ImageTextButton("Annotate", btnX, btnY, btnWidth, btnHeight, ctx, toolbarColour, "#FFFFFF", "300 8pt 'Roboto'", 28, background);
        btnY += toolbarSpacing + btnHeight;
        displayList.addChild( annotateBtn );
        */
        trashBtn = new ImageTextButton("Delete", btnX, btnY, btnWidth, btnHeight, ctx, toolbarColour, "#FFFFFF", "300 8pt 'Roboto'", 28, background);
        btnY += toolbarSpacing + btnHeight;
        displayList.addChild( trashBtn );

        //only show view only icon if in view only mode
        viewOnlyBtn = new ImageTextButton("View Only", preScaledWidth/2-btnWidth/2, 40, btnWidth, btnHeight, ctx, backgroundColour, "#FFFFFF", "300 8pt 'Roboto'", 28, background);
        //displayList.addChild( viewOnlyBtn );
        //one event listener works for all ImageTextButtons
        saveBtn.addEventListener( saveBtn.EVENT_CLICKED, handleToobarClicks ); 
    }
    //get nubmer of saved version from server
    function setupVersions(){
        //savedVersionsNum = data.getSavedFoodwebNum();
        if ( this.mode == "deploy"){
            this.nutella.net.request('get_num_of_saved_foodwebs', this.group, function( num, from ){
                savedVersionsNum = num;
            });
        } else {
            savedVersionsNum = 0;
        }
        version = new Version(ctx, preScaledWidth, preScaledHeight, toolbarWidth, toolbarColour, savedVersionsNum);
        version.changeVersion();
    }
    //EVENTLISTENERS    
    function handleToobarClicks(e){
        //console.log(e.type+", "+e.target.name);
        var clicked = e.target;
        if ( !viewOnly ){
            switch( clicked.name ){
                case "Add ⇄":
                    newConnectionObjs = [];
                    removeArrowBtn.active = false;
                    removeArrowBtn.drawButton();
                    saveBtn.active = false;
                    saveBtn.drawButton();
                    //annotateBtn.active = false;
                    //annotateBtn.drawButton();
                    break;
                case "Remove ⇄":
                    newConnectionObjs = [];
                    addArrowBtn.active = false;
                    addArrowBtn.drawButton();
                    saveBtn.active = false;
                    saveBtn.drawButton();
                    //annotateBtn.active = false;
                    //annotateBtn.drawButton();
                    break;
                case "Save":
                    newConnectionObjs = [];
                    addArrowBtn.active = false;
                    addArrowBtn.drawButton();
                    removeArrowBtn.active = false;
                    removeArrowBtn.drawButton();
                    //annotateBtn.active = false;
                    //annotateBtn.drawButton();
                    saveFoodWeb();
                    break;
                case "Delete":
                    newConnectionObjs = [];
                    addArrowBtn.active = false;
                    addArrowBtn.drawButton();
                    removeArrowBtn.active = false;
                    removeArrowBtn.drawButton();
                    saveBtn.active = false;
                    saveBtn.drawButton();
                    trashBtn.active = false;
                    trashBtn.drawButton();
                    break;
                case "View Only":
                    break;
                default:
                    newConnectionObjs = [];
                    addArrowBtn.active = false;
                    addArrowBtn.drawButton();
                    removeArrowBtn.active = false;
                    removeArrowBtn.drawButton();
                    saveBtn.active = false;
                    saveBtn.drawButton();
                    //annotateBtn.active = false;
                    //annotateBtn.drawButton();
            }
        }
    }
    /*function handleAnnotateBtn(e){
        //console.log("handleAnnotateBtn");
        if ( isAnnotating ){
            //endAnnotate();
            isAnnotating = false;
            annotateBtn.active = false;
            annotateBtn.drawButton();
            displayList.removeChild( trashBtn );
            draw();
            //hide input
            document.getElementById("annotate-layer").style.display = "none";
        } else {
            //startAnnotate();
            isAnnotating = true;
            //show input
            document.getElementById("annotate-layer").style.display = "inline"; //or inline-block
            displayList.addChild( trashBtn );
            trashBtn.drawButton();
        }
    }*/
    /*
    function startAnnotate(){
        isAnnotating = true;
        //show input
        document.getElementById("annotate-layer").style.display = "inline"; //or inline-block
        displayList.addChild( trashBtn );
        trashBtn.drawButton();
    }
    function endAnnotate(){
        isAnnotating = false;
        annotateBtn.active = false;
        annotateBtn.drawButton();
        displayList.removeChild( trashBtn );
        draw();
        //hide input
        document.getElementById("annotate-layer").style.display = "none";
    }*/
    function handleVersionChange( direction ){
        //console.log("handleVersionChange");
        saveBtn.active = false;
        saveBtn.drawButton();
        var oldVersion = version.num;
        var newVersion;
        if ( direction == "next" ){
            newVersion = oldVersion + 1;
        } else if ( direction == "back" ){
            newVersion = oldVersion - 1;
        }        
        /*//cycle through versions **** 
        if( newVersion > savedVersionsNum+1 || newVersion < 1){
            console.log("returning");
            return;
        }*/
        version.num = newVersion;

        if ( newVersion == (version.saved + 1) ){
            viewOnly = false;
            console.log("remove viewOnlyBtn: " + containsObject( viewOnlyBtn, displayList.objectList ));
            if ( containsObject( viewOnlyBtn, displayList.objectList ) ){
                displayList.removeChild( viewOnlyBtn );   
            }
            retrieveDrawing( currentDrawing );
        } else {
            
            if ( !containsObject( viewOnlyBtn, displayList.objectList ) ){
                displayList.addChild( viewOnlyBtn );
            }            
            //data.index = newVersion;
            //var oldDrawing = data.getPreviousDrawing();
            //need to save current state before retrieveDrawing
            if( !viewOnly ){
                var d = getDrawing();
                currentDrawing = d.drawing;
            }
            clearFoodWeb();
            //retrieve saved versions
            if ( this.mode == "deploy"){
                //earliest = 0, current = n;
                this.nutella.net.request('get_saved_foodweb',{group: group, index: newVersion}, function(drawing,from){
                    retrieveDrawing( drawing );
                });
            } else {      
                //console.log('Group ;'+ this.group +' ;Time ;'+t+' ;' + "FOODWEB_RETRIEVE_SAVED"+' ;Index ;'+this.index);
                //return {};
                retrieveDrawing( { nodes:[{name:"species_00", x:100, y:100, active:true},{name:"species_01", x:200, y:200, active: true}]});
            }
            viewOnly = true;
        }
        data.save("FOODWEB_SAVED","window.innerWidth; "+preScaledWidth+"; window.innerHeight; "+preScaledHeight);
        console.log("savedVersionsNum: "+savedVersionsNum+", version.num: "+version.num+", version.saved: "+version.saved+", viewOnly: "+viewOnly);
    }
    function handleSubmitText(e){
        e.preventDefault();
        if( !viewOnly ){
            console.log("Submit annotation: "+input.value);
            //create new annotation
            //var message = document.getElementById("submitText");
            var message = input.value;
            input.value = '';
            var a = new Annotation( message, ctx, backgroundColour, "#FFFFFF", "300 11pt 'Roboto'" );
            displayList.addChild(a);
            a.drawAnnotation();
            annotations.push(a);
        }
    }
    function handleRedraw(e){
        draw();   
    }
    function onTouchUp(e){
        endMove(e.changedTouches[0].pageX, e.changedTouches[0].pageY,true);
        if( !viewOnly ){
            displayList.onMouseUp(event);
        }
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
        if( !viewOnly ){
            displayList.onMouseUp(event);
        }
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
        if ( !viewOnly ){
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
                    if( r.x + r.width + dx >= preScaledWidth-toolbarWidth ){
                        //return;
                        //r.x = preScaledWidth-toolbarWidth-r.width;
                    } else if ( r.y + r.height + dy >= preScaledHeight ){
                        //return;
                        //r.y = preScaledHeight - r.height;
                    } else if ( r.y + dy < 0 ){
                        //return;
                        //r.y = 0;
                    } else if ( r.x + dx < 0 ){
                        //return;
                        //r.x = 0;
                    } else {
                        r.x += dx;
                        r.y += dy;
                    }
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
            var overTrashBtn = false;
            for ( var k=0; k<annotations.length; k++){
                var a = annotations[k];
                if ( a.isDragging ) {
                    //trashBtn.active = true;
                    //test to see if object is within boundary
                    if( a.x + a.width + dx >= preScaledWidth ){
                        //return;
                        //r.x = preScaledWidth-toolbarWidth-r.width;
                    } else if ( a.y + a.height + dy >= preScaledHeight ){
                        //return;
                        //r.y = preScaledHeight - r.height;
                    } else if ( a.y + dy < 0 ){
                        //return;
                        //r.y = 0;
                    } else if ( a.x + dx < paletteWidth ){
                        //return;
                        //r.x = 0;
                    } else {                   
                        a.x += dx;
                        a.y += dy;
                    }
                    if( detectHit( mx, my, trashBtn )){
                        overTrashBtn = true;
                    }    
                }
            }
            // reset the starting mouse position for the next mousemove
            startX = mx;
            startY = my;
        }
        //set active state of trash button to true if mouse over and dragging annotation, otherwise, set to false
        if ( overTrashBtn ){
            trashBtn.active = true;
        } else {
            trashBtn.active = false;
        }
        /*
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
        */
        if ( addArrowBtn.active ){
            if( newConnectionObjs.length >= 1 ){
                //console.log("source obj: "+newConnectionObjs[0].name+", looking for lines");
                showPotentialConnections( x, y );
            }
        }
        draw();
    }
    }
    function startMove(x,y,isTouch){
        if ( !viewOnly ){
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
    }
    }
    function endMove(x,y,isTouch){
        var newx = x;
        var newy = y;
        mouseIsDown = 0;
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
        // clear all the dragging flags
        dragok = false;
        for (var i = 0; i < obj.length; i++) {
            var o = obj[i];
            var to;
            var from;
            if( o.isDragging ){
                if( detectHit( newx, newy, activeArea )){
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

        /*//detectHit 
        var mx = parseInt(newx - canvas.offsetLeft);
        var my = parseInt(newy - canvas.offsetTop);*/

        /*//check to see if version buttons are clicked
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
        }*/
        //if addArrow button is active, add source/destination objects to the array
        //flag checks if user clicked on species
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
                addArrowBtn.active = false;
                addArrowBtn.drawButton();   
            }
        }

        //if removeArrow button is active, remove line if mouse/touch is over line 
        if ( removeArrowBtn.active && !viewOnly ){
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
                //c.updateAlpha(1);
            }
        }
        var tempAnnotation;
        var tempIndex;
        var trashAnnotation = false;
        for (var l = 0; l < annotations.length; l++) {
            var a = annotations[l];
            if( a.isDragging ){
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
        }
        trashBtn.active = false;
        //if save button is active, upon mouse click, change it back to inactive
        if ( saveBtn.active && !viewOnly ){
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
            if( detectHit(s.x,s.y,h) ){
                //species active
                s.active = b;
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
    //g = group, returns label to be placed at the top of the UI
    function getLabel( g ){
        var label;
        var team; 
        switch (g){
            case -1:
                label = "Master Food Web";
                break;
            case "null":
                label = "Team 6";
                break;
            default:
                team = g+1;
                label = "Team "+ team;
        }
        return label;
    }
    function evalConnection(){
        for ( var i=0; i<movingConnections.length; i++){
            var movingConnection = movingConnections[i];
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
    /*
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
    */
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
            message += "{ name: " + c.name + ", x: " + c.x +", y:"+c.y+" }, ";
            comments.push( comment );
            //data.save("FOODWEB_CONNECTION_ADDED","source ;"+obj1.name+" ;destination ;"+obj2.name+" ;connection ;"+connectType);
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
        var comments;
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
        if ( drawing.hasOwnProperty('comments') ){
            comments = drawing.comments;
        } else {
            comments = [];
        }

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
            connections.push( line );
            displayList.addChild( line );
            //data.save("FOODWEB_CONNECTION_ADDED","source ;"+obj1.name+" ;destination ;"+obj2.name+" ;connection ;"+connectType);
        }
        for(var k=0; k<comments.length; k++){
            var c = comments[k];
            //create annotation
            var annotation = new Annotation( c.name, ctx, backgroundColour, "#FFFFFF", "300 11pt 'Roboto'" );
            annotation.x = c.x;
            annotation.y = c.y;
            annotations.push( annotation );
            displayList.addChild( annotation );
            //data.save("FOODWEB_CONNECTION_ADDED","source ;"+obj1.name+" ;destination ;"+obj2.name+" ;connection ;"+connectType);
        }
    }
    function draw() {
        //clear canvas
        ctx.clearRect(0, 0, preScaledWidth, preScaledHeight);
        ctx.fillStyle = backgroundColour;
        ctx.fillRect(0, 0, preScaledWidth, preScaledHeight);
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