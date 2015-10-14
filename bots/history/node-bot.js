
var NUTELLA = require('nutella_lib');

// Get configuration parameters and init nutella
var cliArgs = NUTELLA.parseArgs();
var componentId = NUTELLA.parseComponentId();
var nutella = NUTELLA.init(cliArgs.broker, cliArgs.app_id, cliArgs.run_id, componentId);

//nutella.setResourceId('my_resource_id');

const forceNewDB = false; // for debugging purposes. set true to wipe DB.

// Stores simulation history as an array of objects

var history = nutella.persist.getMongoObjectStore('history');

//
//
// everything is packed into the load function,
// because the existing history needs to be loaded
// before any of the other handlers can fire
//
console.log("History version 0.9.4");
history.load(function(){

// if there is no history db, initialize it here.
// history.states[0] is the initial state of the simulation
// history. 
//


 if (!history.hasOwnProperty('states') || forceNewDB) {

      history['states'] = [];
      history['states'][0] = {timestamp:0, populations:[], environments:[]};
      history['states'][0]['populations'] = [
        [0,.5,.5,0,0,10,.5,0,.5,10,10],
        [1,0,0,0,10,10,1,1,.5,0,0],
        [0,.5,1,.5,0,10,1,0,0,0,10],
        [1,0,0,0,10,10,0,1,.5,0,10]
      ];
      history['states'][0]['environments'] = [ [-20,1,.4,-1],[-20,1,.4,-1],[-20,1,.4,-1],[-20,1,.4,-1] ];
      history['species_events'] = [];
      history['environmental_events'] = [];
      // convert populations from model values to "wall size" values before publishing

    for (var i=0; i<history['states'][0]['populations'].length; i++) {
        // predators
        history['states'][0]['populations'][i][1] *= 100;
        history['states'][0]['populations'][i][3] *= 100;
        history['states'][0]['populations'][i][8] *= 100;
        // herbivores
        history['states'][0]['populations'][i][0] *= 200;
        history['states'][0]['populations'][i][2] *= 200;
        history['states'][0]['populations'][i][6] *= 200;
        history['states'][0]['populations'][i][7] *= 200;
        // resources
        history['states'][0]['populations'][i][4] /= 200;
        history['states'][0]['populations'][i][5] /= 200;
        history['states'][0]['populations'][i][9] /= 200;
        history['states'][0]['populations'][i][10] /= 200;
    }

//  when the configuration bot is ready, uncomment the following and nest everything inside of the
//  function response
      // nutella.net.request('initial_state', {}, function(response){

      //   for (var i=0; i<response['habitats'].length; i++) {
      //     for (var j=0; j<response['habitats'][i]['items'].length; j++)
      //       history['states'][0]['populations'][i][response['habitats'][i]['items'][j]]=20; //check with Joel
      //     history['states'][0]['environments'][i][0]=response['habitats'][i]['temperature'];
      //     history['states'][0]['environments'][i][1]=response['habitats'][i]['pipelength'];
      //     history['states'][0]['environments'][i][2]=response['habitats'][i]['brickarea'];
      //   }
      // })

      var d = new Date(); 
      history['states'][0]['timestamp'] = d.getTime();
      history.save();

 }

//      ************REQUEST HANDLERS**************
//
//
//      The history bot handles four kinds of requests:
//      1. population_history ({habitat, species, from, to})
//      2. environment_history ({habitat, from, to})
//      3. environmental_events_history ({habitat, environmental_variable, species, from, to})
//      4. species_events_history ({habitat, species, from, to})
//
//      note: 'from' and 'to' fields are optional, defaulting to 0 and now, respectively.
//      all other fields are required, or the handlers will return empty arrays.



//
//  This utility function takes an array of the elements {timestamp: <value>, arg:<value>}
//  as input, and returns an array of length n that represents the interpolated values from the
//  original array. arg is the string name of the dependent variable. the timestamps are in
//  strictly increasing order.
//


  function interpolate(A,n,arg,beginning,ending) {

  //
  // we'll build an array B of length n that interpolates the data points in A, then return B
  //
  // totally inelegant. sorry.
  //
  // need parameter validation code here
  //

  var B = [];

    var interval = (ending-beginning) / (n-1);
    for (var j=0; j<n; j++) {
      B[j] = {};
      B[j]['timestamp'] = Number(beginning) + j * interval; //doesn't work with Number (!)
    }

  if (A.length < 5) {for(var j=0; j<n; j++) B[j][arg] = Number(0); return(B);}

    var A_index=1;
    var B_index=0;


    while (B[B_index]['timestamp'] < A[0]['timestamp']) {B[B_index][arg] = 0; B_index++;};

    while (A_index <= A.length-1) {

      if (B[B_index]['timestamp'] == A[A_index]['timestamp']) {
        B[B_index][arg] = A[A_index][arg];
        B_index++; A_index++;
      } 

      else 

      if (B[B_index]['timestamp'] < A[A_index]['timestamp']) {
            B[B_index][arg] = Number(A[A_index-1][arg]) +
                  (A[A_index][arg] - A[A_index-1][arg]) *
                  (B[B_index]['timestamp'] - A[A_index-1]['timestamp']) / (A[A_index]['timestamp'] - A[A_index-1]['timestamp']);
            B_index++;
      }

      else

      {do {A_index++;} while ((A_index<=A.length-1) && (A[A_index]['timestamp'] < B[B_index]['timestamp']));}
    
    }

    while (B_index <= n-1) {B[B_index][arg] = 0; B_index++;}

    return (B);
  }


  


//
// channel: population_history
//
//          message = {
//                      species: '5',
//                      habitat: '2',
//                      points: '25',
//                      from: '100',  // seconds since 1970
//                      to: '200'
//                    }
//
//          returns an array of <points> objects: { timestamp : <value>, population: <value>},
//          equally spaced in time
//          containing the populations of species 'species' in habitat 'habitat'
//          from time 'from' to time 'to'
//

nutella.net.handle_requests('population_history', function(JSONmessage, from) {
        var message = deepCopy(JSONmessage);
//
//      if missing habitat or species parameters, return empty list
//
        if (!(message.hasOwnProperty('species') && message.hasOwnProperty('habitat'))) return ([]);
        if (message['species']<0 || message['species']>(history['states'][0]['populations'][0].length-1)) return ([]);
        if (message['habitat']<0 || message['habitat']>(history['states'][0]['populations'].length-1)) return ([]);
//
//      if missing starting ('from') or ending ('to') times, default to 0 and right now.

        if (!message.hasOwnProperty('from')) {message['from'] = 0;}
          else if (message['from']=='') {message['from'] = 0;}
        if (!message.hasOwnProperty('to')) {var d = new Date(); message['to'] = d.getTime()}
          else if (message['to']=='') {var d = new Date(); message['to'] = d.getTime()}

//      search db and construct array of {timestamp: 198473, population: .2}

        var h = [];
        h = history['states'].filter(function(snapshot){
            return(snapshot['timestamp'] >= message.from && snapshot['timestamp'] <= message.to);
            }).map(function(element) {
                return( {
                  timestamp: element['timestamp'],
                  population: element['populations'][message.habitat][message.species]});
              });
        if (!(message.hasOwnProperty('points'))) return(h);
        if (message['points'] == '') return (h);
        if (message['points'] < 2) return ([]);
        if (message['points'] > history.length-1) return(h);
        return (interpolate(h,message['points'],'population',message['from'],message['to']));

    });

// channel: environment_history
//
//          message = {

//                      environmental_variable: 0, 0=temperature 1=pipe length 2=brick area
//                      habitat: '2',  
//                      points: '25', 
//                      from: '100',  // seconds since 1970 
//                      to: '200'
//                    }
//
//          returns an array of objects: {
//              timestamp : 4958884,
//              value: 14
//            }
//
//          which represents the values of environmental variable "environmental_variable" for habitat "habitat"
//          from time 'from' to time 'to'
//


nutella.net.handle_requests('environment_history', function(JSONmessage, from) {
        var message = JSONmessage;
//
//      if missing or out-of-range habitat or environmental_variable parameter, return empty list
//
        if (!(message.hasOwnProperty('habitat') && message.hasOwnProperty('environmental_variable'))) return ([]);
        if (message['habitat']<0 || message['habitat']>(history['states'][0]['populations'][0].length-1)) return ([]);
        if (message['environmental_variable']<0 || message['environmental_variable']>(history['states'][0]['populations'].length-1)) return ([]);

//      if missing starting ('from') or ending ('to') times, default to 0 and right now.

        if (!message.hasOwnProperty('from')) {message['from'] = 0;}
          else if (message['from']=='') {message['from'] = 0;}
        if (!message.hasOwnProperty('to')) {var d = new Date(); message['to'] = d.getTime()}
          else if (message['to']=='') {var d = new Date(); message['to'] = d.getTime()}

//      search db and construct array of {timestamp: 198473, population: .2}

        var h = [];
        h = history['states'].filter(function(snapshot){
            return(snapshot['timestamp'] >= message.from &&
                   snapshot['timestamp'] <= message.to
                   );
            }).map(function(element) {
                return({
                  timestamp: element['timestamp'],
                  value: Math.abs(element['environments'][message.habitat][message.environmental_variable])});
              });
        if (!(message.hasOwnProperty('points'))) return(h);
        if (message['points'] == '') return (h);
        if (message['points'] < 2) return ([]);
        if (message['points'] > history.length-1) return(h);
        return (interpolate(h,message['points'],'value',message['from'],message['to']));
    });


// channel: environmental_events_history
//
//          message = {
//                      habitat: '2',
//                      from: '100',  // seconds since 1970
//                      to: '200'
//                    }
//
//          returns an array of {timestamp: 5858489, action: "warmer"}  action = warming
//          from time 'from' to time 'to' for that habitat


nutella.net.handle_requests('environmental_events_history', function(JSONmessage, from) {
        var message = JSONmessage;
//
//      if missing or out-of-range habitat parameter, return empty list
        if (!message.hasOwnProperty('habitat')) return ([]);
        if (message['habitat']<0 || message['habitat']>(history['states'][0]['populations'].length-1)) return ([]);
//
        if (!message.hasOwnProperty('from')) {message['from'] = 0;}
          else if (message['from']=='') {message['from'] = 0;}
        if (!message.hasOwnProperty('to')) {var d = new Date(); message['to'] = d.getTime()}
          else if (message['to']=='') {var d = new Date(); message['to'] = d.getTime()}

//      search db and construct array of {timestamp: 198473, action: "warmer"}

        return(history['environmental_events'].filter(function(snapshot){
            return(snapshot['timestamp'] >= message.from &&
                   snapshot['timestamp'] <= message.to &&
                   snapshot['habitat'] == message.habitat);
            }).map(function(element) {
                return( {
                  timestamp: element['timestamp'],
                  action: element['action']});
              })
            )
    });

// channel: species_events_history
//
//          message = {
//                      species: '5',
//                      habitat: '2',
//                      from: '100',  // seconds since 1970
//                      to: '200'
//                    }
//
//
//
//          returns an array of objects: { timestamp : <value>, action: <value>}
//          from time 'from' to time 'to' for that habitat and species (i.e., it's the
//          history of the events for this species in this habitat)

nutella.net.handle_requests('species_events_history', function(JSONmessage, from) {
        var message = JSONmessage;
//
//      if missing habitat or species parameters, return empty list
//
        if (!(message.hasOwnProperty('species') && message.hasOwnProperty('habitat'))) return ([]);
        if (message['species']<0 || message['species']>(history['states'][0]['populations'][0].length-1)) return ([]);
        if (message['habitat']<0 || message['habitat']>(history['states'][0]['populations'].length-1)) return ([]);
//
//      if missing or empty string starting ('from') or ending ('to') times, default to 0 and right now.  clumsy code.

        if (!message.hasOwnProperty('from')) {message['from'] = 0;}
          else if (message['from']=='') {message['from'] = 0;}
        if (!message.hasOwnProperty('to')) {var d = new Date(); message['to'] = d.getTime()}
          else if (message['to']=='') {var d = new Date(); message['to'] = d.getTime()}

//      search db and construct array of {timestamp: 198473, population: .2}

        return(history['species_events'].filter(function(snapshot){
            return(snapshot['timestamp'] >= message.from &&
                   snapshot['timestamp'] <= message.to &&
                   snapshot['habitat'] == message.habitat &&
                   snapshot['species'] == message.species);
            }).map(function(element) {
                return( {
                  timestamp: element['timestamp'],
                  action: element['action']});
              })
            )
    });


//  channel: last_state
//
//          message = ignored
//
//          returns the most recent state (support restart in case of failure). used by simulation bot

nutella.net.handle_requests('last_state',function(JSONmessage, from) {
        return (history['states'][history['states'].length-1]);
});

nutella.net.handle_requests('last_animation_state',function(JSONmessage, from) {
        var state = deepCopy(history['states'][history['states'].length-1]);
//
    for (var i=0; i<state['populations'].length; i++) {
        // predators
        state['populations'][i][1] /= 50;
        state['populations'][i][3] /= 50;
        state['populations'][i][8] /= 50;
        // herbivores
        state['populations'][i][0] /= 50;
        state['populations'][i][2] /= 50;
        state['populations'][i][6] /= 50;
        state['populations'][i][7] /= 50;
        // resources
        state['populations'][i][4] *= 100;
        state['populations'][i][5] *= 100;
        state['populations'][i][9] *= 100;
        state['populations'][i][10] *= 100;
    }
        return (state);
});



//                      ****************SUBSCRIPTIONS****************

//      The history bot listens for three kinds of messages:
//      1. population_update(s) from the simulator
//      2. species_events(s) from teachers and kids (increase, decrease species)
//      3. habitat_events(s) from teachers
//
//
// channel: state_update

//          message = {
//                      timestamp: '2015--..',
//                      populations: [
//                          [0,0,0,0,0,0,0,0,0,0],
//                          [0,0,0,0,0,0,0,0,0,0],
//                          [0,0,0,0,0,0,0,0,0,0],
//                          [0,0,0,0,0,0,0,0,0,0]
//                      ],
//                     environments: [ [20,.8,.4,-1],[20,.8,.4,-1],[20,.8,.4,-1],[20,.8,.4,-1] ]
//          }

//          appends population_update to history



nutella.net.subscribe('state_update', function(JSONmessage, from) {
    var message=JSONmessage;
    var d = new Date();
    message.timestamp=d.getTime();
    history['states'].push(message);
    history.save();
});

// channel: species_event
//
//  message = {habitat: 0, species: 3, action: <event>} <event> := "remove" | "increase" | "decrease" | "insert"

nutella.net.subscribe('species_event', function(JSONmessage, from) {
    var message=JSONmessage;
    var d = new Date();
    console.log("received species event");
    message.timestamp=d.getTime();
    history['species_events'].push(message);
    history.save();
});

// channel: environmental_event   [DRAFT]
//  message = {habitat: 0, action: <event>, species: 2}  <event> := "warming" | "pipeCollapse" | "plasterFall" | "invasion"
//  third parameter used only when event type=invasion
//  plasterFalls for the future; would allow for more brick area
//
//

nutella.net.subscribe('environmental_event', function(JSONmessage, from) {
    var message=JSONmessage;
    var d = new Date();
    message.timestamp=d.getTime();
    history['environmental_events'].push(message);
    history.save();
});

//this for tony's configuration app!


}); // end history.load();

function deepCopy(oldObj) {
    var newObj = oldObj;
    if (oldObj && typeof oldObj === 'object') {
        newObj = Object.prototype.toString.call(oldObj) === "[object Array]" ? [] : {};
        for (var i in oldObj) {
            newObj[i] = deepCopy(oldObj[i]);
        }
    }
    return newObj;
}
