// Wallscope number
var wallscope = 0;

// Unlocked wallscope
var unlock = false;

// Selected specie
var selectedSpecie = undefined;

// Selecteed action
var selectedAction = undefined;

// Controls related actions
$('.control').click(function() {

    if($(this).hasClass('specie')) {
        console.log($(this).attr('specie'));
        selectedSpecie = parseInt($(this).attr('specie'));
    }
    else if($(this).hasClass('action')) {
        console.log($(this).attr('action'));
        selectedAction = $(this).attr('action');
    }
    checkAction();
});

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

                if(selectedSpecie == undefined) {
                    selectedSpecie = specie;
                }

                break;
            case 'action':
                var action = dynamicResource.parameter['action'];
                console.log('Action enter: ' + action);

                if(selectedAction == undefined) {
                    selectedAction = action;
                }
                break;
            case 'key':
                var key = parseInt(dynamicResource.parameter['key']);
                console.log('Key Enter: ' + key);

                if(key == wallscope) {
                    console.log('Wallscope unlocked');
                    unlock = true;
                }
                break;
        }

        checkAction();

    });

    nutella.location.resourceExited(function(dynamicResource, staticResource) {
        var role = dynamicResource.parameter['role'];

        switch(role) {
            case 'specie':
                var specie = parseInt(dynamicResource.parameter['specie']);
                console.log('Specie exit: ' + specie);

                if(specie == selectedSpecie) {
                    selectedSpecie = undefined;
                }

                break;
            case 'action':
                var action = dynamicResource.parameter['action'];
                console.log('Action exit: ' + action);

                if(action == selectedAction) {
                    selectedAction = undefined;
                }

                break;
            case 'key':
                var key = dynamicResource.parameter['key'];
                console.log('Key exit: ' + key);

                if(key == wallscope) {
                    unlock = false;
                }
                break;
        }

        checkAction();

    });

    // Enable resource tracking
    nutella.location.resource['wallscope' + wallscope].notifyEnter = true;
    nutella.location.resource['wallscope' + wallscope].notifyExit = true;
});

// Execute command routine
function checkAction() {
    $(".control").removeClass('selected').removeClass('locked');

    if(unlock && selectedAction != undefined && selectedSpecie != undefined) {
        alert('Executed ' + selectedAction + ' on ' + selectedSpecie);
        unlock = false;
        selectedAction = undefined;
        selectedSpecie = undefined;
    }
    else {
        if(unlock) {
            // Color the specie button
            $(".control.specie[specie='" + selectedSpecie + "']").addClass('selected').removeClass('locked');

            // Color the action button
            $(".control.action[action='" + selectedAction + "']").addClass('selected').removeClass('locked');
        }
        else {
            // Color the specie button
            $(".control.specie[specie='" + selectedSpecie + "']").addClass('selected').addClass('locked');

            // Color the action button
            $(".control.action[action='" + selectedAction + "']").addClass('selected').addClass('locked');
        }
    }
};