function DataLog( n, app, portal, instance, mode ){
	this.nutella = n;
	this.app = app;
	//this.group = group;
	this.portal = portal;
	this.instance = instance;
	this.mode = mode;
	this.destination;
	this.sentData = [];
	this.unsentData = [];

	switch(app){
		case "lion king":
			this.destination = 'add_to_lionking_log';
			break;
		case "modeler":
			this.destination = 'add_to_lionking_log';//'add_to_modeler_log';
			break;
		case "foodweb":
			this.destination = 'add_to_lionking_log';//'add_to_foodweb_log';
			break;
		default:
			this.destination = 'add_to_lionking_log';
	}

	this.save = function(type,message){
		var t = Timestamp(); 
		this.unsentData.push( ['Portal ;'+ this.portal +' ;Instance ;'+this.instance+' ;Time ;'+t+' ;' + type +' ;'+ message] );
		if ( this.mode == "deploy"){
		    this.nutella.net.publish(this.destination,['Portal ;'+ this.portal +' ;Instance ;'+this.instance+' ;Time ;'+t+' ;' + type +' ;'+ message]);
		} else {            
			console.log('Portal ;'+ this.portal +' ;Instance ;'+instance+' ;time ;'+t+' ;' + type +' ;'+ message);
		}
	}
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
	}
}