var actions = [
    {name: 'remove'},
    {name: 'increase'},
    {name: 'decrease'},
    {name: 'insert'}
];

var pendingAction;

// Nutella initialization

// Parse the query parameters
var query_parameters = NUTELLA.parseURLParameters();

// Get an instance of nutella.
var nutella = NUTELLA.init(query_parameters.broker, query_parameters.app_id, query_parameters.run_id, NUTELLA.parseComponentId());

var wallscope = query_parameters.wallscope;
var requireKey = query_parameters.requireKey;
var key;

// Location related actions
nutella.location.ready(function() {
    nutella.location.resourceEntered(function(dynamicResource, staticResource) {
        var role = dynamicResource.parameter['role'];

        switch(role) {
            case 'specie':
                var specie = parseInt(dynamicResource.parameter['specie']);
                console.log('Specie enter: ' + specie);
                selectBug(specie);
                break;
            case 'action':
                var action = dynamicResource.parameter['action'];
                console.log('Action enter: ' + action);
                selectAction(action);
                break;
            case 'key':
                key = parseInt(dynamicResource.parameter['key']);
                console.log('Key Enter: ' + key);
                selectHabitat(key);
                break;
        }
    });

    nutella.location.resourceExited(function(dynamicResource, staticResource) {
        var role = dynamicResource.parameter['role'];

        switch(role) {
            case 'specie':
                var specie = parseInt(dynamicResource.parameter['specie']);
                console.log('Specie exit: ' + specie);
                deselectBug(specie);
                break;
            case 'action':
                var action = dynamicResource.parameter['action'];
                console.log('Action exit: ' + action);
                deselectAction(action);
                break;
            case 'key':
                var newKey = parseInt(dynamicResource.parameter['key']);
                console.log('Key exit: ' + newKey);
                if (key == newKey) {
                    key = undefined
                }
                break;
        }
    });

    // Enable resource tracking
    nutella.location.resource[wallscope].notifyEnter = true;
    nutella.location.resource[wallscope].notifyExit = true;
});



function selectHabitat(index) {
    document.getElementById('species-selector').enableHabitat(index);
}

function selectBug(index) {
    document.getElementById('species-selector').selectBug(index);
}

function deselectBug(index) {
    document.getElementById('species-selector').deselectBug(index);
}

function selectAction(name) {
    var index = actions.map(function(action) {
       return action.name;
    }).indexOf(name);
    if(index != -1) {
        document.getElementById('action-selector').selectAction(index);
    }
}

function deselectAction(name) {
    var index = actions.map(function(action) {
        return action.name;
    }).indexOf(name);
    if(index != -1) {
        document.getElementById('action-selector').deselectAction(index);
    }
}

function getSelectedBugs() {
    return document.getElementById('species-selector').selectedItems.map(function(item) {
        return item.index;
    });
}

function getSelectedHabitat() {
    return document.getElementById('species-selector').currentToggle.index;
}

function getSelectedAction() {
    return document.getElementById('action-selector').selectedItems.map(function(item) {
        return actions[item.index].name;
    });
}

function askConfirmation() {
    pendingAction = {
        action: getSelectedAction()[0],
        species: getSelectedBugs(),
        habitat: getSelectedHabitat()
    };

    document.getElementById('wallcology-controls').actionDescription =
        "Do you really want to " + getSelectedAction() + " species " + getSelectedBugs() + " in habitat " + getSelectedHabitat() + " ?";

    if(!document.getElementById('dialog').opened) {
        document.getElementById('dialog').toggle();
    }
}

function confirmation() {

    if(pendingAction) {
        pendingAction.species.forEach(function (specie) {
            debugger;
            nutella.net.publish('species_event', {
                habitat: pendingAction.habitat,
                species: specie,
                action: pendingAction.action
            });
        });
        pendingAction = undefined;
    }

    // Deselect species
    getSelectedBugs().forEach(function(specie) {
        deselectBug(specie);
    });

    // Deselect action
    getSelectedAction().forEach(function(action) {
        deselectAction(action);
    });

}

function cancel() {
    // Deselect species
    getSelectedBugs().forEach(function(specie) {
        deselectBug(specie);
    });

    // Deselect action
    getSelectedAction().forEach(function(action) {
        deselectAction(action);
    });
}

// Every second check if its a valid state
setInterval(function() {
    var species = getSelectedBugs();
    var habitat = getSelectedHabitat();
    var action = getSelectedAction().length == 1 ? getSelectedAction()[0] : undefined;

    var auth = true;

    if(requireKey && key != getSelectedHabitat()) {
        auth = false;
    }

    if(species.length > 0 && habitat >= 0 && action && auth) {
        askConfirmation();
    }
}, 1000);