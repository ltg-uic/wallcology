
var NUTELLA = require('nutella_lib');

// Get configuration parameters and init nutella
var cliArgs = NUTELLA.app.parseArgs();
var componentId = NUTELLA.app.parseComponentId();
var nutella = NUTELLA.app.init(cliArgs.broker, cliArgs.app_id, componentId);


var currentRun = nutella.app.persist.getMongoObjectStore('currentRun');

currentRun.load(function(){

	if (!(currentRun.hasOwnProperty('class') && currentRun.hasOwnProperty('room'))){
    	currentRun['class'] = "default";
    	currentRun['room'] = "Dreesh"
    	currentRun.save();
	};


	nutella.app.handle_requests_on_all_runs('get_current_run',function(message, from) {
    	return ({class: currentRun.class, room: currentRun.room});
  	});

	nutella.app.handle_requests_on_all_runs('set_current_run',function(message, from){
    	currentRun['class'] = message.class;
    	currentRun['room']  = message.room;
    	currentRun.save();
	})
});
