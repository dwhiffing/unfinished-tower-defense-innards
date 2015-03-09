import Tower from '../entities/tower.js';

class Interface {
  constructor() {
    this.buildTime = 3000;
    this.active = null;
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
    this.status = game.add.text(100, game.height-55, '', {fill: 'white'})
    this.status.alpha = 0;

    game.input.onDown.add(this.attemptToPlace, this);
    game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR).onDown.add(this.rotateActive, this);
  }

  update() {
    this.updateMarker();
  }

  updateMarker(sprite, pointer) {
    var pointer = game.input.activePointer;
    if (pointer.worldX > 0 && pointer.worldY > 0) {
      this.marker.x = game.grid.wall_layer.getTileX(pointer.worldX) * game.grid.tileSize;
      this.marker.y = game.grid.wall_layer.getTileY(pointer.worldY) * game.grid.tileSize;
    }
    if (this.active){
      this.active.x = this.marker.x+game.grid.tileSize/2;
      this.active.y = this.marker.y+game.grid.tileSize/2;
    }
  }

  rotateActive() {
    if (this.active) {
      this.active.angle += 90;
    }
  }
  
  cloneArray (_arr) {
    var arr = (_arr instanceof Array) ? [] : {};
    for (var i in _arr) {
      if (i == 'clone') continue;
      var recurse = (_arr[i] && typeof _arr[i] == "object");
      arr[i] = recurse ? this.cloneArray(_arr[i]) : _arr[i];
    }
    return arr;
  }

  attemptToPlace() {
    this.placementOk = true;
    this.backupData = this.cloneArray(game.grid.data)
    if (this.active) {
      var tiles = []
      if (this.active instanceof Phaser.Group ){
        this.active.forEach(this.checkWallPos, this);
      } else {
        this.checkTowerPos(this.active, 'tower');
      }
      if (this.placementOk) {
        this.placeActive();
      }
    }
  }

  checkWallPos(obj) {
    var tile = game.grid.getWall(obj.world.x, obj.world.y)
    // check if any tiles are over a wall already or out of boundsand flag if any are
    if (!tile) {
      this.setStatus(false, "wall is out of bounds");
    } else if (game.grid.data[tile.y][tile.x] !== 0) {
      this.setStatus(false, "wall is over another wall");
    }
    
    // try placing the tile and see if there is still a path to the exit
    game.grid.set(1,tile.x,tile.y)
    if (!game.grid.getPath(game.grid.center, game.grid.waypoints[0])){
      this.setStatus(false, "creep path has been blocked");
    }
    game.grid.data = this.cloneArray(this.backupData)
  }

  checkTowerPos(obj) {
    var tile = game.grid.getWall(obj.world.x, obj.world.y)
    if (game.grid.getDataFor(tile) === 0 || game.grid.getDataFor(tile) === 3) {
      this.setStatus(false, "tower must be placed on wall");
    } else if (game.grid.data[tile.y][tile.x] === 2) {
      this.setStatus(false, "tower cannot be placed on another tower");
    }
  }

  placeActive() {
    if (this.active instanceof Phaser.Group ){
      this.active.forEach(function(child){
        this.placeThing(child.world.x, child.world.y,1)
      }, this)
      this.active.destroy()
      this.active = game.walls.createTower();
    } else {
      this.placeThing(this.active.x, this.active.y,2);
      this.active = null
      this.startSpawnPhase()
    }
    game.grid.setTileData()
  }

  placeThing(x, y, i) {
    var size = game.grid.tileSize
    var tile = game.grid.getWall(x, y)
    if (tile) {
      game.grid.map.putTile(i, tile.x, tile.y, game.grid.wall_layer);
      game.grid.set(i,tile.x,tile.y)
    }
  }

  setStatus(status, message='') {
    this.status.text = message
    this.placementOk = status;
    this.status.alpha = 1;
    game.time.events.add(1000, () => { this.status.alpha = 0 })
    if (!this.placementOk) game.juicy.shake(20,20);
  }

  startBuildPhase() {
    this.phase = 0;
    game.grid.openCenter(game.enemies.direction)
    this.active = game.walls.createWall();
  }

  startSpawnPhase() {
    this.phase = 1;
    game.enemies.spawnWave();
  }

  checkEndOfRound() {
    if (game.enemies.getAliveEnemies().length === 0 && this.phase === 1) {
      this.startBuildPhase()
    }
  }
}

export default Interface;
