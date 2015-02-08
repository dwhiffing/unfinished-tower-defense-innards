module.exports = {
  create: function() {
    
    // display current connection status
    var style = { font: "22px Arial", fill: "#ffffff", align: "center" };
    game.connectionText = game.add.text(game.width/2, game.height/2, "Looking for connections...", style);
    game.connectionText.anchor.set(0.5);

    // display id for user
    game.displayUserIdText = game.add.text(game.width/2, game.height/2-300, "", style);
    game.displayUserIdText.anchor.set(0.5);
    
    // initialize the client
    // require('../client.js').create();
  }
}