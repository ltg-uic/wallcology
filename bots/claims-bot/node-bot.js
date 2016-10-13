
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
 

var accounts = nutella.persist.getMongoObjectStore('accounts');


accounts.load(function(){
    if (!accounts.hasOwnProperty('data')) {
        var dummyClaims = [];
        for (var i=0; i<40; i++) 
            dummyClaims[i] = {claim: "unsure",observations: "We saw...",reasoning: "We think...",experiment: "", images: ['blank.png','blank.png','blank.png','blank.png','blank.png','blank.png']};
        accounts['data'] = [];
        for (var s=0; s<11; s++) {
            accounts.data[s] = [];
            for (var g=0; g<5; g++) accounts.data[s][g] = [{timestamp:0, synced: true, claims: dummyClaims}];
        }
        accounts.save();
    };

    nutella.net.handle_requests('mostRecentAccounts', function (group, from){ 
        var response = [];

        for (s=0; s<11; s++) response[s] = accounts.data[s][group][accounts.data[s][group].length-1];
            if (s<3) console.log (accounts.data[s][group][accounts.data[s][group].length-1]);
        return(response); 
    });

        nutella.net.handle_requests('latest_class_account', function (s, from){ 
        var response = [];

        for (group=0; group<5; group++) {
            var counter = accounts.data[s][group].length-1;
            while (!accounts.data[s][group][counter].synced) counter--;
            response[group] = accounts.data[s][group][counter];
        }
        return(response); 
    });


    nutella.net.subscribe('newAccount', function (message, from){
        accounts.data[message.species][message.group].push(message.account);
        accounts.save();
    });
});