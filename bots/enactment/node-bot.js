var NUTELLA = require('nutella_lib');

// Get configuration parameters and init nutella
var cliArgs = NUTELLA.parseArgs();
var componentId = NUTELLA.parseComponentId();
var nutella = NUTELLA.init(cliArgs.broker, cliArgs.app_id, cliArgs.run_id, componentId);
// Optionally you can set the resource Id
nutella.setResourceId('my_resource_id');

//All these need to be in a Mongo configuration file.

var N_ECOSYSTEMS = 5;
var TEMPERATURE_DELTA;
var HUMIDITY_DELTA;
var COLONIZER_EFFECT = 2.0;
var TRAP_EFFECT = 0.5;
var SEED_EFFECT = 1.25;
var HERBICIDE_EFFECT = .1;
var RESOURCE_EXTINCTION_THRESHHOLD = 0.01;
var ANIMAL_POPULATION_MAXIMUM = 10000;
var ANIMAL_EXTINCTION_THRESHHOLD = .05;
var COLONIZE_MINUMUM = 1;

// the "ot" table specifies the fraction of total habitat that is
// lost due to occlusion by drywall. so ot.brick[0].left = .25 means
// that if you slide in the left drywall, you'll lose 25% of the total
// brick in the ecosystem.
// this should be removed and made into a mongo table


var ot =    {   brick:  [
                        {left:.25,top:.25,right:.25,bottom:.25},
                        {left:.25,top:.25,right:.25,bottom:.25},
                        {left:.25,top:.25,right:.25,bottom:.25},
                        {left:.25,top:.25,right:.25,bottom:.25},
                        {left:.25,top:.25,right:.25,bottom:.25}
                        ],
                wood:   [
                        {left:.25,top:.25,right:.25,bottom:.25},
                        {left:.25,top:.25,right:.25,bottom:.25},
                        {left:.25,top:.25,right:.25,bottom:.25},
                        {left:.25,top:.25,right:.25,bottom:.25},
                        {left:.25,top:.25,right:.25,bottom:.25}
                        ]
            };



var delayBetweenSteps;
var RUNNING = false;

var m = {}; // model (constant)
var a = []; // abiotic states (temperature, humidity, drywall, thermostat, humidistat, wood, brick)
var b = []; // biotic states (populations)

var subscribe = true;

nutella.net.handle_requests('running', function(request) {
    return RUNNING;
});


nutella.net.subscribe('start_simulation', function(interval, from) {
    delayBetweenSteps = interval;

    // amortize effects over 24 hours
    
    TEMPERATURE_DELTA = 10/((24*60*60)/interval);
    HUMIDITY_DELTA = 30/((24*60*60)/interval);

    nutella.net.request('read_population_model','populationModel', function(response){
        m = response;
        nutella.net.request('last_state',{}, function(reply){

            // unpack the last state

            a = reply['abiotic'];
            b = reply['biotic'];
            RUNNING = true;

            // subscribe to abiotic controls

            if (subscribe) {

                subscribe = false; //already subscribed no matter how many restarts

                nutella.net.subscribe('thermostat', function(message, from) {
                    a[message['ecosystem']]['thermostat']=message['value'];
                    nutella.net.publish('state_update',{abiotic:a,biotic:b});
                });

                nutella.net.subscribe('humidistat', function(message, from) {
                    a[message['ecosystem']]['humidistat']=message['value'];
                });
                nutella.net.subscribe('wall', function(message, from) { console.log(message);
                    a[message['ecosystem']][message['side']]=message['direction'];
                    if ([message['direction']] == 'in') { console.log('point 2');
                        a[message['ecosystem']]['wood']-=ot['wood'][message['ecosystem']][message['side']];
                        a[message['ecosystem']]['brick']-=ot['brick'][message['ecosystem']][message['side']]; 
                        nutella.net.publish('state_update',{abiotic:a,biotic:b});
                    }
                    else if ([message['direction']] == 'out') {
                        a[message['ecosystem']]['wood']+=ot['wood'][message['ecosystem']][message['side']];
                        a[message['ecosystem']]['brick']+=ot['brick'][message['ecosystem']][message['side']];
                        nutella.net.publish('state_update',{abiotic:a,biotic:b});
                    }
                    else console.log("set-wall direction neither 'in' nor 'out': " + message['direction']);
                });

                // subscribe to biotic controls

                nutella.net.subscribe('colonize', function(message, from) {
                    b[message['ecosystem']][message['species']]*=COLONIZER_EFFECT;
                    if (b[message['ecosystem']][message['species']] == 0) b[message['ecosystem']][message['species']] = COLONIZE_MINUMUM;
                    if (b[message['ecosystem']][message['species']] > ANIMAL_POPULATION_MAXIMUM) b[message['ecosystem']][message['species']] = ANIMAL_POPULATION_MAXIMUM; 
                    nutella.net.publish('state_update',{abiotic:a,biotic:b});
                });

                nutella.net.subscribe('trap', function(message, from) {
                    b[message['ecosystem']][message['species']]*=TRAP_EFFECT; 
                    if  (b[message['ecosystem']][message['species']] < ANIMAL_EXTINCTION_THRESHHOLD) b[message['ecosystem']][message['species']] = 0; 
                    nutella.net.publish('state_update',{abiotic:a,biotic:b});
                });

                nutella.net.subscribe('seed', function(message, from) {
                    b[message['ecosystem']][message['species']]*=SEED_EFFECT;
                    if  (b[message['ecosystem']][message['species']] > 1.0) b[message['ecosystem']][message['species']] = 1.0; 
                    nutella.net.publish('state_update',{abiotic:a,biotic:b});
               });

                nutella.net.subscribe('herbicide', function(message, from) {
                    b[message['ecosystem']][message['species']]*=HERBICIDE_EFFECT; 
                    if  (b[message['ecosystem']][message['species']] < RESOURCE_EXTINCTION_THRESHHOLD) b[message['ecosystem']][message['species']] = 0; 
                    nutella.net.publish('state_update',{abiotic:a,biotic:b});
                });

                nutella.net.subscribe('stop_simulation', function(message, from) {
                    RUNNING = false;
                });

            }

            // begin simulation

            crank();
        });
    });
});



function crank () {
    if (RUNNING){
        for (var i=0; i<N_ECOSYSTEMS; i++) {

            // adjust temperatures as needed

            if (a[i]['temperature']+TEMPERATURE_DELTA < a[i]['thermostat']) a[i]['temperature'] += TEMPERATURE_DELTA;
                else if (a[i]['temperature']-TEMPERATURE_DELTA > a[i]['thermostat']) a[i]['temperature'] -= TEMPERATURE_DELTA;
            if (a[i]['humidity']+HUMIDITY_DELTA < a[i]['humidistat']) a[i]['humidity'] += HUMIDITY_DELTA;
                else if (a[i]['humidity']-HUMIDITY_DELTA > a[i]['humidistat']) a[i]['humidity'] -= HUMIDITY_DELTA;

            // run the simulation cycle for ecosystem i

            b[i] = cycleSimulation(m,a[i],b[i]);
        }
        nutella.net.publish('state_update',{abiotic:a,biotic:b});
        setTimeout(crank, delayBetweenSteps*1000);
    }
};


    function modelToTemp (t) {
        return (10+t*20);
    }

    function modelToHumidity (h) {
        return (h*100);
    }

    function humidityToModel (h) {
        return (h/100);
    }

    function tempToModel (t) {
        return ((t-10)/20);
    }



function cycleSimulation(Model,Environment,Populations) {

    var next_population = [];
    var sum1;
    var sum2;
    var exponent;


    function M(parameter,index1,index2,index3) {
        var t = tempToModel(Environment['temperature']);
        var b = Environment['brick']*100*4/9;
        var w = Environment['wood']*100*4/9;
        var h = humidityToModel(Environment['humidity']);
        if (M.arguments.length == 2) return (eval(Model[parameter][index1]));
        if (M.arguments.length == 3) return (eval(Model[parameter][index1][index2]));
        if (M.arguments.length == 4) return (eval(Model[parameter][index1][index2][index3]));
        return ({});
    }

    function P(trophicLevel,index){
        return Populations[M('community',trophicLevel,index)];
    }

    function nP(trophicLevel,index,value) {
        var ti = M('community',trophicLevel,index);
        next_population[ti] = value;
        if (value < M('minimumPopulation',ti)) next_population[ti] = 0;
//        if (value > M('maximumPopulation',ti)) next_population[ti] = M('maximumPopulation',ti);
    }

//  do the resources

    for (var i = 0; i < M('community','resources').length; i++) {
        sum1 = 0; sum2 = 0; 
        for (var j = 0; j < M('community','resources').length; j++) 
                sum1 += (M('alpha',i,j) * P('resources',j)); 
        for (var k = 0; k < M('community','herbivores').length; k++) 
                sum2 += ((M('a',i,k) * P('herbivores',k)) / (1 + M('q',k) * P('herbivores',k)));
        exponent = (M('K',i) - sum1)/(1 + M('K',i)) - sum2;
        nP('resources',i,P('resources',i) * Math.exp(exponent));
    }

//  do the herbivores

    for (var i=0; i < M('community','herbivores').length; i++) {
        sum1 = 0; sum2 = 0; 
        for (var j=0; j < M('community','resources').length; j++) 
                sum1 += (M('a',j,i) * P('resources',j))/(1 + M('q',i) * P('herbivores',i)); 
        for (var k=0; k < M('community','predators').length; k++) 
                sum2 += (M('m',i,k) * P('predators',k)) / (1 + M('s',k) * P('predators',k));
        exponent = M('b',i) * sum1 - M('d',i) - sum2;
        var next_index = M('community', 'resources',i);
        nP('herbivores',i,P('herbivores',i) * Math.exp(exponent));
    }

//  do the predators

    for (var i=0; i < M('community','predators').length; i++) {
        sum1 = 0; 
        for (var j=0; j < M('community','herbivores').length; j++) 
            sum1 += (M('m',j,i) * P('herbivores',j))/(1 + M('s',i) * P('predators',i));
        exponent = M('beta',i) * sum1 - M('delta',i);
        nP('predators',i,P('predators',i) * Math.exp(exponent));
    }

    return (next_population);
}
