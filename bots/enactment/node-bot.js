var NUTELLA = require('nutella_lib');

// Get configuration parameters and init nutella
var cliArgs = NUTELLA.parseArgs();
var componentId = NUTELLA.parseComponentId();
var nutella = NUTELLA.init(cliArgs.broker, cliArgs.app_id, cliArgs.run_id, componentId);
// Optionally you can set the resource Id
nutella.setResourceId('my_resource_id');


var n_ecosystems = 1;
var m = {};
var e = [   {temperature: 20, humidity: 20, brick:20, wood:20},
            {temperature: 20, humidity: 20, brick:20, wood:20},
            {temperature: 20, humidity: 20, brick:20, wood:20},
            {temperature: 20, humidity: 20, brick:20, wood:20},
            {temperature: 20, humidity: 20, brick:20, wood:20}
        ];
var p = [   [1,1,1,1,1,1,1,1,1,1,1],
            [2,2,2,2,2,2,2,2,2,2,2],
            [3,3,3,3,3,3,3,3,3,3,3],
            [4,4,4,4,4,4,4,4,4,4,4],
            [5,5,5,5,5,5,5,5,5,5,5]
        ];
    

nutella.net.subscribe('start_simulation', function(message, from) {
    nutella.net.request('read_population_model','populationModel', function(response){
        console.log('answered request');
        m = response;
        crank();
    });
});


function crank () {
    console.log('crank');
    nutella.net.request('enactment-simulation',{model:m, environment:e, populations:p},function(newpop){
        console.log (newpop);
        p = newpop;
    });
//    setTimeout(crank, 10000);
}




