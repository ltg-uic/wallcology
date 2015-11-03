var actions = [
    {name: 'insert'},
    {name: 'remove'},
    {name: 'increase'},
    {name: 'decrease'}
];

var pendingAction;

// Nutella initialization

// Parse the query parameters
var query_parameters = NUTELLA.parseURLParameters();

// Get an instance of nutella.
var nutella = NUTELLA.init(query_parameters.broker, query_parameters.app_id, query_parameters.run_id, NUTELLA.parseComponentId());

var wallscope = query_parameters.wallscope;
var requireKey = query_parameters.requireKey;

// Location related actions
nutella.location.ready(function() {

    // Check if some resource is inside when the application start
    setInterval(function() {
        // Check if there are beacons inside every 3 seconds
        checkBeacon();
    }, 3000);


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
                if(key == 0 && wallscope == 'wallscope0' ||
                   key == 1 && wallscope == 'wallscope1' ||
                   key == 2 && wallscope == 'wallscope2' ||
                   key == 3 && wallscope == 'wallscope3') {
                        selectHabitat(key);
                        checkBeaconNoKey();
                }

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
                if(key == 0 && wallscope == 'wallscope0' ||
                    key == 1 && wallscope == 'wallscope1' ||
                    key == 2 && wallscope == 'wallscope2' ||
                    key == 3 && wallscope == 'wallscope3') {
                    selectHabitat(-1);
                }
                break;
        }
    });

    // Enable resource tracking
    var wallscopeResource = nutella.location.resource[wallscope];

    if(wallscopeResource != undefined) {
        wallscopeResource.notifyEnter = true;
        wallscopeResource.notifyExit = true;
        console.log('Subscribed to events on ' + wallscopeResource.rid);
    }
});

function selectHabitat(index) {
    console.log('Select habitat ' + index);
    document.getElementById('species-selector').enableHabitat(index);
}

function selectBug(index) {
    console.log('Select bug ' + index);
    document.getElementById('species-selector').selectBug(index);
}

function deselectBug(index) {
    console.log('Deselect bug ' + index);
    document.getElementById('species-selector').deselectBug(index);
}

function selectAction(name) {
    console.log('Select action ' + name);

    var index = actions.map(function(action) {
       return action.name;
    }).indexOf(name);
    if(index != -1) {
        document.getElementById('action-selector').selectAction(index);
    }
}

function deselectAction(name) {
    console.log('Deselect action ' + name);

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


    var speciesDescription = [];
    getSelectedBugs().forEach(function(bug) {
        if(bug < 10) {
            speciesDescription.push('http://ltg.cs.uic.edu/WC/icons/species_0' + (bug) + '.svg');
        }
        else {
            speciesDescription.push('http://ltg.cs.uic.edu/WC/icons/species_' + (bug) + '.svg');
        }

    });

    document.getElementById('wallcology-controls').actionDescription = getSelectedAction();
    document.getElementById('wallcology-controls').habitatDescription = getSelectedHabitat() + 1;
    document.getElementById('wallcology-controls').speciesDescription = speciesDescription;
        //" <b>" +  + "</b> species " + getSelectedBugs() + "  " + getSelectedHabitat() + " ?";

    if(!document.getElementById('dialog').opened) {
        document.getElementById('dialog').toggle();
    }
}

var lastAskConfirmation;

function confirmation() {

    if(pendingAction) {
        pendingAction.species.forEach(function (specie) {
            nutella.net.publish('species_event', {
                habitat: pendingAction.habitat,
                species: specie,
                action: pendingAction.action,
                interface: 'tangible'
            });
        });
        pendingAction = undefined;
    }

    lastAskConfirmation = new Date().getTime();
}


function cancel() {
    lastAskConfirmation = new Date().getTime();
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

    if(species.length > 0 &&
        habitat >= 0 &&
        action && auth &&
        (lastAskConfirmation == undefined || lastAskConfirmation + 30000 < new Date().getTime())
        ) {
        askConfirmation();
    }
}, 1000);

/**
 * Check if some beacon is inside
 */
function checkBeacon() {
    nutella.location.resources.forEach(function(resource) {
        try {
            if (resource.proximity.rid != undefined &&
                resource.proximity.rid == wallscope &&
                resource.type == 'DYNAMIC') {

                var role = resource.parameter['role'];

                switch (role) {
                    case 'specie':
                        var specie = parseInt(resource.parameter['specie']);
                        console.log('Specie enter: ' + specie);
                        selectBug(specie);
                        break;
                    case 'action':
                        var action = resource.parameter['action'];
                        console.log('Action enter: ' + action);
                        selectAction(action);
                        break;
                    case 'key':
                        key = parseInt(resource.parameter['key']);
                        console.log('Key Enter: ' + key);
                        if(key == 0 && wallscope == 'wallscope0' ||
                            key == 1 && wallscope == 'wallscope1' ||
                            key == 2 && wallscope == 'wallscope2' ||
                            key == 3 && wallscope == 'wallscope3') {
                            selectHabitat(key);
                            checkBeaconNoKey();
                        }

                        break;
                }
            }
        } catch(e) {}
    });
}

function checkBeaconNoKey() {
    nutella.location.resources.forEach(function(resource) {
        try {
            if (resource.proximity.rid != undefined &&
                resource.proximity.rid == wallscope &&
                resource.type == 'DYNAMIC') {

                var role = resource.parameter['role'];

                switch (role) {
                    case 'specie':
                        var specie = parseInt(resource.parameter['specie']);
                        console.log('Specie enter: ' + specie);
                        selectBug(specie);
                        break;
                    case 'action':
                        var action = resource.parameter['action'];
                        console.log('Action enter: ' + action);
                        selectAction(action);
                        break;
                }
            }
        } catch(e) {}
    });
}