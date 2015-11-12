var NUTELLA = require('nutella_lib');

// Get configuration parameters and init nutella
var cliArgs = NUTELLA.parseArgs();
var componentId = NUTELLA.parseComponentId();
var nutella = NUTELLA.init(cliArgs.broker, cliArgs.app_id, cliArgs.run_id, componentId);
console.log("Simulator version 1.1");

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
// const frequencyOfUpdate = 4 * 60 * 1000; //(1000 = 1 second)
// const broadcastFrequency = 5; // every update. increase to "speed up" model
const frequencyOfUpdate = 4 * 1 * 100; //(1000 = 1 second. send to animation every 4 min)
const broadcastFrequency = 5; // (save in history every 5 cycles (minimizing size))

var broadcastCount; //cyclic clock controls broadcast frequency
var state; //current state of the simulation
var model; //population model

// listen for model edit, reload model

// nutella.net.subscribe('write_model', function(message, from){
//     var temp_model = nutella.persist.getMongoObjectStore('model');
//     temp_model=message; 
//     model=deepCopy(temp_model); 
// });

// nutella.net.handle_requests('read_model', function(JSONmessage, from) {
//     return(model);
// });


    broadcastCount=0;
    model = nutella.persist.getMongoObjectStore('model');
    model.load(function(){ 
        setTimeout(init,waitForHistoryToLoad); // give history time to load or initialize; a kludge}
    });


// end of program. everything else is functions

// history['states'][0]['environments'] = [ [20.4,1,1,-1],[18.9,1,1,-1],[11.4,1,1,-1],[12.1,1,1,-1] ];
//       history['species_events'] = [];
//       history['environmental_events'] = [];


function init() {
    nutella.net.request('last_state', {}, function(message) {
        state=JSON.parse(JSON.stringify(message));

        if (message == 'new') { //need to build initial state
            var d = new Date();
            state = {}; 
            state['timestamp'] = d.getTime();
            state['populations'] = model['populations'];
            state['environments'] = model['environments'];
        } else { // model parameters are right if created here, but need to be adjusted if from history
            state['timestamp'] = message['timestamp'];
            state['populations'] = message['populations'];
            state['environments'] = message['environments'];            
            for (var habitat=0; habitat<state['populations'].length; habitat++) 
                for (var species=0; species<state['populations'][habitat].length; species++) 
                    state['populations'][habitat][species] *= 
                        model['historyToSimulator'][model['species'][species]['trophicLevel']];
        };
        cycleStatesOnSchedule(); // cycles at frequencyOfUpdate milliseconds
    


//
//  convert from history population values to simulator values
//  




    nutella.net.handle_requests('read_model', function(JSONmessage, from) {
            return(model);           
        });

    nutella.net.subscribe('write_model', function(message, from) {
//        console.log(message['K']);
        model['resourceIndex']=message['resourceIndex'];
        model['herbivoreIndex']=message['herbivoreIndex'];
        model['predatorIndex']=message['predatorIndex'];
        model['r']=message['r']; console.log(model['K']);
        model['K']=message['K']; console.log(model['K']);
        model['alpha']=message['alpha'];
        model['b']=message['b'];
        model['a']=message['a'];
        model['q']=message['q'];
        model['d']=message['d'];
        model['beta']=message['beta'];
        model['s']=message['s'];
        model['delta']=message['delta'];
        model['m']=message['m'];
        model.save();
    });

    // channel: species_event
    //
    //  message = {habitat: 0, species: 3, action: <event>} <event> := "remove" | "increase" | "decrease" | "insert"

    nutella.net.subscribe('species_event', function(message, from){
        switch (message.action) {
            case "remove": 
                state['populations'][message.habitat][message.species] = 0; 
                break;
            case "decrease": //unlimited decreasing
                state['populations'][message.habitat][message.species] *= 0.25; //model['decreaseFactor']; 
                break;
            case "increase": // constrained increasing, can only effectively double population once
                var t = new Date();
                var now = t.getTime();
                var twoHoursAgo = now - (2 * 60 * 60 * 1000); //seconds;                
                var nIncreases = 0;
                var nDecreases = 0;
                nutella.net.request('species_events_history', 
                    {'habitat': message.habitat, 'species': message.species, 'from': twoHoursAgo, 'to': now},
                     function(response) {
                        for (var i=0; i < response.length; i++) {
                            if (response[i]['action'] == 'decrease') nDecreases++;
                            if (response[i]['action'] == 'increase') nIncreases++;
                            }
                        if (nIncreases > (nDecreases + 1)) {
                            nutella.net.publish ('too_soon',{'habitat': message.habitat, 'species': message.species});
                        } else {
                            state['populations'][message.habitat][message.species] *= 4.0; 
                        };
                });
                break;
            case "insert":  
            if (state['populations'][message.habitat][message.species] < .001) 
                    state['populations'][message.habitat][message.species]= 
                        model['defaultPopulations'][model['species'][message.species]['trophicLevel']];
            break;
        };
        broadcastCount = 0;
        cycleStateOnce();
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
                if (message.habitat == 3) {
                    if (state['environments'][message.habitat][0] <= model['tempThreshholds'][2]) 
                        model['tempIncrements'][message.habitat] = model['tempIncrementLevel']; 
                        model.save();
                    }
                break;
            case "pipeCollapse": // these are events. they have instaneous effects. check with joel on constants
                if (message.habitat == 0) {
                    if (state['environments'][message.habitat][1] >= .4) 
                        state['environments'][message.habitat][1] -= .2;
                }
                break;
            case "plasterFall": 
                break;
            case "invasion":
                if (message.habitat == 1 || message.habitat == 2) {
                    state['environments'][message.habitat][3] = message.species; // -1 or undefined or null means no invasion. positive = invasion
                }
                break;
            };
            broadcastCount = 0;
            cycleStateOnce();
        });
    });
}

function cycleStatesOnSchedule() {
    cycleStateOnce();
    setTimeout(cycleStatesOnSchedule,  frequencyOfUpdate);
}


function cycleStateOnce () {

    // for (var habitat=0; habitat<state['populations'].length; habitat++) 
    //     for (var species=0; species<state['populations'][habitat].length; species++) 
    //         state['populations'][habitat][species] *= 
    //             model['historyToSimulator'][model['species'][species]['trophicLevel']];

// convert simulation parameters to history values
    var tempState; 
    // convert to History population magnitudes and report to history bot
    // but only every frequencyOfUpdate * BroadcastFrequency milliseconds
    for (var h=0; h<4; h++) adjustForPressures(h); // 4 =number of ecosystems


    if (broadcastCount == 0) {
        tempState = deepCopy(state); 
        for (var habitat=0; habitat<tempState['populations'].length; habitat++) {
            for (var species=0; species<tempState['populations'][habitat].length; species++) {
                tempState['populations'][habitat][species] *= 
                    model['simulatorToHistory'][model['species'][species]['trophicLevel']]; };
        }            
        nutella.net.publish ('state_update',tempState);

    }
    broadcastCount++;
    if (broadcastCount >= broadcastFrequency) broadcastCount = 0;

//  convert simulation parameters to animation values. obviously i need to break this out.
//  broadcast to Animator on every cycle (i.e., every frequencyOfUpdate milliseconds)

    var tempState2 = deepCopy(state);
    for (var habitat=0; habitat<tempState2['populations'].length; habitat++) {
        for (var species=0; species<tempState2['populations'][habitat].length; species++) {
            tempState2['populations'][habitat][species] *= 
                model['simulatorToAnimator'][model['species'][species]['trophicLevel']];
        };        
        tempState2['environments'][habitat][0] += (Math.random() - .5);
    }
    nutella.net.publish ('animation_state_update',tempState2);


    var tempState3 = deepCopy(state);
    var d = new Date(); 
    tempState3['timestamp'] = d.getTime();
    for (var habitat=0; habitat<tempState3['populations'].length; habitat++) {
        for (var species=0; species<tempState3['populations'][habitat].length; species++)
            tempState3['populations'][habitat][species] = nextPopulation(habitat,species);
            if (tempState3['populations'][habitat][species] < .001) {
                tempState3['populations'][habitat][species] = 0;
            }
    }

    state = deepCopy(tempState3);

}

//  adjust habitat h for various external pressures:
//  warming, habitat destruction, and invasive species

function adjustForPressures(h) {
    // adjustForTemperatures(h);
    // adjustForPipes(h);
    adjustForInvasions(h);
}

// function adjustForTemperatures(h) {

    // temperature adjustments
    // note: the value at index 0 in state['environments'][h][0] is the temperature.
    // the value in 'threshholds' is the point at which you turn off the temp increase.
    // this allows for two "stage" of warming. only works for habitat 3.

    // if (h == 3) {
    //     if (model['tempIncrements'][h]>0) {
    //         var oldTemp = state['environments'][h][0];
    //         var newTemp = oldTemp + model['tempIncrements'][h];
    //         state['environments'][h][0] = newTemp; 
    //         if ((oldTemp <= model['tempThreshholds'][0] && newTemp > model['tempThreshholds'][0]) ||
    //             (oldTemp <= model['tempThreshholds'][1] && newTemp > model['tempThreshholds'][1]) ||
    //             (oldTemp <= model['tempThreshholds'][2] && newTemp > model['tempThreshholds'][2])) {
    //                 model['tempIncrements'][h] = 0; 
    //                 model.save();
    //         } else {
    //             if (state['environments'][h][0] > model['tempThreshholds'][1]) {
    //                     model['K'][h][2] = 10; 
    //                     model['a'][h][1][1] = 0; model['a'][h][2][1] = 0;
    //                     model.save();
    //             }
    //             else {
    //                 if (state['environments'][h][0] > model['tempThreshholds'][0]) {
    //                         model['K'][h][2] = 50; 
    //                         model['a'][h][1][1] = .05; model['a'][h][2][1] = .1;
    //                         model.save();}
    //             }
    //         }
    //     }
    // }
// }

//  adjustments for reductions in available pipe length. these will work ONLY
//  in habitat 0. state['environments'][h][1] is pipe length (0<x<1)

// function adjustForPipes(h) {

    // if (h == 0) {
    //     model['K'][h][0] = state['environments'][h][1] * 100; //very hard-wired ([0])
    //     model['b'][h][0]  = state['environments'][h][1] * .1 - .01; //very hard-wired ([0])
    //     model['beta'][h][0] = state['environments'][h][1] * .1 - .01; //very hard-wired ([0])
    //     model.save();
    // }
// }

//  adjustments for invasive species. this will "work" for all species (but would
//  result in garbage unless the appropriate coefficients were defined. 

function adjustForInvasions(h) {
    if (h == 3) return;

//  chronic invasion; if invader depleted, add more (half of baseline population)

    if (state['environments'][h][3] >= 0) {
        state['populations'][h][state['environments'][h][3]] = 
            Math.max(state['populations'][h][state['environments'][h][3]],
                model['defaultPopulations'][model['species'][state['environments'][h][3]]['trophicLevel']]*
                model['invasionPopulationAdjustment']);
    // parameter adjustments for particular invasions

    // hard wired for environment 2: predator invasion by species 8

        // if (h == 2 && model['m'][h][1][1] > .01) {
        //     model['m'][h][1][1] -= 0.00015277777778; model.save();
        // }
        
        if (h == 2) {model['m'][h][1][1] = .01; model.save();}
        
    //  hard wired for environment 1: resource invasion by species 9

    //  no transforms necessary. it's taken care of by the original model


    //  hard wired for environment 0: herbivore invasion

    //  TBD





    }
 }

//  mapping functions. this is funky because i had to fit it into an existing
//  database. once we standardize the mappings we'll be able to avoid this
//  nonsense altogether

//  basically, there are times when we need to know where a species (0 .. 11)
//  sits in one of joel's models. it gets mapped to both a  modelIndex
//  (0, 1, ...), but also to one of three different arrays (resourceIndex, herbivore
//  Index, and predatorIndex). each function checks to see if the species is at its
//  trophic level, and if so, returns its modelIndex. if the species does not belong
//  to that trophic level, -1 is returned. had to make double duty of the DB cell.

function isResource (h,i) {
    for (var j=0; j<model['resourceIndex'][h].length; j++)
        if (i == model['resourceIndex'][h][j]) return (j);
    return (-1);
}

function isHerbivore (h,i) {
    for (var j=0; j<model['herbivoreIndex'][h].length; j++)
        if (i == model['herbivoreIndex'][h][j]) return (j);
    return (-1);
}

function isPredator (h,i) {
    for (var j=0; j<model['predatorIndex'][h].length; j++)
        if (i == model['predatorIndex'][h][j]) return (j);
    return (-1);
}



function nextPopulation(h,i) { // h=habitat, i=species

    // use model to compute next population state

    var modelIndex; //maps species to Joel's model index
    // if ((modelIndex = isResource(h,i)) >= 0) {
    //     var sum1 = 0;
    //     var sum2 = 0;
    //     for (var j=0; j<model['resourceIndex'][h].length; j++)
    //         sum1 += (model['alpha'][h][modelIndex][j] * state['populations'][h][model['resourceIndex'][h][j]]);
    //     for (var k=0; k<model['herbivoreIndex'][h].length; k++)
    //         sum2 += ((model['a'][h][modelIndex][k] * state['populations'][h][model['herbivoreIndex'][h][k]]) / 
    //             (1 + model['q'][h][k] * state['populations'][h][model['herbivoreIndex'][h][k]]));
    //     return(state['populations'][h][model['resourceIndex'][h][modelIndex]] * 
    //         Math.exp(model['r'][h][modelIndex] * (model['K'][h][modelIndex] - sum1)/model['K'][h][modelIndex] - sum2));
    // } 
    if ((modelIndex = isResource(h,i)) >= 0) {
        var sum1 = 0;
        var sum2 = 0;
        for (var j=0; j<model['resourceIndex'][h].length; j++)
            sum1 += (model['alpha'][h][modelIndex][j] * state['populations'][h][model['resourceIndex'][h][j]]);
        for (var k=0; k<model['herbivoreIndex'][h].length; k++)
            sum2 += ((model['a'][h][modelIndex][k] * state['populations'][h][model['herbivoreIndex'][h][k]]) / 
                (1 + model['q'][h][k] * state['populations'][h][model['herbivoreIndex'][h][k]]));
        var exponent = model['r'][h][modelIndex] * 
            (model['K'][h][modelIndex] - sum1)/model['K'][h][modelIndex] - sum2;
        var speed = 1;
        if (exponent < 0) speed = 10;
        return(state['populations'][h][model['resourceIndex'][h][modelIndex]] * Math.exp(exponent/speed));
    } 
    if ((modelIndex = isHerbivore(h,i)) >= 0) {
        var sum1 = 0;
        var sum2 = 0;
        for (var j=0; j<model['resourceIndex'][h].length; j++) 
            sum1 += ((model['a'][h][j][modelIndex] * state['populations'][h][model['resourceIndex'][h][j]]) / 
            (1 + model['q'][h][modelIndex] * state['populations'][h][model['herbivoreIndex'][h][modelIndex]]));
        for (var k=0; k<model['predatorIndex'][h].length; k++) 
            sum2 += ((model['m'][h][modelIndex][k] * state['populations'][h][model['predatorIndex'][h][k]]) / 
            (1 + model['s'][h][k] * state['populations'][h][model['predatorIndex'][h][k]]));
        var exponent = model['b'][h][modelIndex] * sum1 - model['d'][h][modelIndex] - sum2;
        var speed = 1;
        if (exponent < 0) speed = 10;
        return(state['populations'][h][model['herbivoreIndex'][h][modelIndex]] * Math.exp(exponent/speed));
    }

    if ((modelIndex = isPredator(h,i)) >= 0) {
        var sum = 0;
        for (var j=0; j<model['herbivoreIndex'][h].length; j++) 
            sum += ((model['m'][h][j][modelIndex] * state['populations'][h][model['herbivoreIndex'][h][j]]) / 
            (1 + model['s'][h][modelIndex] * state['populations'][h][model['predatorIndex'][h][modelIndex]]));
        var exponent = model['beta'][h][modelIndex] * sum - model['delta'][h][modelIndex];
        var speed = 1;
        if (exponent < 0) speed = 10;
        return(state['populations'][h][model['predatorIndex'][h][modelIndex]] * Math.exp(exponent/speed));
    }

    return(0);
}

//utility functions

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


// should we add some normal variation to our graphs?


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
