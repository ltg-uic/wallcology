var NUTELLA = require('nutella_lib');

// Get configuration parameters and init nutella
var cliArgs = NUTELLA.parseArgs();
var componentId = NUTELLA.parseComponentId();
var nutella = NUTELLA.init(cliArgs.broker, cliArgs.app_id, cliArgs.run_id, componentId);


// main program

var model = nutella.persist.getMongoObjectStore('populationModel');
model.load(function(){
    nutella.net.handle_requests('read_population_model', function(message, from) {
        return(model);
    });
    nutella.net.handle_requests('write_population_model', function(message, from) {
        model['r']=message['r']; 
        model['K']=message['K']; 
        model['alpha']=message['alpha'];
        model['b']=message['b'];
        model['a']=message['a'];
        model['q']=message['q'];
        model['d']=message['d'];
        model['beta']=message['beta'];
        model['s']=message['s'];
        model['delta']=message['delta'];
        model['m']=message['m'];
        model.save();
        nutella.net.publish('population_model_update');
    });
    nutella.net.handle_requests('get_species_names', function(message, from){ 
        var nameList = []; console.log(model['species']);
        for (var i=0; i<11; i++) { 
            nameList.push(model['species'][i].printName);
        }
        console.log(nameList);
        return (nameList);
    });
    nutella.net.subscribe('set_species_names', function(message){
        for (var i=0; i<11; i++) {
            model['species'][i].printName = message[i];
        };
        model.save();
    });
});







