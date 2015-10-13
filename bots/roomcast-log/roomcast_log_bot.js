var NUTELLA = require('nutella_lib');

console.log('Initializing roomcast_log_bot...');

var cliArgs = NUTELLA.parseArgs();
var componentId = NUTELLA.parseComponentId();
var nutella = NUTELLA.init(cliArgs.broker, cliArgs.app_id, cliArgs.run_id, componentId);

var log = nutella.persist.getMongoCollectionStore('roomcast-log');

var storeMessage = function(message) {
    log.load(function() {
        log.push(message);
        log.save();
    });
};

nutella.net.subscribe('roomcast-log-bot/store', function(message, from) {
    storeMessage(message);
});

console.log('Initialization complete.');

//////////////////////////////////////////

// nutella.net.publish('demo_channel', {a: 'proper', key: 'value'});
// nutella.net.request( 'demo_channel', 'my_request', function(response){});
// nutella.net.handle_requests( 'demo_channel', function(message, from) {var response = 'string'; return response; });
