
var NUTELLA = require('nutella_lib');

// Get configuration parameters and init nutella
var cliArgs = NUTELLA.parseArgs();
var componentId = NUTELLA.parseComponentId();
var nutella = NUTELLA.init(cliArgs.broker, cliArgs.app_id, cliArgs.run_id, componentId);


var PLACES = nutella.persist.getMongoObjectStore('places');

PLACES.load(function () {

    if (PLACES.places == undefined) {
        resetPlaces();
    } else {
        console.log('We start with PLACES DB: ' + PLACES.places.length)
    }

    //returns all_places returns the history for this section
    nutella.net.handle_requests('all_places', function (message, from) {
        console.log('request all_places');
        var body = { 'places': PLACES.places };
        return body;
    });

    //returns all notes for from a group index, e.g.,  group == 1
    nutella.net.handle_requests('all_places_with_group', function (message, from) {
        try {
            //check the  index

            //check species
            var groupIndex = message && message.groupIndex;
            if (isNaN(groupIndex)) throw 'groupIndex index is not a number' + groupIndex;
            if (!groupIndex.checkRange(0, 4)) throw 'groupIndex out of bounds' + groupIndex;

            //we passed all the tests

            var foundPlaces = PLACES.places.filter(
                function (place) {
                    return (place.groupIndex == groupIndex);
                });

            var rm = returnMessage(-1, groupIndex, foundPlaces);
            console.log('making request for groupIndex: ' + groupIndex + ' #places: ' + foundPlaces.length);
            return rm
        } catch (err) {
            console.log('all_places_with_group error: ' + err);
            return returnMessage(-1, -1, []);
        }
    });

    //returns all the species from a species index e.g., species == 2
    nutella.net.handle_requests('all_places_with_species', function (message, from) {
        try {
            //check the  index

            //check species
            var speciesIndex = message && message.speciesIndex;
            if (isNaN(speciesIndex)) throw 'species index is not a number' + speciesIndex;
            if (!speciesIndex.checkRange(0, 10)) throw 'speciesIndex out of bounds' + speciesIndex;

            //we passed all the tests

            var foundPlaces = PLACES.places.filter(
                function (place) {
                    return (place.speciesIndex == speciesIndex);
                });

            var rm = returnMessage(speciesIndex, -1, foundPlaces);
            console.log('making request for speciesIndex: ' + speciesIndex + ' #places: ' + foundPlaces.length);
            return rm
        } catch (err) {
            console.log('all_places_with_species error: ' + err);
            return returnMessage(-1, -1, []);
        }
    });

    nutella.net.handle_requests('save_place', function (message) {
        //check for bad message
        var newPlace = message
        try {

            //check the group index
            var groupIndex = newPlace && newPlace.groupIndex;
            if (isNaN(groupIndex)) throw 'group index is not a number' + groupIndex;
            if (!groupIndex.checkRange(0, 4)) throw 'group index out of bounds' + groupIndex;

            //check species
            var speciesIndex = newPlace && newPlace.speciesIndex;
            if (isNaN(speciesIndex)) throw 'species index is not a number' + speciesIndex;
            if (!speciesIndex.checkRange(0, 10)) throw 'speciesIndex out of bounds' + speciesIndex;

            //we passed all the tests
            console.log('making request for groupIndex: ' + groupIndex + ' speciesIndex: ' + speciesIndex + ' for runId: ' + nutella.run_id);

            //finally add the newNote
            newPlace['timestamp'] = new Date().getTime();
            newPlace['isSynced'] = true
            PLACES.places.push(newPlace);
            //set it

            PLACES.save();

            //publish
            var rm = returnMessage(speciesIndex, groupIndex, [newPlace])
            console.log('Publishing place', rm)
            nutella.net.publish('place_changes', rm);
        } catch (err) {
            console.log('save_place error: ' + err);
            nutella.net.publish('place_changes', returnMessage(-1, -1, []));
        }

        return {};
    });


    nutella.net.subscribe('echo_in', function (message, from) {
        console.log("message" + message);
        var json = { "echo": "hello hello" };
        nutella.net.publish('echo_out', json);

    });

    function resetPlaces() {
        PLACES.places = [];
        PLACES.save();
    };


    function returnMessage(speciesIndex, groupIndex, places) {
        var header = { 'speciesIndex': speciesIndex, 'groupIndex': groupIndex };
        var body = { 'header': header, 'places': places };
        return body;
    };

});


Number.prototype.checkRange = function (min, max) {
    return this >= min && this <= max;
};