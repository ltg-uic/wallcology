var NUTELLA = require('nutella_lib');

// bot name: model

var cliArgs = NUTELLA.parseArgs();
var componentId = NUTELLA.parseComponentId();
var nutella = NUTELLA.init(cliArgs.broker, cliArgs.app_id, cliArgs.run_id, componentId);



var model = nutella.persist.getMongoObjectStore('model');
model.load(function(){ 
    if (!model.hasOwnProperty('data')){
        model['data'] = JSON.parse('{ \
        "community" : { \
            "resources" : [  \
                4,  \
                10,  \
                9,  \
                5 \
            ], \
            "herbivores" : [  \
                6,  \
                2,  \
                0,  \
                7 \
            ], \
            "predators" : [  \
                1,  \
                8,  \
                3 \
            ] \
        }, \
        "species" : [  \
            { \
                "index" : 0, \
                "printName" : "1", \
                "trophicLevel" : "herbivore", \
                "habitat" : "brick", \
                "temperature" : "low", \
                "resistance" : "no" \
            },  \
            { \
                "index" : 1, \
                "printName" : "2", \
                "trophicLevel" : "predator", \
                "habitat" : "wood", \
                "temperature" : "low", \
                "resistance" : "no" \
            },  \
            { \
                "index" : 2, \
                "printName" : "3", \
                "trophicLevel" : "herbivore", \
                "habitat" : "generalist", \
                "temperature" : "generalist", \
                "resistance" : "no" \
            },  \
            { \
                "index" : 3, \
                "printName" : "4", \
                "trophicLevel" : "predator", \
                "habitat" : "brick", \
                "temperature" : "low", \
                "resistance" : "no" \
            },  \
            { \
                "index" : 4, \
                "printName" : "5", \
                "trophicLevel" : "resource", \
                "habitat" : "wood", \
                "temperature" : "generalist", \
                "resistance" : "no" \
            },  \
            { \
                "index" : 5, \
                "printName" : "6", \
                "trophicLevel" : "resource", \
                "habitat" : "brick", \
                "temperature" : "low", \
                "resistance" : "no" \
            },  \
            { \
                "index" : 6, \
                "printName" : "7", \
                "trophicLevel" : "herbivore", \
                "habitat" : "wood", \
                "temperature" : "generalist", \
                "resistance" : "no" \
            },  \
            { \
                "index" : 7, \
                "printName" : "8", \
                "trophicLevel" : "herbivore", \
                "habitat" : "generalist", \
                "temperature" : "generalist", \
                "resistance" : "yes" \
            },  \
            { \
                "index" : 8, \
                "printName" : "9", \
                "trophicLevel" : "predator", \
                "habitat" : "generalist", \
                "temperature" : "generalist", \
                "resistance" : "no" \
            },  \
            { \
                "index" : 9, \
                "printName" : "10", \
                "trophicLevel" : "resource", \
                "habitat" : "brick", \
                "temperature" : "generalist", \
                "resistance" : "yes" \
            },  \
            { \
                "index" : 10, \
                "printName" : "11", \
                "trophicLevel" : "resource", \
                "habitat" : "generalist", \
                "temperature" : "generalist", \
                "resistance" : "no" \
            } \
        ], \
        "initialPopulation" : [  \
            1,  \
            0.5000000000000000,  \
            1,  \
            0.5000000000000000,  \
            10,  \
            10,  \
            1,  \
            1,  \
            0.5000000000000000,  \
            10,  \
            10 \
        ], \
        "minimumPopulation" : [  \
            0.1,  \
            0.1,  \
            0.1,  \
            0.1,  \
            1,  \
            1,  \
            0.1,  \
            0.1,  \
            0.1,  \
            1,  \
            1 \
        ], \
        "maximumPopulation" : [  \
            10,  \
            10,  \
            10,  \
            10,  \
            100,  \
            100,  \
            10,  \
            10,  \
            10,  \
            100,  \
            100 \
        ], \
        "r" : [  \
            ".25",  \
            ".25",  \
            ".25",  \
            ".25" \
        ], \
        "K" : [  \
            "w",  \
            "(w+b)",  \
            "b",  \
            "b" \
        ], \
        "alpha" : [  \
            [  \
                "1",  \
                "0.4",  \
                "0",  \
                "0" \
            ],  \
            [  \
                "0.5",  \
                "1",  \
                "0.5",  \
                "0.6" \
            ],  \
            [  \
                "0",  \
                "0.5",  \
                "1",  \
                "0.5" \
            ],  \
            [  \
                "0",  \
                "0.8",  \
                "0.4",  \
                "1" \
            ] \
        ], \
        "q" : [  \
            "1",  \
            "1",  \
            "1",  \
            "1" \
        ], \
        "b" : [  \
            "0.1",  \
            "0.1",  \
            "0.1",  \
            "0.1" \
        ], \
        "d" : [  \
            "0.1",  \
            "0.1",  \
            "0.1",  \
            "0.1" \
        ], \
        "a" : [  \
            [  \
                "0.2",  \
                "0.08",  \
                "0",  \
                "0.05" \
            ],  \
            [  \
                "0.1",  \
                "0.18",  \
                "0.1",  \
                "0.15" \
            ],  \
            [  \
                "0",  \
                "0",  \
                "0",  \
                "0" \
            ],  \
            [  \
                "0",  \
                "0.08",  \
                "0.2",  \
                "0.05" \
            ] \
        ], \
        "delta" : [  \
            "0.01",  \
            "0.01",  \
            "0.01" \
        ], \
        "beta" : [  \
            "0.03",  \
            "0.01",  \
            "0.01" \
        ], \
        "s" : [  \
            "1",  \
            "1",  \
            "1" \
        ], \
        "m" : [  \
            [  \
                "0.3",  \
                "0.125",  \
                "0" \
            ],  \
            [  \
                "0.15",  \
                "0.25",  \
                "0.14" \
            ],  \
            [  \
                "0",  \
                "0.225", \
                "0.3" \
            ],  \
            [  \
                "0",  \
                "0",  \
                "0" \
            ] \
        ] \
    }');
        model.save();
    }

    nutella.net.handle_requests('read_population_model', function(message, from) {
        console.log('got asked for model');
        var x = model.data;
        return(x);
    });
    nutella.net.handle_requests('write_population_model', function(message, from) {
        model.data['r']=message['r']; 
        model.data['K']=message['K']; 
        model.data['alpha']=message['alpha'];
        model.data['b']=message['b'];
        model.data['a']=message['a'];
        model.data['q']=message['q'];
        model.data['d']=message['d'];
        model.data['beta']=message['beta'];
        model.data['s']=message['s'];
        model.data['delta']=message['delta'];
        model.data['m']=message['m'];
        model.save();
        nutella.net.publish('population_model_update');
    });

//this is just stupid. i have to move this to the roster. but it works for now.

    nutella.net.handle_requests('get_species_names', function(message, from){ 
        var nameList = []; 
        for (var i=0; i<11; i++) { 
            nameList.push(model.data['species'][i].printName);
        }
        
        return (nameList);
    });

    nutella.net.subscribe('set_species_names', function(message){
        for (var i=0; i<11; i++) {
            model.data['species'][i].printName = message[i];
        };
        model.save();
    });
});







