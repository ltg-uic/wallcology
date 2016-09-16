
var NUTELLA = require('nutella_lib');

// Get configuration parameters and init nutella
var cliArgs = NUTELLA.parseArgs();
var componentId = NUTELLA.parseComponentId();
var nutella = NUTELLA.init(cliArgs.broker, cliArgs.app_id, cliArgs.run_id, componentId);


var NOTES = nutella.persist.getMongoObjectStore('speciesNotes');
var ARCHIVED_NOTES = nutella.persist.getMongoObjectStore('archivedNotes');
console.log('SpeciesNoteBot Started');

ARCHIVED_NOTES.load(function () {
  if (ARCHIVED_NOTES.notes == undefined) {
    resetArchivedNotes();
  } else {
    console.log('We start with ARCHIVED_NOTES DB: ' + ARCHIVED_NOTES.notes.length)
  }

  function resetArchivedNotes() {
    ARCHIVED_NOTES.notes = [];
    ARCHIVED_NOTES.save();
  };
});

NOTES.load(function () {

  if (NOTES.notes == undefined) {
    resetNotes();
  } else {
    console.log('We start with NOTES DB: ' + NOTES.notes.length)
  }

  //returns all_notes for every group
  nutella.net.handle_requests('all_notes', function (message, from) {
    console.log('request all_notes');
    //save to dop file box erer, calculaur 
    var url = calculate
    //console.log('message' + message);
    var image = { 'to': from.componentId, 'imageUrl': url }
    nutella.net.publish('image_out', image);

    return NOTES.notes;
  });

  //returns all notes for from a group index, e.g.,  group == 1
  nutella.net.handle_requests('all_notes_with_group', function (message, from) {
        try {
      //check the  index

      //check species
      var groupIndex = message && message.groupIndex;
      if (isNaN(groupIndex)) throw 'groupIndex index is not a number' + groupIndex;
      if (!groupIndex.checkRange(0, 4)) throw 'groupIndex out of bounds' + groupIndex;

      //we passed all the tests

      var foundNotes = NOTES.notes.filter(
        function (note) {
          return (note.groupIndex == groupIndex);
        });

      var rm = returnMessage(-1, groupIndex, foundNotes);
      console.log('making request for groupIndex: ' + groupIndex + ' #notes: ' + foundNotes.length);
      return rm
    } catch (err) {
      console.log('all_notes_with_group error: ' + err);
      return returnMessage(-1, -1, []);
    }
  });

  //   var parsedNote = message;

  //   if (!isNaN(parsedNote) && (parsedNote >= 0 && parsedNote <= 4)) {
  //     console.log('request all_notes_with_group groupIndex: ' + parsedNote.group);
  //     return (
  //       NOTES.notes.filter(
  //         function (note) {
  //           return (note.group == parsedNote.group);
  //         }));
  //   } else {
  //     return {};
  //   }
  // });

  //returns all the species from a species index e.g., species == 2
  nutella.net.handle_requests('all_notes_with_species', function (message, from) {
    try {
      //check the  index

      //check species
      var speciesIndex = message && message.speciesIndex;
      if (isNaN(speciesIndex)) throw 'species index is not a number' + speciesIndex;
      if (!speciesIndex.checkRange(0, 10)) throw 'speciesIndex out of bounds' + speciesIndex;

      //we passed all the tests

      var foundNotes = NOTES.notes.filter(
        function (note) {
          return (note.fromSpecies.index == speciesIndex);
        });

      var rm = returnMessage(speciesIndex, -1, foundNotes);
      console.log('making request for speciesIndex: ' + speciesIndex + ' #notes: ' + foundNotes.length);
      return rm
    } catch (err) {
      console.log('all_notes_with_species error: ' + err);
      return returnMessage(-1, -1, []);
    }
  });

  nutella.net.handle_requests('note_with_species_group', function (message, from) {
    // if coming from the debugger
    //var parsedNote = JSON.parse(message);
    var parsedNote = message;
    if (!isNaN(parsedNote.group) && (parsedNote.group >= 0 && parsedNote.group <= 4) &&
      !isNaN(parsedNote.species) && (parsedNote.species >= 0 && parsedNote.species <= 10)) {
      console.log('request note_with_species_group speciesIndex: ' + parsedNote.species + ' groupIndex: ' + parsedNote.group);

      var n = NOTES.notes.filter(function (note) { return (note.species == parsedNote.species && note.group == parsedNote.group) });
      return ((n.length == 0) ? {} : n[n.length - 1]);ac
    } else {
      return {};
    }
  });

  nutella.net.handle_requests('save_note', function (message) {
    //check for bad message
    var newNote = message
    try {

      //check the group index
      var groupIndex = newNote && newNote.groupIndex;
      if (isNaN(groupIndex)) throw 'group index is not a number' + groupIndex;
      if (!groupIndex.checkRange(0, 4)) throw 'group index out of bounds' + groupIndex;

      //check species
      var speciesIndex = newNote.fromSpecies && newNote.fromSpecies.index;
      if (isNaN(speciesIndex)) throw 'species index is not a number' + speciesIndex;
      if (!speciesIndex.checkRange(0, 10)) throw 'speciesIndex out of bounds' + speciesIndex;

      //we passed all the tests
      console.log('making request for groupIndex: ' + groupIndex + ' speciesIndex: ' + speciesIndex + ' for runId: ' + nutella.run_id);

      //archive the matching old notes, remove them the current db and then push only the ones that dont match
      //https://danmartensen.svbtle.com/javascripts-map-reduce-and-filter
      var newNotes = NOTES.notes.reduce(function (newNotes, noteItem, index, oldNotes) {
        if ((newNote.fromSpecies.index == noteItem.fromSpecies.index) && (newNote.groupIndex == noteItem.groupIndex)) {
          //archive these
          ARCHIVED_NOTES.notes.push(noteItem);
          ARCHIVED_NOTES.save()
        } else {
          newNotes.push(noteItem);
        }
        return newNotes; /* This is important! */
      }, []);

      //finally add the newNote
      newNote['timestamp'] = new Date().getTime();
      newNote['isSynced'] = true
      newNotes.push(newNote);
      //set it
      NOTES.notes = newNotes
      NOTES.save();

      //publish
      var rm = returnMessage(speciesIndex, groupIndex, [newNote])
      console.log('Publishing note', rm)
      nutella.net.publish('note_changes', rm);
    } catch (err) {
      console.log('save_note error: ' + err);
      nutella.net.publish('note_changes', returnMessage(-1, -1, []));
    }

    return {};
  });


  nutella.net.subscribe('echo_in', function (message, from) {
    console.log("message" + message);
    var json = { "echo": "hello hello" };
    nutella.net.publish('echo_out', json);

  });

  nutella.net.subscribe('reset_notes', function (message, from) {
    resetNotes();
  });

  function resetNotes() {
    NOTES.notes = [];
    NOTES.save();
  };


  function returnMessage(speciesIndex, groupIndex, notes) {
    var header = { 'speciesIndex': speciesIndex, 'groupIndex': groupIndex };
    var body = { 'header': header, 'notes': notes };
    return body;
  };

});


Number.prototype.checkRange = function (min, max) {
  return this >= min && this <= max;
};
