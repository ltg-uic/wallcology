
var NUTELLA = require('nutella_lib');

// Get configuration parameters and init nutella
var cliArgs = NUTELLA.parseArgs();
var componentId = NUTELLA.parseComponentId();
var nutella = NUTELLA.init(cliArgs.broker, cliArgs.app_id, cliArgs.run_id, componentId);


var history = nutella.persist.getMongoObjectStore('abioticHistory');

history.load(function(){

  if (!history.hasOwnProperty('ecosystem')){
    reset_history();
  };


  nutella.net.subscribe('thermostat',function(message, from) {
    var d = new Date();
    var timestamp=  d.getTime();
    history.ecosystem[message.ecosystem].push({timestamp: timestamp, action:'thermostat', value: message.value});
    history.save();
  });
  nutella.net.subscribe('humidistat',function(message, from) {
    var d = new Date();
    var timestamp=  d.getTime();
    history.ecosystem[message.ecosystem].push({timestamp: timestamp, action:'humidistat', value: message.value});
    history.save();
  });
  nutella.net.subscribe('wall',function(message, from) {
    var d = new Date();
    var timestamp=  d.getTime();
    history.ecosystem[message.ecosystem].push({timestamp: timestamp, action:'wall', side: message.side, direction: message.direction});
    history.save();
  });
  nutella.net.handle_requests('abiotic-history',function(message, from) {
    return (history.ecosystem[message.ecosystem]);
  });



function reset_history () {
  history['ecosystem']=[];
  for (var i=0; i<5; i++) {
    history.ecosystem[i] = [{timestamp:0, action: 'null'}];
  }
  history.save();
};


});


