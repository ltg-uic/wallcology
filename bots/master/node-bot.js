
var NUTELLA = require('nutella_lib');

console.log("");
console.log("NUTELLA");
console.log("");

var x;
for (x in NUTELLA) {
    console.log(x);
}

// Get configuration parameters and init nutella
var cliArgs = NUTELLA.parseAppArgs();
var componentId = NUTELLA.parseComponentId();
var nutella = NUTELLA.initApp(cliArgs.broker, cliArgs.app_id, componentId);

console.log("");
console.log("nutella");
console.log("");
var x;
for (x in nutella) {
    console.log(x);
}

console.log("");
console.log("nutella.app");
console.log("");
var x;
for (x in nutella.app) {
    console.log(x);
}


console.log("");
console.log("nutella.app.net");
console.log("");
var x;
for (x in nutella.app.net) {
    console.log(x);
}


console.log("");
console.log("nutella.app.persist");
console.log("");
var x;
for (x in nutella.app.persist) {
    console.log(x);
}



console.log("");
console.log("nutella.app.persist.main_nutella");
console.log("");

var x;
for (x in nutella.app.persist.main_nutella) {
    console.log(x);
}




var currentRun = nutella.app.persist.getMongoObjectStore('currentRun');

currentRun.load(function(){

	if (!(currentRun.hasOwnProperty('class')){
    	currentRun['class'] = "default";
    	currentRun.save();
	};


	nutella.app.handle_requests_on_all_runs('get_current_run',function(message, from) {
    	return (currentRun.class);
  	});

	nutella.app.handle_requests_on_all_runs('set_current_run',function(message, from){
    	currentRun['class'] = message;
    	currentRun.save();
	})
});


