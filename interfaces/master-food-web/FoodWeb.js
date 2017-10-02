//WALLCOLOGY FOOD WEB
function FoodWeb(){
    var mode = "deploy"; //"develop" or "deploy"
    var fullscreen = true;
    var app = "wallcology";
    var background = "dark";   //"light" or "dark"
    var versionID = "20170927-1500";
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
    // var version;
    var species = [
        {name:"species_00", width:50, height:50}, {name:"species_01", width:50, height:50}, 
        {name:"species_02", width:50, height:50}, {name:"species_03", width:50, height:50},
        {name:"species_04", width:50, height:50}, {name:"species_05", width:50, height:50}, 
        {name:"species_06", width:50, height:50}, {name:"species_07", width:50, height:50},
        {name:"species_08", width:50, height:50}, {name:"species_09", width:50, height:50}, 
        {name:"species_10", width:50, height:50}];

    var speciesSize = 50; //40;
    var speciesMargin = 30;
    var speciesSpacing = 8;
    var palette;
    var paletteWidth = 80;//70;
    var paletteColour;
    
    var toolbar;                //not drawn, need it to position version buttons, won't need it now
    var toolbarWidth = 0; //80;      
    var toolbarColour;          // = "#344559";
    var toolbarSpacing = 20;
    var saveBtn;

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
    var dialog = [];    
    var groupNames = ["1", "2", "3", "4", "5"]; //for displaying on badges
    var badges = [];
    var badgeColours;

    var data;
    var currentDrawing;
    var fwClaims = []; 
    var withdrawnClaims = [];
    var saveDelay = 300000; //5 minutes in millisecons
    // var initialized = false;

    var obj = [];
    var placeholderObj = [];    //greyed out version of species in the palette
    var connections = [];

    //modal variables
    var openedLine;         //saves line object that has been clicked
    var openedClaimIndex;   //saves index of claim being viewed
    var modal, modalText, modalCloseBtn, modalWithdrawBtn, modalNextBtn;

    //var viewOnlyBtn;
    // var savedVersionsNum;   //number of saved versions retrieved from nutella
    // var viewOnly = false;
    //var input;
    
    console.log("window height: "+parent.document.body.clientHeight+", width: "+parent.document.body.clientWidth);

    //load nutella
    if ( mode == "deploy" ){
        query_parameters = NUTELLA.parseURLParameters();
        nutella = NUTELLA.init(query_parameters.broker, query_parameters.app_id, query_parameters.run_id, NUTELLA.parseComponentId());    
        // begin keep alive code
        var lastping = (new Date).getTime();
        setInterval(reconnect, 60*1000);

        nutella.net.subscribe('ping',function(message,from){
            console.log('received ping' + message);
            lastping = (new Date).getTime();
        });

        function reconnect(){
            var timeNow = (new Date).getTime();
            //save what you've got
            if ((timeNow - lastping) > 70*1000) location.reload(true);
        }
        // end keep alive code
        
        //nutella.net.subscribe('ping',function(message,from){});
        //subscribe to new claims
        nutella.net.subscribe('new_claim', function(message, from){
            console.log("new claim: "+message.source+", "+message.destination+", "+message.relationship);
            fwClaims.push( message );
            var d = getDrawing();
            currentDrawing = d.drawing;
            clearFoodWeb();
            retrieveDrawing(  currentDrawing, fwClaims );
            setTimeout( draw, 500 );
        });

        //subscribe to replaced claims
        nutella.net.subscribe('replace_claim', function(message, from){
            //replaceClaim( message );
            console.log("replace claim: "+message.source+", "+message.destination+", "+message.relationship); 
            var newClaim = message;
            var claimsIndex;
            for( var i=0; i<fwClaims.length; i++ ){
                var testClaim = fwClaims[i];
                if ( newClaim.instance == testClaim.instance && newClaim.source == testClaim.source && newClaim.destination == testClaim.destination ){
                    //testClaim = oldClaim
                    claimsIndex = i;    
                }
            }
            console.log("claimsIndex: "+claimsIndex); 
            fwClaims.splice( claimsIndex, 1 );
            fwClaims.push( newClaim );
            var d = getDrawing();
            currentDrawing = d.drawing;
            clearFoodWeb();
            retrieveDrawing( currentDrawing, fwClaims );
            setTimeout( draw, 500 );
        });
    } else {
        // do nothing
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
        badgeColours = ["#E91E63", "#FF9800","#FFD600", "#8BC34A","#42A5F5","#2E3192"]; //2E3192 for 3F51B5
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
        badgeColours = ["#E91E63", "#FF9800","#8BC34A","#2196F3", "#3F51B5"]; 
    }
    //resize canvas
    onResizeWindow("init");
    
    //setup datalog
    data = new DataLog( nutella, app, mode );
    //setup display list items
    displayList = new DisplayList( canvas );
    palette = { x:0, y:0, width:paletteWidth, height: preScaledHeight };
    toolbar = { x:preScaledWidth-toolbarWidth, y:0, width:toolbarWidth, height: preScaledHeight };
    trophicBox1 = { x:0, y:0, width:preScaledWidth, height: Math.round(preScaledHeight/3) };
    trophicBox2 = { x:0, y:trophicBox1.height, width:preScaledWidth, height: Math.round(preScaledHeight/3) };
    //activeArea = { x: palette.x + paletteWidth, y:0, width: preScaledWidth-palette.width-palette.x-toolbarWidth, height: preScaledHeight };
    activeArea = { x: palette.x + paletteWidth, y:0, width: preScaledWidth-palette.width-palette.x, height: preScaledHeight };
    placeholderObj = setupPlaceholderSpecies( species );
    obj = setupSpecies( species );
    setupButtons();
    setupBadges();
    setupModal();
    //label = getLabel( group );
    //prompt = new Prompt(ctx, preScaledWidth/2, 10, preScaledWidth, preScaledHeight, 1, background);
    //prompt.setText( label );
    //displayList.addChild(prompt);
    //setupVersions();
    // Setup modal
    // Get the modal
/*    var openedLine;    //saves line object that has been clicked
    var modal = document.getElementById('modal-layer');
    var modalText = document.getElementsByClassName('modal-p')[0];
    // Get the <span> element that closes the modal
    var modalCloseBtn = document.getElementsByClassName("close")[0];
    var modalWithdrawBtn = document.getElementById('withdraw');
    var modalNextBtn = document.getElementById('next');
    // When the user clicks on <span> (x), close the modal
    modalCloseBtn.addEventListener('click', handleModalClose, false);
    modalWithdrawBtn.addEventListener('click', handleWithdrawBtn, false);
    modalNextBtn.addEventListener('click', handleNextBtn, false);*/

    data.save("FOODWEB_INIT",versionID+"; window.innerWidth; "+preScaledWidth+"; window.innerHeight; "+preScaledHeight); //+"; savedVersionsNum ;"+savedVersionsNum+"; label ;"+label);

    //get latest saved drawing
    if ( mode == "deploy"){
        nutella.net.request('get_mfw_and_claims', {}, function(message,from){
            //console.log("1 message.claims: " + message.claims.length + ", message.mfw: "+isEmpty(message.mfw) );
            fwClaims = message.claims;
            if ( message.mfw.hasOwnProperty('drawing') ){
                currentDrawing = message.mfw.drawing;
            } else {
                currentDrawing = {};
            }
            console.log("message.claims: " + message.claims.length + ", message.mfw.isEmpty: "+isEmpty(message.mfw)+", message.mfw.hasOwnProperty: "+message.mfw.hasOwnProperty('drawing') );
            retrieveDrawing( currentDrawing, fwClaims ); 
            setupEventListeners();
            setTimeout( draw, 1000 );
        });
    } else {
        //retrieveDrawing( {}, [] );    //blank drawing, no claims
        fwClaims = [
            { instance: 1, source: 3, destination: 0, type: "eats", reasoning: "ABC", figure1: "none", figure2: "none", figure3: "none" }, 
            { instance: 2, source: 0, destination: 4, type: "eats", reasoning: "ABC", figure1: "none", figure2: "none", figure3: "none" },
            { instance: 2, source: 0, destination: 5, type: "eats", reasoning: "ABC", figure1: "none", figure2: "none", figure3: "none" },
            { instance: 3, source: 0, destination: 5, type: "eats", reasoning: "ABC", figure1: "none", figure2: "none", figure3: "none" }, 
            { instance: 4, source: 0, destination: 10, type: "eats", reasoning: "ABC", figure1: "none", figure2: "none", figure3: "none" }, 
            { instance: 2, source: 5, destination: 4, type: "competeswith", reasoning: "ABC", figure1: "none", figure2: "none", figure3: "none" }, 
            { instance: 5, source: 7, destination: 9, type: "eats", reasoning: "ABC", figure1: "none", figure2: "none", figure3: "none" },
            { instance: 1, source: 7, destination: 9, type: "doesnoteat", reasoning: "ABC", figure1: "none", figure2: "none", figure3: "none" }
            ];
        retrieveDrawing( 
            //MFW OBJECT
            { time:0, nodes:[
            { name: "species_00", x:361, y:321 }, 
            { name: "species_01", x:15, y:66 }, 
            { name: "species_02", x:15, y:114 }, 
            { name: "species_03", x:574, y:92 }, 
            { name: "species_04", x:194, y:555 }, 
            { name: "species_05", x:472, y:558 }, 
            { name: "species_06", x:15, y:306 }, 
            { name: "species_07", x:939, y:333 }, 
            { name: "species_08", x:15, y:402 }, 
            { name: "species_09", x:995, y:550 }, 
            { name: "species_10", x:730, y:565 }], links:[
            { name: "species_03-species_00", source: 0, destination: 3, type: "eats", status: "inprogress", confirmed: true, votes: 2 }]}, 
            //CLAIMS ARRAY
            fwClaims);
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
    }
    //clear all the event listeners before removing object
    function clearListeners(){
        for (var i=0; i<dialog.length; i++){
            var d = dialog[i];
            d.removeEventListener(d.EVENT_CLOSE, onDialogClose);
        }
    }
    function onResizeWindow( init ){
        // console.log("window height: "+parent.document.body.clientHeight+", width: "+parent.document.body.clientWidth);
        // canvasWidth = (window.innerWidth == 0)? 980 : window.innerWidth;
        // canvasHeight = (window.innerHeight == 0)? 680 : window.innerHeight;
        canvasWidth = (parent.document.body.clientWidth == 0)? 980 : parent.document.body.clientWidth;
        canvasHeight = (parent.document.body.clientHeight == 0)? 680 : parent.document.body.clientHeight;

        if (mode == "deploy" ){
            canvasWidth -= 20;
            canvasHeight -= 30;
        }
        //Canvas for drag and drop
        canvas = document.getElementById("ui-layer");
        ctx = canvas.getContext("2d");

        //allow for top wallcology buttons and left margin if mode is not set to "fullscreen"
        //console.log("fullscreen: "+fullscreen+", canvasWidth: "+canvasWidth+", canvasHeight: "+canvasHeight);
        if ( fullscreen ){
            canvas.width = canvasWidth;
            canvas.height = canvasHeight;
        } else if ( !fullscreen ){
            var distFromTop = 26;
            var distFromLeft = 24;
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
                toolbar.height = preScaledHeight;
            }
            if ( palette ){
                palette.height = preScaledHeight;
            }
            if ( trophicBox1 ){
                trophicBox1.height = Math.round(preScaledHeight/3);
                trophicBox1.width = preScaledWidth;
            }
            if ( trophicBox2 ){
                trophicBox2.height = Math.round(preScaledHeight/3);
                trophicBox2.width = preScaledWidth;
                trophicBox2.y = trophicBox2.height;
            }
            if ( saveBtn ){
                var btnX = (paletteWidth - btnWidth)/2;
                var btnY = preScaledHeight - btnHeight - 10;
                saveBtn.x = btnX;
                saveBtn.y = btnY;
            }
            if ( modal ){
                var modal1 = document.getElementsByClassName('modal')[0];
                var modal2 = document.getElementsByClassName('modal')[1];

                modal1.style.height = preScaledHeight+'px';
                modal2.style.height = preScaledHeight+'px';
            }
            // if( version ){
            //     version.updateCanvasSize( preScaledWidth, preScaledHeight);
            // }
            for (var i=0; i<dialog.length; i++){
                var d = dialog[i];
                d.setCanvasWidthHeight( preScaledWidth, preScaledHeight );
            }
            data.save("FOODWEB_RESIZE","window.innerWidth; "+preScaledWidth+"; window.innerHeight; "+preScaledHeight);
        }
        setTimeout(draw, 500);
    }
    function setupSpecies( speciesArr ){
        var tempArr = [];
        var tempY = speciesMargin;
        for(var i=0; i<speciesArr.length; i++){
            var sp = speciesArr[i];
            var nickname = top.species_names[i]; //top.species_names[species[type][i]]; 
            var tempObj = new Species( sp.name, 
                (paletteWidth-sp.width)/2, tempY+speciesSpacing-sp.height/2, 
                sp.height, sp.width, ctx, shadowColour, nickname );
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
            //console.log("x: "+(paletteWidth-sp.width)/2);
            displayList.addChild(tempObj);
            tempY += speciesSize+speciesSpacing;        
        }
        return tempArr;
    }
    //Set up badges
    function setupBadges(){
        var padding = 10;
        var badgeW = 30;
        var badgeH = 30;
        var badgeX = 100;
        var badgeY = 30;
        for(var i=0; i<groupNames.length; i++){
            var n = groupNames[i];
            //n, x, y, w, h, c, colour, textcolour, font, yo
            var b = new Badge(n, (i*(badgeW+padding)+badgeX), badgeY, badgeW, badgeH, ctx, badgeColours[i], "#FFFFFF", "500 10pt 'Roboto'", 6);
            badges.push( b );
            displayList.addChild( b );
        }
    }
    //initialize modal dialog 
    function setupModal(){
        modal = document.getElementById('modal-layer');
        modalText = document.getElementsByClassName('modal-p')[0];
        // Get the <span> element that closes the modal
        modalCloseBtn = document.getElementsByClassName("close")[0];
        modalWithdrawBtn = document.getElementById('withdraw');
        modalNextBtn = document.getElementById('next');
        // When the user clicks on <span> (x), close the modal
        modalCloseBtn.addEventListener('click', handleModalClose, false);
        modalWithdrawBtn.addEventListener('click', handleWithdrawBtn, false);
        modalNextBtn.addEventListener('click', handleNextBtn, false);

        //var modalHeight = preScaledHeight;
        modal1 = document.getElementsByClassName('modal')[0];
        modal2 = document.getElementsByClassName('modal')[1];

        modal1.style.height = preScaledHeight+'px';
        modal2.style.height = preScaledHeight+'px';

        var content1 = document.getElementsByClassName('content')[0];
        var content2 = document.getElementsByClassName('content')[1];
        content1.style.maxHeight = preScaledHeight + 'px';
        content2.style.maxHeight = preScaledHeight + 'px';

        //console.log( "max height: "+document.getElementsByClassName('content')[0].style.maxHeight )
    }
    /*
    //get nubmer of saved version from server
    function setupVersions(){
        if ( mode == "deploy"){
            nutella.net.request('get_num_of_saved_foodwebs', group, function( num, from ){
                savedVersionsNum = num;
                version = new Version(ctx, preScaledWidth, preScaledHeight, toolbarWidth, backgroundColour, savedVersionsNum);
                version.changeVersion();
            });
        } else {
            savedVersionsNum = 0;
            version = new Version(ctx, preScaledWidth, preScaledHeight, toolbarWidth, backgroundColour, savedVersionsNum);
            version.changeVersion();
        }
    }
    */
    //Set up toolbar buttons
    function setupButtons(){
        var btnHeight = 48;
        var btnWidth = 60;
        //top left
        //var btnX = preScaledWidth-toolbarWidth+11;//((toolbarWidth-btnWidth)/3);
        //var btnY = speciesMargin;        
        //bottom palette

        var btnX = (paletteWidth - btnWidth)/2;
        var btnY = preScaledHeight - btnHeight - 10;
        
        saveBtn = new ImageTextButton("Save", btnX, btnY, btnWidth, btnHeight, ctx, paletteColour, "#FFFFFF", "300 8pt 'Roboto'", 28, background);
        //btnY += toolbarSpacing + btnHeight;
        displayList.addChild( saveBtn );
        //one event listener works for all ImageTextButtons
        saveBtn.addEventListener( saveBtn.EVENT_CLICKED, handleToobarClicks ); 
    }

    //EVENTLISTENERS
    function handleWithdrawBtn(e){
        //console.log("handleWithdrawBtn: " + openedLine.claims.length );
        //console.log("withdrawnClaims.length: "+withdrawnClaims.length);
        //check if already withdrawn
        var index = -1;
        for ( var i=0; i<withdrawnClaims.length; i++ ){
            //console.log( "withdrawnClaims[i].instance: "+withdrawnClaims[i].instance+", openedLine.claims[openedClaimIndex].instance: "+openedLine.claims[openedClaimIndex].instance);
            if( withdrawnClaims[i].instance == openedLine.claims[openedClaimIndex].instance ){
                index = i;
            }
        }
        if( index > -1 ){
            //console.log("already withdrawn");
            //already withdrawn
            withdrawnClaims.splice( index, 1 );
            document.getElementById('withdraw').innerHTML = "Withdraw Claim";
            document.getElementById('removeClaim').style.display = 'none';
        } else {
            //console.log("withdraw");
            withdrawnClaims.push( openedLine.claims[openedClaimIndex] );
            //indicate that it's been added    
            document.getElementById('withdraw').innerHTML = "Cancel Withdraw";
            document.getElementById('removeClaim').style.display = 'inline-block';
        }
        //toggleWithdrawClaim();
    }
    function updateWithdrawClaim(){      
        var index = -1;
        for ( var i=0; i<withdrawnClaims.length; i++ ){
            //console.log( "withdrawnClaims[i].instance: "+withdrawnClaims[i].instance+", openedLine.claims[openedClaimIndex].instance: "+openedLine.claims[openedClaimIndex].instance);
            if( withdrawnClaims[i].instance == openedLine.claims[openedClaimIndex].instance ){
                index = i;
            }
        }
        if( index > -1 ){
            //console.log("already withdrawn");
            //already withdrawn
            //document.getElementById('checkmark').style.display = 'inline-block';
            document.getElementById('withdraw').innerHTML = "Cancel Withdraw";
            document.getElementById('removeClaim').style.display = 'inline-block';
            
            //withdrawnClaims.splice( index, 1 );
            
        } else {
            //console.log("withdraw");
            //withdrawnClaims.push( openedLine.claims[openedClaimIndex] );
            //indicate taht it's been added    
            //document.getElementById('checkmark').style.display = 'none';
            document.getElementById('withdraw').innerHTML = "Withdraw Claim";
            document.getElementById('removeClaim').style.display = 'none';
        }
    }
    //handles modal close
    function handleModalClose(e){
        //console.log("close modal: span.onclick");
        modal.style.display = "none";
        //find withdrawn claim from list of claims and remove it
        if( withdrawnClaims.length > 0 ){
            for( var i = 0; i<withdrawnClaims.length; i++ ){
                var wc = withdrawnClaims[i];
                withdrawClaim( wc );
                if( mode == "deploy" ){
                    nutella.net.publish('withdraw_claim', wc );
                }                
            }
            var d = getDrawing();
            currentDrawing = d.drawing;
            clearFoodWeb();
            retrieveDrawing(  currentDrawing, fwClaims );
            setTimeout(draw, 500);
        }
        openedLine = {};
        openedClaimIndex = 0;
        withdrawnClaims = [];
    }
    //handle modal open
    function handleModalOpen(e){
        //check to see if openedLine is empty - to run this function only once per click, otherwise, each line object will invoke
        if( isEmpty(openedLine) ){
            openedLine = e.target; //line clinked
            openedClaimIndex = 0;
            updateModalContent( openedLine );
            updateWithdrawClaim();
        }
    }
    //handles "view next claim" in opened modal
    function handleNextBtn(e){
        console.log("handleNextBtn");
        openedClaimIndex += 1;
        if ( openedClaimIndex == openedLine.claims.length ){
            openedClaimIndex = 0;
        }
        updateModalContent( openedLine );
        updateWithdrawClaim();
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
        //if ( !viewOnly ){
            switch( clicked.name ){
                case "Save":
                    saveFoodWeb();
                    break;
                case "View Only":
                    break;
                default:
                    saveBtn.active = false;
                    saveBtn.drawButton();
            }
        //}
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
            // if ( containsObject( viewOnlyBtn, displayList.objectList ) ){
            //     displayList.removeChild( viewOnlyBtn );   
            // }
            clearFoodWeb();
            retrieveDrawing( currentDrawing, [
            { instance: 1, source: 3, destination: 0, type: "eats", reasoning: "ABC", figure1: "none", figure2: "none", figure3: "none" }, 
            { instance: 2, source: 0, destination: 4, type: "eats", reasoning: "ABC", figure1: "none", figure2: "none", figure3: "none" },
            { instance: 2, source: 0, destination: 5, type: "eats", reasoning: "ABC", figure1: "none", figure2: "none", figure3: "none" },
            { instance: 3, source: 0, destination: 5, type: "eats", reasoning: "ABC", figure1: "none", figure2: "none", figure3: "none" }, 
            { instance: 4, source: 0, destination: 10, type: "eats", reasoning: "ABC", figure1: "none", figure2: "none", figure3: "none" }, 
            { instance: 2, source: 5, destination: 4, type: "competeswith", reasoning: "ABC", figure1: "none", figure2: "none", figure3: "none" }, 
            { instance: 5, source: 7, destination: 9, type: "eats", reasoning: "ABC", figure1: "none", figure2: "none", figure3: "none" },
            { instance: 1, source: 7, destination: 9, type: "doesnoteat", reasoning: "ABC", figure1: "none", figure2: "none", figure3: "none" }
            ] );
            data.save("FOODWEB_RETRIEVE_CURRENT","savedVersionsNum ;"+savedVersionsNum+";version.num ;"+version.num+";version.saved ;"+version.saved+";viewOnly ;"+viewOnly);
        } else {
            // if ( !containsObject( viewOnlyBtn, displayList.objectList )){
            //     displayList.addChild( viewOnlyBtn );
            // }
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
                //placeholder drawing      
                retrieveDrawing( {time:0, nodes:[
                    { name: "species_00", x: 415, y:202, active: true }, 
                    { name: "species_01", x: 247, y:96, active: true }, 
                    { name: "species_02", x: 341, y:376, active: true }, 
                    { name: "species_03", x: 10, y:187, active: false }, 
                    { name: "species_04", x: 338, y:560, active: true }, 
                    { name: "species_05", x: 635, y:454, active: true }, 
                    { name: "species_06", x: 10, y:361, active: false }, 
                    { name: "species_07", x: 10, y:419, active: false }, 
                    { name: "species_08", x: 10, y:477, active: false }, 
                    { name: "species_09", x: 10, y:535, active: false }, 
                    { name: "species_10", x: 10, y:593, active: false }], links:[
                    { name: "species_00-species_01", source: "species_00", destination:"species_01", type: "eatenby", status: "inprogress", confirmed: true, votes: 2 }, 
                    { name: "species_02-species_00", source: "species_02", destination:"species_00", type: "eatenby", status: "inprogress", confirmed: false, votes: 2 }, 
                    { name: "species_04-species_02", source: "species_04", destination:"species_02", type: "eatenby", status: "inprogress", confirmed: false, votes: 2 }, 
                    { name: "species_05-species_00", source: "species_05", destination:"species_00", type: "eatenby", status: "inprogress", confirmed: false, votes: 5 }]}, []);
            }
            viewOnly = true;
            data.save("FOODWEB_RETRIEVE_SAVED","savedVersionsNum ;"+savedVersionsNum+";version.num ;"+version.num+";version.saved ;"+version.saved+";viewOnly ;"+viewOnly);
        }
    }*/
    
    function handleRedraw(e){
        draw();   
    }
    function onTouchUp(e){
        //console.log("onTouchUp");
        // tell the browser we're handling this mouse event
        e.preventDefault();
        e.stopPropagation();
        endMove(e.changedTouches[0].pageX, e.changedTouches[0].pageY,true);
        //if( !viewOnly ){
            displayList.onMouseUp(event);
        //}
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
        //if( !viewOnly ){
            displayList.onMouseUp(e);
        //}
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
        //if ( !viewOnly ){
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
                    }
                }            
                for (var j = 0; j < connections.length; j++) {
                    connections[j].updateXY();
                }
                for ( var k=0; k < badges.length; k++ ){
                    var b = badges[k];
                    if ( b.isDragging ) {
                        //test to see if object is within boundary
                        if( b.x + b.width + dx >= preScaledWidth-toolbarWidth || b.y + r.height + dy >= preScaledHeight || b.y + dy < 0 || b.x + dx < 0 ){
                            //do nothing
                            startX = b.x + b.width/2;
                            startY = b.y + b.height/2;
                        } else {
                            b.x += dx;
                            b.y += dy;
                            startX = mx;
                            startY = my;
                        }
                    }
                }
                draw();
            } else {
                //tooltip
                for (var a = 0; a < obj.length; a++) {
                    var b = obj[a];
                    var mx = canX;
                    var my = canY;

                    if (mx > b.x && mx < b.x + b.width && my > b.y && my < b.y + b.height) {
                        // if yes, set that obj isHover=true
                        b.isHover = true;
                        draw();
                    } else {
                        b.isHover = false;
                        draw();
                    }
                }
            }
        //}
    }
    function startMove(x,y,isTouch){
        //if ( !viewOnly ){
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
            for (var j=0; j<badges.length; j++){
                var b = badges[j];
                if (mx > b.x && mx < b.x + b.width && my > b.y && my < b.y + b.height) {
                    // if yes, set that obj isDragging=true
                    dragok = true;
                    b.isDragging = true;
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
        //}
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
        if( detectHit( mx, my, version) ){
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
        }
        */
        // clear all the dragging flags
        dragok = false;
        for (var i = 0; i < obj.length; i++) {
            var o = obj[i];
            var to;
            var from;
            if( o.isDragging ){
                //console.log("species: "+o.name+", isDragging: "+o.isDragging);
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
                } else if( detectHit( o.x, o.y, palette )){
                    if ( o.active ){
                        //move from active to palette
                        to = "palette";
                        from = "active";
                        o.active = false;
                    } else {
                        //then moving from palette to palette
                        to = "palette";
                        from = "palette";
                        o.active = false;   
                    }
                } else {   
                    if ( o.active ){
                        //move from active to palette
                        to = "palette";
                        from = "active";
                        o.active = false;
                    } else {
                        //then moving from palette to palette
                        to = "palette";
                        from = "palette";
                        o.active = false;   
                    }
                }
                //data.save("FOODWEB_SPECIES_MOVE","object ;"+o.name+" ; x;"+o.x+" ;y ;"+o.y+" ;from ;"+from+" ;to ;"+to);
            }
            o.isDragging = false;
            //o.isHover = false;
        }
        for (var j = 0; j < badges.length; j++) {
            var b = badges[j];
            if( b.isDragging ){
                data.save("FOODWEB_BADGE_MOVE","group ;"+b.name+" ;x ;"+b.x+" ;y ;"+b.y);
            }
            b.isDragging = false;
        }
        //if save button is active, upon mouse click, change it back to inactive
        //if ( saveBtn.active && !viewOnly ){
        if ( saveBtn.active ){
            saveBtn.active = false;
        }
        resetObjPos();
        mouseIsDown = 0;
        draw();
    }
    //FUNCTIONS
    //Utility function for checking if an object is empty or not
    function isEmpty(obj) {
        for(var key in obj) {
            if(obj.hasOwnProperty(key))
                return false;
            }
        return true;
    }
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
    function updateModalContent( lineClicked ){
        //console.log("claims array length: "+lineClicked.claims.length+", e.target: "+lineClicked.name );
        if ( lineClicked.claims.length < 2 ){
            //hide next button
            modalNextBtn.style.display = 'none';
        } else {
            //show next button
            modalNextBtn.style.display = 'inline-block';
        }
        //modalText.innerHTML = "Claim " + (openedClaimIndex+1) + " of " + openedLine.claims.length; 
        modal.style.display = "block";

        document.getElementById('image1').src = validateImage( openedLine.claims[openedClaimIndex].figure1 );
        document.getElementById('image2').src = validateImage( openedLine.claims[openedClaimIndex].figure2 );
        document.getElementById('image3').src = validateImage( openedLine.claims[openedClaimIndex].figure3 );
        document.getElementById('species0').src = openedLine.obj1.name+".png";
        document.getElementById('species1').src = openedLine.obj2.name+".png";
        document.getElementById('relationship-p').innerHTML = getRelationshipText( openedLine.claims[openedClaimIndex].relationship );
        
        //var reasoningText = openedLine.claims[openedClaimIndex].reasoning;
        //console.log("reasoning: "+reasoningText);
        document.getElementById('reasoning-p').innerHTML = openedLine.claims[openedClaimIndex].reasoning;//reasoningText.replace("\n\n", "<br />");
        document.getElementById('number-p').innerHTML = (openedClaimIndex+1) + " of " + openedLine.claims.length;
        
        var authorP = document.getElementById('author-p');
        var groupInstance = parseInt(openedLine.claims[openedClaimIndex].instance);
        authorP.innerHTML = "Group "+( groupInstance + 1);
        authorP.style.color = badgeColours[groupInstance];//"Red";
        //number-p        
        //clientHeight includes padding
        //offsetHeight includes padding, scrollBar and borders.
        //console.log( "modal offset height: "+document.getElementById('modal-container').offsetHeight+", client: "+document.getElementById('modal-container').clientHeight );
        var modalH = document.getElementById('modal-container').offsetHeight;
        var padTop = ((preScaledHeight-modalH)<0 ) ? 0 : Math.floor((preScaledHeight - modalH) / 2 );
        //console.log( "modalH: " + modalH + ", padTop: "+ padTop );
        document.getElementById('modal-container').style.top = padTop + "px";
    }
    /*function repositionModal(){
        //var padTop = ((preScaledHeight-originalImage.naturalHeight)<0 ) ? 0 : Math.floor((browserH - originalImage.naturalHeight) / 2 );
        //document.getElementById('image-container').style.top = padTop + "px";
        console.log( "modal height: "+document.getElementById('modal-container').height );


    }*/
    function validateImage( url ){
        var imgUrl;
        if( url == "" ){
            imgUrl = "qmark.png";
        } else {
            imgUrl = url;
        }
        return imgUrl;
    }
    //parses relationship type to readable text
    function getRelationshipText( relationship ){
        var rText;
        switch ( relationship ){
            case "doesnoteat":
                rText = "does not eat";
                break;
            case "competeswith":
                rText = "competes with";
                break; 
            case "doesnotcompetewith":
                rText = "does not compete with";
                break;
            default:
                rText = relationship;
        }
        return rText;
    }
    //finds claim, replaces it, and redraws canvas
    function replaceClaim( newClaim ){
        var claimsIndex1;
        var claimsIndex2;
        var matchedLine;

        for( var i=0; i<fwClaims.length; i++ ){
            var testClaim = fwClaims[i];
            if ( newClaim.instance == testClaim.instance && newClaim.source == testClaim.source && newClaim.destination == testClaim.destination ){
                //testClaim = oldClaim
                claimsIndex1 = i;    
            }
        }
        fwClaims.splice( claimsIndex1, 1 );
        fwClaims.push( newClaim );
        /*//find claim from lines and removes it from line object
        for ( var j=0; j<connections.length; j++){
            var l = connections[j];
            if( l.source == newClaim.source && l.destination == newClaim.destination ){
                var lc = l.claims;
                matchedLine = connections[j];
                for ( var k=0; k<lc.length; k++ ){
                    if ( lc.instance == newClaim.instance ){
                        claimsIndex2 = k;
                    }
                }
            }
        }
        matchedLine.claims.splice( claimsIndex2, 1 );
        matchedLine.push( newClaim );*/
        var d = getDrawing();
        currentDrawing = d.drawing;
        retrieveDrawing(  currentDrawing, fwClaims );
    }
    //finds claim and removes it
    function withdrawClaim( oldClaim ){
        console.log("withdrawClaim: "+oldClaim.source);
        var claimsIndex1;
        var claimsIndex2;
        var matchedLine;
        console.log("fwClaims: "+fwClaims.length);
        for( var i=0; i<fwClaims.length; i++ ){
            var testClaim = fwClaims[i];
            console.log("withdrawClaim: "+oldClaim.instance+", "+oldClaim.source+", "+oldClaim.destination);
            if ( oldClaim.instance == testClaim.instance && oldClaim.source == testClaim.source && oldClaim.destination == testClaim.destination ){
                //testClaim = oldClaim
                claimsIndex1 = i;
                console.log("claimsIndex: "+claimsIndex1);
            }
        }
        fwClaims.splice( claimsIndex1, 1 );
        
        /*//find claim from lines and removes it from line object
        for ( var j=0; j<connections.length; j++){
            var l = connections[j];
            if( l.source == oldClaim.source && l.destination == oldClaim.destination ){
                var lc = l.claims;
                matchedLine = connections[j];
                for ( var k=0; k<lc.length; k++ ){
                    if ( lc.instance == oldClaim.instance ){
                        claimsIndex2 = k;
                    }
                }
            }
        }
        matchedLine.claims.splice( claimsIndex2, 1 );*/
    }
    /*
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
    */
    
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

    //function returns a set of links based on claims objects retrieved
    function getLinks( c ){
        //claim.relationship == link.type
        //console.log("claims.length: "+c.length);
        var allClaims = c;
        var links = [];
        var flag = false;   //for checking if link exists for relationship in claim already
        for(var i=0; i < allClaims.length; i++){
            var claim = allClaims[i];
            //check to see if line exists for objects yet
            for ( var j=0; j<links.length; j++ ){
                var link = links[j];
                if ( claim.source == link.source && claim.destination == link.destination ){
                    if( claim.relationship == link.type ){
                        //a match between two species increase votes
                        link.votes += 1;
                        console.log("+votes: "+claim.source+", "+claim.destination+", "+claim.relationship+", "+link.votes );
                    } else {
                        link.status = "inconflict";
                        console.log("conflict: "+claim.source+", "+claim.destination+", "+claim.relationship+", "+link.status );
                    }
                    link.claims.push( claim );
                    flag = true;
                } else if ( claim.source == link.destination && claim.destination == link.source ){
                    //some sort of relationship 
                    link.status = "inconflict";
                    //console.log("conflict: "+claim.name );
                    link.claims.push( claim );
                    flag = true;
                } 
            }
            //console.log("i: "+i+", flag: "+flag);
            if (!flag){
                //no relationship apriori
                var sourceName = getSpeciesNameByIndex( claim.source );
                var destinationName = getSpeciesNameByIndex( claim.destination ); 
                console.log("new line: "+sourceName+"-"+destinationName );
                var newlink = { name: sourceName+"-"+destinationName, source: claim.source, destination: claim.destination, type: claim.relationship, status: "inprogress", confirmed: false, votes: 1, claims: [claim] };
                links.push( newlink );
            }
            flag = false;
        }
        //console.log("links: "+links.length);
        return links;
    }
    //checks position of objects, if line is being drawn, o.active = true 
    function repositionLineObject( o ){
        var xPos = o.x;
        var yPos = o.y;
        var newX = xPos;
        var newY = yPos;        
        //in palette --> randomize pos
        if ( o.x == o.px && o.y == o.py ){
            //console.log("random: obj.name: "+o.name+", obj.x: "+o.x+", obj.y: "+o.y);
            newX = getRandomInt( paletteWidth + o.width, preScaledWidth - o.width );
            //if vegetation limit to bottom trophic strata
            if( o.name == "species_04" || o.name == "species_05" || o.name == "species_09" || o.name == "species_10" ){
                newY = getRandomInt( (trophicBox2.y + trophicBox2.height + o.height), preScaledHeight - o.height );
            } else {
                //not vegetation, limit to middle trophic level
                newY = getRandomInt( trophicBox2.y + o.height, trophicBox2.y+trophicBox2.height-o.height );                
            }
            //save position after x minutes
            setInterval( saveFoodWeb, saveDelay );
        //not in palette --> keep original pos
        } else {
            //console.log("drawing: obj.name: "+o.name+", obj.x: "+o.x+", obj.y: "+o.y);
            newX = xPos;
            newY = yPos;
        }
        o.x = newX;
        o.y = newY;
        //console.log("final: obj.name: "+o.name+", obj.x: "+o.x+", obj.y: "+o.y);
    }
    /**
     * Returns a random integer between min (inclusive) and max (inclusive)
     * Using Math.round() will give you a non-uniform distribution!
     */
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    //returns name of species (string) when given the species index (as stored in claims)
    function getSpeciesNameByIndex( index ){
        var speciesName;
        if ( index > 9 ){
            speciesName = "species_" + index;   
        } else {
            speciesName = "species_0" + index;
        }
        return speciesName;
    }
    //returns index when given the name of species (for storing in claims)
    function getSpeciesIndexByName( name ){
        var str = name.slice(-2);
        var index = Number(str);
        //console.log("index: "+index)
        return index;
    }
    //compares two sets of links and sets "confirmed" variable if true - returns claims links
    function consolidateLinks( cl, el ){
        var links  = [];
        var clinks = cl;
        var elinks = el;

        //check if there are confirmed existing links in drawing and assigns the value to set of links created by claims
        for ( var i = 0; i<elinks.length; i++ ){
            var elink = elinks[i];
            for ( var j = 0; j<clinks.length; j++ ){
                var clink = clinks[j];
                if( clink.source == elink.source && clink.destination == elink.destination && elink.confirmed ){
                    clink.confirmed = elink.confirmed;
                }
            }
        }
        return clinks;
    }
    function saveFoodWeb(){
        console.log("saving master food web");
        //handle versions
        // savedVersionsNum += 1;
        // version.saveVersion( savedVersionsNum );
        //save drawing 
        var d = getDrawing();
        //var dataURL = canvas.toDataURL();
        data.saveDrawing( d.drawing, d.message ); //, dataURL );
        //draw "Saved" button state
        //saveBtn.drawSavedButton();
        saveBtn.drawButton();
        saveBtn.active = true;
        setTimeout( resetSavedButton, 2000 );
        data.save("FOODWEB_DRAWING_SAVED","Drawing ;"+d.message); //"savedVersionsNum ;"+savedVersionsNum+" ;version.num ;"+version.num+" ;version.saved ;"+version.saved+
    }
    function resetSavedButton(){
        saveBtn.active = false;
        saveBtn.drawButton();
    }
    function getDrawing(){
        var nodes = [];
        var links = [];
        //var claims = [];
        var groupBadges = [];
        var message = "nodes: ";
        var drawing;

        for(var i=0; i<obj.length; i++){
            var o = obj[i];
            var node = { name: o.name, x: o.x, y: o.y, active: o.active };
            message += "{ name: " + o.name + ", x: " + o.x +", y:"+o.y+" }, ";
            nodes.push( node );
        }
        message = message.slice(0, -2);
        message += ", links: "
        for(var j=0; j<connections.length; j++){
            var c = connections[j];

            s = getSpeciesIndexByName( c.obj1.name );
            d = getSpeciesIndexByName( c.obj2.name );
            //console.log("line source: "+s+", destination: "+d);

            var link = { name: c.name, source: s, destination: d, type: c.type, votes: c.votes };
            message += "{ name: '"+c.name+"', source: "+s+", destination: "+d+", type: "+c.type+", votes: "+c.votes+" }, ";
            links.push( link );
            /*
            for (var k=0; k<c.claims.length; k++){
                var cl = c.claims[k];
                var claim = { instance: cl.instance, source: cl.source, destination: cl.destination, type: cl.type, reasoning: cl.reasoning, figure1: cl.figure1, figure2: cl.figure2, figure3: cl.figure3 };
                message += "{ instance: " + cl.instance+", source: "+cl.source+", destination: "+cl.destination+", type: "+cl.type+", reasoning: "+cl.reasoning+", figure1: "+cl.figure1+", figure2: "+cl.figure2+", figure3: "+cl.figure3+" };";
                claims.push( claim );
            }
            */
        }
        message = message.slice(0, -2);
        message += ", badges: "
        for(var l=0; l<badges.length; l++){
            var bd = badges[l];
            var gb = { name: bd.name, x: bd.x, y: bd.y };
            message += "{ name: " + bd.name + ", x: " + bd.x +", y: "+bd.y+" }, ";
            groupBadges.push( gb );
        }
        message = message.slice(0, -2);
        currentDrawing = { drawingH: preScaledHeight, drawingW: preScaledWidth, nodes: nodes, links: links, badges: groupBadges };
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
            c.removeEventListener( c.EVENT_OPENDIALOG, handleModalOpen ); //handleModalOpen //openDialog
            //c.removeEventListener( c.EVENT_CONFIRM, onConfirmLine );
            displayList.removeChild( c );
        }
        for( var k=0; k<badges.length; k++){
            var b = badges[k];
            b.x = -500; //move off screen
            b.y = -500;
        }
        connections = [];
    }
    //retrieve drawing
    function retrieveDrawing( drawing, allclaims ){
        var nodes;
        var links;
        var claimslinks;
        var drawinglinks;
        var groupBadges;

        if ( !drawing ){
            return;
        }
        if ( drawing.hasOwnProperty('nodes') ){
            nodes = drawing.nodes;
        } else {
            nodes = [];
        }

        if ( allclaims.length > 0 ){
            claimslinks = getLinks( allclaims ); //drawing.links;
            if( drawing.hasOwnProperty('links') ){
                drawinglinks = drawing.links;
                //compare 2 sets of links
                links = consolidateLinks( claimslinks, drawinglinks );
            } else {
                //no links
                links = claimslinks;
            }
        } else {
            //does not have claims or links
            if( !drawing.hasOwnProperty('links') ){
                links = [];
            } else {
                //error - links established but no claims
                links = [];
            }
        }
        if ( drawing.hasOwnProperty('badges') ){
            groupBadges = drawing.badges;
        } else {
            groupBadges = [];
        }

        //update xy positions from existing drawing
        for(var i=0; i<nodes.length; i++){
            var n = nodes[i];
            for (var k=0; k<obj.length; k++){
                var o = obj[k];
                if( n.name == o.name ){
                    o.x = n.x;
                    o.y = n.y;
                    o.active = false;
                }
            }
        }

        for(var j=0; j<links.length; j++){
            var l = links[j];
            //var link = { name: c.name, source: c.obj1.name, destination: c.obj2.name, type: c.type, votes: c.votes };
            //create connections
            var connectSourceName = getSpeciesNameByIndex( l.source );
            var connectDestinationName = getSpeciesNameByIndex( l.destination );
            var tempConnection = connectSourceName+"-"+connectDestinationName;
            var connectType = l.type;
            var connectStatus = l.status;
            var connectConfirmed = l.confirmed;
            var obj1;
            var obj2;
            var votes = l.votes;
            var claims = l.claims;
            //get obj1 and obj2 by name
            for( var m=0; m<obj.length; m++){
                var o = obj[m];
                if ( o.name == connectSourceName ){
                    o.active = true;
                    obj1 = o;
                    repositionLineObject(o);
                } else if ( o.name == connectDestinationName ){
                    o.active = true;
                    obj2 = o; 
                    repositionLineObject(o);
                }
            }
            var line = new Line( tempConnection, obj1, obj2, ctx, 1, connectType, connectStatus, connectConfirmed, data, shadowColour, backgroundColour, lineColours, votes, claims );
            line.addEventListener( line.EVENT_OPENDIALOG, handleModalOpen ); //handleModalOpen //openDialog
            //line.addEventListener( line.EVENT_CONFIRM, onConfirmLine );
            connections.push( line );
            displayList.addChild( line );
        }

        for(var n=0; n<groupBadges.length; n++){
            var gb = groupBadges[n];
            //var node = { name: o.name, x: o.x, y: o.y, active: o.active };
            for (var p=0; p<badges.length; p++){
                var bd = badges[p];
                if( bd.name == gb.name ){
                    bd.x = gb.x;
                    bd.y = gb.y;
                }
            }
        }
        //if object not part of a line and is in the work area, send it back to the palette
        for (var q=0; q<obj.length; q++){
            var o = obj[q];
            if( !o.active && o.x != o.px && o.y != o.py ){
                console.log(o.name+", active: "+o.active+", not in palette");
                o.x = o.px;
                o.y = o.py;
                //save position after X minutes
                setInterval( saveFoodWeb, saveDelay );
            }
        }
        //console.log("connections.length: "+connections.length);
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
        /*//showPos
        ctx.font = "24pt Helvetica";
        ctx.shadowBlur=0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
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
        /*
        //draw toolbar
        ctx.fillStyle = toolbarColour;
        ctx.fillRect(toolbar.x, toolbar.y, toolbar.width, toolbar.height);
        */
        if ( preScaledHeight != 0 && preScaledWidth != 0 ){
            //console.log("version: " + version);
            //version.draw();
            displayList.draw();
        }
    }
}