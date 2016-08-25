
var NUTELLA = require('nutella_lib');

// Get configuration parameters and init nutella
var cliArgs = NUTELLA.parseArgs();
var componentId = NUTELLA.parseComponentId();
var nutella = NUTELLA.init(cliArgs.broker, cliArgs.app_id, cliArgs.run_id, componentId);


var experiments = nutella.persist.getMongoObjectStore('experiments');

experiments.load(function(){

    if (!experiments.hasOwnProperty('data')){
        experiments['data'] = []; experiments.save();
    };

    nutella.net.handle_requests('get_experiments',function(ecosystem, from) {
        return (experiments.data.filter(function(item){return item.ecosystem == ecosystem}));
    });

    nutella.net.handle_requests('update_experiment',function(experiment, from) {

        for (var i=0; i<experiments.data.length; i++)
            if (experiments.data[i].ecosystem == experiment.ecosystem &&
                experiments.data[i].question == experiment.question)
                { experiments.data[i] = experiment; experiments.save();}
        return;
    });

    nutella.net.subscribe('create_experiment',function(message, from) {

        experiments.data = [{ecosystem: message.ecosystem, timestamp: 0, question: message.question,  manipulations:'', 
                            reasoning: message.notes, results:'', figures: [], conclusions:''}].concat(experiments.data);
        experiments.save();                    

    });

});


