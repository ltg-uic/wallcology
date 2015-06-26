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
            critter.translateX((Math.random() * 25 - 12.5));
            critter.translateY((Math.random() * 25 - 12.5));
            critter.translateZ((Math.random() * 25 - 12.5));
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

    for (var bug in {"red":10, "green":10, "blue":10}) {
        for (var i = 0; i < 10; i++){
            createCritter(bug, i);
        }
    }

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

    var timers = setInterval(function(){
        console.log("fired");
        var bugs = ['red', 'yellow', 'blue'];
        var choices = ['add', 'destroy'];
        var bug = bugs[Math.floor(Math.random()*3)];
        var choice = choices[Math.floor(Math.random()*2)];
        var tribute = Math.floor(Math.random()*10);
        switch(choice) {
            case 'add':
                console.log( 'add')
                for (var i = 0; i < tribute; i++) {
                    createCritter(bug, i);
                }

                break;
            case 'destroy':
                console.log( 'destroy')
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
    nutella.net.subscribe('wallscope_channel', function(message, from) {
        switch(message.eventType) {
            case "Start":
                for (bug in message.Critters) {
                    for (var i = 0; i < message[bug]; i++){
                        createCritter(bug, i);
                    }
                }
                break;

            case "Update":
                console.log("");
                break;

            case "End":
                console.log("");
                break;
            default:
                return;
        }
    });


    // 2. Publish a message to a channel
    nutella.net.publish('wallscope_channel', 'demo_message');


    // 2a. The cool thing is that the message can be any object
    nutella.net.publish('wallscope_channel', {a: 'proper', key: 'value'});


    // 3. Make asynchronous requests on a certain channel
    nutella.net.request( 'demo_channel', 'my_request', function(response){
        // Your code to handle the response to this request goes here
    });


    // 4. Handle requests from other components
    nutella.net.handle_requests( 'demo_channel', function(message, from) {
        // Your code to handle each request here
        // Anything this function returns (String, Integer, Object...) is going to be sent as the response
        var response = 'a simple string'
        // response = 12345
        // response = {}
        // response = {my:'json'}
        return response;
    });

    // 6. Access the variables that uniquely identify this instance of this component
    console.log(
        nutella,
        nutella.runId, '\n',
        nutella.componentId, '\n',
        nutella.resourceId);


    // 7. Do you need an extra instance of nutella (to work with React components for instance)? Not a problem...
    // var nutella2 = NUTELLA.init(query_parameters.run_id, query_parameters.broker, 'your_interface_name');

    // HAVE FUN WITH nutella!
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
    vec3.z = Math.random() * 2 - 1;

    vec3.multiplyScalar(200);

    mesh.position.set( vec3.x, vec3.y, vec3.z);
    mesh.updateMatrix();
    console.log(Critters[bug])
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