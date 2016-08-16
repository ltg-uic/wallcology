
var NUTELLA = require('nutella_lib');

// Get configuration parameters and init nutella
var cliArgs = NUTELLA.parseArgs();
var componentId = NUTELLA.parseComponentId();
var nutella = NUTELLA.init(cliArgs.broker, cliArgs.app_id, cliArgs.run_id, componentId);


var Notes = nutella.persist.getMongoObjectStore('speciesNotes');

Notes.load(function(){

  if (!Notes.hasOwnProperty('notes')){
    resetNotes();
  };

  nutella.net.handle_requests('group_notes',function(group, from) {
    return(Notes.notes.filter(function(note){return (note.group == group)}));
  });


  nutella.net.handle_requests('species_notes',function(species, from) {
    return(Notes.notes.filter(function(note){return (note.species == species)}));
  });

  nutella.net.handle_requests('combo_note',function(selector, from) {
    return(Notes.notes.filter(function(note){return (note.species == selector.species && note.group == selector.group)}));
  });
 
  nutella.net.subscribe('update_note',function(note){
    // replace the var n declaration below with this one to maintain full history of species note updates, at performance cost
    // var n=Notes.notes;
    var n = Notes.notes.filter(function(item){return (!(note.species == item.species && notes.group == item.group))});
    var d = new Date();
    note['timestamp'] = d.getTime();
    Notes.notes = n.push(note);
    Notes.save();
  });

  nutella.net.subscribe('reset_notes',function(message,from) {
    resetNotes();
  });

  function resetNotes () {
    Notes.notes=[];
    Notes.save();
  };

});   



