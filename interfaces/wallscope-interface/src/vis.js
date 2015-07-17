/**
 * Created by krbalmryde on 6/25/15.
 *
 */

"use strict";

var CritterGroups = {};
var scene, camera, renderer, container;
var hasStarted = false;
var nutella;
var loader = new THREE.OBJMTLLoader();


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
    for (var bug in CritterGroups) {
        for (var i = 0; i < CritterGroups[bug].children.length; i++) {
            var critter = CritterGroups[bug].children[i];
            // critter.translateX((Math.random() * 10 - 5));
            // critter.translateY((Math.random() * 10 - 5));
//            critter.translateZ((Math.random() * 10 - 5));
        }
    }
    renderer.render( scene, camera );
}


function initVisComponents(){
    console.log("initVisComponents");

    scene = new THREE.Scene();
    CritterGroups = new THREE.Object3D();
    // CritterGroups['fang bug'] = new THREE.Object3D();
    // CritterGroups['big bug'] = new THREE.Object3D();
    // CritterGroups['small bug'] = new THREE.Object3D();
    // CritterGroups['spikey bug'] = new THREE.Object3D();

    scene.add(CritterGroups);
    // scene.add(CritterGroups['fang bug']);
    // scene.add(CritterGroups['big bug']);
    // scene.add(CritterGroups['small bug']);
    // scene.add(CritterGroups['spikey bug']);

    camera = new THREE.PerspectiveCamera( 45, window.innerWidth/window.innerHeight, 1, 1000 );
    camera.position.z = 900;

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor(rgbToHex(255,255,255));

    container = document.getElementById("wallcology");
    container.appendChild( renderer.domElement );

    window.addEventListener( 'resize', onReshape, false );

}

function initNutellaComponents() {
    // Parse the query parameters
    var query_parameters = NUTELLA.parseURLParameters();

    // Get an instance of nutella.
    nutella = NUTELLA.init(query_parameters.broker, query_parameters.app_id, query_parameters.run_id, NUTELLA.parseComponentId());

    // (Optional) Set the resourceId
    nutella.setResourceId('wallscope_vis');

    var isRunning = false;
    var sphereGeometry = new THREE.SphereGeometry(35, 15, 15);

    subscribeToChannel('wallcology_admin_channel', adminMessageCallBack);
    // subscribeToChannel("wallscope_channel", adminMessageCallBack);


    // 3. Make asynchronous requests on a certain channel
    nutella.net.request( 'wallcology_admin_channel', 'start', function(response){
        console.log("Help me 'wallcology_admin_channel', youre my only hope", response)
    });
}

function subscribeToChannel(channelName, messageHandler) {
    console.log("subscribing to channel:", channelName);
    nutella.net.subscribe(channelName, messageHandler);
}



function adminMessageCallBack(message, from) {
    // 1. Subscribing to a channel
    console.log("Message from", from.component_id, ":", message);
    switch (message.event) {
        case "start":
            handleStartEvent(message);
            break;

        case "update_scope":
            console.log("Message received", message);
            handleUpdateScopeMessage(message);
            break;

        case "stop":
            console.log("stop");
            hasStarted = false;
            for (var bug in CritterGroups) {
                while (CritterGroups[bug].children.length > 0){
                    console.log("stop", bug, CritterGroups[bug].children, length);
                    var critter = CritterGroups[bug].children[0];
                    CritterGroups[bug].remove(critter);
                    scene.remove(critter);
                    critter.material.dispose();
                    critter.geometry.dispose();
                }
            }
            break;
        default:
            return;
    }
}

function handleStartEvent(m) {
    console.log("It Has Begun!!", m);

    hasStarted = true;

    var bugMaterials = {}
    var bugGeometry = new THREE.SphereGeometry(35, 15, 15)

    m.scopeConfiguration.forEach(function(config) {
        config.bugs.forEach(function(bug){
            console.log(bug);
            if (!bugMaterials.hasOwnProperty(bug.name)){
                console.log("missing")
                bugMaterials[bug.name] = new THREE.MeshBasicMaterial({
                    color: bug.color
                });

            } else {
                console.log("its there")
            }

            for (var i = 0; i < bug.population; i++) {
                createCritter(bug, bugGeometry, bugMaterials[bug.name]);
            }

        })
    })
}


function handleUpdateScopeMessage(m) {
    console.log("Dealing with message...");
    m.scopeConfiguration.bugs.forEach(function(bug) {
        console.log(bug);
    })
}




function createCritter(bug, sphereGeometry, sphereMaterial) {
    console.log("createCritter(",bug,")");

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

    CritterGroups[bug.name].add(mesh);
}


function createDinoCritter(bug) {
    console.log("createDinoCritter", bug);

    // load an obj / mtl resource pair
    loader.load(
        // OBJ resource URL
        'assets/Dino.obj',
        // MTL resource URL
        'assets/Dino.mtl',
        // Function when both resources are loaded
        function ( object ) {
            console.log(object)
            object.children.forEach(function(mesh) {
                console.log("\t",mesh);
                mesh.material.vertexColors = THREE.VertexColors;
                mesh.material.color.setRGB(255,0,155);
                mesh.scale.set(10,10,10);
            })
            CritterGroups[bug.name].add(object);
        },
        // Function called when downloads progress
        function ( xhr ) {
            console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
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