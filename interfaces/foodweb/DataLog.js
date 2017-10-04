//FOOD WEB EDITOR / DRAWING TOOL
function DataLog( n, app, portal, instance, mode ){
	this.nutella = n;
	this.app = app;
	this.destination;

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
		if ( mode == "deploy"){
		    this.nutella.net.publish(this.destination,['Portal ;'+ portal +' ;Instance ;'+instance+' ;Time ;'+t+' ;' + type +' ;'+ message]);
		} else {            
			console.log('Portal ;'+ portal +' ;Instance ;'+instance+' ;Time ;'+t+' ;' + type +' ;'+ message);
		}
	}
	this.saveDrawing = function( drawing, message){//, imgBase64 ){
		var t = Timestamp(); 
		if ( mode == "deploy"){
		    this.nutella.net.publish('save_fwe',{portal: portal, instance: instance, time: t, drawing: drawing});
		    this.nutella.net.publish(this.destination,['Portal ;'+ portal + ' ;Instance: ' + instance +' ;Time ;'+t+' ;Drawing Saved']);
		} else {            
			console.log('Group ;'+ group +' ;Time ;'+t); //+' ;FOODWEB_IMAGE ;'+ imgBase64 );
		}
	}
}