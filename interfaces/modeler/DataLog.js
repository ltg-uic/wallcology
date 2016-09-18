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
			this.destination = 'add_to_lionking_log';
			break;
		default:
			this.destination = 'add_to_lionking_log';
	}

	this.save = function(type,message){
		var t = Timestamp(); 
		this.unsentData.push( ['Group ;'+ this.group +' ;time ;'+t+' ;' + type +' ;'+ message] );
		if ( this.mode == "deploy"){
		    this.nutella.net.publish(this.destination,['Group ;'+ this.group +' ;Time ;'+t+' ;' + type +' ;'+ message]);
		} else {            
			console.log('Group ;'+ this.group +' ;time ;'+t+' ;' + type +' ;'+ message);
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