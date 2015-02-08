(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Wall = function(x,y) {
  Phaser.Sprite.call(this, game, x, y, 'wall');
  this.anchor.set(0.5,0.5)
}

Wall.prototype = Object.create(Phaser.Sprite.prototype);
Wall.prototype.constructor = Wall;

module.exports = Wall
},{}],2:[function(require,module,exports){
var Wall = require('../entities/Wall.js');

var WallGroup = function(shape) {
  Phaser.Group.call(this, game);
  this.classType = Wall;
  var tileSize = 50;
  for(var i = 0; i < shape.length; i++) {
    var x = shape[i][0]*tileSize
    var y = shape[i][1]*tileSize
    var wall = new Wall(x,y)
    this.add(wall)
  }
}

WallGroup.prototype = Object.create(Phaser.Group.prototype);
WallGroup.prototype.constructor = WallGroup;

module.exports = WallGroup

},{"../entities/Wall.js":1}],3:[function(require,module,exports){
var WallGroup = require('../entities/WallGroup.js');
var Tower = require('../entities/tower.js');

var WallManager = function() {
  this.minos = [
    [
      [
        [0,0]
      ]
    ], [
      [
        [0,0], [1,0],
      ]
    ], [
      [
        [0,0], [1,0], [2,0],
      ], [
        [0,0], [1,0], [0,1],
      ]
    ], [
      [
        [0,0],[1,0],[2,0],[3,0]
      ], [
        [0,0],[1,0],[0,1],[1,1]
      ], [
        [0,0],[1,0],[2,0],[0,1]
      ], [
        [0,0],[1,0],[2,0],[2,1]
      ], [
        [0,0],[0,1],[1,1],[1,2]
      ], [
        [0,0],[1,0],[1,1],[1,2]
      ], [
        [0,0],[1,0],[2,0],[1,1]
      ]
    ]
  ]
}

WallManager.prototype.constructor = WallManager;

WallManager.prototype.createWall = function() {
  var size = game.rnd.integerInRange(0,this.minos.length-1)
  var shape = game.rnd.integerInRange(0,this.minos[size].length-1)
  var wall = new WallGroup(this.minos[size][shape]);
  return wall;
}

WallManager.prototype.createTower = function() {
  var tower = new Tower(0,0);
  return tower;
}

module.exports = WallManager
},{"../entities/WallGroup.js":2,"../entities/tower.js":8}],4:[function(require,module,exports){
var Enemy = function(game, opts) {
  var opts = opts || {}
  Phaser.Sprite.call(this, game, -50, -50, 'enemy');
  this.setConfig(opts);
  
  game.physics.enable(this);
  this.kill();
}

Enemy.prototype = Object.create(Phaser.Sprite.prototype)
Enemy.prototype.constructor = Enemy;

Enemy.prototype.setConfig = function(opts) {
  // initialize configs
  this.height = opts.size
  this.width = opts.size
  this.anchor.setTo(0.5,0.5);

  this.speed = opts.speed;
  this.maxHealth = opts.heath || 8;
  
  this.offset = game.grid.tileSize/2;
  this.nextWaypoint = 0;
}

Enemy.prototype.pulsateTween = function(opts) {
  this.spin = game.add.tween(this);
  this.pulsate = game.add.tween(this);
  var duration = game.rnd.integerInRange(this.speed*90,this.speed*100)
  var delay = game.rnd.integerInRange(100,1000)
  var angle = 360;
  this.pulsate.to({height: 60, width:60}, duration/2, Phaser.Easing.Quadratic.InOut, true, delay, -1, true)
  this.spin.to({angle: angle}, duration*2, Phaser.Easing.Linear.None, true, delay, -1)
}

Enemy.prototype.spawnTween = function(duration) {
  this.startTween = game.add.tween(this);
  this.startTweenAlpha = game.add.tween(this);

  this.scale.set(0,0)
  this.alpha = 0;

  this.startTween.to({height: 50, width:50}, duration, Phaser.Easing.Quadratic.InOut, true)
  this.startTweenAlpha.to({alpha: 1}, duration, Phaser.Easing.Quadratic.InOut, true)
}

Enemy.prototype.spawn = function(x, y, spacing, health) {
  // initialize this enemy from the spawner
  this.reset(x+this.offset, y+this.offset, health);
  this.spawnTween(spacing/2);
  game.time.events.add(spacing/2, this.startMoving, this)
  this.nextWaypoint = 0;
}

Enemy.prototype.startMoving = function() {
  var self = this;
  
  this.pulsateTween();
  var tween = game.add.tween(this)
  if (this.nextWaypoint === 0) {
    tween.to({x: this.x}, 10, Phaser.Easing.Linear.None);
    this.nextWaypoint++;
  }
  
  // determine the closest tile to the enemies current position
  var tile = game.grid.map.getTileWorldXY(this.x, this.y, game.grid.tileSize, game.grid.tileSize, game.grid.layer)
  var start = {x: tile.x, y: tile.y};

  // determine the next waypoint we want to go to
  var path1 = game.grid.getPath(start, game.grid.waypoints[0], true);
  // var path2 = game.grid.getPath(start, game.grid.waypoints[1], true);
  var path;
  // if (PF.Util.pathLength(path1) > PF.Util.pathLength(path2)) {
    // path = game.grid.getPath(start, game.grid.waypoints[1]);
  // } else {
    path = game.grid.getPath(start, game.grid.waypoints[0]);
  // }
  
  // stop any tweens in progress 
  if (this.lastTween) {this.lastTween.stop();}
  this.lastTween = tween;
  this.lastPath = path

  // tween the enemy to that tile, and chain each tween needed to the next waypoint
  for(var j = 1; j < path.length; j++) {
    var nTile = game.grid.map.getTile(path[j].x, path[j].y, game.grid.layer);
    var oTile = game.grid.map.getTile(path[j-1].x, path[j-1].y, game.grid.layer);
    var nPos = {x: nTile.worldX + this.offset, y: nTile.worldY + this.offset};
    var oPos = {x: oTile.worldX + this.offset, y: oTile.worldY + this.offset};
    var distance = this.getDistance(nPos, oPos) * this.speed;
    tween.to({x: nPos.x, y: nPos.y }, distance, Phaser.Easing.Linear.None);
  }
  tween.onComplete.add(this.doKill, this)
  tween.start();
};

Enemy.prototype.doKill = function(enemy) {
  enemy.kill()
  enemy.pulsate.stop()
  enemy.spin.stop()
  game.ui.checkEndOfRound()
}

Enemy.prototype.getDistance = function(p1,p2) {
  return Math.sqrt( Math.pow((p1.x - p2.x), 2) + Math.pow((p1.y - p2.y), 2) );
}

module.exports = Enemy
},{}],5:[function(require,module,exports){
var Enemy = require('../entities/enemy.js')

var EnemyManager = function (game, opts)  {
  var opts = opts || {};
  this.cursor = 0;
  this.waveNum = 0;

  this.setConfig(opts);
  this.createEnemyPool();
}

EnemyManager.prototype.constructor = EnemyManager;

EnemyManager.prototype.setConfig = function(opts) {
  // initialize configs
  this.tileSize = opts.tileSize || game.grid.tileSize;
  this.enemyHeight = opts.enemyHeight || this.tileSize*.9;
  this.enemySpeed = opts.enemySpeed || 5;
  
  // space between enemies in wave
  this.spacing = opts.spacing || 40 * this.tileSize;
  this.spacing /= (20/this.enemySpeed)

  // direction of next spawn (0: up, 1: down, 2: left, 3: right)
  this.direction = 0;
}

EnemyManager.prototype.createEnemyPool = function(opts) {
  // create pool of enemies for spawning
  this.group = game.add.group();
  for(var i = 0; i < 50; i++){
    var enemy = new Enemy(game, {size: this.enemyHeight, speed: this.enemySpeed});
    this.group.add(enemy);
  }
}

EnemyManager.prototype.spawnWave = function(wavesize){
  // null out time to next round until this round finishes
  game.timeToNextRound = null;
  if (this.isSpawning) return
  this.isSpawning = true;
  
  // create the next wave of enemies
  wavesize = wavesize || 5 + (1*this.waveNum);
  var deadEnemies = this.getDeadEnemies();
  this.enemiesToRevive = deadEnemies.splice(1, wavesize);

  var tile = game.grid.map.getTile(game.grid.center.x, game.grid.center.y, game.grid.layer)
  var spawnx = tile.worldX
  var spawny = tile.worldY

  this.cursor = 0;
  this.spawnEnemy(spawnx,spawny);
  game.time.events.repeat(this.spacing, this.enemiesToRevive.length-1, this.spawnEnemy, this, spawnx, spawny);
  this.enemyHealth = 3 + (1*this.waveNum)
  this.direction++;
  this.waveNum++;
  if (this.direction === 4) this.direction = 0;
}

EnemyManager.prototype.spawnEnemy = function(x, y) {
  var enemy = this.enemiesToRevive[this.cursor];
  if(!enemy) return
  this.cursor++;
  if (this.cursor == this.enemiesToRevive.length) {
    game.time.events.add(this.spacing, function(){
      this.isSpawning = false;
    },this)
  }
  enemy.spawn(x, y, this.spacing, this.enemyHealth);
}

EnemyManager.prototype.getAliveEnemies = function() {
  return this.group.filter(function(obj){if(obj.alive===true)return obj }).list
}

EnemyManager.prototype.getDeadEnemies = function() {
  return this.group.filter(function(obj){if(obj.alive===false)return obj }).list
}

module.exports = EnemyManager
},{"../entities/enemy.js":4}],6:[function(require,module,exports){
var Grid = function (game)  {
  
  this.setConfig();
  this.group = game.add.group();
  
  // temporary home base graphics
  this.graphics = game.add.graphics(0,0);
  this.graphics.lineStyle(0);
  this.graphics.beginFill(0xffff00);
  
  // initialize a Phaser tilemap to keep track of walkable tiles
  this.map = game.add.tilemap();
  this.map.setTileSize(this.tileSize, this.tileSize);
  this.map.addTilesetImage('tile');
  
  this.arrow = game.add.sprite(0,0,'arrow');
  this.arrow.anchor.set(0.5,0.5)

  // set up the tile layer to draw the walls and towers
  this.layer = this.map.create(
    'layer', // key of layer
    this.width, this.height, // the number of tiles wide/high the grid is
    this.tileSize, this.tileSize, // the size of the individual tiles
    this.group // the group the layer is added to
  )
  
  // fill map with empty tiles
  this.map.fill(0, 0, 0, this.width, this.height, this.layer)

  // create a buffer around the tile map to make room for user interface and background elements
  // TODO: This method sucks. Find a better way.
  game.world.setBounds(0,-this.buffer, this.map.widthInPixels+this.buffer*2, this.map.heightInPixels+this.buffer*2);
  game.camera.x = 0; game.camera.y = -this.buffer;
  this.layer.resizeWorld();

  // initialize the pathfinder for the creeps
  this.finder = new PF.AStarFinder();

  this.center = {};
  this.center.x = Math.floor(this.width/2);
  this.center.y = Math.floor(this.height/2);
  this.center.tile = this.map.getTile(this.center.x, this.center.y);

  this.clear();
  this.drawWaypoints();
}

Grid.prototype.constructor = Grid;

Grid.prototype.setConfig = function(opts){
  // initialize config vars for grid
  opts = opts || {};
  this.width = opts.width || 15;
  this.height = opts.height || 25;
  this.tileSize = this.tileSize = opts.tileSize || 50;
  this.buffer = (game.height - this.height*this.tileSize)/2;
  
  var middle = Math.ceil( (this.height-1) / 2);
  this.waypoints = [
    {x: 0, y: 0}
  ];
}

Grid.prototype.setData = function(val, x, y){
  // set status for an individual node and trigger an update to enemies and server
  this.data[y][x] = val;
  // game.enemies.updatePaths();
  // game.eurecaServer.syncGridData(this.data);
}

Grid.prototype.clear = function(direction) {
  // reset grid data to be completely walkable
  this.data = [];
  for(var i = 0; i < this.height; i++) {
    this.data[i] = [];
    for(var j = 0; j < this.width; j++) {
      this.data[i][j] = 0;
    }
  }
  this.openCenter(0);
}

Grid.prototype.openCenter = function(direction) {
  var x,y, angle
  this.data[this.center.y-1][this.center.x-1] = 1;
  this.data[this.center.y-1][this.center.x+1] = 1;
  this.data[this.center.y  ][this.center.x  ] = 1;
  this.data[this.center.y+1][this.center.x-1] = 1;
  this.data[this.center.y+1][this.center.x+1] = 1;

  this.data[this.center.y-1][this.center.x] = 1; // up
  this.data[this.center.y+1][this.center.x] = 1; // down
  this.data[this.center.y][this.center.x-1] = 1; // left
  this.data[this.center.y][this.center.x+1] = 1; // right
  if (direction === 0) {
    x = this.center.x; y = this.center.y-1; angle = 0;
  } else if (direction === 1) {
    x = this.center.x; y = this.center.y+1; angle = 180;
  } else if (direction === 2) {
    x = this.center.x-1; y = this.center.y; angle = 270;
  } else {
    x = this.center.x+1; y = this.center.y; angle = 90;
  }
  this.data[y][x] = 0;
  this.arrow.position.set(x*50+this.arrow.width/2, y*50+this.arrow.height/2)
  this.arrow.angle = angle
}

Grid.prototype.getPath = function(start, end, toVector) {
  // given a start and end point, return the shortest path to that point
  var toVector = toVector || true;
  var grid = new PF.Grid(this.width, this.height, this.data);
  var path = this.finder.findPath(start.x, start.y, end.x, end.y, grid);
  if (path.length === 0) return false
  path = PF.Util.expandPath(path);
  if(toVector) {
    for(var i = 0; i < path.length; i++) {
      path[i] = {x: path[i][0], y: path[i][1]}
    }
  }
  if (path) {
    return path
  } else{
    return false
  }
}

Grid.prototype.drawWaypoints = function() {
  // draw each of the home bases
  for(var i = 0; i < this.waypoints.length; i++) {
    var tile = this.map.getTile(this.waypoints[i].x, this.waypoints[i].y, this.layer);
    this.graphics.drawRect(tile.worldX, tile.worldY, this.tileSize, this.tileSize);
  }
}

Grid.prototype.syncTowersVsData = function() {
    this.map.removeTile()
  // compare the current tower setup the the data stored for the grid and reconcile
  for(var i = 0; i < this.data.length; i++) {
    for(var j = 0; j < this.data[i].length; j++) {
      if (this.data[j][i] > 0) {
        var type = this.data[j][i]
        var tile = this.map.getTile(i,j,this.layer)
        game.grid.map.putTile(type, tile.x, tile.y, this.layer);
        game.ui.placeTower(tile.worldX, tile.worldY)
      }
    }
  }
}
module.exports = Grid;
},{}],7:[function(require,module,exports){
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
},{"../entities/tower.js":8}],8:[function(require,module,exports){
var Tower = function(x, y) {
  Phaser.Sprite.call(this, game, x, y, 'tower');
  this.anchor.setTo(0.5,0.5)
  this.range = 300;
  game.towers.add(this);
  game.time.events.loop(Phaser.Timer.SECOND/4, this.shoot, this)
}

Tower.prototype = Object.create(Phaser.Sprite.prototype)
Tower.prototype.constructor = Tower;

Tower.prototype.pointAt = function(enemy) {
  this.rotation = game.physics.arcade.angleToXY(this, enemy.x, enemy.y);
}

Tower.prototype.update = function(enemy) {
  var potentialTargets = game.enemies.getAliveEnemies();
  var lastDistance = null;
  for(var i = 0; i < potentialTargets.length; i++) {
    var distance = game.physics.arcade.distanceToXY(this, potentialTargets[i].x, potentialTargets[i].y);
    if(!lastDistance || lastDistance > distance) {
      lastDistance = distance;
      this.target = potentialTargets[i]
    }
  }
  if (this.target && this.target.alive) {
    this.pointAt(this.target);
  }
}

Tower.prototype.shoot = function(enemy) {
  if(!this.target || !this.target.alive) return
  var distance = game.physics.arcade.distanceToXY(this, this.target.x, this.target.y);
  if (this.range >= distance) {
    var bullet = game.bullets.create(this.x, this.y, 'bullet')
    game.physics.enable(bullet)
    bullet.outOfBoundsKill = true;
    game.physics.arcade.moveToXY(bullet, this.target.x, this.target.y, 200, 200)
  }
}

module.exports = Tower
},{}],9:[function(require,module,exports){
window.game = new Phaser.Game(750, 1334, Phaser.AUTO, 'game-container');

game.state.add('play', require('./states/play.js'));
game.state.add('load', require('./states/load.js'));
game.state.add('menu', require('./states/menu.js'));
game.state.add('boot', require('./states/boot.js'));
game.state.start('boot');

},{"./states/boot.js":11,"./states/load.js":12,"./states/menu.js":13,"./states/play.js":14}],10:[function(require,module,exports){
'use strict';


/**
* @author       Jeremy Dowell <jeremy@codevinsky.com>
* @license      {@link http://www.wtfpl.net/txt/copying/|WTFPL}
*/

/**
* Creates a new `Juicy` object.
*
* @class Phaser.Plugin.Juicy
* @constructor
*
* @param {Phaser.Game} game Current game instance.
*/
Phaser.Plugin.Juicy = function (game) {

  Phaser.Plugin.call(this, game);

  /**
  * @property {Phaser.Rectangle} _boundsCache - A reference to the current world bounds.
  * @private
  */
  this._boundsCache = Phaser.Utils.extend(false, {}, this.game.world.bounds);

  /**
  * @property {number} _shakeWorldMax - The maximum world shake radius
  * @private
  */
  this._shakeWorldMax = 20;

  /**
  * @property {number} _shakeWorldTime - The maximum world shake time
  * @private
  */
  this._shakeWorldTime = 0;

  /**
  * @property {number} _trailCounter - A count of how many trails we're tracking
  * @private
  */  
  this._trailCounter = 0;

  /**
  * @property {object} _overScales - An object containing overscaling configurations
  * @private
  */  
  this._overScales = {};

  /**
  * @property {number} _overScalesCounter - A count of how many overScales we're tracking
  * @private
  */  
  this._overScalesCounter = 0;
};


Phaser.Plugin.Juicy.prototype = Object.create(Phaser.Plugin.prototype);
Phaser.Plugin.Juicy.prototype.constructor = Phaser.Plugin.Juicy;



/**
* Creates a new `Juicy.ScreenFlash` object.
*
* @class Phaser.Plugin.Juicy.ScreenFlash
* @constructor
*
* @param {Phaser.Game} game -  Current game instance.
* @param {string} color='white' - The color to flash the screen.
* @memberof Phaser.Plugin.Juicy
*/
Phaser.Plugin.Juicy.ScreenFlash = function(game, color) {
  color = color || 'white';
  var bmd = game.add.bitmapData(game.width, game.height);
  bmd.ctx.fillStyle = color;
  bmd.ctx.fillRect(0,0, game.width, game.height);

  Phaser.Sprite.call(this, game, 0,0, bmd);
  this.alpha = 0;
};

Phaser.Plugin.Juicy.ScreenFlash.prototype = Object.create(Phaser.Sprite.prototype);
Phaser.Plugin.Juicy.ScreenFlash.prototype.constructor = Phaser.Plugin.Juicy.ScreenFlash;


/*
* Flashes the screen
*
* @param {number} [maxAlpha=1] - The maximum alpha to flash the screen to
* @param {number} [duration=100] - The duration of the flash in milliseconds
* @method Phaser.Plugin.Juicy.ScreenFlash.prototype.flash
* @memberof Phaser.Plugin.Juicy.ScreenFlash
*/
Phaser.Plugin.Juicy.ScreenFlash.prototype.flash = function(maxAlpha, duration) {
  maxAlpha = maxAlpha || 1;
  duration = duration || 100;
  var flashTween = this.game.add.tween(this).to({alpha: maxAlpha}, 100, Phaser.Easing.Bounce.InOut, true,0, 0, true);
  flashTween.onComplete.add(function() {
    this.alpha = 0;
  }, this);
};

/**
* Creates a new `Juicy.Trail` object.
*
* @class Phaser.Plugin.Juicy.Trail
* @constructor
*
* @param {Phaser.Game} game -  Current game instance.
* @param {number} [trailLength=100] - The length of the trail
* @param {number} [color=0xFFFFFF] - The color of the trail
* @memberof Phaser.Plugin.Juicy
*/
Phaser.Plugin.Juicy.Trail = function(game, trailLength, color) {
  Phaser.Graphics.call(this, game, 0,0);
  
  /**
  * @property {Phaser.Sprite} target - The target sprite whose movement we want to create the trail from
  */
  this.target = null;
  /**
  * @property {number} trailLength - The number of segments to use to create the trail
  */
  this.trailLength = trailLength || 10;
  /**
  * @property {number} trailWidth - The width of the trail
  */
  this.trailWidth = 15.0;

  /**
  * @property {boolean} trailScale - Whether or not to taper the trail towards the end
  */
  this.trailScaling = false;

  /**
  * @property {Phaser.Sprite} trailColor - The color of the trail
  */
  this.trailColor = color || 0xFFFFFF;
  
  /**
  * @property {Array<Phaser.Point>} _segments - A historical collection of the previous position of the target
  * @private
  */
  this._segments = [];
  /**
  * @property {Array<number>} _verts - A collection of vertices created from _segments
  * @private
  */
  this._verts = [];
  /**
  * @property {Array<Phaser.Point>} _segments - A collection of indices created from _verts
  * @private
  */
  this._indices = [];

};

Phaser.Plugin.Juicy.Trail.prototype = Object.create(Phaser.Graphics.prototype);
Phaser.Plugin.Juicy.Trail.prototype.constructor = Phaser.Plugin.Juicy.Trail;

/**
* Updates the Trail if a target is set
*
* @method Phaser.Plugin.Juicy.Trail#update
* @memberof Phaser.Plugin.Juicy.Trail
*/


/*
* Draws a {Phaser.Polygon} or a {PIXI.Polygon} filled
*
* @method Phaser.Graphics.prototype.drawPolygon
*/

Phaser.Plugin.Juicy.Trail.prototype.drawPolygon = function (poly) {

    this.moveTo(poly.points[0].x, poly.points[0].y);

    for (var i = 1; i < poly.points.length; i += 1)
    {
        this.lineTo(poly.points[i].x, poly.points[i].y);
    }

    this.lineTo(poly.points[0].x, poly.points[0].y);

};

Phaser.Plugin.Juicy.Trail.prototype.update = function() {
  if(this.target) {
    this.x = this.target.x;
    this.y = this.target.y;
  }
};

/**
* Adds a segment to the segments list and culls the list if it is too long
* 
* @param {number} [x] - The x position of the point
* @param {number} [y] - The y position of the point
* 
* @method Phaser.Plugin.Juicy.Trail#addSegment
* @memberof Phaser.Plugin.Juicy.Trail
*/
Phaser.Plugin.Juicy.Trail.prototype.addSegment = function(x, y) {
  var segment;

  while(this._segments.length > this.trailLength) {
    segment = this._segments.shift();
  }
  if(!segment) {
    segment = new Phaser.Point();
  }

  segment.x = x;
  segment.y = y;

  this._segments.push(segment);
};


/**
* Creates and draws the triangle trail from segments
* 
* @param {number} [offsetX] - The x position of the object
* @param {number} [offsetY] - The y position of the object
* 
* @method Phaser.Plugin.Juicy.Trail#redrawSegment
* @memberof Phaser.Plugin.Juicy.Trail
*/
Phaser.Plugin.Juicy.Trail.prototype.redrawSegments = function(offsetX, offsetY) {
  this.clear();
  var s1, // current segment
      s2, // previous segment
      vertIndex = 0, // keeps track of which vertex index we're at
      offset, // temporary storage for amount to extend line outwards, bigger = wider
      ang, //temporary storage of the inter-segment angles
      sin = 0, // as above
      cos = 0; // again as above

  // first we make sure that the vertice list is the same length as we we want
  // each segment (except the first) will create to vertices with two values each
  if (this._verts.length !== (this._segments.length -1) * 4) {
    // if it's not correct, we clear the entire list
    this._verts = [];
  }

  // now we loop over all the segments, the list has the "youngest" segment at the end
  var prevAng = 0;
  
  for(var j = 0; j < this._segments.length; ++j) {
    // store the active segment for convenience
    s1 = this._segments[j];

    // if there's a previous segment, time to do some math
    if(s2) {
      // we calculate the angle between the two segments
      // the result will be in radians, so adding half of pi will "turn" the angle 90 degrees
      // that means we can use the sin and cos values to "expand" the line outwards
      ang = Math.atan2(s1.y - s2.y, s1.x - s2.x) + Math.PI / 2;
      sin = Math.sin(ang);
      cos = Math.cos(ang);

      // now it's time to creat ethe two vertices that will represent this pair of segments
      // using a loop here is probably a bit overkill since it's only two iterations
      for(var i = 0; i < 2; ++i) {
        // this makes the first segment stand out to the "left" of the line
        // annd the second to the right, changing that magic number at the end will alther the line width
        offset = ( -0.5 + i / 1) * this.trailWidth;

        // if trail scale effect is enabled, we scale down the offset as we move down the list
        if(this.trailScaling) {
          offset *= j / this._segments.length;
        }

        // finally we put to values in the vert list
        // using the segment coordinates as a base we add the "extended" point
        // offsetX and offsetY are used her to move the entire trail
        this._verts[vertIndex++] = s1.x + cos * offset - offsetX;
        this._verts[vertIndex++] = s1.y + sin * offset - offsetY;
      }
    }
    // finally store the current segment as the previous segment and go for another round
    s2 = s1.copyTo({});
  }
  // we need at least four vertices to draw something
  if(this._verts.length >= 8) {
    // now, we have a triangle "strip", but flash can't draw that without 
    // instructions for which vertices to connect, so it's time to make those
    
    // here, we loop over all the vertices and pair them together in triangles
    // each group of four vertices forms two triangles
    for(var k = 0; k < this._verts.length; k++) {
      this._indices[k * 6 + 0] = k * 2 + 0;
      this._indices[k * 6 + 1] = k * 2 + 1;
      this._indices[k * 6 + 2] = k * 2 + 2;
      this._indices[k * 6 + 3] = k * 2 + 1;
      this._indices[k * 6 + 4] = k * 2 + 2;
      this._indices[k * 6 + 5] = k * 2 + 3;
    }
    this.beginFill(this.trailColor);
    this.drawTriangles(this._verts, this._indices);
    this.endFill();
    
  }
};






/**
* Add a Sprite reference to this Plugin.
* All this plugin does is move the Sprite across the screen slowly.
* @type {Phaser.Sprite}
*/

/**
* Begins the screen shake effect
* 
* @param {number} [duration=20] - The duration of the screen shake
* @param {number} [strength=20] - The strength of the screen shake
* 
* @method Phaser.Plugin.Juicy#redrawSegment
* @memberof Phaser.Plugin.Juicy
*/
Phaser.Plugin.Juicy.prototype.shake = function (duration, strength) {
  this._shakeWorldTime = duration || 20;
  this._shakeWorldMax = strength || 20;
  this.game.world.setBounds(this._boundsCache.x - this._shakeWorldMax, this._boundsCache.y - this._shakeWorldMax, this._boundsCache.width + this._shakeWorldMax, this._boundsCache.height + this._shakeWorldMax);
};


/**
* Creates a 'Juicy.ScreenFlash' object
*
* @param {string} color - The color of the screen flash
* 
* @type {Phaser.Plugin.Juicy.ScreenFlash}
*/

Phaser.Plugin.Juicy.prototype.createScreenFlash = function(color) {
    return new Phaser.Plugin.Juicy.ScreenFlash(this.game, color);
};


/**
* Creates a 'Juicy.Trail' object
*
* @param {number} length - The length of the trail
* @param {number} color - The color of the trail
* 
* @type {Phaser.Plugin.Juicy.Trail}
*/
Phaser.Plugin.Juicy.prototype.createTrail = function(length, color) {
  return new Phaser.Plugin.Juicy.Trail(this.game, length, color);
};


/**
* Creates the over scale effect on the given object
*
* @param {Phaser.Sprite} object - The object to over scale
* @param {number} [scale=1.5] - The scale amount to overscale by
* @param {Phaser.Point} [initialScale=new Phaser.Point(1,1)] - The initial scale of the object
* 
*/
Phaser.Plugin.Juicy.prototype.overScale = function(object, scale, initialScale) {
  scale = scale || 1.5;
  var id = this._overScalesCounter++;
  initialScale = initialScale || new Phaser.Point(1,1);
  var scaleObj = this._overScales[id];
  if(!scaleObj) {
    scaleObj = {
      object: object,
      cache: initialScale.copyTo({})
    };
  } 
  scaleObj.scale = scale;
  
  this._overScales[id] = scaleObj;
};

/**
* Creates the jelly effect on the given object
*
* @param {Phaser.Sprite} object - The object to gelatinize
* @param {number} [strength=0.2] - The strength of the effect
* @param {number} [delay=0] - The delay of the snap-back tween. 50ms are automaticallly added to whatever the delay amount is.
* @param {Phaser.Point} [initialScale=new Phaser.Point(1,1)] - The initial scale of the object
* 
*/
Phaser.Plugin.Juicy.prototype.jelly = function(object, strength, delay, initialScale) {
  strength = strength || 0.2;
  delay = delay || 0;
  initialScale = initialScale ||  new Phaser.Point(1, 1);
  
  this.game.add.tween(object.scale).to({x: initialScale.x + (initialScale.x * strength)}, 50, Phaser.Easing.Quadratic.InOut, true, delay)
  .to({x: initialScale.x}, 600, Phaser.Easing.Elastic.Out, true);

  this.game.add.tween(object.scale).to({y: initialScale.y + (initialScale.y * strength)}, 50, Phaser.Easing.Quadratic.InOut, true, delay + 50)
  .to({y: initialScale.y}, 600, Phaser.Easing.Elastic.Out, true);
};

/**
* Creates the mouse stretch effect on the given object
*
* @param {Phaser.Sprite} object - The object to mouse stretch
* @param {number} [strength=0.5] - The strength of the effect
* @param {Phaser.Point} [initialScale=new Phaser.Point(1,1)] - The initial scale of the object
* 
*/
Phaser.Plugin.Juicy.prototype.mouseStretch = function(object, strength, initialScale) {
    strength = strength || 0.5;
    initialScale = initialScale || new Phaser.Point(1,1);
    object.scale.x = initialScale.x + (Math.abs(object.x - this.game.input.activePointer.x) / 100) * strength;
    object.scale.y = initialScale.y + (initialScale.y * strength) - (object.scale.x * strength);
};

/**
* Runs the core update function and causes screen shake and overscaling effects to occur if they are queued to do so.
*
* @method Phaser.Plugin.Juicy#update
* @memberof Phaser.Plugin.Juicy
*/
Phaser.Plugin.Juicy.prototype.update = function () {
  var scaleObj;
  // Screen Shake
  if(this._shakeWorldTime > 0) { 
    var magnitude = (this._shakeWorldTime / this._shakeWorldMax) * this._shakeWorldMax;
    var x = this.game.rnd.integerInRange(-magnitude, magnitude);
    var y = this.game.rnd.integerInRange(-magnitude, magnitude);

    this.game.camera.x = x;
    this.game.camera.y = y;
    this._shakeWorldTime--;
    if(this._shakeWorldTime <= 0) {
      this.game.world.setBounds(this._boundsCache.x, this._boundsCache.x, this._boundsCache.width, this._boundsCache.height);
    }
  }

  // over scales
  for(var s in this._overScales) {
    if(this._overScales.hasOwnProperty(s)) {
      scaleObj = this._overScales[s];
      if(scaleObj.scale > 0.01) {
        scaleObj.object.scale.x = scaleObj.scale * scaleObj.cache.x;
        scaleObj.object.scale.y = scaleObj.scale * scaleObj.cache.y;
        scaleObj.scale -= this.game.time.elapsed * scaleObj.scale * 0.35;
      } else {
        scaleObj.object.scale.x = scaleObj.cache.x;
        scaleObj.object.scale.y = scaleObj.cache.y;
        delete this._overScales[s];
      }
    }
  }
};

// for browserify compatibility
if(typeof module === 'object' && module.exports) {
  module.exports = Phaser.Plugin.Juicy;
}



// Draw Triangles Polyfill for back compatibility
if(!Phaser.Graphics.prototype.drawTriangle) {
  Phaser.Graphics.prototype.drawTriangle = function(points, cull) {
      var triangle = new Phaser.Polygon(points);
      if (cull) {
          var cameraToFace = new Phaser.Point(this.game.camera.x - points[0].x, this.game.camera.y - points[0].y);
          var ab = new Phaser.Point(points[1].x - points[0].x, points[1].y - points[0].y);
          var cb = new Phaser.Point(points[1].x - points[2].x, points[1].y - points[2].y);
          var faceNormal = cb.cross(ab);
          if (cameraToFace.dot(faceNormal) > 0) {
              this.drawPolygon(triangle);
          }
      } else {
          this.drawPolygon(triangle);
      }
      return;
  };

  /*
  * Draws {Phaser.Polygon} triangles 
  *
  * @param {Array<Phaser.Point>|Array<number>} vertices - An array of Phaser.Points or numbers that make up the vertices of the triangles
  * @param {Array<number>} {indices=null} - An array of numbers that describe what order to draw the vertices in
  * @param {boolean} [cull=false] - Should we check if the triangle is back-facing
  * @method Phaser.Graphics.prototype.drawTriangles
  */

  Phaser.Graphics.prototype.drawTriangles = function(vertices, indices, cull) {

      var point1 = new Phaser.Point(),
          point2 = new Phaser.Point(),
          point3 = new Phaser.Point(),
          points = [],
          i;

      if (!indices) {
          if(vertices[0] instanceof Phaser.Point) {
              for(i = 0; i < vertices.length / 3; i++) {
                  this.drawTriangle([vertices[i * 3], vertices[i * 3 + 1], vertices[i * 3 + 2]], cull);
              }
          } else {
              for (i = 0; i < vertices.length / 6; i++) {
                  point1.x = vertices[i * 6 + 0];
                  point1.y = vertices[i * 6 + 1];
                  point2.x = vertices[i * 6 + 2];
                  point2.y = vertices[i * 6 + 3];
                  point3.x = vertices[i * 6 + 4];
                  point3.y = vertices[i * 6 + 5];
                  this.drawTriangle([point1, point2, point3], cull);
              }

          }
      } else {
          if(vertices[0] instanceof Phaser.Point) {
              for(i = 0; i < indices.length /3; i++) {
                  points.push(vertices[indices[i * 3 ]]);
                  points.push(vertices[indices[i * 3 + 1]]);
                  points.push(vertices[indices[i * 3 + 2]]);
                  if(points.length === 3) {
                      this.drawTriangle(points, cull);    
                      points = [];
                  }
                  
              }
          } else {
              for (i = 0; i < indices.length; i++) {
                  point1.x = vertices[indices[i] * 2];
                  point1.y = vertices[indices[i] * 2 + 1];
                  points.push(point1.copyTo({}));
                  if (points.length === 3) {
                      this.drawTriangle(points, cull);
                      points = [];
                  }
              }
          }
      }
  };
}
},{}],11:[function(require,module,exports){
module.exports = {

  preload: function () {
    this.load.baseURL = 'src/assets/';
  },

  create: function () {
    this.input.maxPointers = 1;

    // auto pause if window loses focus
    this.stage.disableVisibilityChange = true;
    
    // set up scale mode
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.scale.pageAlignHorizontally = true;
    this.scale.pageAlignVertically = true;
    game.scale.setScreenSize(true);

    game.state.start('load', true, false);
  }
};
},{}],12:[function(require,module,exports){
module.exports = {
  constructor: function() {
    this.loadingSprite = null;
  },

  preload: function() {
    this.load.onLoadComplete.addOnce(this.onLoadComplete, this);

    this.load.spritesheet('button', 'images/button.png', 193, 71);
    this.load.image('spawner', 'images/spawner.png');
    this.load.image('bullet', 'images/bullet.png');
    this.load.image('arrow', 'images/arrow.png');
    this.load.image('towerMenu', 'images/selector2.png');
    this.load.image('tower', 'images/tower.png');
    this.load.image('towerbutton', 'images/towerbutton.png');
    this.load.image('wallbutton', 'images/wallbutton.png');
    this.load.image('bg', 'images/bg.jpg');
    this.load.image('enemy', 'images/enemy4.png');
    this.load.image('tile', 'images/tile3.png');
    this.load.image('wall', 'images/tile.png');
  },

  onLoadComplete: function() {
    game.state.start('play', true, false);
  }
}
},{}],13:[function(require,module,exports){
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
},{}],14:[function(require,module,exports){
var EnemyManager = require('../entities/enemyManager.js');
var WallManager = require('../entities/WallManager.js');
var Grid = require('../entities/grid.js');
var Interface = require('../entities/interface.js');

module.exports = {
  create: function() {
    game.time.advancedTiming = true;
    game.time.desiredFps = 60;
    game.time.slowMotion = 1;
    game.juicy = game.plugins.add(require('../lib/juicy.js'));
    game.fpsProblemNotifier.add(this.handleFpsProblem, this);
    
    // initialize physics
    game.physics.startSystem(Phaser.Physics.ARCADE);

    // setup group for background elements
    game.backGroup = game.add.group();
    game.bullets = game.add.group()
    game.towers = game.add.group()

    // initialize individual game components
    game.grid = new Grid(game);
    game.enemies = new EnemyManager(game);
    game.walls = new WallManager(game);
    game.ui = new Interface(game);

    game.gui = new dat.GUI();
    game.gui.add(game.time, 'slowMotion', 0.1, 3);

    // start the game up!
    game.ui.startBuildPhase()
  },

  update: function() {
    // overlap enemies and bullets
    game.physics.arcade.overlap(game.enemies.group, game.bullets, this.bulletOverlap)
    // update ui elements / text
    game.ui.update();
  },

  bulletOverlap: function(enemy, bullet) {
    enemy.damage(1);
    bullet.kill();
  },
  
  handleFpsProblem: function() {
    // modify the game desired fps to match the current suggested fps
    game.time.desiredFps = game.time.suggestedFps;
  },

  render: function() {
    var p = game.input.activePointer;
    game.debug.text(Math.floor(p.x)+', '+Math.floor(p.y), 10, game.height-10, "#00ff00");  
    game.debug.text('fps: '+game.time.fps || '--', 10, game.height-30, "#00ff00");
  }
}

},{"../entities/WallManager.js":3,"../entities/enemyManager.js":5,"../entities/grid.js":6,"../entities/interface.js":7,"../lib/juicy.js":10}]},{},[9]);
