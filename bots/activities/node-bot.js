
var NUTELLA = require('nutella_lib');

// Get configuration parameters and init nutella
var cliArgs = NUTELLA.parseArgs();
var componentId = NUTELLA.parseComponentId();
var nutella = NUTELLA.init(cliArgs.broker, cliArgs.app_id, cliArgs.run_id, componentId);
// Optionally you can set the resource Id
nutella.setResourceId('my_resource_id');


var currentActivity;

var activity = nutella.persist.getMongoObjectStore('currentActivity');

activity.load(function(){
    activity.currentActivity;
    nutella.net.handle_requests('currentActivity', function (message, from){
        return activity.currentActivity;
    });
    var roster = nutella.persist.getMongoObjectStore('roster');
    roster.load(function(){
        nutella.net.handle_requests('roster',function (message, from){
            return(roster.logins);          
        });
    });
    var activities = nutella.persist.getMongoObjectStore('activities');
    activities.load(function(){
        nutella.net.handle_requests('channel_list', function (message, from){ console.log(message);

            for (var i=0; i<activities.data.length; i++) {
                if (activities.data[i].name == message.activity) { console.log ('a ' + activities.data[i].name + '  ' + message.activity);
                    for (var j=0; j<activities.data[i].lineup.length; j++) {
                        console.log('b ' + activities.data[i].lineup[j].type+ '  ' +  message.type);
                        if (activities.data[i].lineup[j].type == message.type) { 
                            console.log('c ' + activities.data[i].lineup[j].channels); 
                            return (activities.data[i].lineup[j].channels);
                        }; 
                    };  
                };       
            };
        });
    });
    nutella.net.subscribe('change_activity', function(a){
        activity.currentActivity = a;
        activity.save();
        nutella.net.publish('activity_update');
    });
});

