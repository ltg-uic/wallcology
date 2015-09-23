var NUTELLA = require('nutella_lib');

// Get configuration parameters and init nutella
var cliArgs = NUTELLA.parseArgs();
var componentId = NUTELLA.parseComponentId();
var nutella = NUTELLA.init(cliArgs.broker, cliArgs.app_id, cliArgs.run_id, componentId);
// Optionally you can set the resource Id

// WHEN do you need it, by the way?

// nutella.setResourceId('my_resource_id');

// 

var warming_rate = [];

var state;

setTimeout(init,10000); // wait for history to get loaded

function init() {

    nutella.net.request('last_state', {}, function(JSONmessage, from) {
            var message=JSONmessage;
            state=message;
            cycleState();
    });

    nutella.net.subscribe('species_event', function(JSONmessage, from){
        message=JSONmessage;
        state['populations']['message.habitat']['message.species'] = 1; // maximize species (temporary)
    })

    nutella.net.subscribe('environmental_event', function(JSONmessage){
        message=JSONmessage;
        warming_rate [message.habitat] = .01; // temporary
    })

}

// basic simulator cycle. currently every ten seconds for testing.

function cycleState () {
    var newState=state;
    var d = new Date(); 
    newState['timestamp'] = d.getTime();
    for (var i=0; i<state['populations'].length; i++) {
        for (var j=0; j<state['populations'][0].length; j++)
            newState['populations'][i][j] = Math.floor(Math.random()*6);
        for (var k=0; k<state['environments'][0].length; k++)       
            newState['environments'][i][k] = Math.floor(Math.random()*6);
    }
    nutella.net.publish ('state_update',newState);
    state=newState;
    console.log('new state', state);
    setTimeout(cycleState,  1000);
 }



