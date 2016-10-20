
var NUTELLA = require('nutella_lib');

// Get configuration parameters and init nutella
var cliArgs = NUTELLA.parseArgs();
var componentId = NUTELLA.parseComponentId();
var nutella = NUTELLA.init(cliArgs.broker, cliArgs.app_id, cliArgs.run_id, componentId);


var experiments = nutella.persist.getMongoObjectStore('experiments');

experiments.load(function(){

    if (!experiments.hasOwnProperty('data')){
        experiments['data'] = [[],[],[],[],[]]; experiments.save();       
    };

    nutella.net.handle_requests('get_experiments',function(group, from) { console.log(group);
        var response = []; console.log ( group + ' ' + experiments.data);
        for (var q=0; q < experiments.data[group].length; q++){
            response[q] = experiments.data[group][q][experiments.data[group][q].length-1]; console.log(response);}
        return(response); 
    });

    nutella.net.handle_requests('update_experiment',function(exp, from) {
        var experiment = exp;
        var d = new Date();
        experiment.timestamp = d.getTime();
        //
        // find the matching experiment
        // 
        group=experiment.ecosystem;
        for (var q=0; q<experiments.data[group].length; q++)
            if (experiments.data[group][q][0].question == experiment.question){
                experiments.data[group][q].push(experiment); experiments.save(); return;
        }
        return;
    });

 
    nutella.net.subscribe('create_experiment',function(message, from) {
        var d = new Date();
        var initialExperiment = {ecosystem: message.ecosystem, timestamp: d.getTime(), question: message.question,  manipulations:'', 
                            reasoning: message.notes, results:'', figures: [], conclusions:''};

        experiments.data[message.ecosystem].push([initialExperiment]);
        experiments.save();
        nutella.net.publish('refresh_experiments',message.ecosystem);                

    });

///////////////////////
    nutella.net.subscribe('delete_experiment',function(message, from) { 
        var g = message.ecosystem;
        for (q=0; q < experiments.data[g].length; q++)
            if (message.question == experiments.data[g][q][0].question) {
                experiments.data[g].splice(q,1); return;
            }
        return;

///////////////////////
///////////////////////
    });



});


