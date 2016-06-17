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


//utility functions

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


