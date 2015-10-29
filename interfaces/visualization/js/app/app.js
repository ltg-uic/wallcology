
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
var lastState;
function Last_State_Handler( response )
{

    lastState = response;

    // Send messages to Unity
    console.log("last_state!", response);

    console.log('THE MESSAGE ', response, Date(response["timestamp"]));

    // Send messages to Unity
    SetThermometerText( response['environments'][wallscopeID-1][0] );  // Set the wallscope Temperature

    // Get the population state update
    UpdatePopulations();

    // Update collapse
    UpdateCollapse(response['environments'][wallscopeID-1][1]);
}

/*==============================================================================
 #                          UTILITY FUNCTIONS
 #=============================================================================*/

// Update the collapse
function UpdateCollapse(value) {
    if(value < 0.21) {
        // Collapse the pipes
        console.log('Collapse the pipes');
        unity3d.getUnity().SendMessage("WallScope", "pipeCollapse", 1);
    }
    else {
        // Uncollapse the pipes
        console.log('Pipes are not collapsed');
        unity3d.getUnity().SendMessage("WallScope", "pipeCollapse", 0);
    }
}

// Manage population updates.
function UpdatePopulations()
{
    console.log("UpdatePopulations!");

    for (var i = 0; i < 11; i++) {

        switch(i)
        {
            case 0:
            case 1:
            case 2:
            case 3:
            case 6:
            case 7:
            case 8:
                RequestPopulationCount( i );
                break;
            case 4:
            case 5:
            case 9:
            case 10:
                break;
            default:
                // console.log("No critter Ive ever heard of");
                break;
        }
    }
}

function CheckPopulationCounts()
{
    window.setInterval(periodicUpdate, 20000);
}


/*==============================================================================
 #                       UNITY MESSAGE HANDLERS
 #=============================================================================*/
 // These functions are called from WITHIN Unity!

// Allows Unity to tell us its ready
function initWallScopeStartState( live )
{
    console.log("Unity is READY!!", live);

    periodicUpdate();

    // Set our interval to be called every N minutes.
    CheckPopulationCounts();
}

function periodicUpdate() {
    console.log('Periodic update');
    nutella.net.request( 'last_animation_state', {}, Last_State_Handler);
}


// Function is called by Unity, which gives it the species ID, and the number of
// Unity GameObjects with that Identifier that
function ReceivePopulationCount( uID, pCount )
{
    console.log('Count species: ' + uID + ' count: ' + pCount);

    var populationLevel = lastState['populations'][wallscopeID-1];
    console.log("\tID is %o and there are %o in Unity but %o in Nutella", uID, pCount, populationLevel[ uID ]);

    if (populationLevel[ uID ] < pCount)
    {
        var difference = pCount - populationLevel[ uID ];
        for (var i = 0; i < difference; i++) {
            console.log('Killed: ' + difference + ' of species ' + uID);
            KillCritter( uID );
        }
    }
    else if (populationLevel[ uID ] > pCount)
    {
        var difference = populationLevel[ uID ] - pCount;
        for (var i = 0; i < difference; i++) {
            console.log('Spawned: ' + difference + ' of species ' + uID);
            SpawnCritter( uID );
        }

    }


}


function ProgressUpdate(func, valid)
{
    // console.log(func + ' has executed ' + valid.toString());
}

function DebugMessage(string)
{
    console.log(string);
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
    console.log("Lets make a "+id.toString() +"! ", typeof id  );
    unity3d.getUnity().SendMessage( "WallScope", "SpawnCritter", id );
    // console.log("We have", SpeciesCounter[id], "of species", id, "now");
}

function KillCritter ( id )
{
    console.log("Killing " + id.toString() + " softly!");
    unity3d.getUnity().SendMessage("WallScope", "KillCritter", id);
}


// Calls UNITY requesting Population
function RequestPopulationCount( uID )
{
    // console.log("Make Request!", uID );
    unity3d.getUnity().SendMessage("WallScope", "GetPopulationCount", uID);
}


/*==============================================================================
 #                             START OF MAIN
 #=============================================================================*/

function Start() {
    initNutellaComponents();
}