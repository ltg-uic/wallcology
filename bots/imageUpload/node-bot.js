var fs = require('fs'),
    NUTELLA = require('nutella_lib');

// Get configuration parameters and init nutella
var cliArgs = NUTELLA.parseArgs();
var componentId = NUTELLA.parseComponentId();
var nutella = NUTELLA.init(cliArgs.broker, cliArgs.app_id, cliArgs.run_id, componentId);
// Optionally you can set the resource Id
nutella.setResourceId('my_resource_id');

nutella.net.subscribe('image-manager',function(message,from) {
    console.log("message:", message, "from:", from);
    var fileName = message.fileName;
    var base64String = message.data;


    fs.readFile("boobs-lead-2.jpg", 'binary', function(err, orig_data){
        fs.writeFile('boobs-orig.jpg', orig_data, function(err) {})
        var base64Image = orig_data.toString('base64');
        var decodedImage = new Buffer(base64Image, 'base64');

        (base64String == base64Image) ? console.log("== They are the same!") : console.log(" == They are not the same!");
        (base64String === base64Image) ? console.log("=== They are the same!") : console.log(" === They are not the same!");

        fs.writeFile('boobs-decoded.jpg', decodedImage, function(err){})
    })


    // var decodedImage = new Buffer(base64String, 'base64');
    // fs.writeFile(fileName, decodedImage, function(err, data) {
    //     if (err) console.error(err);
    //     else console.log(data);
    // });

    // nutella.net.bin.uploadFile(decodedImage, function(url) {
    //     console.log("Uploaded " + fileName + ". URL: " + url);
    // });

});