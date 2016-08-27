
var NUTELLA = require('nutella_lib');

// Get configuration parameters and init nutella
var cliArgs = NUTELLA.parseArgs();
var componentId = NUTELLA.parseComponentId();
var nutella = NUTELLA.init(cliArgs.broker, cliArgs.app_id, cliArgs.run_id, componentId);
// Optionally you can set the resource Id
nutella.setResourceId('my_resource_id');


    // "_id" : "default/threats",
    // "data" : [ 
    //     {
    //         "threat" : "Does Fleebus eat Gronko?",
    //     "status" : "open", /+ or "resolved" or "under investigation" */
    //         "answer" : "",
    //         "confidence" : "",
    //         "notes" : "This one is hard! We've tried a bunch of stuff.",
    //         "owner" : ""
    //     },
 

var threats = nutella.persist.getMongoObjectStore('threats');

threats.load(function(){
    if (!threats.hasOwnProperty('data')) {threats['data']=[]; threats.save();}
    nutella.net.handle_requests('get_threats', function (message, from){
        return threats.data;
    });
    nutella.net.handle_requests('set_threats', function (message, from){
        threats.data=message;
        threats.save();
        return;
    });
});
