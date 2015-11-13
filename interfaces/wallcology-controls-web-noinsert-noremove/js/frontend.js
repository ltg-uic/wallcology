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

function setHabitatBasedOnWallscope() {
    console.log('here');
    setTimeout(function() {
        try {
            selectHabitat(parseInt(wallscope.replace(/[^\d]/g, "")));
        } catch (e) {
            setHabitatBasedOnWallscope();
        }
    }, 1000);
}

setHabitatBasedOnWallscope();


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
    if(getSelectedBugs().length == 0) {
        if(getSelectedAction().length > 0) {
            deselectAction(getSelectedAction()[0]);
        }
        return;
    }

    pendingAction = {
        action: getSelectedAction()[0],
        species: getSelectedBugs(),
        habitat: getSelectedHabitat()
    };

    if(pendingAction.action == 'insert' || pendingAction.action == 'remove') {
        deselectAction(getSelectedAction()[0]);
        return; // Insert & remove disabled
    }

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

function confirmation() {

    if(pendingAction) {
        pendingAction.species.forEach(function (specie) {
            nutella.net.publish('species_event', {
                habitat: pendingAction.habitat,
                species: specie,
                action: pendingAction.action,
                interface: 'web'
            });
        });
        pendingAction = undefined;
    }

    lastAskConfirmation = new Date().getTime();

    // Deselect species
    getSelectedBugs().forEach(function(species) {
        deselectBug(species);
    });

    // Deselect actions
    getSelectedAction().forEach(function(action) {
        deselectAction(action);
    });
}


function cancel() {
    // Deselect species
    getSelectedBugs().forEach(function(species) {
        deselectBug(species);
    });

    // Deselect actions
    getSelectedAction().forEach(function(action) {
        deselectAction(action);
    });
}

// Listen for the error message
nutella.net.subscribe('too_soon', function(message) {
    if(getSelectedHabitat() == message.habitat) {
        alert('You can not do so many changes');
    }
});

// Listen for the confirmation message
nutella.net.subscribe('action_confirmed', function(message) {
    if(getSelectedHabitat() == message.habitat) {
        alert('You succesfully ' + message.action + ' the species');
    }
});
