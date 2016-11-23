var NUTELLA = require('nutella_lib');

// Get configuration parameters and init nutella
var cliArgs = NUTELLA.parseArgs();
var componentId = NUTELLA.parseComponentId();
var nutella = NUTELLA.init(cliArgs.broker, cliArgs.app_id, cliArgs.run_id, componentId);

// var model; 


function cycleSimulation(Model,Environment,Populations) {

    var next_population = [];
    var sum1;
    var sum2;
    var exponent;

    function M(parameter,index1,index2,index3) {
        var t = (Environment['temperature']-10)/20;
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
        nP('resources',i,P('resources',i) * Math.exp(exponent/2));
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
        nP('herbivores',i,P('herbivores',i) * Math.exp(exponent/5));
    }

//  do the predators

    for (var i=0; i < M('community','predators').length; i++) {
        sum1 = 0; 
        for (var j=0; j < M('community','herbivores').length; j++) 
            sum1 += (M('m',j,i) * P('herbivores',j))/(1 + M('s',i) * P('predators',i));
        exponent = M('beta',i) * sum1 - M('delta',i);
        nP('predators',i,P('predators',i) * Math.exp(exponent/.25));
    }

    return (next_population);
}


nutella.net.handle_requests('model-simulation', function(message, from) {
    var m = message['model'];
    var e0 = message['environment0']; //{temperature:20, brickArea:.3, woodArea:.3, humidity:.5};
    var ef = message['environmentf']; //{temperature:20, brickArea:.3, woodArea:.3, humidity:.5};
    var p = message['populations']; //[1,.5,1,.5,10,10,1,1,.5,10,10];
    var pHistory = [p];
    var e = {temperature:e0['temperature'],humidity:e0['humidity'],brick:e0['brick'],wood:e0['wood']};
    for (var i = 0; i < message['cycles']; i++) { 
        p = cycleSimulation(m,e,p);
        pHistory.push(p);
        e['temperature'] = e0['temperature'] + i*(ef['temperature']-e0['temperature'])/message['cycles'];
        e['humidity'] = e0['humidity'] + i*(ef['humidity']-e0['humidity'])/message['cycles'];       
        e['wood'] = e0['wood'] + i*(ef['wood']-e0['wood'])/message['cycles'];
        e['brick'] = e0['brick'] + i*(ef['brick']-e0['brick'])/message['cycles'];       
    };
    return (pHistory);
});

 
nutella.net.handle_requests('enactment-simulation', function(message, from) {
    var m = message['model'];
    var e = message['environment'];
    var p = message['populations'];
    for (var i=0; i<5; i++) p[i] = cycleSimulation(m,e[i],p[i]);
    return (p);
});



