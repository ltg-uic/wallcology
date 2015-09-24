
var NUTELLA = require('nutella_lib');
var masterConfiguration = require('./master_configuration.json');
var simulatorConfiguration = require('./simulator_configuration.json');

// Get configuration parameters and init nutella
var cliArgs = NUTELLA.parseArgs();
var componentId = NUTELLA.parseComponentId();
var nutella = NUTELLA.init(cliArgs.broker, cliArgs.app_id, cliArgs.run_id, componentId);


console.log('HABITATS: ')
for (var i = 0; i < masterConfiguration.habitats.length; i++) {
    console.log('\n',masterConfiguration.habitats[i]);
}

console.log('CRITTERS: ')
for (var i = 0; i < masterConfiguration.habitats.length; i++) {
    console.log('\n',masterConfiguration.habitatItems[i]);
}

nutella.net.handle_requests('master_configuration', function(message, from) {
    console.log('MasterConfiguration Requested');
    return masterConfiguration;
});

nutella.net.handle_requests('simulator_configuration', function(message, from) {
    console.log('SimulatorConfiguration Requested');
    return SimulatorConfiguration;
});
