/**
 * Created by krbalmryde on 6/25/15.
 *
 */
var Critters = {red: [], green: [], blue:[]};
var critterGroup = new THREE.Object3D();
var scene, camera, renderer, container;

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
    for (var bug in Critters) {
        for (var i = 0; i < Critters[bug].length; i++) {
            var critter = Critters[bug][i];
            critter.translateX((Math.random() * 10 - 5));
            critter.translateY((Math.random() * 10   - 5));
            //critter.translateZ((Math.random() * 10 - 5));
        }
    }
    renderer.render( scene, camera );
}


function initVisComponents(){
    console.log("initVisComponents");
    scene = new THREE.Scene();
    scene.add(critterGroup);
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth/window.innerHeight, 1, 1000 );
    camera.position.z = 900;

    renderer = new THREE.WebGLRenderer();

    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor(rgbToHex(255,255,255))
    container = document.getElementById("wallcology");
    container.appendChild( renderer.domElement );

    window.addEventListener( 'resize', onReshape, false );

}


function initNutellaComponents() {
    // Parse the query parameters
    var query_parameters = NUTELLA.parseURLParameters();

    // Get an instance of nutella.
    var nutella = NUTELLA.init(query_parameters.broker, query_parameters.app_id, query_parameters.run_id, NUTELLA.parseComponentId());


    // (Optional) Set the resourceId
    nutella.setResourceId('wallscope_bot');

    // EXAMPLES
    // You can do stuff like:
    console.log("Hi, I'm a wallscope-bot");

    var isRunning = false;

    var timers = setInterval(function () {
        console.log("fired");
        var bugs = ['red', 'green', 'blue'];
        var choices = ['add', 'destroy'];
        var bug = bugs[Math.floor(Math.random() * 3)];
        var choice = choices[Math.floor(Math.random() * 2)];
        var tribute = Math.floor(Math.random() * 10);
        switch (choice) {
            case 'add':
                console.log('add', tribute, bug)
                for (var i = 0; i < tribute; i++) {
                    createCritter(bug, i);
                }

                break;
            case 'destroy':
                console.log('destroy', tribute, bug);
                for (var i = 0; i < tribute; i++) {
                    if (Critters[bug].length < 1) {
                        Critters[bug] = [];
                        break;
                    }
                    var critter = Critters[bug].pop();
                    critterGroup.remove(critter);
                    scene.remove(critter);
                    critter.material.dispose();
                    critter.geometry.dispose();
                }
                break;
        }
    }, 5000);


    // 1. Subscribing to a channel
    nutella.net.subscribe('wallscope_channel', function (message, from) {
        console.log("subscribe to message", message);
        switch (message.event) {
            case "start":
                console.log("subscribe to message", message)
                for (bug in message.Critters) {
                    for (var i = 0; i < message[bug]; i++) {
                        createCritter(bug, i);
                    }
                }
                break;

            case "update":
                console.log("");
                break;

            case "stop":
                console.log("stop");
                for (var bug in Critters) {
                    for (var i = 0; i < Critters[bug].length; i++) {
                        var critter = Critters[bug].pop();
                        critterGroup.remove(critter);
                        scene.remove(critter);
                        critter.material.dispose();
                        critter.geometry.dispose();
                    }
                }
                break;
            default:
                return;
        }
    });
}


function createCritter(bug, i) {

    var mesh = new THREE.Mesh(
        new THREE.SphereGeometry(35, 15, 15),
        new THREE.MeshBasicMaterial({
            color: getBugColor(bug),
            vertexColors: THREE.VertexColors
        })
    );

    var vec3 = new THREE.Vector3();
    vec3.x = Math.random() * 2 - 1;
    vec3.y = Math.random() * 2 - 1;
    //vec3.z = Math.random() * 2 - 1;

    vec3.multiplyScalar(200);

    mesh.position.set( vec3.x, vec3.y, 0);
    mesh.updateMatrix();
    console.log(bug)
    Critters[bug].push(mesh);
    critterGroup.add(mesh);
}


function onReshape() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}


function getBugColor(bug) {
    switch (bug) {
        case 'red': return rgbToHex(255,0,0);
        case 'green': return rgbToHex(0,255,0);
        case 'blue': return rgbToHex(0,0,255);
        default: return rgbToHex(255,255,255);
    }
}


function rgbToHex(R,G,B){
    function toHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }
    return "#" + toHex(R) + toHex(G) + toHex(B)
}