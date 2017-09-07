var NUTELLA = require('nutella_lib');

// Get configuration parameters and init nutella
var cliArgs = NUTELLA.parseArgs();
var componentId = NUTELLA.parseComponentId();
var nutella = NUTELLA.init(cliArgs.broker, cliArgs.app_id, cliArgs.run_id, componentId);
// Optionally you can set the resource Id
nutella.setResourceId('my_resource_id');


console.log("Keep alive bot. Pings every minute. Interfaces must subscribe.");

var pingcount = 0;
// 2. Publish a message to a channel
setInterval(ping, 60*1000); //ping every minute

function ping () {
 nutella.net.publish('ping',pingcount++);
}


