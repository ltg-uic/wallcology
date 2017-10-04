
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

console.log("fw-editor-bot launched");

var fwe = nutella.persist.getMongoObjectStore('fwe');

fwe.load(function(){
    //fw.load(function(){
    if (!fwe.hasOwnProperty('data')){
        fwe.data = []; fwe.save(); 
    };
      
    nutella.net.handle_requests('get_fwe', function(message,from){
        console.log("get fwe");
        var f = fwe.data.filter(function(item){
            return (item.portal == message.portal && item.instance == message.instance)
        });
        //console.log("f.length: "+f.length);
        //console.log("f[0]: "+f[0]+", f[0].drawing: "+f[0].drawing);
        if (f.length == 0) return {};
        else return f[0].drawing;
    });

    nutella.net.subscribe('save_fwe', function(message,from){
        console.log("save fwe");
        for (var i=0; i<fwe.data.length; i++)
            if (fwe.data[i].portal == message.portal && 
                fwe.data[i].instance == message.instance) {
                    fwe.data[i].drawing = message.drawing;
                    fwe.save(); return;
            };
        fwe.data.push({portal: message.portal, instance: message.instance, drawing: message.drawing});
        fwe.save();
    });
});