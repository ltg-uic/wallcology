var actions = [
    {name: 'remove'},
    {name: 'increase'},
    {name: 'decrease'},
    {name: 'insert'}
];

// Nutella initialization

// Parse the query parameters
var query_parameters = NUTELLA.parseURLParameters();

// Get an instance of nutella.
var nutella = NUTELLA.init(query_parameters.broker, query_parameters.app_id, query_parameters.run_id, NUTELLA.parseComponentId());

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
                var key = parseInt(dynamicResource.parameter['key']);
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
                var key = parseInt(dynamicResource.parameter['key']);
                console.log('Key exit: ' + key);
                if (key == getSelectedHabitat()) {
                    selectHabitat(-1);
                }
                break;
        }
    });

    // Enable resource tracking
    nutella.location.resource['wallscope' + wallscope].notifyEnter = true;
    nutella.location.resource['wallscope' + wallscope].notifyExit = true;
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