/**
 * Created by krbalmryde on 6/25/15.
 *
 */

var CritterGroups = {};
var scene, camera, renderer, container;
var hasStarted = false;



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
            critter.translateX((Math.random() * 10 - 5));
            critter.translateY((Math.random() * 10 - 5));
//            critter.translateZ((Math.random() * 10 - 5));
        }
    }
    renderer.render( scene, camera );
}


function initVisComponents(){
    console.log("initVisComponents");
    
    scene = new THREE.Scene();
    CritterGroups['red'] = new THREE.Object3D();
    CritterGroups['green'] = new THREE.Object3D();
    CritterGroups['blue'] = new THREE.Object3D();
    
    scene.add(CritterGroups['red']);
    scene.add(CritterGroups['green']);
    scene.add(CritterGroups['blue']);
    
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
    var nutella = NUTELLA.init(query_parameters.broker, query_parameters.app_id, query_parameters.run_id, NUTELLA.parseComponentId());


    // (Optional) Set the resourceId
    nutella.setResourceId('wallscope_bot');

    // EXAMPLES
    // You can do stuff like:
    console.log("Hi, I'm a wallscope-bot");

    var isRunning = false;
    var sphereGeometry = new THREE.SphereGeometry(35, 15, 15);
    
    var bugGeometry = {}
    var bugMaterials = {}

    setInterval(function () {
        console.log("fired");
        if (hasStarted) {
            var bugs = ['red', 'green', 'blue'];
            var choices = ['add', 'destroy'];
            var bug = bugs[Math.floor(Math.random() * 3)];
            var choice = choices[Math.floor(Math.random() * 2)];
            var tribute = Math.floor(Math.random() * 10)+1;
            
            if (!bugMaterials.hasOwnProperty(bug)){
                var material = new THREE.MeshBasicMaterial({
                    color: getBugColor(bug)
//                    vertexColors: THREE.VertexColors
                });
                
                bugMaterials[bug] = material;
            }
                        
            
            switch (choice) {
                case 'add':
                    console.log('add', tribute, bug)
                    for (var i = 0; i < tribute; i++) {
                        createCritter(bug, sphereGeometry, bugMaterials[bug]);
                    }
                    break;
                case 'destroy':
                    console.log('destroy', tribute, bug);
                    for (var i = 0; i < tribute; i++) {
                        console.log('\t', bug, CritterGroups[bug].children.length);
                        if (CritterGroups[bug].children.length < 1) {
                            console.log("break", bug, CritterGroups[bug].children.length)
                            break;
                        }
                        
                        var critter = CritterGroups[bug].children[0];
                        console.log("\tcritter..", bug, critter);
                        CritterGroups[bug].remove(critter);
//                        critter.material.dispose();
//                        critter.geometry.dispose();
                    }
                    break;
            }
        } else {
            console.log("wating for start event");
        }
    }, 5000);


    // 1. Subscribing to a channel
    nutella.net.subscribe('wallscope_channel', function (message, from) {
        console.log("subscribe to message", message);
        switch (message.event) {
            case "start":
                console.log("Start subscribe to message", message);
                hasStarted = true;
                for (bug in message) {
                    console.log("adding bug", bug, message[bug])
                    if (bug !== "event"){
                        if (!bugMaterials.hasOwnProperty(bug)){
                            var material = new THREE.MeshBasicMaterial({
                                color: getBugColor(bug)
            //                    vertexColors: THREE.VertexColors
                            });

                            bugMaterials[bug] = material;
                        }

                        for (var i = 0; i < parseInt(message[bug]); i++) {
                            createCritter(bug, sphereGeometry, bugMaterials[bug]);
                        }
                    }
                }
                break;

            case "update":
                console.log("");
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
    });
}


function createCritter(bug, sphereGeometry, sphereMaterial) {

    var mesh = new THREE.Mesh(sphereGeometry, sphereMaterial);

    var vec3 = new THREE.Vector3();
    vec3.x = Math.random() * 2 - 1;
    vec3.y = Math.random() * 2 - 1;
    vec3.z = Math.random() * 2 - 1;

    vec3.multiplyScalar(200);

    mesh.position.set( vec3.x, vec3.y, 0);
    mesh.updateMatrix();
    console.log(bug)
    CritterGroups[bug].add(mesh);
}


function onReshape() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}


function getBugColor(bug) {
    console.log("getBugColor(", bug, ")");
    switch (bug) {
        case 'red': return 'rgb(255,0,0)';
        case 'green': return 'rgb(0,255,0)';
        case 'blue': return 'rgb(0,0,255)';
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