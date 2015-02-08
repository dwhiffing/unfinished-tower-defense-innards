var Tower = require('../entities/tower.js');

var Interface = function (game)  {
  this.buildTime = 3000;
  this.teamTowerFrame = (game.myTeam === 0) ? 2 : 3; // the index of the tileSprite we are painting with (0: empty, 1: wall)
  this.teamWallFrame = (game.myTeam === 0) ? 1 : 1; // the index of the tileSprite we are painting with (0: empty, 1: wall)

  // create flesh wall
  game.backGroup.create(0,0,'bg');
  
  // create key ui elements
  this.createCursor();
  this.createText();
  // this.createTowerSelector();
  this.createSpawner();

  this.activeWall = null;

  this.startWaveText = game.add.text(game.width-380, game.height-55, 'spawn wave:')
  this.startWaveButton = game.add.button(game.width-200, game.height-70, 'button', this.startSpawnPhase, this, 2, 1, 0);
  var key1 = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
  var key2 = game.input.keyboard.addKey(Phaser.Keyboard.Z);
  key2.onDown.add(this.rotateActiveWall, this);
  key1.onDown.add(this.placeActiveWall, this);
}

Interface.prototype.constructor = Interface;

Interface.prototype.createCursor = function() {
  // create cursor that will follow the active pointer
  this.marker = game.add.graphics();
  // this.marker.lineStyle(2, 0x000000, 1);
  // this.marker.drawRect(0, 0, game.grid.tileSize, game.grid.tileSize);
}

Interface.prototype.createText = function() {
  var style = { font: "32px Courier", fill: "#ffffff", align: "center" };
  this.waveText = game.add.text(game.width/2, 50, "", style);
  this.waveText.anchor.setTo(0.5,0.5);
  this.connectionText = game.add.text(game.width/2, game.height/2, "", style);
  this.connectionText.anchor.set(0.5);
}

Interface.prototype.createSpawner = function() {
  // create sphincter
  this.spawner = game.backGroup.create(game.grid.center.tile.worldX, game.grid.center.tile.worldY, 'spawner');
  this.spawner.x += game.grid.tileSize/2;
  this.spawner.y += game.grid.tileSize/2;
  this.spawner.anchor.setTo(0.5,0.5)
}


Interface.prototype.update = function() {
  this.updateMarker();
  this.updateTimer();
}

Interface.prototype.updateMarker = function(sprite, pointer) {
  var pointer = game.input.activePointer;
  if (pointer.worldX > 0 && pointer.worldY > 0) {
    // update position of marker
    this.marker.x = game.grid.layer.getTileX(pointer.worldX) * game.grid.tileSize;
    this.marker.y = game.grid.layer.getTileY(pointer.worldY) * game.grid.tileSize;
  }
  if (this.activeWall){
    this.activeWall.position = this.marker.position;
  }
}

Interface.prototype.updateTimer = function(sprite, pointer) {
  // update timer information inbetween rounds
  if (game.timeToNextRound) {
    if (game.timeToNextRound.duration >= 0) {
      var time = Math.floor(game.timeToNextRound.duration.toFixed(0)/1000);
      this.waveText.text = 'Time until next \nround: ' + time + ' seconds';
    }
    if (game.timeToNextRound.duration === 0) {
      this.waveText.text = '';
    }
  }  
}

Interface.prototype.rotateActiveWall = function() {
  if (this.activeWall) {
    this.activeWall.angle += 90;
  }
}

Interface.prototype.placeActiveWall = function() {
  if (this.activeWall) {
    var tiles = []
    this.activeWall.forEach(function(child){
      var x = child.world.x
      var y = child.world.y
      var tile = game.grid.map.getTileWorldXY(x, y, game.grid.tileSize, game.grid.tileSize, game.grid.layer)
      game.grid.map.putTile(1, tile.x, tile.y, game.grid.layer);
      game.grid.setData(1,tile.x,tile.y)
    }, this)
    this.activeWall.destroy()
    this.startSpawnPhase()
  }
}

Interface.prototype.startBuildPhase = function() {
  // create a timer til the start of the next round
  // game.timeToNextRound = game.time.create(false);
  // game.timeToNextRound.add(this.buildTime, game.enemies.spawnWave, game.enemies)
  // game.timeToNextRound.start();
  this.startWaveText.alpha = 1;
  this.startWaveButton.alpha = 1;
  this.activeWall = game.walls.createWall();
}

Interface.prototype.startSpawnPhase = function() {
  // create a timer til the start of the next round
  this.startWaveText.alpha = 0;
  this.startWaveButton.alpha = 0;
  game.enemies.spawnWave();
}

Interface.prototype.checkEndOfRound = function() {
  // check if there are any enemies left
  if (game.enemies.getAliveEnemies().length === 0) {
    // if not, send signal to server
    // game.eurecaServer.sendRoundFinished(game.sessionId)
    this.startBuildPhase()
    // this.waveText.text = 'waiting for other player';
  }
}

Interface.prototype.pickTile = function(sprite, pointer) {
  this.teamTowerFrame = game.math.snapToFloor(pointer.x, game.grid.tileSize) / game.grid.tileSize;
}
module.exports = Interface;