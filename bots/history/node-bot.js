
var NUTELLA = require('nutella_lib');

// Get configuration parameters and init nutella
var cliArgs = NUTELLA.parseArgs();
var componentId = NUTELLA.parseComponentId();
var nutella = NUTELLA.init(cliArgs.broker, cliArgs.app_id, cliArgs.run_id, componentId);


var history = nutella.persist.getMongoObjectStore('newHistory');

GRAPH_RESOLUTION = 75; // Number of lines in graphical displays. always return longitudinal arrays of this length.

history.load(function(){

  if (!history.hasOwnProperty('states')){
    reset_history();
  };

  nutella.net.handle_requests('last_state',function(message, from) {console.log(message);
    var last_state_index = history['states'].length-1;
    return ({abiotic: history['states'][last_state_index]['abiotic'], biotic: history['states'][last_state_index]['biotic']});
  });


   nutella.net.handle_requests('ecosystem_history',function(message, from) {
      var a = [];
      var b = [];
      var i=0;
      var timeUnit = (message.stop - message.start)/GRAPH_RESOLUTION;
      var time;
      var zeroPop = [0,0,0,0,0,0,0,0,0,0,0];

      for (var j=0; j<GRAPH_RESOLUTION; j++) { 
        time = message.start + j * timeUnit;
        while (history.states[i].timestamp < time && i<history.states.length-1) i++;
        var beforeGap = (i!=0)? time - history.states[i-1].timestamp: Number.POSITIVE_INFINITY;
        var afterGap = (i<history.states.length-1)? history.states[i].timestamp - time: Number.POSITIVE_INFINITY;
        if (beforeGap < afterGap) {
          if (i>=history.states.length-1) a[j] = {temperature:0, brick:0, wood:0};
            else a[j]= {  temperature: history.states[i-1].abiotic[message.ecosystem].temperature,
                          brick: history.states[i-1].abiotic[message.ecosystem].brick,
                          wood: history.states[i-1].abiotic[message.ecosystem].wood};
          b[j]= (i>=history.states.length-1)? zeroPop : history.states[i-1].biotic[message.ecosystem];
        } else {
          if (i==0) a[j] = {temperature:0, brick:0, wood:0};
            else a[j]= {  temperature: history.states[i].abiotic[message.ecosystem].temperature,
                          brick: history.states[i].abiotic[message.ecosystem].brick,
                          wood: history.states[i].abiotic[message.ecosystem].wood};
          b[j]= (i==0)? zeroPop : history.states[i].biotic[message.ecosystem];
        };
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
      biotic :  [ [0,1,1,0,1,0,1,0,1,1,1], // this needs to be in a configuration file
                  [1,0,0,0,1,1,1,1,1,0,0],
                  [0,1,1,1,0,1,1,0,0,0,1],
                  [1,0,0,0,1,1,0,1,1,0,1],
                  [1,0,0,1,1,1,0,1,1,1,0]
                ]
  };
  history['states'].push(state);
  history.save();
};


