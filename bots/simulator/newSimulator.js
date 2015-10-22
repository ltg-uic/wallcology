var NUTELLA = require('nutella_lib');

// Get configuration parameters and init nutella
var cliArgs = NUTELLA.parseArgs();
var componentId = NUTELLA.parseComponentId();
var nutella = NUTELLA.init(cliArgs.broker, cliArgs.app_id, cliArgs.run_id, componentId);
console.log("Simulator version 0.9.6");

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
// const frequencyOfUpdate = 2 * 60 * 1000; //(1000 = 1 second)
// const broadcastFrequency = 15; // every update. increase to "speed up" model
const frequencyOfUpdate = 1 * 1 * 1000; //(1000 = 1 second)
const broadcastFrequency = 1; // every update. increase to "speed up" model

var broadcastCount=0;

var state; //current state of the simulation

//  load the models for this run
var model = nutella.persist.getMongoObjectStore('model');

model.load(function(){
    setTimeout(init,waitForHistoryToLoad); // give history time to load or initialize; a kludge
})


// end of program. everything else is functions


function init() {
    nutella.net.request('last_state', {}, function(message, from) {
    state=JSON.parse(JSON.stringify(message)); //deepCopy(message);
//
//  convert from wall values to simulator values
//  
    for (var ecosystem=0; ecosystem<state['populations'].length; ecosystem++) 
        for (var species=0; species<state['populations'][ecosystem].length; species++) 
            state['populations'][habitat][species] *= 
                model['wallToSimulator'][model['species'][species]['trophicLevel']];
}

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
                    state['populations'][message.habitat][message.species] *= model['decreaseFactor']; 
                    break;
                case "increase": 
                    state['populations'][message.habitat][message.species] *= model['increaseFactor']; 
                    break;
                case "insert":
                    state['populations'][message.habitat][message.species] *= 
                        (model['defaultPopulations'][model['species'][message.species]['trophicLevel'] *
                            model['invasionFactor']);
                    break;
                };
            cycleState();
        });

    // channel: environmental_event   [DRAFT]
    //  message = {habitat: 0, action: <event>, species: 6}  <event> := "warming" | "pipeCollapse" | "plasterFall" | "invasion"
    //  
    //  plasterFalls for the future; would allow for more brick area
    //
    //

        nutella.net.subscribe('environmental_event', function(message){

            switch (message.action) {
                case "warming": 
                    model['tempIncrements'][message.habitat] = model['tempIncrementLevel'];
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

function isResource (h,i) {
    for (var j=0; j<model['resourceIndex'][h].length; j++)
        if (i == model['resourceIndex'][h][j]) return (j);
    return (-1);
}

function isHerbivore (h,i) {
    for (var j=0; j<model['herbivoreIndex'][h].length; j++)
        if (i == model['resourceIndex'][h][j]) return (j);
    return (-1);
}

function isPredator (h,i) {
    for (var j=0; j<model['predatorIndex'][h].length; j++)
        if (i == model['predatorIndex'][h][j]) return (j);
    return (-1);
}

// growth model


function applyModelAdjustments(h) {

    // apply model corrections due to pressures
    // temperature adjustments

    if (model['tempIncrements'][h]>0) {
        var oldTemp = state['environments'][h][0];
        var newTemp = oldTemp + model['tempIncrements'][h];
        state['environments'][h][0] = newTemp;
        if ((oldTemp <= model['tempThresholds'][0] && newTemp > model['tempThresholds'][0]) ||
            (oldTemp <= model['tempThresholds'][1] && newTemp > model['tempThresholds'][1]))
                model['tempIncrements'][h] = 0;
    // insert model transforms describing temperature effect here, like:
        // model['K'][i] -= (model['defaultPopulations'][model['species'][i]['trophicLevel']]/3/50);
        // model['b'][h][0] -= (model['defaultPopulations'][model['species'][i]['trophicLevel']]/5/50);
        // model['beta'][h][0] -= (model['defaultPopulations'][model['species'][i]['trophicLevel']]/5/50);
    }

    var highPipe = model['pipeValues'][h][0];
    var lowPipe = model['pipeValues'][h][model['pipeValues'].length-1];
    var currentPipe = state['environments'][h][1];
    model['K'][h][?] *= (highPipe-currentPipe);
    model['b'][h][?] *= ((highPipe-currentPipe)/5)*.1

function nextPopulation(h,i) { // h=habitat, i=species
    var modelIndex; //maps species to Joel's model index


    }  

    // pipe length adjustments
    // 
    var pipeLength = state['environments'][h][1];

    model['K'][i] -= (model['pipeThreshholds'][0]-pipeLength)/
        (model['pipeThreshholds'][0]-model['pipeThreshholds'][model['pipeThreshholds'].length-1])*2/3/

    if ()
        model['K'][i] -= (model['defaultPopulations'][model['species'][i]['trophicLevel']]/3/50);
        model['b'][h][0] -= (model['defaultPopulations'][model['species'][i]['trophicLevel']]/5/50);
        model['beta'][h][0] -= (model['defaultPopulations'][model['species'][i]['trophicLevel']]/5/50);


    if ((modelIndex = isResource(h,i)) >= 0) {
        var sum1 = 0;
        var sum2 = 0;
        for (var j=0; j<resourceIndex[h].length; j++) 
            sum1 += (model['alpha'][h][modelIndex][j] * state['populations'][h][resourceIndex[h][j]]);
        for (var k=0; k<herbivoreIndex[h].length; k++)
            sum2 += ((model['a'][h][modelIndex][k] * state['populations'][h][herbivoreIndex[h][k]]) / 
                (1 + model['q'][h][k] * state['populations'][h][herbivoreIndex[h][k]]));
        return(state['populations'][h][resourceIndex[h][modelIndex]] * 
            Math.exp(model['r'][h][modelIndex] * (model['K'][h][modelIndex] - sum1)/model['K'][h][modelIndex] - sum2));
    } 
    if ((modelIndex = isHerbivore(h,i)) >= 0) {
        var sum1 = 0;
        var sum2 = 0;
        for (var j=0; j<resourceIndex[h].length; j++) 
            sum1 += ((model['a'][h][j][modelIndex] * state['populations'][h][resourceIndex[h][j]]) / 
            (1 + model['q'][h][modelIndex] * state['populations'][h][herbivoreIndex[h][modelIndex]]));
        for (var k=0; k<predatorIndex[h].length; k++) 
            sum2 += ((model['m'][h][modelIndex][k] * state['populations'][h][predatorIndex[h][k]]) / 
            (1 + model['s'][h][k] * state['populations'][h][predatorIndex[h][k]]));
        return(state['populations'][h][herbivoreIndex[h][modelIndex]] * Math.exp(model['b'][h][modelIndex] * sum1 - model['d'][h][modelIndex] - sum2));
    }

    if ((modelIndex = isPredator(h,i)) >= 0) {
        var sum = 0;
        for (var j=0; j<herbivoreIndex[h].length; j++) 
            sum += ((model['m'][h][j][modelIndex] * state['populations'][h][herbivoreIndex[h][j]]) / 
            (1 + model['s'][h][modelIndex] * state['populations'][h][predatorIndex[h][modelIndex]]));
        return(state['populations'][h][predatorIndex[h][modelIndex]] * Math.exp(model['beta'][h][modelIndex] * sum - model['delta'][h][modelIndex]));
    }

    return(0);
}



// const resourceIndex = [ [5,10,9], 
//                         [4,5], 
//                         [10,5], 
//                         [4,10,5] 
//                       ] ; // which indexes in the species array correspond to resources

// const herbivoreIndex =  [   [6,2], 
//                             [6,7,0], 
//                             [6,2], 
//                             [7,0] 
//                         ]; // etc. ORDER MATTERS in all 3, because constants above are based on them

// const predatorIndex = [ [1,8], 
//                         [8], 
//                         [1,3], 
//                         [8] 
//                       ]; // ditto


// basic simulator cycle. 

function cycleState () {

// convert simulation parameters to history values
    if (broadcastCount == 0) {
        var tempState = deepCopy(state);
        for (var i=0; i<state['populations'].length; i++) {
            // predators
            tempState['populations'][i][1] *= 100;
            tempState['populations'][i][3] *= 100;
            tempState['populations'][i][8] *= 100;
            // herbivores
            tempState['populations'][i][0] *= 200;
            tempState['populations'][i][2] *= 200;
            tempState['populations'][i][6] *= 200;
            tempState['populations'][i][7] *= 200;
            // resources
            tempState['populations'][i][4] /= 200;
            tempState['populations'][i][5] /= 200;
            tempState['populations'][i][9] /= 200;
            tempState['populations'][i][10] /= 200;

        }
        nutella.net.publish ('state_update',tempState); 
// convert history parameters to animation parameters
        var tempState2 = deepCopy(tempState);
        for (var i=0; i<state['populations'].length; i++) {
            // predators
            tempState2['populations'][i][1] = Math.round(tempState['populations'][i][1]/100);
            tempState2['populations'][i][3] = Math.round(tempState['populations'][i][3]/100);
            tempState2['populations'][i][8] = Math.round(tempState['populations'][i][8]/100);
            // herbivores
            tempState2['populations'][i][0] = Math.round(tempState['populations'][i][0]/25);
            tempState2['populations'][i][2] = Math.round(tempState['populations'][i][2]/25);
            tempState2['populations'][i][6] = Math.round(tempState['populations'][i][6]/25);
            tempState2['populations'][i][7] = Math.round(tempState['populations'][i][7]/25);
            // resources
            tempState2['populations'][i][4] = tempState['populations'][i][4];
            tempState2['populations'][i][5] = tempState['populations'][i][5];
            tempState2['populations'][i][9] = tempState['populations'][i][9];
            tempState2['populations'][i][10] = tempState['populations'][i][10];

        }
        nutella.net.publish ('animation_state_update',tempState2);
    }
    broadcastCount++;
    if (broadcastCount >= broadcastFrequency) broadcastCount = 0;

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
            if (isResource(newState['populations'][i][state['environments'][i][3]][0]) >= 0) newPop=10;
            if (isHerbivore(newState['populations'][i][state['environments'][i][3]][0]) >= 0) newPop=1;
            if (isPredator(newState['populations'][i][state['environments'][i][3]][0]) >= 0) newPop=0.5;
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

Math.nrand = function() {
    var x1, x2, rad, y1;
    do {
        x1 = 2 * this.random() - 1;
        x2 = 2 * this.random() - 1;
        rad = x1 * x1 + x2 * x2;
    } while(rad >= 1 || rad == 0);
    var c = this.sqrt(-2 * Math.log(rad) / rad);
    return x1 * c;
};
