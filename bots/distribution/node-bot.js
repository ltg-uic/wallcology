var NUTELLA = require('nutella_lib');

// Get configuration parameters and init nutella
var cliArgs = NUTELLA.parseArgs();
var componentId = NUTELLA.parseComponentId();
var nutella = NUTELLA.init(cliArgs.broker, cliArgs.app_id, cliArgs.run_id, componentId);
// Optionally you can set the resource Id
nutella.setResourceId('my_resource_id');


var channels = nutella.persist.getMongoObjectStore('channels');


channels.load(function(){

  if (!channels.hasOwnProperty('channel')){
    reset_channels();
  };
  nutella.net.handle_requests('channel_print_names', function (message, from){
    return channels.channel;
  });

});

function reset_channels () {
  channels['channel']=[];
  channels.save();
};

