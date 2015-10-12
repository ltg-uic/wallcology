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
const frequencyOfUpdate = 2 * 60 * 1000; //(1000 = 1 second)

//  model constants

const r =   [   [0.25, 0.25, 0.25, 0.25],
                [0.25, 0.25, 0.25, 0.25],
                [0.25, 0.25, 0.25, 0.25],
                [0.25, 0.25, 0.25, 0.25]
            ];
; // one for each resource (maximal growth rate)

var K =     [   [100, 150, 60, 0],
                [100,80,0,0],
                [125,100,0,0],
                [50, 150, 100, 0]
            ];

; // one for each resource (carrying capacity)

var alpha = [
                [       [ 1.0,  0.4,  0.0,  0.0   ], 
                        [ 0.5,  1.0,  0.5,  0.0   ], 
                        [ 0.0,  0.5,  1.0,  0.0   ],
                        [ 0.0,  0.0,  0.0,  0.0   ]
                ],
                [       [ 1.0,  0.0,  0.0,  0.0    ], 
                        [ 0.0,  1.0,  0.0,  0.0   ], 
                        [ 0.0,  0.0,  0.0,  0.0   ],
                        [ 0.0,  0.0,  0.0,  0.0   ]
                ],
                [       [ 1.0,  0.4,  0.0,  0.0   ], 
                        [ 0.2,  1.0,  0.0,  0.0   ], 
                        [ 0.0,  0.0,  0.0,  0.0   ],
                        [ 0.0,  0.0,  0.0,  0.0   ]
                ],
                [       [ 1.0,  0.4,  0.0,  0.0   ], 
                        [ 0.3,  1.0,  0.3,  0.0   ], 
                        [ 0.0,  0.4,  1.0,  0.0   ],
                        [ 0.0,  0.0,  0.0,  0.0   ]
                ]
            ];

const b = [ [0.1, 0.1, 0.1, 0.1], 
            [0.1, 0.1, 0.1, 0.1], 
            [0.1, 0.1, 0.1, 0.1],
            [0.1, 0.1, 0.1, 0.1] 
          ];

; // one for each herbivore (conversion of resources consumed into new herbivores)
var a =  [
            [
                [ 0.20, 0.08, 0.00, 0.00 ], 
                [ 0.10, 0.18, 0.00, 0.00 ],
                [ 0.00, 0.00, 0.00, 0.00 ],
                [ 0.00, 0.00, 0.00, 0.00 ]
            ],
            [
                [ 0.20, 0.05, 0.00, 0.00 ], 
                [ 0.00, 0.05, 0.20, 0.00 ],
                [ 0.00, 0.00, 0.00, 0.00 ],
                [ 0.00, 0.00, 0.00, 0.00 ]
            ],
            [
                [ 0.15, 0.10, 0.00, 0.00 ], 
                [ 0.00, 0.10, 0.00, 0.00 ],
                [ 0.00, 0.00, 0.00, 0.00 ],
                [ 0.00, 0.00, 0.00, 0.00 ]
            ],
            [
                [ 0.08, 0.00, 0.00, 0.00 ], 
                [ 0.18, 0.10, 0.00, 0.00 ],
                [ 0.06, 0.20, 0.00, 0.00 ],
                [ 0.00, 0.00, 0.00, 0.00 ]
            ]
          ];


const q = [ [1, 1, 1, 1],  
            [1, 1, 1, 1],  
            [1, 1, 1, 1],  
            [1, 1, 1, 1] 
          ]; // one for each herbivore (measure of interference competition among herbivores)

const d = [ [0.1, 0.1, 0.1, 0.1], 
            [0.1, 0.1, 0.1, 0.1], 
            [0.1, 0.1, 0.1, 0.1], 
            [0.1, 0.1, 0.1, 0.1] 
          ]; // one for each herbivore (intrinsic death rates)



const beta = [  [0.1, 0.1, 0.1], 
                [0.1, 0.1, 0.1], 
                [0.1, 0.1, 0.1], 
                [0.1, 0.1, 0.1] 
             ]; // one for each predator  (intrinsic death rates) (just like b, but herbs to preds




const s = [ [1, 1, 1], 
            [1, 1, 1], 
            [1, 1, 1], 
            [1, 1, 1] 
          ]; // one for each predator (measure of interference competition among predators)



const delta = [ [0.01, 0.01, 0.01], 
                [0.01, 0.01, 0.01], 
                [0.01, 0.01, 0.01], 
                [0.01, 0.01, 0.01] 
              ]; // one per predator (intrinsicd death rath of predator)

var m =   [ 
            [
                [ 0.300, 0.125, 0.000 ], 
                [ 0.150, 0.250, 0.000 ],
                [ 0.000, 0.000, 0.000 ],

            ],
            [
                [ 0.100, 0.000, 0.120 ], 
                [ 0.000, 0.000, 0.000 ],
                [ 0.000, 0.000, 0.000 ],

            ],
            [
                [ 0.150, 0.000, 0.000 ], 
                [ 0.050, 0.120, 0.000 ],
                [ 0.000, 0.000, 0.000 ],

            ],
            [
                [ 0.000, 0.000, 0.000 ], 
                [ 0.100, 0.000, 0.000 ],
                [ 0.000, 0.000, 0.000 ],

            ]
          ];


const resourceIndex = [ [5,10,9], 
                        [4,5], 
                        [10,5], 
                        [4,10,5] 
                      ] ; // which indexes in the species array correspond to resources

const herbivoreIndex =  [   [6,2], 
                            [6,7,0], 
                            [6,2], 
                            [7,0] 
                        ]; // etc. ORDER MATTERS in all 3, because constants above are based on them

const predatorIndex = [ [1,8], 
                        [8], 
                        [1,3], 
                        [8] 
                      ]; // ditto


var state; 
console.log("Simulator version 0.9.2");
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
                    if (isResource(message.habitat,message.species) >= 0) state['populations'][message.habitat][message.species] = 10;
                    if (isHerbivore(message.habitat,message.species) >= 0) state['populations'][message.habitat][message.species] = 1;
                    if (isPredator(message.habitat,message.species) >= 0) state['populations'][message.habitat][message.species] = .5;
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

function isResource (h,i) {
    for (var j=0; j<resourceIndex[h].length; j++)
        if (i == resourceIndex[h][j]) return (j);
    return (-1);
}

function isHerbivore (h,i) {
    for (var j=0; j<herbivoreIndex[h].length; j++)
        if (i == herbivoreIndex[h][j]) return (j);
    return (-1);
}

function isPredator (h,i) {
    for (var j=0; j<predatorIndex[h].length; j++)
        if (i == predatorIndex[h][j]) return (j);
    return (-1);
}

// growth model

function nextPopulation(h,i) {
    var modelIndex; //maps species to Joel's model index

    if ((modelIndex = isResource(h,i)) >= 0) {
        var sum1 = 0;
        var sum2 = 0;
        for (var j=0; j<resourceIndex[h].length; j++) 
            sum1 += (alpha[h][modelIndex][j] * state['populations'][h][resourceIndex[h][j]]);
        for (var k=0; k<herbivoreIndex[h].length; k++)
            sum2 += ((a[h][modelIndex][k] * state['populations'][h][herbivoreIndex[h][k]]) / 
                (1 + q[h][k] * state['populations'][h][herbivoreIndex[h][k]]));
        return(state['populations'][h][resourceIndex[h][modelIndex]] * 
            Math.exp(r[h][modelIndex] * (K[h][modelIndex] - sum1)/K[h][modelIndex] - sum2));
    } 
    if ((modelIndex = isHerbivore(h,i)) >= 0) {
        var sum1 = 0;
        var sum2 = 0;
        for (var j=0; j<resourceIndex[h].length; j++) 
            sum1 += ((a[h][j][modelIndex] * state['populations'][h][resourceIndex[h][j]]) / 
            (1 + q[h][modelIndex] * state['populations'][h][herbivoreIndex[h][modelIndex]]));
        for (var k=0; k<predatorIndex[h].length; k++) 
            sum2 += ((m[h][modelIndex][k] * state['populations'][h][predatorIndex[h][k]]) / 
            (1 + s[h][k] * state['populations'][h][predatorIndex[h][k]]));
        return(state['populations'][h][herbivoreIndex[h][modelIndex]] * Math.exp(b[h][modelIndex] * sum1 - d[h][modelIndex] - sum2));
    }

    if ((modelIndex = isPredator(h,i)) >= 0) {
        var sum = 0;
        for (var j=0; j<herbivoreIndex[h].length; j++) 
            sum += ((m[h][j][modelIndex] * state['populations'][h][herbivoreIndex[h][j]]) / 
            (1 + s[h][modelIndex] * state['populations'][h][predatorIndex[h][modelIndex]]));
        return(state['populations'][h][predatorIndex[h][modelIndex]] * Math.exp(beta[h][modelIndex] * sum - delta[h][modelIndex]));
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

