
var
    NUTELLA = require("./nutella_lib.js"),
    d3 = require("d3")

var instance;
var type;

var channel_lineup = []; // = [{name: 'Abiotic controls', URL: 'http://localhost:57880/wallcology/default/runs/abiotic-controls/index.html?broker=127.0.0.1&app_id=wallcology&run_id=default'},{name: 'Biotic controls', URL: 'http://localhost:57880/wallcology/default/runs/biotic-controls/index.html?broker=127.0.0.1&app_id=wallcology&run_id=default'},{name: 'History', URL: 'http://localhost:57880/wallcology/default/runs/ecosystem-history/index.html?broker=127.0.0.1&app_id=wallcology&run_id=default'},{name: 'Enactment', URL: 'http://localhost:57880/wallcology/default/runs/enactment-control/index.html?broker=127.0.0.1&app_id=wallcology&run_id=default'},{name: 'Model Editor', URL: 'http://localhost:57880/wallcology/default/runs/newModelEditor/index.html?broker=127.0.0.1&app_id=wallcology&run_id=default'}];

// Get an instance of nutella

var query_parameters = NUTELLA.parseURLParameters();

var nutella = NUTELLA.init(query_parameters.broker, query_parameters.app_id, query_parameters.run_id, NUTELLA.parseComponentId());

if (query_parameters.INSTANCE === undefined) { //login request
    nutella.net.request('roster', {}, function(logins, from) {
        for (var i = 0; i < logins.length; i++) {
            document.body.appendChild(logins[i].type + ': ');
            for (var j = 0; j < logins[i].printNames.length; j++) {
                document.body.appendChild('<button onClick="login(\'' + logins[i].type + '\',' + j + ');">' + logins[i].printNames[j] + '</button>');
            }
            document.body.appendChild('<br>');
        }
    });

} else { // lightCast tabbed page based on login
    instance = query_parameters.INSTANCE;
    type = query_parameters.TYPE;
    nutella.net.request('currentActivity', {}, function(currentActivity, from) {
        nutella.net.request('channel_list', {
            activity: currentActivity,
            type: type
        }, function(channelList, from) {
            var channel_lineup = buildLineup(channelList, instance);
            construct_user_interface(channel_lineup);
        });
    });
};


function login(type, instance) {
    // look up class activity alert()
    location.href = location.href + '&TYPE=' + type + '&INSTANCE=' + instance;
}

function buildLineup(channelList, instance) {
    var s;
    var channel_lineup = [];
    for (var i = 0; i < channelList.length; i++) {
        s = "http://";
        s += window.location.host + '/';
        s += query_parameters.app_id + '/';
        s += query_parameters.run_id + '/';
        s += 'runs/';
        s += channelList[i] + '/';
        s += 'index.html' + '?';
        s += 'broker=' + query_parameters.broker + '&';
        s += 'app_id=' + query_parameters.app_id + '&';
        s += 'run_id=' + query_parameters.run_id + '&';
        s += 'INSTANCE=' + instance;

        channel_lineup[i] = {
            name: channelList[i],
            URL: s
        };
    };
    return (channel_lineup);
}

function construct_user_interface(channel_lineup) {

    document.body.appendChild('<ul class="tab">');

    for (var i = 0; i < channel_lineup.length; i++) {
        alert('<li><a href="#" class="tablinks" onclick="openTab(event, \'' + channel_lineup[i].name + '\');">' + channel_lineup[i].name + '</a></li>');
        document.body.appendChild('<li><a href="#" class="tablinks" onclick="openTab(event, \'' + channel_lineup[i].name + '\')">' + channel_lineup[i].name + '</a></li>');
    };

    //         document.body.appendChild('<li><a href="#" class="tablinks" onclick="openTab(event, \'enactment-control\')">enactment-control</a></li>');
    // <li><a href="#" class="tablinks" onclick="openCity(event, 'MSNBC')">MSNBC</a></li>
    // <li><a href="#" class="tablinks" onclick="openCity(event, 'FOX')">FOX</a></li>

    document.body.appendChildln("</ul>");

    for (var i = 0; i < channel_lineup.length; i++) {
        alert('<div id="' + channel_lineup[i].name + '" class="tabcontent"><iframe src="' + channel_lineup[i].URL + '"></iframe> </div>');
        document.body.appendChildln('<div id="' + channel_lineup[i].name + '" class="tabcontent"><iframe src="' + channel_lineup[i].URL + '"></iframe> </div>');
    };

};

function openTab(evt, channelName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(channelName).style.display = "inline";
    evt.currentTarget.className += " active";
}