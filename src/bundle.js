(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{}],2:[function(require,module,exports){
var Enemy = function(game, opts) {
  var opts = opts || {}
  Phaser.Sprite.call(this, game, -50, -50, 'enemy');
  this.setConfig(opts);
  
  game.physics.enable(this);
  this.kill();

  this.setupTweens();
}

Enemy.prototype = Object.create(Phaser.Sprite.prototype)
Enemy.prototype.constructor = Enemy;

Enemy.prototype.setConfig = function(opts) {
  // initialize configs
  this.height = opts.size; this.width = opts.size;
  this.anchor.setTo(0.5,0.5);

  this.speed = opts.speed;
  this.maxHealth = opts.heath || 25;
  
  this.offset = game.grid.tileSize/2;
  this.nextWaypoint = 0;
}

Enemy.prototype.setupTweens = function(opts) {
  this.spin = game.add.tween(this);
  this.pulsate = game.add.tween(this.scale);
  var duration = game.rnd.integerInRange(1000,1500)
  var delay = game.rnd.integerInRange(100,1000)
  var angle = game.rnd.integerInRange(10,40)
  this.pulsate.to({x: 0.21, y:0.21}, duration, Phaser.Easing.Quadratic.InOut, true, delay, -1, true)
  this.spin.to({angle: angle}, duration, Phaser.Easing.Quadratic.InOut, true, delay, -1, true)
}

Enemy.prototype.spawn = function(tile) {
  // initialize this enemy from the spawner
  this.revive(this.maxHealth);
  this.x = tile.worldX + this.offset
  this.y = tile.worldY + this.offset
}

Enemy.prototype.updatePath = function(spacing) {
  var self = this;
  
  var tween = game.add.tween(this)
  if (this.nextWaypoint === 0) {
    tween.to({x: this.x}, spacing, Phaser.Easing.Linear.None);
    this.nextWaypoint++;
  }
  
  // determine the closest tile to the enemies current position
  var tile = game.grid.map.getTileWorldXY(this.x, this.y, game.grid.tileSize, game.grid.tileSize, game.grid.layer)
  var start = {x: tile.x, y: tile.y};

  // determine the next waypoint we want to go to
  var path1 = game.grid.getPath(start, game.grid.waypoints[0], true);
  var path2 = game.grid.getPath(start, game.grid.waypoints[1], true);
  var path;
  if (PF.Util.pathLength(path1) > PF.Util.pathLength(path2)) {
    path = game.grid.getPath(start, game.grid.waypoints[1]);
  } else {
    path = game.grid.getPath(start, game.grid.waypoints[0]);
  }
  
  // stop any tweens in progress 
  if (this.lastTween) {this.lastTween.stop();}
  this.lastTween = tween;
  this.lastPath = path
  // this.drawPath(path);

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
  game.ui.checkEndOfRound()
}

Enemy.prototype.getDistance = function(p1,p2) {
  return Math.sqrt( Math.pow((p1.x - p2.x), 2) + Math.pow((p1.y - p2.y), 2) );
}

module.exports = Enemy
},{}],3:[function(require,module,exports){
var Enemy = require('../entities/enemy.js')

var EnemyManager = function (game, opts)  {
  var opts = opts || {};

  this.setConfig(opts);
  this.createEnemyPool();
}

EnemyManager.prototype.constructor = EnemyManager;

EnemyManager.prototype.setConfig = function(opts) {
  // initialize configs
  this.tileSize = opts.tileSize || game.grid.tileSize;
  this.enemyHeight = opts.enemyHeight || this.tileSize*.9;
  this.enemySpeed = opts.enemySpeed || 15;
  
  // space between enemies in wave
  this.spacing = opts.spacing || 40 * this.tileSize;

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
  
  // create the next wave of enemies
  wavesize = wavesize || 5;
  var deadEnemies = this.getDeadEnemies();
  var enemiesToRevive = deadEnemies.splice(1, wavesize);
  for (var i = 0, enemy; enemy = enemiesToRevive[i++];) {
    enemy.spawn(this.getSpawnPosition());
  }
  this.updatePaths(enemiesToRevive);
  this.direction++;
  if (this.direction === 4) this.direction = 0;
}

EnemyManager.prototype.getSpawnPosition = function(enemies) {
  // direction the wave will spawn from this round
  if (this.direction === 0){
    return game.grid.map.getTile(game.grid.center.x, game.grid.center.y-1, game.grid.layer)
  } else if (this.direction === 1){
    return game.grid.map.getTile(game.grid.center.x, game.grid.center.y+1, game.grid.layer)
  } else if (this.direction === 2){
    return game.grid.map.getTile(game.grid.center.x-1, game.grid.center.y, game.grid.layer)
  } else {
    return game.grid.map.getTile(game.grid.center.x+1, game.grid.center.y, game.grid.layer)
  }
}

EnemyManager.prototype.updatePaths = function(enemies) {
  // trigger each enemy to update its pathfinding based on the current grid data
  var enemies = enemies || this.getAliveEnemies();
  for(var i = 0; i < enemies.length; i++) {
    var enemy = enemies[i];
    var spacing = this.spacing*i+1;
    enemy.updatePath(spacing);
  }
}

EnemyManager.prototype.getAliveEnemies = function() {
  return this.group.filter(function(obj){if(obj.alive===true)return obj }).list
}

EnemyManager.prototype.getDeadEnemies = function() {
  return this.group.filter(function(obj){if(obj.alive===false)return obj }).list
}

module.exports = EnemyManager
},{"../entities/enemy.js":2}],4:[function(require,module,exports){
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
  this.drawWaypoints();
  this.center = {x: Math.floor(this.width/2), y: Math.floor(this.height/2)}
  this.center.tile = this.map.getTile(this.center.x, this.center.y);


  // set unwalkable in center
  // this.map.fill(2, this.center.x-1, this.center.y-1, 3, 3, this.layer)

  this.clear();
}

Grid.prototype = Object.create(Phaser.Tilemap);
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
    {x: 0, y: 0}, 
    {x: this.width-1, y: this.height-1} 
  ];
}

Grid.prototype.setData = function(val, x, y){
  // set status for an individual node and trigger an update to enemies and server
  this.data[y][x] = val;
  game.enemies.updatePaths();
  game.eurecaServer.syncGridData(this.data);
}

Grid.prototype.clear = function() {
  // reset grid data to be completely walkable
  this.data = [];
  for(var i = 0; i < this.height; i++) {
    this.data[i] = [];
    for(var j = 0; j < this.width; j++) {
      this.data[i][j] = 0;
    }
  }
}

Grid.prototype.getPath = function(start, end, noConvert) {
  // given a start and end point, return the shortest path to that point
  var noConvert = noConvert || false;
  var grid = new PF.Grid(this.width, this.height, this.data);
  var path = this.finder.findPath(start.x, start.y, end.x, end.y, grid);
  if (path.length === 0) return
  path = PF.Util.expandPath(path);
  if(noConvert == false) {
    for(var i = 0; i < path.length; i++) {
      path[i] = {x: path[i][0], y: path[i][1]}
    }
  }
  return path
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
},{}],5:[function(require,module,exports){
var Tower = require('../entities/tower.js');

var Interface = function (game)  {
  game.input.onDown.add(this.updateMarker, this);

  this.buildTime = 10000;
  this.teamTowerFrame = (game.myTeam === 0) ? 2 : 3; // the index of the tileSprite we are painting with (0: empty, 1: wall)
  this.teamWallFrame = (game.myTeam === 0) ? 1 : 1; // the index of the tileSprite we are painting with (0: empty, 1: wall)

  // create flesh wall
  game.backGroup.create(0,0,'bg');
  
  // create key ui elements
  this.createCursor();
  this.createText();
  this.createTowerSelector();
  this.createSpawner();
}

Interface.prototype.constructor = Interface;

Interface.prototype.createCursor = function() {
  // create cursor that will follow the active pointer
  this.marker = game.add.graphics();
  this.marker.lineStyle(2, 0x000000, 1);
  this.marker.drawRect(0, 0, game.grid.tileSize, game.grid.tileSize);
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

Interface.prototype.createTowerSelector = function() {
  // create context menu for selecting next tower type
  var th = game.grid.tileSize/2;
  this.selectorOpen = false;

  this.towerMenu = game.add.group();
  game.world.bringToTop(this.towerMenu);

  this.menuBackground = this.towerMenu.create(0, 0, 'towerMenu')
  this.towerMenu.alpha = 0;
  this.menuBackground.anchor.setTo(0.5,0.5)

  this.vertTowerButton = game.add.button(0-100, 0-th, 'towerbutton', this.selectTower, this);
  this.vertWallButton = game.add.button(0+50, 0-th, 'wallbutton', this.selectWall, this);
  
  this.towerMenu.add(this.vertTowerButton)
  this.towerMenu.add(this.vertWallButton)

  this.horizTowerButton = game.add.button(0-th, -100, 'wallbutton', this.selectWall, this);
  this.horizWallButton = game.add.button(0-th, 50, 'towerbutton', this.selectTower, this);
  this.towerMenu.add(this.horizTowerButton)
  this.towerMenu.add(this.horizWallButton)
}

Interface.prototype.updateMarker = function(sprite, pointer) {
  var pointer = game.input.activePointer;
  if (pointer.worldX > 0 && pointer.worldY > 0) {
    
    // update position of marker
    this.marker.x = game.grid.layer.getTileX(pointer.worldX) * game.grid.tileSize;
    this.marker.y = game.grid.layer.getTileY(pointer.worldY) * game.grid.tileSize;
    if (this.lastPos) {
      var clickedOutsideMenu = (this.marker.x < this.lastPos.x-this.menuBackground.width/2 || this.marker.x > this.lastPos.x+this.menuBackground.width/2) ||(this.marker.y < this.lastPos.y-this.menuBackground.width/2 || this.marker.y > this.lastPos.y+this.menuBackground.width/2)
      if (clickedOutsideMenu){
        this.closeTowerSelector();
      }
    } else if (!this.selectorOpen) {
      this.lastPos = {x: this.marker.x, y: this.marker.y};
      this.openTowerSelector(this.marker.x,this.marker.y);
    }
  }
}

Interface.prototype.openTowerSelector = function(x, y) {
  var mode;
  if(x < 100 || x > game.width -100) mode = 1
  if(y < 100 || x > game.height -100) mode = 0

  if (mode === 1) { 
    // layout buttons vertically
    this.horizWallButton.alpha = 1; this.horizTowerButton.alpha = 1;
    this.vertWallButton.alpha = 0; this.vertTowerButton.alpha = 0;
    this.horizWallButton.inputEnabled = true; this.horizTowerButton.inputEnabled = true;
  } else {
    // layout buttons horizontally
    this.horizWallButton.alpha = 0; this.horizTowerButton.alpha = 0;
    this.vertWallButton.alpha = 1; this.vertTowerButton.alpha = 1;
    this.vertWallButton.inputEnabled = true; this.vertTowerButton.inputEnabled = true;
  }
  
  this.selectorOpen = true;
  this.towerMenu.x = x+game.grid.tileSize/2;
  this.towerMenu.y = y+game.grid.tileSize/2;

  var tween = game.add.tween(this.towerMenu);
  tween.to({alpha: 1}, 500, Phaser.Easing.Quadratic.Out, true).start();
}

Interface.prototype.closeTowerSelector = function(x, y) {
  this.selectorOpen = false;
  this.lastPos = null;
  var tween = game.add.tween(this.towerMenu);
  tween.to({alpha: 0}, 500, Phaser.Easing.Quadratic.Out, true).start();
  this.vertWallButton.inputEnabled = false; this.vertTowerButton.inputEnabled = false;
  this.horizWallButton.inputEnabled = false; this.horizTowerButton.inputEnabled = false;
  this.marker.position.setTo(-999,-999)
}

Interface.prototype.selectTower = function() {
  this.placeTower(this.lastPos.x,this.lastPos.y)
  this.closeTowerSelector();
}

Interface.prototype.selectWall = function() {
  this.placeWall(this.lastPos.x,this.lastPos.y)
  this.closeTowerSelector();
}

Interface.prototype.placeTower = function(x,y) {
  var tileX = game.grid.layer.getTileX(x);
  var tileY = game.grid.layer.getTileY(y);
  // place tile with our tower frame
  game.grid.map.putTile(this.teamTowerFrame, tileX, tileY, game.grid.layer);
  
  // if there is no tower where we are clicking
  if (game.grid.data[tileY][tileX] != 2 && game.grid.data[tileY][tileX] != 3) {
    var tower = new Tower(game, x+game.grid.tileSize/2, y+game.grid.tileSize/2);
  }
  // update data with new 
  game.grid.setData(this.teamTowerFrame, tileX, tileY);
}

Interface.prototype.placeWall = function(x,y) {
  var tileX = game.grid.layer.getTileX(x);
  var tileY = game.grid.layer.getTileY(y);
  // place tile with our tower frame
  
  game.grid.map.putTile(this.teamWallFrame, tileX, tileY, game.grid.layer);
  game.grid.setData(this.teamWallFrame, tileX, tileY);
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

Interface.prototype.startBuildPhase = function() {
  // create a timer til the start of the next round
  game.timeToNextRound = game.time.create(false);
  game.timeToNextRound.add(this.buildTime, game.enemies.spawnWave, game.enemies)
  game.timeToNextRound.start();
}

Interface.prototype.checkEndOfRound = function() {
  // check if there are any enemies left
  if (game.enemies.getAliveEnemies().length === 0) {
    // if not, send signal to server
    game.eurecaServer.sendRoundFinished(game.sessionId)
    this.waveText.text = 'waiting for other player';
  }
}

Interface.prototype.pickTile = function(sprite, pointer) {
  this.teamTowerFrame = game.math.snapToFloor(pointer.x, game.grid.tileSize) / game.grid.tileSize;
}
module.exports = Interface;
},{"../entities/tower.js":6}],6:[function(require,module,exports){
var Tower = function(game, x, y) {
  Phaser.Sprite.call(this, game, x, y, 'tower');
  this.anchor.setTo(0.5,0.5)
  this.shootTimer = 0;
  this.delay = 200+game.rnd.integerInRange(0,500);
  this.range = 300;
  this.target = game.enemies.getAliveEnemies()[0];
  game.towers.add(this);
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
  if (this.target) {
    this.pointAt(this.target);
    // this.shoot()
  }
}

Tower.prototype.shoot = function(enemy) {
  var distance = game.physics.arcade.distanceToXY(this, this.target.x, this.target.y);
  if (this.shootTimer < game.time.now && this.range >= distance) {
    this.shootTimer = game.time.now + this.delay;
    var bullet = game.bullets.create(this.x, this.y, 'bullet')
    game.physics.enable(bullet)
    bullet.outOfBoundsKill = true;
    game.physics.arcade.moveToXY(bullet, this.target.x, this.target.y, 200, 200)
  }
}

module.exports = Tower
},{}],7:[function(require,module,exports){
window.game = new Phaser.Game(750, 1334, Phaser.AUTO, 'game-container');

game.state.add('play', require('./states/play.js'));
game.state.add('load', require('./states/load.js'));
game.state.add('menu', require('./states/menu.js'));
game.state.add('boot', require('./states/boot.js'));
game.state.start('boot');

},{"./states/boot.js":8,"./states/load.js":9,"./states/menu.js":10,"./states/play.js":11}],8:[function(require,module,exports){
module.exports = {

  preload: function () {
    this.load.baseURL = 'src/assets/';
    this.load.image('preloader', 'images/preloader.gif');
    game.time.advancedTiming = true;
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
},{}],9:[function(require,module,exports){
module.exports = {
  constructor: function() {
    this.loadingSprite = null;
  },

  preload: function() {
    this.loadingSprite = this.add.sprite(320, 480, 'preloader');
    this.loadingSprite.anchor.setTo(0.5, 0.5);

    this.load.onLoadComplete.addOnce(this.onLoadComplete, this);
    this.load.setPreloadSprite(this.loadingSprite);

    this.load.spritesheet('button', 'images/button.png', 193, 71);
    this.load.image('spawner', 'images/spawner.png');
    this.load.image('bullet', 'images/bullet.png');
    this.load.image('towerMenu', 'images/selector2.png');
    this.load.image('tower', 'images/tower.png');
    this.load.image('towerbutton', 'images/towerbutton.png');
    this.load.image('wallbutton', 'images/wallbutton.png');
    this.load.image('logo', 'images/logo.png');
    this.load.image('bg', 'images/bg.jpg');
    this.load.image('enemy', 'images/enemy4.png');
    this.load.image('tile', 'images/tile3.png');
  },

  onLoadComplete: function() {
    game.state.start('menu', true, false);
  }
}
},{}],10:[function(require,module,exports){
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
    require('../../client.js').create();
  }
}
},{"../../client.js":1}],11:[function(require,module,exports){
var EnemyManager = require('../entities/enemyManager.js');
var Grid = require('../entities/grid.js');
var Interface = require('../entities/interface.js');

module.exports = {
  create: function() {
    // initialize physics
    game.physics.startSystem(Phaser.Physics.ARCADE);

    // setup group for background elements
    game.backGroup = game.add.group();
    game.bullets = game.add.group()
    game.towers = game.add.group()

    // initialize individual game components
    game.grid = new Grid(game);
    game.enemies = new EnemyManager(game);
    game.ui = new Interface(game);

    // start the game up!
    game.enemies.spawnWave()
  },

  update: function() {
    // overlap enemies and bullets
    game.physics.arcade.overlap(game.enemies.group, game.bullets, this.bulletOverlap)
    // update ui elements / text
    game.ui.updateTimer();
  },

  bulletOverlap: function(enemy, bullet) {
    enemy.damage(1);
    bullet.kill();
  },

  render: function() {
    var p = game.input.activePointer;
    game.debug.text(Math.floor(p.x)+', '+Math.floor(p.y), 10, game.height-10, "#00ff00");  
    game.debug.text('fps: '+game.time.fps || '--', 10, game.height-30, "#00ff00");
  }
}
},{"../entities/enemyManager.js":3,"../entities/grid.js":4,"../entities/interface.js":5}]},{},[7]);
