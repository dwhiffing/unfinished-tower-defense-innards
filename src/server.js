var express = require('express'), 
    app = express(app),
    server = require('http').createServer(app);
 
// serve static files from the current directory
app.use(express.static(__dirname));

var EurecaServer = require('eureca.io').EurecaServer;
var clients = {};
 
// create an instance of EurecaServer, list allowed methods
var eurecaServer = new EurecaServer({allow:[
  'setId',
  'onConnect',
  'onDisconnect',
  'triggerIsReady',
  'startGame',
  'syncGridData',
  'triggerBuildPhase'
]});
 
//attach eureca.io to our http server
eurecaServer.attach(server);

//detect client connection
eurecaServer.onConnect(function (client) {    
  console.log('New Client id=%s ', client.id, client.remoteAddress);
  
  var remote = eurecaServer.getClient(client.id);    
  
  clients[client.id] = {id:client.id, remote:remote, readyStartGame: false, readyStartWave: false, team: null}
  
  remote.setId(client.id);    
});
 
//detect client disconnection
eurecaServer.onDisconnect(function (client) {    
  console.log('Client disconnected ', client.id);
  delete clients[client.id];
  
  for (var c in clients) {
    var remote = clients[c].remote;
    remote.onDisconnect(client.id);
  }    
});

eurecaServer.exports.handshake = function() {
  // establish connection on menu
  for (var c in clients) {
    var remote = clients[c].remote;
    for (var cc in clients) {
      remote.onConnect(clients[cc].id, 0, 0);        
    }
  }
}

eurecaServer.exports.startGameRequestMade = function (from, to) {
  // the requesting player is ready
  clients[from].readyStartGame = true;

  // requsting player becomes team 1, accepting player becomes team 2
  if (!clients[from].team){
    clients[from].team = 0;
    clients[to].team = 1;
  }

  // if both clients are ready, trigger the start of the game
  if (clients[from].readyStartGame && clients[to].readyStartGame){
    for (var c in clients) {
      var remote = clients[c].remote;
      remote.startGame(clients[c]);
    }
  } else {
    // else, tell the player that a game start has been requested
    var remote = clients[to].remote;
    remote.triggerIsReady(to);
  }
};

eurecaServer.exports.sendRoundFinished = function (id) {
  // triggering player is ready to start next wave
  if(!clients[id]) return false;
  clients[id].readyStartWave = true;
  var allReady = true;

  // check if all players are ready
  for (var c in clients) {
    if (!clients[c].readyStartWave) allReady = false;
  }

  // trigger start of build phase for clients if both are ready
  if (allReady){
    for (var c in clients) {
      clients[c].remote.triggerBuildPhase();
    }
  }
};


eurecaServer.exports.syncGridData = function (data) {
  for (var c in clients) {
    var remote = clients[c].remote;
    remote.syncGridData(data);
  }
};
 
server.listen(8000);