
var NUTELLA = require('nutella_lib');

// Get configuration parameters and init nutella
var cliArgs = NUTELLA.parseArgs();
var componentId = NUTELLA.parseComponentId();
var nutella = NUTELLA.init(cliArgs.broker, cliArgs.app_id, cliArgs.run_id, componentId);


var Notes = nutella.persist.getMongoObjectStore('speciesNotes');

console.log('SpeciesNoteBot Started');


Notes.load(function () {

  if (Notes.notes == undefined) {
    resetNotes();
  } else {
    console.log('We start with NOTES DB: ' + Notes.notes.length)
  }

  //returns all_notes for every group
  nutella.net.handle_requests('all_notes', function (message, from) {
    console.log('request all_notes');
    //save to dop file box erer, calculaur 
    var url = calculate 
    //console.log('message' + message);
    var image = {'to':from.componentId,'imageUrl': url}
        nutella.net.publish('image_out', image);

    return Notes.notes;
  });

  //returns all notes for from a group index, e.g.,  group == 1
  nutella.net.handle_requests('all_notes_with_group', function (message, from) {
    // if coming from the debugger
    //var parsedNote = JSON.parse(message);
    var parsedNote = message;

    if (!isNaN(parsedNote) && (parsedNote >= 0 && parsedNote <= 4)) {
      console.log('request all_notes_with_group groupIndex: ' + parsedNote.group);
      return (
        Notes.notes.filter(
          function (note) {
            return (note.group == parsedNote.group);
          }));
    } else {
      return {};
    }
  });


  //returns all the species from a species index e.g., species == 2
  nutella.net.handle_requests('all_notes_with_species', function (message, from) {
    console.log('request all_notes_with_species speciesIndex: ' + JSON.stringify(message, null, 4));
    
    // if coming from the debugger
    //var parsedNote = JSON.parse(message);
    var speciesIndex = message.speciesIndex;
    if (speciesIndex != undefined && !isNaN(speciesIndex) && (speciesIndex >= 0 && speciesIndex <= 10)) {
      var query = (
        Notes.notes.filter(
          function (note) {
            return (note.fromSpecies.index == speciesIndex);
          }));
      console.log('RETURN all_notes_with_species with speciesIndex: ' + speciesIndex + ' notes: ' + query.length);
      var header = {'speciesIndex':parseInt(speciesIndex), 'groupIndex': -1};
      return { 'header': header, 'notes': query};
    } else {
      console.log('RETURNED all_notes_with_species speciesIndex: ' + speciesIndex + ' notes: 0');
      return {};
    }
  });

  nutella.net.handle_requests('note_with_species_group', function (message, from) {
    // if coming from the debugger
    //var parsedNote = JSON.parse(message);
    var parsedNote = message;
    if (!isNaN(parsedNote.group) && (parsedNote.group >= 0 && parsedNote.group <= 4) &&
      !isNaN(parsedNote.species) && (parsedNote.species >= 0 && parsedNote.species <= 10)) {
      console.log('request note_with_species_group speciesIndex: ' + parsedNote.species + ' groupIndex: ' + parsedNote.group);

      var n = Notes.notes.filter(function (note) { return (note.species == parsedNote.species && note.group == parsedNote.group) });
      return ((n.length == 0) ? {} : n[n.length - 1]);


      // tony, your code below returns an array of notes, not a single note
      // my strategy is to filter and then choose the last (most recent) one
      // if there are more than one. there will never be more than one, though.
      //
      // return (
      //   Notes.notes.filter(
      //   function(note){
      //     return (note.species == parsedNote.species);
      //   }));

    } else {
      return {};
    }
  });



  nutella.net.handle_requests('save_note', function (message) {
    // if coming from the debugger

    //check for bad message
    if( message == undefined )
      return

    //console.log('sent NOTE: ' + JSON.parse(message));

    //if we are coming the debugger
    //is needed coming from swift
    //var parsedNote = JSON.parse(message)
    //not testing with the debugger
    //var parsedNote = message

    //var parsedNote=message;
    console.log('request save_note: ' + parsedNote.groupIndex);
    // replace the var n declaration below with this one to maintain full history of species note updates, at performance cost
    // var n=Notes.notes;
    if (!isNaN(parsedNote.groupIndex) && (parsedNote.groupIndex >= 0 && parsedNote.groupIndex <= 4) &&
      !isNaN(parsedNote.fromSpecies.index) && (parsedNote.fromSpecies.index >= 0 && parsedNote.fromSpecies.index <= 10)) {
      var n = Notes.notes.filter(function (item) { return (!(parsedNote.fromSpecies.index == item.fromSpecies.index && parsedNote.groupIndex == item.groupIndex)) });
      if (n == undefined) {
        n = []
      }
      var d = new Date();
      parsedNote['timestamp'] = d.getTime();
      parsedNote['isSynced'] = true
      Notes.notes.push(parsedNote);
      Notes.save();

      //construct message - same as notes with species 
      //{ 'notes': [...], 'speciesIndex': Int }
      console.log('publishing note changes for speciesIndex: ' + parsedNote.fromSpecies.index);
      var parsedNotes = [parsedNote]
      //nutella.net.publish('note_changes',{ 'hello':1})

      var header = {'speciesIndex':parseInt(parsedNote.fromSpecies.index), 'groupIndex':parseInt(parsedNote.groupIndex)}
      nutella.net.publish('note_changes', { 'header': header, 'notes': parsedNotes});
      return parsedNote;
    } else {
      return {};
    }
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
    Notes.notes = [];
    Notes.save();
  };

});


  //returns a note with species and group index
//   nutella.net.handle_requests('save_note',function(message, from) {
//     // replace the var n declaration below with this one to maintain full history of species note updates, at performance cost
//     // var n=Notes.notes;
//     if (message !== null && message !== undefined) {
//   // if coming from the debugger
//       //var parsedNote = JSON.parse(message);
//       var parsedNote = message;
//       console.log('request save_note: ' + parsedNote.group);

//       var found = false;
//       Notes.notes.forEach(function(foundNote, index) {
//           if (foundNote.species == parsedNote.species && foundNote.group == parsedNote.group) {
//             found = true;
//             updateNoteWithTimestamp(parsedNote);
//           }
//        }, this);

//       if (found === false) {
//             updateNoteWithTimestamp(parsedNote);
//       }
//     }
// >>>>>>> origin/master
//   });

//   function updateNoteWithTimestamp(note) {
//     note.timestamp = new Date().getTime();
//     Notes.notes[index] = note;
//     Notes.save();
//             //now publish the note to all the clients
//     pushNotifcation(note);
//   }

//   //sends a message to all the clients listening
//   function pushNotifcation(note) {
//     var message = {'group':note.group, 'species':note.species, 'note':note};
//     nutella.net.publish('note_changes',message);
//   }
//   //note changes is a channel that client use to listen for changes
//   // message format {"group":0,"species":1,note:{}}

//   //saves a note

//   //a client can request a reset
//   nutella.net.subscribe('reset_notes',function(message,from) {
//     resetNotes();
//   });

//   //clear the notes DB
//   function resetNotes () {
//     Notes.notes = [];
//     Notes.save();
//   }
//   //for testing
//   // console.log("Notes:" + Notes.notes);

//   // Notes.notes.forEach(function(element) {
//   //   console.log("element " + element.group);
//   // }, this);
// });

