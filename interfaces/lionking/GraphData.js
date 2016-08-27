function GraphData() {
      /*
	this.baseline = [Math.random() * 20, Math.random() * 20, Math.random() * 20, Math.random() * 20, Math.random() * 20,
             Math.random() * 20, Math.random() * 20, Math.random() * 20, Math.random() * 20, Math.random() * 20, 
             Math.random() * 20, Math.random() * 20, Math.random() * 20, Math.random() * 20, Math.random() * 20, 
             Math.random() * 20, Math.random() * 20, Math.random() * 20, Math.random() * 20, Math.random() * 20, 
             Math.random() * 20, Math.random() * 20, Math.random() * 20, Math.random() * 20, Math.random() * 20, 
             Math.random() * 20, Math.random() * 20, Math.random() * 20, Math.random() * 20, Math.random() * 20, 
             Math.random() * 20, Math.random() * 20, Math.random() * 20, Math.random() * 20, Math.random() * 20, 
             Math.random() * 20, Math.random() * 20, Math.random() * 20, Math.random() * 20, Math.random() * 20, 
             Math.random() * 20, Math.random() * 20, Math.random() * 20, Math.random() * 20, Math.random() * 20, 
             Math.random() * 20, Math.random() * 20, Math.random() * 20, Math.random() * 20, Math.random() * 20, 
             Math.random() * 20, Math.random() * 20, Math.random() * 20, Math.random() * 20, Math.random() * 20, 
             Math.random() * 20, Math.random() * 20, Math.random() * 20, Math.random() * 20, Math.random() * 20, 
             Math.random() * 20, Math.random() * 20, Math.random() * 20, Math.random() * 20, Math.random() * 20,
             Math.random() * 20, Math.random() * 20, Math.random() * 20, Math.random() * 20, Math.random() * 20,
             Math.random() * 20, Math.random() * 20, Math.random() * 20, Math.random() * 20, Math.random() * 20,
             Math.random() * 20, Math.random() * 20, Math.random() * 20, Math.random() * 20, Math.random() * 20,
             Math.random() * 20, Math.random() * 20, Math.random() * 20, Math.random() * 20, Math.random() * 20,
             Math.random() * 20, Math.random() * 20, Math.random() * 20, Math.random() * 20, Math.random() * 20,
             Math.random() * 20, Math.random() * 20, Math.random() * 20, Math.random() * 20, Math.random() * 20,
             Math.random() * 20, Math.random() * 20, Math.random() * 20, Math.random() * 20, Math.random() * 20, 
             Math.random() * 20, Math.random() * 20, Math.random() * 20, Math.random() * 20, Math.random() * 20 
             ];
      */
       
       this.random = generateData("random");
       this.baseline = generateData("baseline");
       //this.increase = generateData("increase");
       this.increase = generateSinWave(0, -90, 0.75);
       this.laggedincrease = generateSinWave(10, -90, 0.75);
       this.decrease = generateSinWave(0, 90, 0.25);
       this.laggeddecrease = generateSinWave(10, 90, 0.25);

       function generateSinWave( lag, phase, dy ){
            //Vp (V) Peak Voltage = 1    
            //fo (Hz) Sine frequency = 1000 
            //Phase (deg) Time Shift = 0
            //Vmax (V) for plot = 2
            //Tmax (s) for plot = 0.001
            //Npoints for plot = 101
            //y[i] = Vp*Math.sin(2*3.1415*fo*x[i] + phase*3.1415/180)
            var Vp = 0.25;
            var fo = 1000;
            //var phase = -90;
            var arr = [];
            for( var k=0; k<lag; k++ ){
                  arr.push( 0.5 );
            }
            for ( var i=0; i<67; i++){
                  var y = Vp*Math.sin(2*3.1415*fo*((i+1)*0.5) + phase *3.1415/180) + dy;
                  arr.push(y);
            }
            for( var j=0; j<100; j++ ){
                  arr.push( 0.5 );
            }
            return arr;
       }

       function generateData(values){
            var v = values;
            var num;
            var arr = [];
            if( v == "random" ){
                  for( var i=0; i<100; i++ ){
                        arr.push( Math.random() );
                  }
            } else {
                  switch (v){
                        case "baseline":
                              num = 0.5;
                              break;
                        case "increase":
                              num = 1;
                              break;
                        default:
                              num = 0.1;
                  }
                  for( var i=0; i<100; i++ ){
                        arr.push( num );
                  }
            } 
            return arr;
       }
}
