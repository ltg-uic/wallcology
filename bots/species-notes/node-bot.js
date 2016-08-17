
var NUTELLA = require('nutella_lib');

// Get configuration parameters and init nutella
var cliArgs = NUTELLA.parseArgs();
var componentId = NUTELLA.parseComponentId();
var nutella = NUTELLA.init(cliArgs.broker, cliArgs.app_id, cliArgs.run_id, componentId);

var Notes = nutella.persist.getMongoObjectStore('speciesNotes');

console.log("species-note bot started");

Notes.load(function(){
  console.log('species-notes load');
  if (!Notes.hasOwnProperty('notes')){
    resetNotes();
  }

  //returns all_notes for every group
  nutella.net.handle_requests('all_notes',function(from) {
    console.log('request all_notes');
    return Notes.notes;
  });

  //returns all notes for from a group index, e.g.,  group == 1
  nutella.net.handle_requests('all_notes_with_group',function(message, from) {
    if (message !== null && message !== undefined) {
      // if coming from the debugger
      //var parsedNote = JSON.parse(message);
      var parsedNote = message;
      console.log('request all_notes_with_group groupIndex: ' + parsedNote.group);
      return (
        Notes.notes.filter(
        function(note){
          return (note.group == parsedNote.group);
        }));
    } else {
      return {};
    }
  });

  //returns all the species from a group index e.g., species == 2
  nutella.net.handle_requests('all_notes_with_species',function(message, from) {
    if (message !== null && message !== undefined) {
      // if coming from the debugger
      //var parsedNote = JSON.parse(message);
      var parsedNote = message;
      console.log('request all_notes_with_species speciesIndex: ' + parsedNote.species);
      return (
        Notes.notes.filter(
        function(note){
          return (note.species == parsedNote.species);
        }));
    } else {
      return {};
    }
  });

  //returns a note with species and group index
  nutella.net.handle_requests('note_with_species_group',function(message, from) {
    if (message !== null && message !== undefined) {
      // if coming from the debugger
      //var parsedNote = JSON.parse(message);
      var parsedNote = message;
      console.log('request note_with_species_group speciesIndex: ' + parsedNote.species + ' groupIndex: ' + parsedNote.group);
      return (
        Notes.notes.filter(
        function(note){
          return (note.species == parsedNote.species && note.group == parsedNote.group);
        }));
    } else {
      return {};
    }
  });

  //returns a note with species and group index
  nutella.net.handle_requests('save_note',function(message, from) {
    // replace the var n declaration below with this one to maintain full history of species note updates, at performance cost
    // var n=Notes.notes;
    if (message !== null && message !== undefined) {
  // if coming from the debugger
      //var parsedNote = JSON.parse(message);
      var parsedNote = message;
      console.log('request save_note: ' + parsedNote.group);

      var found = false;
      Notes.notes.forEach(function(foundNote, index) {
          if (foundNote.species == parsedNote.species && foundNote.group == parsedNote.group) {
            found = true;
            updateNoteWithTimestamp(parsedNote);
          }
       }, this);

      if (found === false) {
            updateNoteWithTimestamp(parsedNote);
      }
    }
  });

  function updateNoteWithTimestamp(note) {
    note.timestamp = new Date().getTime();
    Notes.notes[index] = note;
    Notes.save();
            //now publish the note to all the clients
    pushNotifcation(note);
  }

  //sends a message to all the clients listening
  function pushNotifcation(note) {
    var message = {'group':note.group, 'species':note.species, 'note':note};
    nutella.net.publish('note_changes',message);
  }
  //note changes is a channel that client use to listen for changes
  // message format {"group":0,"species":1,note:{}}

  //saves a note

  //a client can request a reset
  nutella.net.subscribe('reset_notes',function(message,from) {
    resetNotes();
  });

  //clear the notes DB
  function resetNotes () {
    Notes.notes = [];
    Notes.save();
  }
  //for testing
  // console.log("Notes:" + Notes.notes);

  // Notes.notes.forEach(function(element) {
  //   console.log("element " + element.group);
  // }, this);
});



