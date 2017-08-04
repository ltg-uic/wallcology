
// nutella install basic-node-bot fw-bot
// nutella dependencies
// nutella start


var NUTELLA = require('nutella_lib');

// Get configuration parameters and init nutella
var cliArgs = NUTELLA.parseArgs();
var componentId = NUTELLA.parseComponentId();
var nutella = NUTELLA.init(cliArgs.broker, cliArgs.app_id, cliArgs.run_id, componentId);
// Optionally you can set the resource Id
nutella.setResourceId('my_resource_id');


console.log("fw-bot launched");

var mfw = nutella.persist.getMongoObjectStore('mfw');
var fw = nutella.persist.getMongoObjectStore('fw');
var claims = nutella.persist.getMongoObjectStore('claims');

mfw.load(function(){
    if (!mfw.hasOwnProperty('data')){
        mfw.data = [{}]; mfw.save(); 
    };
    fw.load(function(){
      if (!fw.hasOwnProperty('data')){
        fw.data = []; fw.save(); 
      };
      claims.load(function(){
        if (!claims.hasOwnProperty('data')){
            claims.data = []; claims.save();
        };

        // master food web handlers (archived)

        nutella.net.handle_requests('get_mfw', function(message,from){
            return mfw.data[mfw.data.length-1];
        });

        nutella.net.subscribe('save_mfw', function(message,from){
            mfw.data.push(message); mfw.save();
        });

        // group and individual food web handlers (not archived)

        nutella.net.handle_requests('get_fw', function(message,from){
            var f = fw.data.filter(function(item){
                return (item.portal == message.portal && item.instance == message.instance)
            });
            if (f.length == 0) return {};
            else return f[0].drawing;
        });

        nutella.net.subscribe('save_fw', function(message,from){
            for (var i=0; i<fw.data.length; i++)
                if (fw.data[i].portal == message.portal && 
                    fw.data[i].instance == message.instance) {
                        fw.data[i].drawing = message.drawing;
                        fw.save(); return;
                };
            fw.data.push({portal: message.portal, instance: message.instance, drawing: message.drawing});
            fw.save();
        });

        // group and individual food web handlers (not archived)

        nutella.net.handle_requests('get_claims', function(message,from){
            return claims.data;
        })

        nutella.net.subscribe('save_claim',function(message,from){
            for (var i=0; i<claims.data.length; i++){
                if (claims.data[i].instance == message.instance &&
                    claims.data[i].source == message.source &&
                    claims.data[i].destination == message.destination) {
                        claims.data[i] = message;
                        claims.save();
                        nutella.net.publish('replace_claim',message)
                        return;
                };
            };
            claims.data.push(message);
            claims.save();
            nutella.net.publish('new_claim',message);
        });

        nutella.net.subscribe('withdraw_claim',function(message,from){
            for (var i=0; i<claims.data.length; i++){
                if (claims.data[i].instance == message.instance &&
                    claims.data[i].source == message.source &&
                    claims.data[i].destination == message.destination) {
                        claims.data.splice(i,1);
                        claims.save();
                        return;
                };
            };
        });

        nutella.net.handle_requests('get_mfw_and_claims',function (message,from) {
            return {mfw: mfw.data[mfw.data.length-1], claims: claims.data};
        });


  // { instance:1, 
  // source: 7, destination:9, 
  // relationship: "eats", reasoning: "ABC", 
  // figure1: "none", figure2: "none", figure3: "none"}

    });
  });
});


