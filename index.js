'use strict';

var ogm = require('opengov-meetings')
  , uuid = require('uuid')
  , config = require('./config')
  , Firebase = require('firebase')
  , FirebaseTokenGenerator = require('firebase-token-generator')
  , tokenGenerator = new FirebaseTokenGenerator(config.firebaseSecret)
  , token = tokenGenerator.createToken({"dill": "dall"}, {"admin" : true})
  , dataRef = new Firebase("https://" + config.firebaseHost + "/" + config.ogmMeetingId + "/saker/")
  , opts = {
      host: config.ogmHost,
      path: config.ogmPath,
      meetingId: config.ogmMeetingId
    }
  ;

function prepareAgendaItem(item) {
  var newUUID = uuid.v4()
    , newItem = {
        active : false,
        antall_forslag : 0,
        behandlet : false,
        sakID : item.id + '-' +  newUUID,
        saksinnstilling : "",
        saksnummer : item.agendanumber,
        sakstall : parseInt(item.agendanumber.split('/')[0], 10),
        sakstittel :  item.title,
        ts : new Date().getTime(),
        votering : false
      }
    ;

  return newItem;
}

function putNewAgendaItem (item) {
  var putData = prepareAgendaItem(item)
    ;

  dataRef.child(putData.sakID).set(putData, function(error) {
    if (error) {
      console.error(error);
    } else {
      console.log(putData.saksnummer + ' OK');
    }
  });
}

function dataHandler(err, data){
  if(err){
    console.error(err);
  } else {
    console.log('Data received from OpenGov.');
    data.agenda.forEach(function(item, index, arr){
      putNewAgendaItem(item);
      if(index === arr.length - 1){
        console.log('Finished parsing data. ' + arr.length + ' items ready for import.');
      }
    });
  }
}

dataRef.authWithCustomToken(token, function(error) {
  if (error) {
    console.error(error);
  } else {
    console.log('Authenticated with Firebase.');
    ogm.getAgenda(opts, dataHandler);
  }
});