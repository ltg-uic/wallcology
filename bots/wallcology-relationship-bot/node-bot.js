
var NUTELLA = require('nutella_lib');

// Get configuration parameters and init nutella
var cliArgs = NUTELLA.parseArgs();
var componentId = NUTELLA.parseComponentId();
var nutella = NUTELLA.init(cliArgs.broker, cliArgs.app_id, cliArgs.run_id, componentId);

console.log('cliArgs.app_id cliArgs.run_id componentId', cliArgs.app_id, cliArgs.run_id, componentId);


nutella.setResourceId('wallcology-relationships');

console.log("Hi, I'm RELATIONSHIP BOT!");

// Stores the relationships in the format {}

var relationships = nutella.persist.getJsonObjectStore('relationships');
relationship.load(function(){});



console.log('RELATIONSHIP PREVIOUS DATA: ',typeof(relationships), relationships);



// Handles student data entry


nutella.net.subscribe('relationships', function(message, from) {
    console.log( 'The Message to WRB: ' + message);

    if( !relationships.hasOwnProperty('data') ) {
        relationships['data'] = [];
    }

    relationships['data'].push(message);
    console.log('relationship ARR', message, relationships);
    //if not a duplicate
	nutella.net.publish('update_relationships', message);

    relationships.save();
});


// Subscribes to all enter and exit events for all beacons and
// register callbacks for these events
nutella.location.ready(function() { console.log('relationships bot on line!');});



//  Handles the requests for the stats of all students
nutella.net.handle_requests('complete_relationships', function(message, from) {
    console.log('REQUEST COMPLETE RELATIONSHIPS: '+ message);
    return relationships;
});
