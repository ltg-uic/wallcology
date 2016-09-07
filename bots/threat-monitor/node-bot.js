
var NUTELLA = require('nutella_lib');

// Get configuration parameters and init nutella
var cliArgs = NUTELLA.parseArgs();
var componentId = NUTELLA.parseComponentId();
var nutella = NUTELLA.init(cliArgs.broker, cliArgs.app_id, cliArgs.run_id, componentId);


var predictions = nutella.persist.getMongoObjectStore('predictions');

predictions.load(function(){

    if (!predictions.hasOwnProperty('data')){
        predictions['data'] = []; predictions.save();
    };

    nutella.net.handle_requests('get_predictions',function(ecosystem, from) {
        return (predictions.data.filter(function(item){return item.ecosystem == ecosystem}));
    });

    nutella.net.handle_requests('update_prediction',function(prediction, from) {

        for (var i=0; i<predictions.data.length; i++)
            if (predictions.data[i].ecosystem == prediction.ecosystem &&
                predictions.data[i].threat == prediction.threat)
                { predictions.data[i] = prediction; predictions.save();}
        return;
    });

    nutella.net.subscribe('create_prediction',function(message, from) {

        predictions.data = [{ecosystem: message.ecosystem, timestamp: 0, threat: message.threat,  prediction:'', 
                            reasoning: message.notes, results:'', figures: [], conclusions:''}].concat(predictions.data);
        predictions.save();                    
        nutella.net.publish('refresh_predictions',message.ecosystem);                

    });

///////////////////////
    nutella.net.subscribe('delete_prediction',function(message, from) { 
        predictions.data = predictions.data.filter(function(item){return !(item.ecosystem == message.ecosystem && item.threat == message.threat);});
        predictions.save(); 
        nutella.net.publish('refresh_predictions',message.ecosystem);                
///////////////////////
///////////////////////
    });


});


