/**
 * Created by krbalmryde on 6/25/15.
 *
 */

"use strict";

var CritterGroups = {};
var scene, renderer, container;
var camera, controls, raycaster;
var hasStarted = false;
var nutella, mouse;
var loader = new THREE.OBJLoader();  // THREE.OBJMTLLoader();
var texture = new THREE.Texture();
var wallscopeId;
var configuration;
var currentWallscope;

function Start() {
    onCreate();
    onFrame();
}


function onCreate() {
    initVisComponents();
    initNutellaComponents();
}


function onFrame() {
    requestAnimationFrame( onFrame );
    render();
}

/* ================================== *
 *          render
 *  Our render function which renders
 *  the scene and its associated objects
 * ================================== */
function render() {
    CritterGroups.children.forEach(function(Bug) {
        for (var i = 0; i < Bug.children.length; i++) {
            var bug = Bug.children[i];
            bug.translateX((Math.random() * 10 - 5));
            bug.translateY((Math.random() * 10 - 5));
            // bug.translateZ((Math.random() * 10 - 5));
        }
    })
    renderer.render( scene, camera );
}


function initVisComponents(){
    console.log("initVisComponents");

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor(rgbToHex(255,255,255));

    container = document.getElementById("wallcology");
    container.appendChild( renderer.domElement );

    scene = new THREE.Scene();
    CritterGroups = new THREE.Object3D();

    scene.add(CritterGroups);

    console.log("initRayCaster()")
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    initTexture();

    camera = new THREE.PerspectiveCamera( 45, window.innerWidth/window.innerHeight, 1, 1000 );
    camera.position.z = 900;

    controls = new THREE.TrackballControls(camera, renderer.domElement);
    {
        controls.rotateSpeed = 4.0;
        controls.zoomSpeed = 1.5;
        controls.panSpeed = 1.0;

        controls.noZoom = false;
        controls.noPan = false;

        controls.staticMoving = false;
        controls.dynamicDampingFactor = 0.3;

        controls.keys = [65, 83, 68];
        controls.enabled = true;
    }
    camera.lookAt({x:0,y:0,z:0});
    controls.target.set(0, 0, 0);
    controls.update();
    // updateLightPosition();

    console.log()

    console.log("initListeners()")
    window.addEventListener('resize', onReshape, false);
    window.addEventListener('mousemove', onMouseMove, false);
    window.addEventListener('click', onMouseClick, true);
    // window.addEventListener('dblclick', onMouseDoubleClick, true);
    // window.addEventListener('keypress', onKeyPress, false);

}

function initNutellaComponents() {
    // Parse the query parameters
    var query_parameters = NUTELLA.parseURLParameters();

    wallscopeId = query_parameters.wallscope;

    console.log('wallscope: ' + wallscopeId)

    // Get an instance of nutella.
    nutella = NUTELLA.init(
        query_parameters.broker,
        query_parameters.app_id,
        query_parameters.run_id,
        NUTELLA.parseComponentId()
    );

    // (Optional) Set the resourceId
    nutella.setResourceId('wallscope_vis');

    var isRunning = false;
    var sphereGeometry = new THREE.SphereGeometry(35, 15, 15);

    subscribeToChannel('wallscope_channel', adminMessageCallBack);
    // subscribeToChannel("wallscope_channel", adminMessageCallBack);


    // 3. Make asynchronous requests on a certain channel
    nutella.net.request( 'wallscope_channel', 'start', function(response){
        console.log("Help me 'wallcology_channel', youre my only hope", response)
    });
}

function subscribeToChannel(channelName, messageHandler) {
    console.log("subscribing to channel:", channelName);
    nutella.net.subscribe(channelName, messageHandler);
}


function adminMessageCallBack(message, from) {

    console.log('THE MESSAGE' + message);


    // 1. Subscribing to a channel
    console.log("Message from", from.component_id, ":", message);
    switch (message.event) {
        case "start":
            handleStartEvent(message);
            break;

        case "update_scope":
            console.log("Message received", message);
            handleUpdateScopeEvent(message);
            break;

        case "stop":
            handleStopEvent(message);
            break;
        default:
            return;
    }
}


function createCritter(bug, sphereGeometry, sphereMaterial) {
    // console.log("createCritter(",bug, sphereGeometry, sphereMaterial,")");

    if (bug.name === "Spikey Bug") {
        createDinoCritter(bug);
        return;
    }

    var mesh = new THREE.Mesh(sphereGeometry, sphereMaterial);

    var vec3 = new THREE.Vector3();
    vec3.x = Math.random() * 2 - 1;
    vec3.y = Math.random() * 2 - 1;
    vec3.z = Math.random() * 2 - 1;

    vec3.multiplyScalar(200);

    mesh.position.set( vec3.x, vec3.y, 0);
    mesh.updateMatrix();

    // console.log("\t",bug.name,CritterGroups.getObjectByName(bug.name));
    CritterGroups.getObjectByName(bug.name).add(mesh);
}


function createDinoCritter(bug) {
    // console.log("createDinoCritter", bug);

    // load an obj / mtl resource pair
    loader.load(
        // OBJ resource URL
        'assets/Dino.obj',
        // MTL resource URL
        // 'assets/Dino.mtl',
        // Function when both resources are loaded
        function ( object ) {
            // console.log(object)
            object.children.forEach(function(mesh) {
                console.log("\t",mesh);
                mesh.material = new THREE.MeshBasicMaterial({
                    map: texture,
                    color: 'rgb(255, 0, 0)',
                    // blending: THREE.AdditiveBlending,
                    // specular: colorKey(halo.time),
                    // shininess: 40,
                    // shading: THREE.SmoothShading,
                    // vertexColors: THREE.VertexColors,
                    // transparent: true,
                    // side: THREE.BackSide,  // Seems to be slowing things down a lot
                    // opacity: 0.4
                });
                // mesh.material.map = texture;                mesh.scale.set(10,10,10);

            });
            object.scale.set(4,4,4);
            CritterGroups.getObjectByName(bug.name).add(object);
        },
        // Function called when downloads progress
        function ( xhr ) {
            // console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
        },
        // Function called when downloads error
        function ( xhr ) {
            console.log( 'An error happened' );
        }
    );
}



function onReshape() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}


/**
 * Created by krbalmryde on 7/7/15.
 */


// ==========================================
//        onReshape, onMouseMove
// And associated Event Listeners
// ==========================================
function onReshape() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );

}


function onMouseMove( event ) {

    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components
    event.preventDefault();
    // console.log("Before:", event.clientX, event.clientY)
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    // console.log("After:", mouse.x, mouse.y);
}


function onMouseClick(event) {
    console.log("Single Click!!");
    // update the picking ray with the camera and mouse position
    raycaster.setFromCamera( mouse, camera );
    // calculate objects intersecting the picking ray
    console.log("Before:", event.clientX, event.clientY)
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    console.log("After:", mouse.x, mouse.y);
    CritterGroups.children.forEach(function(critters) {
        var hit, hits = raycaster.intersectObjects( critters.children );

        for (var i = 0; i < hits.length; i++) {
            hit = hits[i];
            console.log("\t",critters.name, i, "hit?", hit);
            if (hit.object.visible) break;
        }
        console.log("\t",critters.name, "hit?", hits);
    })

    // if (hit && (hit.object.material.opacity !== 0.0 && hit.object.visible)) {

    //     console.log("we got something!", hit);
    //     if (!prevTarget)
    //         prevTarget = curTarget = hit;
    //     else {
    //         prevTarget = curTarget;
    //         curTarget = hit;
    //     }
    // }

}


function tweenToPosition(durationA, durationB, zoom) {

    console.log("we are tweenToPosition! Pre");
    TWEEN.removeAll();


    var cameraPosition = camera.position;  // The current Camera position
    var currentLookAt = controls.target;   // The current lookAt position

    var haloDestination = {   // Our destination
        x: curTarget.object.position.x,
        y: curTarget.object.position.y,
        z: curTarget.object.position.z  // put us a little bit away from the point
    };

    var zoomDestination = {
        x: haloDestination.x,
        y: haloDestination.y,
        z: haloDestination.z - (haloDestination.z * .3)  // put us a little bit away from the point
    };

    // Frist we position the camera so it is looking at our Halo of interest
    var tweenLookAt = new TWEEN.Tween(currentLookAt)
        .to(haloDestination, durationA)
        .onUpdate(function() {

            controls.target.set(currentLookAt.x, currentLookAt.y, currentLookAt.z);
        });

    // Then we zoom in
    var tweenPosition = new TWEEN.Tween(cameraPosition)
        .to(zoomDestination, durationB)
        .onUpdate(function() {

            camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
            controls.update();
        });

    if (zoom)
        tweenLookAt.chain(tweenPosition);
    tweenLookAt.start();
    console.log("we are tweenToPosition! Post");
}



function initTexture() {
    // texture

    var manager = new THREE.LoadingManager();
    manager.onProgress = function ( item, loaded, total ) {

        console.log( item, loaded, total );

    };



    var onProgress = function ( xhr ) {
        if ( xhr.lengthComputable ) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            console.log( Math.round(percentComplete, 2) + '% downloaded' );
        }
    };

    var onError = function ( xhr ) {
    };

    loader = new THREE.OBJLoader(manager);

    var textureLoader = new THREE.ImageLoader( manager );
    textureLoader.load( 'assets/disturb.jpg', function ( image ) {

        texture.image = image;
        texture.needsUpdate = true;

    } );

    // model

    // var loader = new THREE.OBJLoader( manager );
    // loader.load( 'obj/male02/male02.obj', function ( object ) {

    //     object.traverse( function ( child ) {

    //         if ( child instanceof THREE.Mesh ) {

    //             child.material.map = texture;

    //         }

    //     } );

    //     object.position.y = - 80;
    //     scene.add( object );

    // }, onProgress, onError );

    //
}


function getBugColor(bug) {
    console.log("getBugColor(", bug, ")");
    switch (bug) {
        case 'Fang Bug': return 'rgb(255,0,0)';
        case 'Big Bug': return 'rgb(0,255,0)';
        case 'Small Bug': return 'rgb(0,0,255)';
        default: return 'rgb(255,255,0)';
    }
}


function rgbToHex(R,G,B){
    function toHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }
    return "#" + toHex(R) + toHex(G) + toHex(B)
}