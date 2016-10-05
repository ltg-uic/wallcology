var NUTELLA = require('nutella_lib');

// Get configuration parameters and init nutella
var cliArgs = NUTELLA.parseArgs();
var componentId = NUTELLA.parseComponentId();
var nutella = NUTELLA.init(cliArgs.broker, cliArgs.app_id, cliArgs.run_id, componentId);
// Optionally you can set the resource Id
nutella.setResourceId('my_resource_id');


console.log("Foodweb bot");



var foodwebs = nutella.persist.getMongoObjectStore('foodwebs');

foodwebs.load(function(){

  if (!foodwebs.hasOwnProperty('data')){
    resetFoodwebs();
  };

nutella.net.subscribe('set_foodweb',{group: this.group, time: t, drawing: drawing})

nutella.net.subscribe('set_foodweb',function(message,from){
    foodweb.data.push(message);
    foodweb.save();
});


nutella.net.handle_requests('get_current_foodweb',function(group,from){
    var index = foodweb.data.length;
    while (--index >= 0){
        if foodweb.data[i].group == group) return (foodweb.data[i]);
    }
    return false;
})

nutella.net.handle_requests('get_previous_foodweb',function(message,from){
    var index = foodweb.data.length;
    var countBack = 0;
    while (--index >= 0){
        if foodweb.data[i].group == message.group) 
            {   if (countBack == message.index) return (foodweb.data[i]);
                countBack++;
            }
    }
    return false;
})




    /*this.nutella.net.request('get_num_of_saved_foodwebs', this.group, function( num, from ){
                return num;
            });*/

    this.saveDrawing = function( nodes, links ){
        //console.log("nodes: "+nodes.length+", links: "+links.length);
        var t = Timestamp(); 
        var message = "";
        var drawing;

        for(var i=0; i<nodes.length; i++){
            var o = nodes[i];
            var node = { name: o.name, x: o.x, y: o.y, active: o.active };
            message += "{ name: " + o.name + ", x: " + o.x +", y:"+o.y+", active: "+o.active+" }, ";
            //console.log("{ name: " + o.name + ", x: " + o.x +", y:"+o.y+", active: "+o.active+" }, ");
        }

        for(var j=0; j<links.length; j++){
            var c = links[j];
            var link = { name: c.name, source: c.obj1.name, destination: c.obj2.name, type: c.type };
            message += "{ name: " + c.name + ", source: " + c.obj1.name +", destination:"+c.obj2.name+", type: "+c.type+" }, ";
            //console.log("{ name: " + c.name + ", source: " + c.obj1.name +", destination:"+c.obj2.name+", type: "+c.type+" }, ");
        }
        
        message = message.slice(0, -2);
        drawing = { nodes: nodes, links: links };

        if ( this.mode == "deploy"){
            //this.nutella.net.publish('set_foodweb',['Group ;'+ this.group +' ;Time ;'+t+' ;' + "FOODWEB_SAVE" +' ;'+ drawing]);
            this.nutella.net.publish('set_foodweb',{group: this.group, time: t, drawing: drawing});
        } else {            
            console.log('Group ;'+ this.group +' ;time ;'+t+' ;' + "FOODWEB_SAVE" +' ;'+ message);
        }
    }
    this.getCurrentDrawing = function(){
        //var t = Timestamp(); 
        var drawing;
        if ( this.mode == "deploy"){
            //this.nutella.net.publish('set_foodweb',['Group ;'+ this.group +' ;Time ;'+t+' ;' + "FOODWEB_SAVE" +' ;'+ message]);
            //earliest = 0, current = n;
            this.nutella.net.request('get_current_foodweb', this.group, function(drawing,from){
                return drawing;
            });
        } else {            
            console.log('Group ;'+ this.group +' ;time ;'+t+' ;' + "FOODWEB_RETRIEVE" +' ;');
        }
    }
    this.getPreviousDrawing = function(){
        //var t = Timestamp(); 
        var drawing;
        if ( this.mode == "deploy"){
            //this.nutella.net.publish('set_foodweb',['Group ;'+ this.group +' ;Time ;'+t+' ;' + "FOODWEB_SAVE" +' ;'+ message]);
            //earliest = 0, current = n;
            this.nutella.net.request('get_saved_foodweb',{group:this.group, index: this.index}, function(drawing,from){
                return drawing;
            });
        } else {            
            console.log('Group ;'+ this.group +' ;time ;'+t+' ;' + "FOODWEB_RETRIEVE" +' ;');
        }
    }



  function resetFoodwebs() {
    foodwebs.data = [];
    foodwebs.save();
  };

// Some examples to give you ideas...
// You can do things such as:



// // 1. Subscribing to a channel
// nutella.net.subscribe('demo_channel', function(message, from) {
//     // Your code to handle messages received on this channel goes here
// });


// // 2. Publish a message to a channel
// nutella.net.publish('demo_channel', 'demo_message');

	
// // 2a. The cool thing is that the message can be any object
// nutella.net.publish('demo_channel', {a: 'proper', key: 'value'});


// // 3. Make asynchronous requests on a certain channel
// nutella.net.request( 'demo_channel', 'my_request', function(response){
//     // Your code to handle the response to this request goes here
// });


// // 4. Handle requests from other components
// nutella.net.handle_requests( 'demo_channel', function(message, from) {
//     // Your code to handle each request here
//     // Anything this function returns (String, Integer, Object...) is going to be sent as the response
//     var response = 'a simple string'
//     // response = 12345
//     // response = {}
//     // response = {my:'json'}
//     return response;
// });

