function DataLog( n, app, portal, instance, mode ){
	this.nutella = n;
	this.app = app;
	this.destination;
	this.portalType = portal;		//query_parameters.TYPE
	this.instance = instance;		//query_parameters.INSTANCE
	this.mode = mode;
	this.destination = 'add_to_lionking_log';
	this.sentData = [];
	this.unsentData = [];

	/*switch(app){
		case "lion king":
			
			break;
		case "modeler":
			this.destination = 'add_to_lionking_log';
			break;
		case "foodweb":
			this.destination = 'add_to_lionking_log';
			break;

		default:
			this.destination = 'add_to_lionking_log';
	}*/

	console.log("FOODWEB_VIEWER: "+this.instance+", "+this.portalType);
	this.save = function(type,message){
		var t = Timestamp(); 
		this.unsentData.push( ['Type ;'+ this.portalType +' ;Instance ;'+this.instance+' ;Time ;'+t+' ;' + type +' ;'+ message] );
		if ( this.mode == "deploy"){
		    this.nutella.net.publish(this.destination,['Type ;'+ this.portalType +' ;Instance ;'+this.instance+' ;Time ;'+t+' ;' + type +' ;'+ message]);
		} else {            
			console.log('Type ;'+ this.portalType +' ;Instance ;'+instance+' ;time ;'+t+' ;' + type +' ;'+ message);
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
	}/*
	this.save = function(type,message){
		var t = Timestamp(); 
		if ( mode == "deploy"){
		    this.nutella.net.publish(this.destination,['Time ;'+t+' ;' + type +' ;'+ message]);
		} else {            
			console.log('Time ;'+t+' ;' + type +' ;'+ message);
		}
	}
	this.saveDrawing = function( drawing, message, imgBase64 ){
		var t = Timestamp(); 
		if ( mode == "deploy"){
		    this.nutella.net.publish('save_mfw',{time: t, drawing: drawing});
		    //this.nutella.net.publish(this.destination,['Group ;'+ group +' ;Time ;'+t+' ;FOODWEB_IMAGE ;'+ imgBase64 ]);
		} else {            
			console.log('Time ;'+t+' ;FOODWEB_IMAGE');
			//console.log('Group ;'+ group +' ;Time ;'+t+' ;FOODWEB_IMAGE ;'+ imgBase64 );
		}
	}*/
}