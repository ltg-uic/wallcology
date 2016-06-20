var NUTELLA = require('nutella_lib');

// Get configuration parameters and init nutella
var cliArgs = NUTELLA.parseArgs();
var componentId = NUTELLA.parseComponentId();
var nutella = NUTELLA.init(cliArgs.broker, cliArgs.app_id, cliArgs.run_id, componentId);
// Optionally you can set the resource Id
nutella.setResourceId('my_resource_id');

// gotta get these from somewhere

var n_ecosystems = 5;
var tempDelta = .5;
var humidityDelta = 2;

var m = {};
var e = [];
var p = [];
    

nutella.net.subscribe('start_simulation', function(message, from) {
    nutella.net.request('read_population_model','populationModel', function(response){
        m = response;
        nutella.net.request('last_state',{}, function(reply){
            e = reply['abiotic'];
            p = reply['biotic'];
            crank();
        });
    });
});


function crank () {
    for (var i=0; i<n_ecosystems; i++) {
        p[i] = cycleSimulation(m,e[i],p[i]);
        if (e[i]['temperature'] < e[i]['thermostat']) e[i]['temperature'] += tempDelta;
            else if (e[i]['temperature'] > e[i]['thermostat']) e[i]['temperature'] -= tempDelta;
        if (e[i]['humidity'] < e[i]['humidistat']) e[i]['humidity'] += humidityDelta;
            else if (e[i]['humidity'] > e[i]['humidistat']) e[i]['humidity'] -= humidityDelta;
    }
    nutella.net.publish('state-update',{biotic:p,abiotic:e});
    setTimeout(crank, 10000);
}




function cycleSimulation(Model,Environment,Populations) {

    var next_population = [];
    var sum1;
    var sum2;
    var exponent;

    function M(parameter,index1,index2,index3) {
        var t = Environment['temperature'];
        var b = Environment['brick'];
        var w = Environment['wood'];
        var h = Environment['humidity'];
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
