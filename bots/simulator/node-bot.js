var NUTELLA = require('nutella_lib');

// Get configuration parameters and init nutella
var cliArgs = NUTELLA.parseArgs();
var componentId = NUTELLA.parseComponentId();
var nutella = NUTELLA.init(cliArgs.broker, cliArgs.app_id, cliArgs.run_id, componentId);
// Optionally you can set the resource Id

// WHEN do you need it, by the way?

// nutella.setResourceId('my_resource_id');

// 
//
//  these constants are important for debugging
//  the first forces a delay before attempting to retrieve
//  the most recent state from the history bot. this
//  avoids a race situation. i'm sure there's a better way
//  to do this that to set an arbitrary time limit, but i
//  don't know how.
//
//  during enactment, we plan to update state every fiften
//  minutes (15 x 60 x 1000). for testing purposes, at least,
//  you will want to run it much faster to generate test values.
//  here it's set to one second, but i'm just generating random
//  numbers, so this might be too frequent for joel's model
//  when we plug that in.


const waitForHistoryToLoad = 10 * 1000; //(1000 = 1 second)
const frequencyOfUpdate = 15 * 60 * 1000; //(1000 = 1 second)


var state; console.log("Version 0.8");

setTimeout(init,waitForHistoryToLoad); // give history a minute to load or initialize

function init() {

    nutella.net.request('last_state', {}, function(message, from) {

        state=message;
        cycleState();

    // channel: species_event
    //
    //  message = {habitat: 0, species: 3, action: <event>} <event> := "remove" | "increase" | "decrease" | "insert"

        nutella.net.subscribe('species_event', function(message, from){
            switch (message.action) {
                case "remove": 
                    state['populations'][message.habitat][message.species] = 0; //need joel's input on these 
                    break;
                case "decrease": 
                    state['populations'][message.habitat][message.species] *= 0.8; 
                    break;
                case "increase": 
                    state['populations'][message.habitat][message.species] *= 1.2; 
                    break;
                case "introduce": 
                    state['populations'][message.habitat][message.species] = 20; // these are all total guesses
                    break;
                };
                cycleState();
        })

    // channel: environmental_event   [DRAFT]
    //  message = {habitat: 0, action: <event>}  <event> := "warming" | "pipeCollapse" | "plasterFall"
    //  
    //  plasterFalls for the future; would allow for more brick area
    //
    //

        nutella.net.subscribe('environmental_event', function(message){
           switch (message.action) {
                case "warming": 
                    if (state['environments'][message.habitat][0] < 2) state['environments'][message.habitat][0] += 1 // next higest temperature; //need joel's input on these 
                    break;
                case "pipeCollapse": 
                    if (state['environments'][message.habitat][1] < 2)state['environments'][message.habitat][1] -= 1; 
                    break;
                case "plasterFall": 
                    if (state['environments'][message.habitat][2] < 2)state['environments'][message.habitat][2] += 1; 
                    break;
                };
                cycleState();
        })
    })
}


// basic simulator cycle. currently every ten seconds for testing.

function cycleState () {
    nutella.net.publish ('state_update',state);
    var newState=state;
    var d = new Date(); 
    newState['timestamp'] = d.getTime();
    for (var i=0; i<state['populations'].length; i++) {
        for (var j=0; j<state['populations'][0].length; j++)
//
//  duumy data generation for now
//  the conditional below is just to keep data smoother until we get the real formula
//            
            if (Math.random()<.1) newState['populations'][i][j] = Math.floor(Math.random()*6); // joel will give me the expression 
    }
    for (var i=0; i<state['environments'].length; i++) {
        for (var j=0; j<state['environments'][0].length; j++)
//
//  the conditional below is just to keep data smoother until we get the real formula
//            
            if (Math.random()<.1) newState['environments'][i][j] = Math.floor(Math.random()*50); // joel will give me the expression 
    }

    state=newState;

    setTimeout(cycleState,  frequencyOfUpdate);
 }



