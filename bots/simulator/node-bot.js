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
const frequencyOfUpdate = 1 * 30 * 1000; //(1000 = 1 second)

//  model constants

const r = [0.25, 0.25, 0.25]; // one for each resource (maximal growth rate)
var K = [100, 150, 60]; // one for each resource (carrying capacity)
var alpha =   [     [ 1.0,  0.4,  0.0   ], 
                    [ 0.5,  1.0,  0.5   ], 
                    [ 0.0,  0.5,  1.0   ]
                ];
const b = [0.1, 0.1]; // one for each herbivore (conversion of resources consumed into new herbivores)
var a =   [
                [ 0.20, 0.08 ], 
                [ 0.10, 0.18 ],
                [ 0.00, 0.00 ]
            ];
const q = [1, 1]; // one for each herbivore (measure of interference competition among herbivores)
const d = [0.1, 0.1]; // one for each herbivore (intrinsic death rates)
const beta = [0.1, 0.1]; // one for each predator  (intrinsic death rates) (just like b, but herbs to preds
const s = [1, 1]; // one for each predator (measure of interference competition among predators)
const delta = [0.1, 0.1]; // one per predator (intrinsicd death rath of predator)
var m =   [
                [ 0.300, 0.125 ], 
                [ 0.150, 0.250 ]
           ];


const resourceIndex = [5,10,9]; // which indexes in the species array correspond to resources
const herbivoreIndex = [6,2]; // etc. ORDER MATTERS in all 3, because constants above are based on them
const predatorIndex = [1,8]; // ditto


var state; 
console.log("Simulator version 0.9.0");
setTimeout(init,waitForHistoryToLoad); // give history a minute to load or initialize

function init() {
        nutella.net.request('last_state', {}, function(message, from) {
        state=JSON.parse(JSON.stringify(message)); //deepCopy(message);
        cycleStatesOnSchedule();
    // channel: species_event
    //
    //  message = {habitat: 0, species: 3, action: <event>} <event> := "remove" | "increase" | "decrease" | "insert"

        nutella.net.subscribe('species_event', function(message, from){
            switch (message.action) {
                case "remove": 
                    state['populations'][message.habitat][message.species] = 0;  
                    break;
                case "decrease": 
                    state['populations'][message.habitat][message.species] *= 0.2; 
                    break;
                case "increase": 
                    state['populations'][message.habitat][message.species] *= 2; 
                    break;
                case "insert":
                    state['populations'][message.habitat][message.species] = 0;
                    if (isResource() >= 0) state['populations'][message.habitat][message.species] = 10;
                    if (isHerbivore() >= 0) state['populations'][message.habitat][message.species] = 1;
                    if (isPredator() >= 0) state['populations'][message.habitat][message.species] = .5;
                    break;
                };
                cycleState();
        })

    // channel: environmental_event   [DRAFT]
    //  message = {habitat: 0, action: <event>, species: 6}  <event> := "warming" | "pipeCollapse" | "plasterFall"
    //  
    //  plasterFalls for the future; would allow for more brick area
    //
    //

        nutella.net.subscribe('environmental_event', function(message){

            switch (message.action) {
                case "warming": // here, flag mode by making temp negative. it's a hack, but it preserves db structure
                    state['environments'][message.habitat][0] = 
                    Math.abs(state['environments'][message.habitat][0]); // next higest temperature; //need joel's input on these 
                    break;
                case "pipeCollapse": // these are events. they have instaneous effects. check with joel on constants
                    if      (state['environments'][message.habitat][1] > 0.9 ) state['environments'][message.habitat][1] = 0.9;
                    else if (state['environments'][message.habitat][1] > 0.7 ) state['environments'][message.habitat][1] = 0.7;
                    else if (state['environments'][message.habitat][1] > 0.6 ) state['environments'][message.habitat][1] = 0.6;
                    else if (state['environments'][message.habitat][1] > 0.5 ) state['environments'][message.habitat][1] = 0.5;
                    else if (state['environments'][message.habitat][1] > 0.3 ) {
                        state['environments'][message.habitat][1] = 0.3;
                        // adjust joel's parameters because we're at "low" pipe level;
                    }
                    break;
                case "plasterFall": 
                    if (state['environments'][message.habitat][2] < 0.8) 
                        state['environments'][message.habitat][2] += 0.1; 
                    break;
                case "invasion":
                    state['environments'][message.habitat][3] = message.species; // -1 or undefined or null means no invasion. positive = invasion
                    break;
    
            };
            cycleState();
        })
    })
}

function isResource (i) {
    for (var j=0; j<resourceIndex.length; j++)
        if (i == resourceIndex[j]) return (j);
    return (-1);
}

function isHerbivore (i) {
    for (var j=0; j<herbivoreIndex.length; j++)
        if (i == herbivoreIndex[j]) return (j);
    return (-1);
}

function isPredator (i) {
    for (var j=0; j<predatorIndex.length; j++)
        if (i == predatorIndex[j]) return (j);
    return (-1);
}

// growth model

function nextPopulation(h,i) {
    var modelIndex; //maps species to Joel's model index

    if ((modelIndex = isResource(i)) >= 0) {
        var sum1 = 0;
        var sum2 = 0;
        for (var j=0; j<resourceIndex.length; j++) 
            sum1 += (alpha[modelIndex][j] * state['populations'][h][resourceIndex[j]]);
        for (var k=0; k<herbivoreIndex.length; k++)
            sum2 += ((a[modelIndex][k] * state['populations'][h][herbivoreIndex[k]]) / 
                (1 + q[k] * state['populations'][h][herbivoreIndex[k]]));
        return(state['populations'][h][resourceIndex[modelIndex]] * 
            Math.exp(r[modelIndex] * (K[modelIndex] - sum1)/K[modelIndex] - sum2));
    } 
    if ((modelIndex = isHerbivore(i)) >= 0) {
        var sum1 = 0;
        var sum2 = 0;
        for (var j=0; j<resourceIndex.length; j++) 
            sum1 += ((a[j][modelIndex] * state['populations'][h][resourceIndex[j]]) / 
            (1 + q[modelIndex] * state['populations'][h][herbivoreIndex[modelIndex]]));
        for (var k=0; k<predatorIndex.length; k++) 
            sum2 += ((m[modelIndex][k] * state['populations'][h][predatorIndex[k]]) / 
            (1 + s[k] * state['populations'][h][predatorIndex[k]]));
        return(state['populations'][h][herbivoreIndex[modelIndex]] * Math.exp(b[modelIndex] * sum1 - d[modelIndex] - sum2));
    }

    if ((modelIndex = isPredator(i)) >= 0) {
        var sum = 0;
        for (var j=0; j<herbivoreIndex.length; j++) 
            sum += ((m[j][modelIndex] * state['populations'][h][herbivoreIndex[j]]) / 
            (1 + s[modelIndex] * state['populations'][h][predatorIndex[modelIndex]]));
        return(state['populations'][h][predatorIndex[modelIndex]] * Math.exp(beta[modelIndex] * sum - delta[modelIndex]));
    }

    return(0);
}



// basic simulator cycle. 

function cycleState () {
    nutella.net.publish ('state_update',state);
//    var newState = JSON.parse(JSON.stringify(state));
   var newState = deepCopy(state);

   var d = new Date(); 
    newState['timestamp'] = d.getTime();
   for (var i=0; i<state['populations'].length; i++) 
        for (var j=0; j<state['populations'][i].length; j++)
            newState['populations'][i][j] = nextPopulation(i,j);

    // accounting for continuous pressures

 
    for (var i=0; i<state['environments'][0].length; i++) {

    // warming

       if (state['environments'][i][0]>0)   //if it's in warming mode, update the temperature
                                                            //add here because warming environments have positive values
            newState['environments'][i][0] += .01; //degrees. Joel? this should be computable from period
            // and then we have to also store that into one of joel's variables? i'm sure we do.

    // invasion

       if (state['environments'][i][3]>0) {  //if it's in invasion mode (>0), this field identifies the invading species
            var newPop = 0;
            if (idResource(newState['populations'][i][state['environments'][i][3]][0]) >= 0) newPop=10;
            if (idResource(newState['populations'][i][state['environments'][i][3]][0]) >= 0) newPop=1;
            if (idResource(newState['populations'][i][state['environments'][i][3]][0]) >= 0) newPop=0.5;
            newState['populations'][i][state['environments'][i][3]][0] = 
                Math.max(newPop,state['populations'][i][state['environments'][i][3]][0]); //degrees. Joel? this should be computable from period
            // and then we have to also store that into one of joel's variables? i'm sure we do. check with joel on constants
        }
    }
    state = deepCopy(newState);
    // throw new Error('simulator halted');
 }

function cycleStatesOnSchedule() {
    cycleState();
    setTimeout(cycleStatesOnSchedule,  frequencyOfUpdate);
}

function deepCopy(oldObj) {
    var newObj = oldObj;
    if (oldObj && typeof oldObj === 'object') {
        newObj = Object.prototype.toString.call(oldObj) === "[object Array]" ? [] : {};
        for (var i in oldObj) {
            newObj[i] = deepCopy(oldObj[i]);
        }
    }
    return newObj;
}

