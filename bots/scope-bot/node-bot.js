var NUTELLA = require('nutella_lib');
var request = require('request');

// Get configuration parameters and init nutella
var cliArgs = NUTELLA.parseArgs();
var componentId = NUTELLA.parseComponentId();
var nutella = NUTELLA.init(cliArgs.broker, cliArgs.app_id, cliArgs.run_id, componentId);
// Optionally you can set the resource Id
nutella.setResourceId('wallscope_bot');

var configuration
console.log('Hi, Im a wallscope-bot');


//var url = 'http://beta.json-generator.com/api/json/get/4JWVllOd'
//
//request({
//    url: url,
//    json: true
//}, function (error, response, body) {
//
//    if (!error && response.statusCode === 200) {
//        console.log('we have a new config')
//    }
//})

var isRunning = false;

var configuration;

nutella.net.subscribe('wallcology_admin_channel', function(message, from) {
    if( message != undefined ) {
        if( message.event == 'start') {
            console.log('from Admin: viz  has been started');
            configuration = message.scopeConfiguration;
            console.log('from Admin: viz  has been started');
            nutella.net.publish('wallscope_channel',{event:'start', configuration: configuration});
        } else if( message.event === 'stop') {
            console.log('from Admin: viz start has been stopped');
            nutella.net.publish('wallscope_channel',{event:'stop'});
        } else if( message.event === 'update_scope') {
            console.log('from Admin: sending update to scopes');
            nutella.net.publish('wallscope_channel',message);
        }
    }
});

nutella.net.subscribe('wallscope_channel', function(message, from) {
    // Your code to handle messages received on this channel goes here
});


//// 2. Publish a message to a channel
//nutella.net.publish('wallscope_channel', 'demo_message');
//
//
//// 2a. The cool thing is that the message can be any object
//nutella.net.publish('wallscope_channel', {a: 'proper', key: 'value'});


// 3. Make asynchronous requests on a certain channel
//nutella.net.request( 'demo_channel', 'my_request', function(response){
//    // Your code to handle the response to this request goes here
//});


// 4. Handle requests from other components
nutella.net.handle_requests( 'demo_channel', function(message, from) {
    // Your code to handle each request here
    // Anything this function returns (String, Integer, Object...) is going to be sent as the response
    var response = 'a simple string';
    // response = 12345
    // response = {}
    // response = {my:'json'}
    return response;
});

