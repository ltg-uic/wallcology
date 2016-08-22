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
  nutella.net.handle_requests('channel_names', function (message, from){
    return channels.channel;
  });
  nutella.net.subscribe('set_channel_names', function (message, from){
    channels.channel=message;
    channels.save();
  });
});

var roster = nutella.persist.getMongoObjectStore('roster');

  roster.load(function(){
  		// if (!roster.hasOwnProperty('logins')){
    // 		reset_roster();
  		// };
  		nutella.net.handle_requests('roster', function (message, from){
  			console.log('upon request: ' + roster.logins[1].printNames[2]);
  			var p = [];
  			var temp = [];
  			for (var i=0; i<roster.logins.length; i++){
  				p = roster.logins[i].printNames;
  				temp[i]={ type: roster.logins[i].type, owner: roster.logins[i].owner, printNames: p };
  			}
    		return temp;
  		});
  		nutella.net.subscribe('set_roster', function (message, from){
    		roster.logins = [];
			for(var i=0; i < message.length; i++){
    			roster.logins.push({type:message[i].type, owner: message[i].owner, printNames: message[i].printNames});
    		}
    		console.log('from client: ' + roster.logins[1].printNames[2]);
    		roster.save();
    		console.log('after save: ' + roster.logins[1].printNames[2]);
  		});

  });

function reset_roster () {
  roster['logins']=[];
  roster.save();
};

function reset_channels () {
  channels['channel']=[];
  channels.save();
};

