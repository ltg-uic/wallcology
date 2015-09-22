
var NUTELLA = require('nutella_lib');

// Get configuration parameters and init nutella
var cliArgs = NUTELLA.parseArgs();
var componentId = NUTELLA.parseComponentId();
var nutella = NUTELLA.init(cliArgs.broker, cliArgs.app_id, cliArgs.run_id, componentId);

//nutella.setResourceId('my_resource_id');

// Stores simulation history as an array of objects

var history = nutella.persist.getMongoObjectStore('history');

//
//
// this scope of this 
history.load(function(){


if  (!history.hasOwnProperty('state')) {
    history['states'] = []; 
});




// temporary

//  var history={};

//  var history = {
//     states: [
//         {
//             timestamp: 2,
//             populations: [
//                 [0.5, 0.5, 0.4, 0.5, 0.5, 0.4, 0.5, 0.5, 0.4, 0.5, 0.5],
//                 [0.5, 0.5, 0.4, 0.5, 0.5, 0.4, 0.5, 0.5, 0.4, 0.5, 0.5],
//                 [0.5, 0.5, 0.4, 0.5, 0.5, 0.4, 0.5, 0.5, 0.4, 0.5, 0.5],
//                 [0.5, 0.5, 0.4, 0.5, 0.5, 0.4, 0.5, 0.5, 0.4, 0.5, 0.5]
//                 ],
               // environments: [
               //      {
               //          temperature: "hi";
               //          surfaces: 0.4;

               //      },
               //      {
               //          temperature: "med";
               //          surfaces: 0.2;
               //      },
               //      {
               //          temperature: "hi";
               //          surfaces: 0.7;
               //      },
               //      {
               //          temperature: "lo";
               //          surfaces: 0.3;
               //      }
               //  ]
//         },
//         {
//             timestamp: 5,
//             populations: [
//                 [0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2],
//                 [0.2, 0.5, 0.4, 0.5, 0.5, 0.4, 0.5, 0.5, 0.4, 0.5, 0.5],
//                 [0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7],
//                 [0.7, 0.5, 0.4, 0.1, 0.1, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6]
//                 ]
//         }
//     ],
//     species_events: [
//         {
//             timestamp: 3,
//             habitat: 1, 
//             species: 2, 
//             action: 'increase'
//         }
//     ],
//     habitat_events: [
//         {
//             timestamp: 4,
//             habitat: 0, 
//             action: 'increase_temperature'
//         }
//     ]
// }

//      REQUEST HANDLERS
//
//
//      handle request for the entire history database
//

// channel: full_species_events_history
//
//          message ignored.
//

nutella.net.handle_requests('species_event_history', function(message, from) {
    return (history['species_events'].filter(function(value,index) {return(index!=0);}));
});

// channel: full_habitat_events_history
//
//          message ignored.
//

nutella.net.handle_requests('habitat_event_history', function(message, from) {
    return (history['habitat_events'].filter(function(value,index) {return(index!=0);}));
});

// channel: specific_state
//
//          message = {
//                      species: '5',
//                      habitat: '2',  // habitat 0 = sum across all the habitats
//                      from: '2015--..',
//                      to: '2015--..'
//                    }

// channel: full_state
//
//          message ignored.
//

nutella.net.handle_requests('state_history', function(message, from) {
    return (history['states']);
});



nutella.net.handle_requests('state_history', function(JSONmessage, from) {
        var message = {};
        if (JSONmessage == '') {
            message['habitat'] = 0; 
            message['species'] = 0; 
            message['from'] = 0;
            message['to'] = history['states'][history.length].timetamp +1;
        } else {
            message = JSON.parse(JSONmessage);
            if (!message.hasOwnProperty('habitat')) message['habitat'] = 0;
            if (!message.hasOwnProperty('species')) message['species'] = 0;
            if (!message.hasOwnProperty('from')) message['from'] = 0;
            if (!message.hasOwnProperty('to')) message['to'] = history['states'][history.length]['timestamp'] +1;
        }
          //delete this and remove JSON from line above for real operation.
        return(history['states'].filter(function(snapshot){
            return(snapshot['timestamp'] >= message.from && snapshot['timestamp'] <= message.to);
            }).map(function(element) {
                return({timestamp: element['timestamp'], value: element['populations'][message.habitat][message.species]});}
            ))
    })

// nutella.net.handle_requests('specific_state', function(JSONmessage, from) {
//         var message = JSON.parse(JSONmessage);  //delete this and remove JSON from line above for real operation.
//         return(history['state'].filter(function(snapshot){
//             return(snapshot['timestamp'] >= message.from && snapshot['timestamp'] <= message.to);
//             }).map(function(element) {
//                 return({timestamp: element['timestamp'], value: element['population'][message.habitat][message.species]});}
//             ))
//     })
 
/

// SUBSCRIPTIONS

//      Listen for population updates, append to history and save
//
// channel: population_update
//
//          message = {
//                      timestamp: '2015--..',
//                      population: [
//                          [0.5, 0.5, 0.4, 0.5, 0.5, 0.4, 0.5, 0.5, 0.4, 0.5, 0.5],
//                          [0.5, 0.5, 0.4, 0.5, 0.5, 0.4, 0.5, 0.5, 0.4, 0.5, 0.5],
//                          [0.5, 0.5, 0.4, 0.5, 0.5, 0.4, 0.5, 0.5, 0.4, 0.5, 0.5],
//                          [0.5, 0.5, 0.4, 0.5, 0.5, 0.4, 0.5, 0.5, 0.4, 0.5, 0.5]
//                      ]
//                    }

nutella.net.subscribe('population_update', function(message, from) {
    var message=JSON.parse(JSONmessage);
    var d = new Date();
    message.timestamp=d.getTime();
    if (history.hasOwnProperty('population')) history['population'].push(message);
    else {history['population'] = []; history['population'][0] = message;};
    history.save();
});

// channel: control_species_event
//  message = {habitat: 0, species: 3, action: <event>} <event> := "kill" | "increase" | "harvest" | "colonize"

// insert timestamp

nutella.net.subscribe('species_event', function(JSONmessage, from) {
    var message=JSON.parse(JSONmessage);
    var d = new Date();
    message.timestamp=d.getTime();
    if (history.hasOwnProperty('species_events')) history['species_events'].push(message);
    else {history['species_events'] = []; history['species_events'][0] = message;}
    history.save();
});

// channel: control_habitat_event   [DRAFT]
//  message = {habitat: 0, action: <event>}  <event> := "warmer" | "colder" | "more_wall_space" | "less_wall_space"

// insert timestamp

nutella.net.subscribe('habitat_event', function(JSONmessage, from) {
    var message=JSON.parse(JSONmessage);
    var d = new Date();
    message.timestamp=d.getTime();
    if (history.hasOwnProperty('habitat_events')) history['habitat_events'].push(message);
    else {history['habitat_events'] = []; history['habitat_events'][0] = message;}
    history.save();
});


}); // end history.load();


