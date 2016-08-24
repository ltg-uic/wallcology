
var NUTELLA = require('nutella_lib');

// Get configuration parameters and init nutella
var cliArgs = NUTELLA.parseArgs();
var componentId = NUTELLA.parseComponentId();
var nutella = NUTELLA.init(cliArgs.broker, cliArgs.app_id, cliArgs.run_id, componentId);
// Optionally you can set the resource Id
nutella.setResourceId('my_resource_id');


    // "_id" : "default/questions",
    // "data" : [ 
    //     {
    //         "question" : "Does Fleebus eat Gronko?",
    //     "status" : "open", /+ or "resolved" or "under investigation" */
    //         "answer" : "",
    //         "confidence" : "",
    //         "notes" : "This one is hard! We've tried a bunch of stuff.",
    //         "owner" : ""
    //     },
 

var questions = nutella.persist.getMongoObjectStore('questions');

questions.load(function(){
    if (!questions.hasOwnProperty('data')) {questions['data']=[]; questions.save();}
    nutella.net.handle_requests('get_questions', function (message, from){
        return questions.data;
    });
    nutella.net.handle_requests('set_questions', function (message, from){
        questions.data=message;
        questions.save();
        return;
    });
});
