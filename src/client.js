module.exports = {
  create: function() {
    game.eurecaServer;
    game.connectionEstablished = false;
    game.eurecaClient = new Eureca.Client();

    game.eurecaClient.ready(function (proxy) {  
      game.eurecaServer = proxy;
    });

    // inital connection methods

    game.eurecaClient.exports.setId = function(id) {
      // set our client ID for this session
      game.sessionId = id;
      game.eurecaServer.handshake();
      game.connectionEstablished = true;
      game.displayUserIdText.text = "Your id: " + id;
    }    

    game.eurecaClient.exports.onConnect = function(id, x, y) {
      // return if the id is ours
      if (id == game.sessionId) return; 

      // update opponent id
      game.otherPlayerId = id;

      // update ui to reflect ready status
      game.connectionText.text = "found an opponent: \n" + id;
      game.connectButton = game.add.button(game.world.centerX - 95, 500, 'button', function(){
        game.connectionText.text = "request made to player: \n" + id;
        game.eurecaServer.startGameRequestMade(game.sessionId, id);
      }, this, 2, 1, 0);
    }

    game.eurecaClient.exports.onDisconnect = function(i) {
      // return if the id is ours
      if (i == game.sessionId) return;
      
      // update ui to reflect ready status
      game.connectionText.text = "player left: \n" + i;
      game.connectButton.destroy()
      if(game.state.current !== 'menu') {
        game.state.start('menu');
      }
    }

    // game menu / ready methods

    game.eurecaClient.exports.triggerIsReady = function(i) {
      game.connectionText.text = "player requested to start game: \n" + i;
    }

    game.eurecaClient.exports.startGame = function(data) {
      game.connectionText.text = "starting game";
      game.myTeam = data.team;
      setTimeout(function(){
        game.state.start('play');
      }, 1000)
    }

    // in game sync methods

    game.eurecaClient.exports.triggerBuildPhase = function() {
      game.ui.startBuildPhase();
    }

    game.eurecaClient.exports.syncGridData = function(data) {
      if(!data) return
      game.grid.data = data;
      game.grid.syncTowersVsData();
      game.enemies.updatePaths();
    }

  }
}
