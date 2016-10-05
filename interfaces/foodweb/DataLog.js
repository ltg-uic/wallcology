function DataLog( n, app, group, mode ){
	this.nutella = n;
	this.app = app;
	this.group = group;
	this.mode = mode;
	this.destination;
	this.sentData = [];
	this.unsentData = [];

	switch(app){
		case "lion king":
			this.destination = 'add_to_lionking_log';
			break;
		case "modeler":
			this.destination = 'add_to_lionking_log';
			break;
		case "foodweb":
			this.destination = 'add_to_foodweb_log';
			break;
		default:
			this.destination = 'add_to_lionking_log';
	}

	this.save = function(type,message){
		var t = Timestamp(); 
		//this.unsentData.push( ['Group ;'+ this.group +' ;time ;'+t+' ;' + type +' ;'+ message] );
		if ( this.mode == "deploy"){
		    this.nutella.net.publish(this.destination,['Group ;'+ this.group +' ;Time ;'+t+' ;' + type +' ;'+ message]);
		} else {            
			console.log('Group ;'+ this.group +' ;time ;'+t+' ;' + type +' ;'+ message);
		}
	}
	this.getSavedFoodwebNum = function(){
		if ( this.mode == "deploy"){
			this.nutella.net.request('get_num_of_saved_foodwebs', this.group, function( num, from ){
		    	return num;
			});
		} else {
			return 0;
		}
	}
	this.saveDrawing = function( drawing, message ){
		var t = Timestamp(); 
		if ( this.mode == "deploy"){
		    //this.nutella.net.publish('set_foodweb',['Group ;'+ this.group +' ;Time ;'+t+' ;' + "FOODWEB_SAVE" +' ;'+ drawing]);
		    this.nutella.net.publish('set_foodweb',{group: this.group, time: t, drawing: drawing});
		} else {            
			console.log('Group ;'+ this.group +' ;time ;'+t+' ;' + "FOODWEB_SAVE" +' ;'+ message);
		}
	}
	this.getCurrentDrawing = function(){
		var t = Timestamp(); 
		var drawing;
		if ( this.mode == "deploy"){
		    //this.nutella.net.publish('set_foodweb',['Group ;'+ this.group +' ;Time ;'+t+' ;' + "FOODWEB_SAVE" +' ;'+ message]);
		    //earliest = 0, current = n;
		    this.nutella.net.request('get_current_foodweb', this.group, function(drawing,from){
		    	return drawing;
			});
		} else {
			console.log('Group ;'+ this.group +' ;time ;'+t+' ;' + "FOODWEB_RETRIEVE_CURRENT" +' ;');
			return { nodes:{},links:{} };
		}
	}
	this.getPreviousDrawing = function(){
		var t = Timestamp(); 
		var drawing;
		if ( this.mode == "deploy"){
		    //this.nutella.net.publish('set_foodweb',['Group ;'+ this.group +' ;Time ;'+t+' ;' + "FOODWEB_SAVE" +' ;'+ message]);
		    //earliest = 0, current = n;
		    this.nutella.net.request('get_saved_foodweb',{group:this.group, index: this.index}, function(drawing,from){
		    	return drawing;
			});
		} else {      
			console.log('Group ;'+ this.group +' ;time ;'+t+' ;' + "FOODWEB_RETRIEVE_SAVED" +' ;');
			return { nodes:{},links:{} };
		}
	}	
	/*
	this.send = function(){
		for (var i=0;i<unsentData.length;i++){
			var d = unsentData[i];
			if ( this.mode == "deploy"){
		    	nutella.net.publish( this.destination, d );
			} else {
				console.log(d);
			}
			sentData.push(unsentData);
		}
		unsentData = [];
	}*/
}