var NUTELLA = require('nutella_lib');

// Get configuration parameters and init nutella
var cliArgs = NUTELLA.parseArgs();
var componentId = NUTELLA.parseComponentId();
var nutella = NUTELLA.init(cliArgs.broker, cliArgs.app_id, cliArgs.run_id, componentId);
// Optionally you can set the resource Id
nutella.setResourceId('my_resource_id');


console.log("user log");

var SEPARATOR = "^,^";

var userlog = nutella.persist.getMongoObjectStore('userlog');

userlog.load(function(){

    if (!userlog.hasOwnProperty('data')){ userlog.data = []; userlog.save(); }

    // add to log of user actions incrementally

    nutella.net.subscribe('add_to_user_log', function(arrayOfLogEntries, from) {
        var temp = []; var d = new Date(); var str = d.getTime(); var rs = d.toLocaleString();
        for (var i=0; i<arrayOfLogEntries.length; i++) temp[i] = rs + SEPARATOR + arrayOfLogEntries[i];
        userlog.data = userlog.data.concat(temp); userlog.save();
    });


    // but retrieve as a whole 

    nutella.net.handle_requests('retrieve_user_log', function(message, from){
        return(userlog.data);
    })
});


// [ {group: query_parameters.INSTANCE, eventType: “run”, selected: “goes up” }, {“event}, {jfadfl;ajls}, {a;lsdfjlsa} ]

// timeStamp

// app:
// - lion king
// - modeler
// - food web

// nutella.net.publish(“foodweblog”)


// ———


//     nutella.net.request('get_foodweb',query_parameters.INSTANCE,function(message,from){ 

//     });

//     nutella.net.publish('set_foodweb',{group: query_parameters.INSTANCE, web: YourVariable});
        
//     nutella.net.publish('foodweb_log’, array);
        
//     nutella.net.handle_request('foodweb_image',function(message,from){
        
//         return (image);
//     });

//     nutella.net.request('species_icons',function(message,from){
        
//         message[i] will be the URL for species icon i
//     });


// drawing = {
//                       nodes: [{species: 3, x: 20, y:80},{species: 4, x: 20, y:80}],

//                       links: [ {sourceSpecies: 3, destinationSpecies: 4, type: ‘competition’} ]

//           }

// save_drawing (drawing);
// get_drawing (drawing);


// if food web is empty, 
// {nodes:[], link:[]}






// // Some examples to give you ideas...
// // You can do things such as:



// // 1. Subscribing to a channel
// nutella.net.subscribe('demo_channel', function(message, from) {
//     // Your code to handle messages received on this channel goes here
// });


// // 2. Publish a message to a channel
// nutella.net.publish('demo_channel', 'demo_message');

    
// // 2a. The cool thing is that the message can be any object
// nutella.net.publish('demo_channel', {a: 'proper', key: 'value'});


// // 3. Make asynchronous requests on a certain channel
// nutella.net.request( 'demo_channel', 'my_request', function(response){
//     // Your code to handle the response to this request goes here
// });


// // 4. Handle requests from other components
// nutella.net.handle_requests( 'demo_channel', function(message, from) {
//     // Your code to handle each request here
//     // Anything this function returns (String, Integer, Object...) is going to be sent as the response
//     var response = 'a simple string'
//     // response = 12345
//     // response = {}
//     // response = {my:'json'}
//     return response;
// });

