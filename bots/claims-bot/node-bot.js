
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
        accounts['data'] = [];
        for (var s=0; s<11; s++) {
            accounts.data[s] = [];
            for (var g=0; g<5; g++) {
                accounts.data[s][g]=[];
                for (var c=0; c<40; c++) {
                   accounts.data[s][g][c] = [];
                   accounts.data[s][g][c][0] = {timestamp:0, synced:true, claim: "unsure",observations: "We saw...",reasoning: "We think...",experiment: "", images: ['blank.png','blank.png','blank.png','blank.png','blank.png','blank.png']};
                }
            }
        }
        accounts.save();
    }
    

    // nutella.net.handle_requests('mostRecentAccounts', function (group, from){ 
    //     var response = []; 
        
    //     for (var s=0; s<11; s++) {
    //         var temp = accounts.data[s][group].length-1;
    //         response[s] = accounts.data[s][group][temp];
    //     }
    //     return(response); 
    // });

    nutella.net.handle_requests('mostRecentAccounts', function (group, from){ 
        var response = []; 
        for (var s=0; s<11; s++) {
            response[s]=[];
            for (var c=0; c<40; c++) {
                var index = accounts.data[s][group][c].length-1;
                response[s][c] = accounts.data[s][group][c][index];
            }
        }
        return(response); 
    });


    nutella.net.handle_requests('latest_class_account', function (s, from){ 
        var response = []; 
        for (var g=0; g<5; g++) {
            response[g]=[];
            for (var c=0; c<40; c++) {
                var index = accounts.data[s][g][c].length-1;
                while (!accounts.data[s][g][c][index].synced)index--;
                response[g][c] = accounts.data[s][g][c][index];
            }
        }
        return(response); 
    });


    nutella.net.subscribe('sync', function (message, from){ 
         for (var c=0; c<40; c++) {
            var index = accounts.data[message.species][message.group][c].length-1;// if(i==0)console.log(index);
            accounts.data[message.species][message.group][c][index].synced = true;
        };
        accounts.save();
        nutella.net.publish('new_account',message.species);           
    });


    nutella.net.handle_requests('updateAccount', function (message, from){   

        var index = accounts.data[message.species][message.group][message.claim].length; console.log(index);
        var images = [];
        for (var i =0; i<6; i++) images[i] = message.account.images[i];
        accounts.data[message.species][message.group][message.claim][index]=
            {
                timestamp: message.account.timestamp,
                synced: message.account.synced,
                observations: message.account.observations,
                reasoning: message.account.reasoning,
                experiment: message.account.experiment,
                claim: message.account.claim,
                images: images
            };
        accounts.save();
        return;
    });
});