var Tower = require('../entities/tower.js');

var Interface = function ()  {
  this.buildTime = 3000;
  this.activeObject = null;
  this.phase = 0;

  // create flesh wall
  game.backGroup.create(0,0,'bg');
  
  // create cursor that will follow the active pointer
  this.marker = game.add.graphics();
  this.marker.lineStyle(2, 0x000000, 1);
  this.marker.drawRect(0, 0, game.grid.tileSize, game.grid.tileSize);

  // create ui text
  this.waveText = game.add.text(game.width/2, 50, "", {fill: "white", align: "center"});
  this.waveText.anchor.setTo(0.5,0.5);
  this.placementText = game.add.text(100, game.height-55, '', {fill: 'white'})
  this.placementText.alpha = 0;
  
  // create sphincter
  this.spawner = game.backGroup.create(game.grid.center.tile.worldX, game.grid.center.tile.worldY, 'spawner');
  this.spawner.x += game.grid.tileSize/2;
  this.spawner.y += game.grid.tileSize/2;
  this.spawner.anchor.setTo(0.5,0.5)
  game.input.onDown.add(this.attemptToPlace, this)

  var key2 = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
  key2.onDown.add(this.rotateActiveObject, this);
}

Interface.prototype.constructor = Interface;

Interface.prototype.update = function() {
  this.updateMarker();
}

Interface.prototype.updateMarker = function(sprite, pointer) {
  var pointer = game.input.activePointer;
  if (pointer.worldX > 0 && pointer.worldY > 0) {
    this.marker.x = game.grid.layer.getTileX(pointer.worldX) * game.grid.tileSize;
    this.marker.y = game.grid.layer.getTileY(pointer.worldY) * game.grid.tileSize;
  }
  if (this.activeObject){
    this.activeObject.x = this.marker.x+game.grid.tileSize/2;
    this.activeObject.y = this.marker.y+game.grid.tileSize/2;
  }
}

Interface.prototype.rotateActiveObject = function() {
  if (this.activeObject) {
    this.activeObject.angle += 90;
  }
}

Interface.prototype.attemptToPlace = function() {
  this.placementOk = true;
  this.backupData = cloneArray(game.grid.data)
  if (this.activeObject) {
    var tiles = []
    if (this.activeObject instanceof Phaser.Group ){
      this.activeObject.forEach(this.checkWallPosition, this);
    } else {
      this.checkTowerPosition(this.activeObject, 'tower');
    }
    if (this.placementOk) {
      this.placeActiveObject();
    }
  }
}

Interface.prototype.checkWallPosition = function(obj) {
  var tile = game.grid.map.getTileWorldXY(obj.world.x, obj.world.y, game.grid.tileSize, game.grid.tileSize, game.grid.layer)
  // check if any tiles are over a wall already or out of boundsand flag if any are
  if (!tile) {
    this.setPlacementStatus(false, "wall is out of bounds");
  } else if (game.grid.data[tile.y][tile.x] !== 0) {
    this.setPlacementStatus(false, "wall is over another wall");
  }
  
  // try placing the tile and see if there is still a path to the exit
  game.grid.setData(1,tile.x,tile.y)
  if (game.grid.getPath(game.grid.center, game.grid.waypoints[0], true) === false){
    this.setPlacementStatus(false, "creep path has been blocked");
    game.grid.data = cloneArray(this.backupData)
  }
}

Interface.prototype.checkTowerPosition = function(obj) {
  var tile = game.grid.map.getTileWorldXY(obj.world.x, obj.world.y, game.grid.tileSize, game.grid.tileSize, game.grid.layer)
  if (game.grid.data[tile.y][tile.x] === 0 || game.grid.data[tile.y][tile.x] === 3) {
    this.setPlacementStatus(false, "tower must be placed on wall");
  } else if (game.grid.data[tile.y][tile.x] === 2) {
    this.setPlacementStatus(false, "tower cannot be placed on another tower");
  }
}

Interface.prototype.placeActiveObject = function() {
  if (this.activeObject instanceof Phaser.Group ){
    this.activeObject.forEach(function(child){
      var tile = game.grid.map.getTileWorldXY(child.world.x, child.world.y, game.grid.tileSize, game.grid.tileSize, game.grid.layer)
      if (tile) {
        game.grid.map.putTile(1, tile.x, tile.y, game.grid.layer);
        game.grid.setData(1,tile.x,tile.y)
      }
    }, this)
    this.activeObject.destroy()
    this.activeObject = game.walls.createTower();
  } else {
    var tile = game.grid.map.getTileWorldXY(this.activeObject.x, this.activeObject.y, game.grid.tileSize, game.grid.tileSize, game.grid.layer)
    game.grid.map.putTile(2, tile.x, tile.y, game.grid.layer);
    game.grid.setData(2,tile.x,tile.y)
    this.activeObject = null
    this.startSpawnPhase()
  }
}

Interface.prototype.setPlacementStatus = function(status, message) {
  var message = message || '';
  this.placementText.text = message
  this.placementOk = status;
  this.placementText.alpha = 1;
  game.time.events.add(1000,function(){
    this.placementText.alpha = 0;
  }, this)
  if (!this.placementOk) game.juicy.shake(20,20);
}

Interface.prototype.startBuildPhase = function() {
  // game.eurecaServer.sendRoundFinished(game.sessionId)
  // this.waveText.text = 'waiting for other player';
  this.phase = 0;
  game.grid.openCenter(game.enemies.direction)
  this.activeObject = game.walls.createWall();
}

Interface.prototype.startSpawnPhase = function() {
  // create a timer til the start of the next round
  this.phase = 1;
  game.enemies.spawnWave();
}

Interface.prototype.checkEndOfRound = function() {
  if (game.enemies.getAliveEnemies().length === 0 && this.phase === 1) {
    this.startBuildPhase()
  }
}

module.exports = Interface;
