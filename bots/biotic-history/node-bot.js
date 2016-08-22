
var NUTELLA = require('nutella_lib');

// Get configuration parameters and init nutella
var cliArgs = NUTELLA.parseArgs();
var componentId = NUTELLA.parseComponentId();
var nutella = NUTELLA.init(cliArgs.broker, cliArgs.app_id, cliArgs.run_id, componentId);


var history = nutella.persist.getMongoObjectStore('bioticHistory');

history.load(function(){

  if (!history.hasOwnProperty('ecosystem')){
    reset_history();
  };


  nutella.net.subscribe('seed',function(message, from) {
    var d = new Date();
    var timestamp=  d.getTime();
    history.ecosystem[message.ecosystem].push({timestamp: timestamp, action:'seed', species: message.species});
    history.save();
  });
  nutella.net.subscribe('herbicide',function(message, from) {
    var d = new Date();
    var timestamp=  d.getTime();
    history.ecosystem[message.ecosystem].push({timestamp: timestamp, action:'herbicide', species: message.species});
    history.save();
  });
  nutella.net.subscribe('colonize',function(message, from) {
    var d = new Date();
    var timestamp=  d.getTime();
    history.ecosystem[message.ecosystem].push({timestamp: timestamp, action:'colonize', species: message.species});
    history.save();
  });
  nutella.net.subscribe('trap',function(message, from) {
    var d = new Date();
    var timestamp=  d.getTime();
    history.ecosystem[message.ecosystem].push({timestamp: timestamp, action:'trap', species: message.species});
    history.save();
  });
  nutella.net.handle_requests('biotic-history',function(message, from) {
    return (history.ecosystem[message.ecosystem]);
  });


function reset_history () {
  history['ecosystem']=[];
  for (var i=0; i<5; i++) {
    history.ecosystem[i] = [{timestamp:0, action: 'null', species:-1}];
  }
  history.save();
};




});


