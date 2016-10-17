function DataLog( n, app, group, mode ){
	this.nutella = n;
	this.app = app;
	this.group = group;
	this.mode = mode;
	this.destination;
	this.sentData = [];
	this.unsentData = [];
	this.index;

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
		if ( this.mode == "deploy"){
		    this.nutella.net.publish(this.destination,['Group ;'+ this.group +' ;Time ;'+t+' ;' + type +' ;'+ message]);
		} else {            
			console.log('Group ;'+ this.group +' ;Time ;'+t+' ;' + type +' ;'+ message);
		}
	}
	/*this.getSavedFoodwebNum = function(){
		if ( this.mode == "deploy"){
			this.nutella.net.request('get_num_of_saved_foodwebs', this.group, function( num, from ){
		    	return num;
			});
		} else {
			return 0;
		}
	}*/
	this.saveDrawing = function( drawing, message ){
		var t = Timestamp(); 
		if ( this.mode == "deploy"){
		    this.nutella.net.publish('set_foodweb',{group: this.group, time: t, drawing: drawing});
		    this.nutella.net.publish(this.destination,['Group ;'+ this.group +' ;Time ;'+t+' ;' + type +' ;'+ message]);
		} else {            
			console.log('Group ;'+ this.group +' ;Time ;'+t+' ;' + "FOODWEB_SAVE" +' ;'+ message);
		}
	}
	/*
	this.getCurrentDrawing = function(){
		var t = Timestamp(); 
		var drawing;
		if ( this.mode == "deploy"){
		    //earliest = 0, current = n;
		    this.nutella.net.request('get_current_foodweb', this.group, function(drawing,from){
		    	//return drawing;

			});
		} else {
			console.log('Group ;'+ this.group +' ;Time ;'+t+' ;' + "FOODWEB_RETRIEVE_CURRENT");
			
			//return {};
		}
	}
	this.getPreviousDrawing = function(){
		var t = Timestamp(); 
		var drawing;
		if ( this.mode == "deploy"){
		    //earliest = 0, current = n;
		    this.nutella.net.request('get_saved_foodweb',{group:this.group, index: this.index}, function(drawing,from){
		    	return drawing;
			});
		} else {      
			console.log('Group ;'+ this.group +' ;Time ;'+t+' ;' + "FOODWEB_RETRIEVE_SAVED"+' ;Index ;'+this.index);
			//return {};
			return { nodes:[{name:"species_00", x:100, y:100, active:true},{name:"species_01", x:200, y:200, active: true}]};
		}
	}*/	
}