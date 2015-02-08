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
  this.phase = 0;

  this.placementText = game.add.text(100, game.height-55, '', {fill: 'white'})
  this.placementText.alpha = 0;
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
    this.activeWall.x = this.marker.x+25;
    this.activeWall.y = this.marker.y+25;
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
    var placementOk = true;
    var placementStatus = "";
    if (this.activeWall instanceof Phaser.Group ){
      var tiles = []
      var backupData = cloneArray(game.grid.data)
      // check if any tiles are over a wall already or out of boundsand flag if any are
      this.activeWall.forEach(function(child){
        var tile = game.grid.map.getTileWorldXY(child.world.x, child.world.y, game.grid.tileSize, game.grid.tileSize, game.grid.layer)
        if (!tile) {
          placementOk = false;
          placementStatus = "wall is out of bounds";
        } else if (game.grid.data[tile.y][tile.x] !== 0) {
          placementOk = false;
          placementStatus = "wall is over another wall";
        }
      }, this)
      // if placement is okay after that, try placing the tile and see if there is still a path to the exit
      if (placementOk) {
        this.activeWall.forEach(function(child){
          var tile = game.grid.map.getTileWorldXY(child.world.x, child.world.y, game.grid.tileSize, game.grid.tileSize, game.grid.layer)
          game.grid.setData(1,tile.x,tile.y)
        })
        if (game.grid.getPath(game.grid.center, game.grid.waypoints[0], true) === false){
          placementOk = false;
          placementStatus = "creep path has been blocked";
          game.grid.data = cloneArray(backupData)
        }
      }
      // if there is still a path, go ahead and place the tile
      if (placementOk) {
        placementStatus = "wall placement is good";
        this.activeWall.forEach(function(child){
          var tile = game.grid.map.getTileWorldXY(child.world.x, child.world.y, game.grid.tileSize, game.grid.tileSize, game.grid.layer)

          if (tile) {
            game.grid.map.putTile(1, tile.x, tile.y, game.grid.layer);
            game.grid.setData(1,tile.x,tile.y)
          }
        }, this)
        this.activeWall.destroy()
        this.activeWall = game.walls.createTower();
      }
    }else{
      var tile = game.grid.map.getTileWorldXY(this.activeWall.x, this.activeWall.y, game.grid.tileSize, game.grid.tileSize, game.grid.layer)
      if (game.grid.data[tile.y][tile.x] === 1){
        placementStatus = "tower placement is good";
        game.grid.map.putTile(2, tile.x, tile.y, game.grid.layer);
        game.grid.setData(2,tile.x,tile.y)
        this.activeWall = null
        this.startSpawnPhase()
      } else if (game.grid.data[tile.y][tile.x] === 0) {
        placementStatus = "tower must be placed on wall";
        placementOk = false;
      } else if (game.grid.data[tile.y][tile.x] === 2) {
        placementStatus = "tower cannot be placed on another tower";
        placementOk = false;
      }
    }
    if (!placementOk) game.juicy.shake(20,20);
    this.placementText.text = placementStatus
    this.placementText.alpha = 1;
    game.time.events.add(1000,function(){
      this.placementText.alpha = 0;
    }, this)
  }
}

Interface.prototype.startBuildPhase = function() {
  // create a timer til the start of the next round
  // game.timeToNextRound = game.time.create(false);
  // game.timeToNextRound.add(this.buildTime, game.enemies.spawnWave, game.enemies)
  // game.timeToNextRound.start();
  this.phase = 0;
  game.grid.openCenter(game.enemies.direction)
  this.activeWall = game.walls.createWall();
}

Interface.prototype.startSpawnPhase = function() {
  // create a timer til the start of the next round
  this.phase = 1;
  game.enemies.spawnWave();
}

Interface.prototype.checkEndOfRound = function() {
  // check if there are any enemies left
  if (game.enemies.getAliveEnemies().length === 0 && this.phase === 1) {
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
function cloneArray (existingArray) {
   var newObj = (existingArray instanceof Array) ? [] : {};
   for (i in existingArray) {
      if (i == 'clone') continue;
      if (existingArray[i] && typeof existingArray[i] == "object") {
       newObj[i] = cloneArray(existingArray[i]);
      } else {
         newObj[i] = existingArray[i]
      }
   }
   return newObj;
}