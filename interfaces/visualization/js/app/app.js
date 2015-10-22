
/*==============================================================================
 #    Program Name: App.js
 #          Author: Kyle Reese Almryde
 #            Date: 10/10/2015
 #
 #     Description:
 #        Establishes and communicates between the Unity3D visualization and
 #        Nutella. Handles updates from the simulation and passes them along to
 #        the Unity visualization.
 #
 #    Version: 0.2.1
 #
 #    Deficiencies:
 #       None. This program meets specifications
 #
 #==============================================================================
 #                            GLOBAL VAR DECLARATIONS
 #=============================================================================*/

var unity3d,
    wallscopeID;

var SpeciesCounter = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];  // Keeps track of the current population counts

/*==============================================================================
 #                            FUNCTION DEFINITIONS
 #=============================================================================*/

// Instantiate the Nutella components
function initNutellaComponents()
{
    console.log("Connecting Nutella");
    // Parse the query parameters
    var query_parameters = NUTELLA.parseURLParameters();
    console.log(query_parameters);
    wallscopeID = query_parameters.wallscope || 1;

    console.log('wallscope: ' + wallscopeID)

    // Get an instance of nutella.
    nutella = NUTELLA.init(
        query_parameters.broker,
        query_parameters.app_id,
        query_parameters.run_id,
        NUTELLA.parseComponentId()
    );

    // (Optional) Set the resourceId
    nutella.setResourceId('wallscope_vis');

    // Subscribe to the Channel, assign callback function
    subscribeToChannel('animation_state_update', State_Update_Handler);
    subscribeToChannel('species_event', Species_Event_Handler);


    // initialize the unity WebPlayer
    initWebPlayer();

};


function initWebPlayer()
{
    var config =
    {
        width: window.innerWidth, // 960,
        height: window.innerHeight, // 600,
        params: { enableDebugging:"1" }
    };

    unity3d = new UnityObject2(config);

    var url = "build/wallscope" + wallscopeID.toString() + "/wallscope" + wallscopeID.toString() + ".unity3d";
    // var url = "build/Wallcology/Wallcology.unity3d"; // + wallscopeID.toString() + "/wallscope" + wallscopeID.toString() + ".unity3d";

    console.log("Start WebPlayer");
    jQuery(function() {

        var $missingScreen = jQuery("#unityPlayer").find(".missing");
        var $brokenScreen = jQuery("#unityPlayer").find(".broken");
        $missingScreen.hide();
        $brokenScreen.hide();

        var installPlugin = function (e) {
            e.stopPropagation();
            e.preventDefault();
            unity3d.installPlugin();
            return false;
        };

        unity3d.observeProgress(function (progress) {
            switch(progress.pluginStatus) {
                case "broken":
                    $brokenScreen.find("a").click(installPlugin);
                    $brokenScreen.show();
                break;
                case "missing":
                    $missingScreen.find("a").click(installPlugin);
                    $missingScreen.show();
                break;
                case "installed":
                    $missingScreen.remove();
                break;
                case "first":
                break;
            }
        });
        console.log("url is", url);
        // recieve wallscope #, grab appropriate program.
        unity3d.initPlugin(jQuery("#unityPlayer")[0], url);
    });
};


/*==============================================================================
 #                       NUTELLA MESSAGE HANDLERS
 #=============================================================================*/

// Handles most recent state of simulation
function Last_State_Handler( response )
{
    // Send messages to Unity
    console.log("last_state!", response);

    // Since they are doing the same thing...
    State_Update_Handler( response, null );
}


function Species_Event_Handler( message, from )
{
    // ['increase','decrease','colonize','kill'];
    State_Update_Handler(message, from);
}


function State_Update_Handler(message, from)
{

    console.log('THE MESSAGE ', message, Date(message["timestamp"]));

    // Send messages to Unity
    SetThermometerText( message['environments'][wallscopeID-1][0] );  // Set the wallscope Temperature
    UpdatePopulations(message['populations'][wallscopeID-1]);
}

/*==============================================================================
 #                          UTILITY FUNCTIONS
 #=============================================================================*/
// Helper function to subscribe to channels
function subscribeToChannel(channelName, messageHandler)
{
    console.log("subscribing to channel:", channelName);
    nutella.net.subscribe(channelName, messageHandler);
};



// Manage population updates.
function UpdatePopulations(population)
{
    console.log("UpdatePopulations!", population);

    for (var i = 0; i < population.length; i++) {
        var count = population[i]

        RequestPopulationCount(i);
        console.log("\t", i, count, SpeciesCounter[i]);

        switch(i)
        {
            case 0:
            case 2:
            case 6:
            case 7:
                AdjustHerbivore( count, i );
                break;
            case 1:
            case 3:
            case 8:
                AdjustPredator( count, i );
                break;
            case 4:
            case 5:
            case 9:
            case 10:
                console.log("Not Implemented yet!");
                break;
            default:
                console.log("No critter Ive ever heard of");
                break;
        }
    }
    console.log("Thats a wrap!", SpeciesCounter);
}


function AdjustCritterPopulations( count, id, delay )
{
    console.log("AdjustCritterPopulations", count, id, delay);
    if ( count < SpeciesCounter[ id ] ) {

        while ( count < SpeciesCounter[id] ) {
            KillCritter( id )
        }
    } else if ( count > SpeciesCounter[ id ] ) {

        while ( count > SpeciesCounter[ id ] ) {
            // setTimeout(SpawnCritter, [ delay, id ] )
            SpawnCritter( id );
        }

    } else {
        console.log("They are both zero");
    }
}


function AdjustHerbivore( count, id )
{
    console.log("AdjustHerbivore", id);
    AdjustCritterPopulations( count, id, 0.0 ); // Herbivores should be added immediately
}


function AdjustPredator( count, id )
{
    var duration = (Math.random() * 10) * 1000;
    console.log("AdjustPredator", id, duration);
    AdjustCritterPopulations( count, id, duration ); // Predators should be added after a delay
}

/*==============================================================================
 #                       UNITY MESSAGE HANDLERS
 #=============================================================================*/
 // These functions are called from WITHIN Unity!

// Allows Unity to tell us its ready
function initWallScopeStartState( live )
{
    console.log("Unity is READY!!", live)
    // Make asynchronous requests on a certain channel
    // LoadWallscope( wallscopeID );
    nutella.net.request( 'last_animation_state', {}, Last_State_Handler);
}


// Function is called by Unity, which gives it the species ID, and the number of
// Unity GameObjects with that Identifier that
function ReceivePopulationCount( uID, pCount )
{
    console.log("Species ID is", uID, "and there are", pCount );
    SpeciesCounter[uID] = pCount;
}


function ProgressUpdate(func, valid)
{
    console.log(func, 'has executed', valid);
}
/*==============================================================================
 #                       UNITY MESSAGE REQUESTS
 #=============================================================================*/
// These functions Send messages TO Unity


// Set the Temperature Thermometer
//     expects a float/double
function SetThermometerText (temp)
{
    temp = Math.abs(Math.round(temp * 100) / 100);
    temp = temp.toString() + "˚C";
    temp = "";
    console.log("Temperature is", temp);
    unity3d.getUnity().SendMessage("Temperature", "SetText", temp);
}


// Spawns a critter
// id is assumed to be an integer
function SpawnCritter ( id )
{
    // console.log("Lets make a ", typeof id, "!");
    unity3d.getUnity().SendMessage( "WallScope", "SpawnCritter", id );
    SpeciesCounter[id]++;
    // console.log("We have", SpeciesCounter[id], "of species", id, "now");
}

function KillCritter ( id )
{
    console.log("Killing", id, "softly!");
    unity3d.getUnity().SendMessage("WallScope", "KillCritter", id);
    SpeciesCounter[id]--;
}


// Calls UNITY requesting Population
function RequestPopulationCount( uID )
{
    // console.log("Make Request!", uID );
    unity3d.getUnity().SendMessage("WallScope", "GetPopulationCount", uID);
}

// Tells UNITY to change the scene to the requested wallscope number
function LoadWallscope( scopeNumber )
{
    console.log("Loading Wallscope scene #" + scopeNumber);
    unity3d.getUnity().SendMessage("WallScope", "LoadWallscopeScene", parseInt(scopeNumber));
}



/*==============================================================================
 #                             START OF MAIN
 #=============================================================================*/

function Start() {
    initNutellaComponents();
}
