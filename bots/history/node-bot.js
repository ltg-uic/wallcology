
var NUTELLA = require('nutella_lib');

// Get configuration parameters and init nutella
var cliArgs = NUTELLA.parseArgs();
var componentId = NUTELLA.parseComponentId();
var nutella = NUTELLA.init(cliArgs.broker, cliArgs.app_id, cliArgs.run_id, componentId);


var history = nutella.persist.getMongoObjectStore('newHistory');

history.load(function(){

  if (!history.hasOwnProperty('states')){
    reset_history();
  };

  nutella.net.handle_requests('last_state',function(message, from) {
    var last_state_index = history['states'].length-1;
    return ({abiotic: history['states'][last_state_index]['abiotic'], biotic: history['states'][last_state_index]['biotic']});
  });

  nutella.net.handle_requests('ecosystem_history',function(message, from) {
      var a = [];
      var b = [];
      var index = 0;
      var last_state_index = history['states'].length-1;
      for (var i=0; i<last_state_index; i++) {
//        if (history['states'].timestamp > message.start && history['states'].timestamp < message.stop) {
          a[index] = history['states'][i]['abiotic'][message.ecosystem];
          b[index] = history['states'][i]['biotic'][message.ecosystem];
          index++;
//        }
      }
    return ({abiotic: a, biotic: b});
  });

  nutella.net.subscribe('reset_history',function(message,from) {
    reset_history();
  });

  nutella.net.subscribe('state_update',function(message, from) {
    var d = new Date();
    history['states'].push({timestamp: d.getTime(), abiotic: message['abiotic'], biotic: message['biotic']});
    history.save();
  });

});   

function reset_history () {
  var d = new Date();
  history['states']=[];
  var state = {timestamp: d.getTime(),
    abiotic : [ 
      {thermostat:20, temperature:20, humidistat:50, humidity:50, left:'out', top:'out', right:'out', bottom:'out', brick:1, wood:1},
      {thermostat:20, temperature:20, humidistat:50, humidity:50, left:'out', top:'out', right:'out', bottom:'out', brick:1, wood:1},
      {thermostat:20, temperature:20, humidistat:50, humidity:50, left:'out', top:'out', right:'out', bottom:'out', brick:1, wood:1},
      {thermostat:20, temperature:20, humidistat:50, humidity:50, left:'out', top:'out', right:'out', bottom:'out', brick:1, wood:1},
      {thermostat:20, temperature:20, humidistat:50, humidity:50, left:'out', top:'out', right:'out', bottom:'out', brick:1, wood:1}
        ],
      biotic :  [ [1,1,0,1,1,0,1,1,1,0,1], // this needs to be in a configuration file
                  [0,1,1,0,1,0,1,1,1,1,0],
                  [1,1,0,1,1,0,0,1,1,0,1],
                  [1,1,0,1,0,1,1,1,0,1,1],
                  [0,1,0,0,1,0,1,0,1,0,1]
                ]
  };
  history['states'].push(state);
  history.save();
};


