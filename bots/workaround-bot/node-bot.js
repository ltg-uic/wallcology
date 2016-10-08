
var NUTELLA = require('nutella_lib');


// Get configuration parameters and init nutella
var cliArgs = NUTELLA.parseArgs();
var componentId = NUTELLA.parseComponentId();
var nutella = NUTELLA.init(cliArgs.broker, cliArgs.app_id, cliArgs.run_id, componentId);

var current_run;

nutella.net.request('get_current_run',{},function(message){
    current_run = message;
    nutella.net.handle_requests('get_current_run2',function(message,from){
        return current_run;
    });
});

nutella.net.subscribe('set_current_run',function(message,from){
    current_run = message;
});


