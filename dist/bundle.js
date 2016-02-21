(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./src/game.js":[function(require,module,exports){
"use strict";

window.game = new Phaser.Game(750, 1334, Phaser.AUTO);

game.state.add("play", require("./states/play.js"));
game.state.add("load", require("./states/load.js"));
game.state.add("menu", require("./states/menu.js"));
game.state.add("boot", require("./states/boot.js"));
game.state.start("boot");

},{"./states/boot.js":"/Users/danielwhiffing/Dropbox/js/phaser/towerdefense/src/states/boot.js","./states/load.js":"/Users/danielwhiffing/Dropbox/js/phaser/towerdefense/src/states/load.js","./states/menu.js":"/Users/danielwhiffing/Dropbox/js/phaser/towerdefense/src/states/menu.js","./states/play.js":"/Users/danielwhiffing/Dropbox/js/phaser/towerdefense/src/states/play.js"}],"/Users/danielwhiffing/Dropbox/js/phaser/towerdefense/src/entities/enemy-manager.js":[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Enemy = _interopRequire(require("../entities/enemy.js"));

var EnemyManager = (function () {
  function EnemyManager(opts) {
    _classCallCheck(this, EnemyManager);

    var opts = opts || {};
    this.wave_num = 0;
    this.wave_size = 5;
    this.setConfig(opts);
    this.setSpawnPoint();
    this.createEnemyPool();
    this.createSphincter();
  }

  _createClass(EnemyManager, {
    setConfig: {
      value: function setConfig(opts) {
        // initialize configs
        this.tileSize = opts.tileSize || game.grid.tileSize;
        this.enemyHeight = opts.enemyHeight || this.tileSize * 0.9;
        this.enemySpeed = opts.enemySpeed || 5;

        // space between enemies in wave
        this.spacing = opts.spacing || 40 * this.tileSize;
        this.spacing /= 20 / this.enemySpeed;

        // direction of next spawn (0: up, 1: down, 2: left, 3: right)
        this.direction = 0;
      }
    },
    setSpawnPoint: {
      value: function setSpawnPoint(x, y) {
        var center_tile = game.grid.getCenterTile();
        x = x || center_tile.worldX;
        y = y || center_tile.worldY;
        this.spawn_point = { x: x, y: y };
      }
    },
    createSphincter: {
      value: function createSphincter() {
        var center = game.grid.getCenterTile();
        var offset = game.grid.tileSize / 2;
        this.spawner = game.backGroup.create(center.worldX + offset, center.worldY + offset, "spawner");
        this.spawn_anim = this.spawner.animations.add("spawn", [0, 1, 2, 3, 4, 5, 6, 7, 6, 5, 4, 3, 2, 1], 60, true);
        this.idle_anim = this.spawner.animations.add("idle", [0, 1, 2, 3, 4, 5, 6, 7, 6, 5, 4, 3, 2, 1], 5, true);
        this.spawner.animations.play("idle");
        this.spawner.anchor.setTo(0.5, 0.5);
      }
    },
    createEnemyPool: {
      value: function createEnemyPool(opts) {
        this.group = game.add.group();
        for (var i = 0; i < 50; i++) {
          this.group.add(new Enemy({
            size: this.enemyHeight,
            speed: this.enemySpeed
          }));
        }
      }
    },
    spawnWave: {
      value: function spawnWave() {
        var _this = this;

        this.spawn_anim.speed = this.spacing / 10;
        this.spawner.animations.play("spawn");
        this.enemiesLeft = this.getDeadEnemies().splice(1, this.wave_size);
        this.enemiesLeft.forEach(function (enemy, index) {
          game.time.events.add(_this.spacing * index, function () {
            enemy.spawn(_this.spawn_point.x, _this.spawn_point.y, _this.spacing, _this.wave_num * 2);
            if (index + 1 === _this.wave_size) {
              _this.spawner.animations.play("idle");
            }
          });
        });
        this.direction = this.wave_num++ % 4;
      }
    },
    getAliveEnemies: {
      value: function getAliveEnemies() {
        var group = arguments[0] === undefined ? this.group : arguments[0];

        return group.filter(function (obj) {
          return obj.alive;
        }).list;
      }
    },
    getDeadEnemies: {
      value: function getDeadEnemies() {
        var group = arguments[0] === undefined ? this.group : arguments[0];

        return group.filter(function (obj) {
          return !obj.alive;
        }).list;
      }
    }
  });

  return EnemyManager;
})();

module.exports = EnemyManager;

},{"../entities/enemy.js":"/Users/danielwhiffing/Dropbox/js/phaser/towerdefense/src/entities/enemy.js"}],"/Users/danielwhiffing/Dropbox/js/phaser/towerdefense/src/entities/enemy.js":[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Enemy = (function (_Phaser$Sprite) {
  function Enemy() {
    var opts = arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, Enemy);

    _get(Object.getPrototypeOf(Enemy.prototype), "constructor", this).call(this, game, -50, -50, "enemy");
    game.physics.enable(this);
    this.setConfig(opts);
    Phaser.Sprite.prototype.kill.call(this);
  }

  _inherits(Enemy, _Phaser$Sprite);

  _createClass(Enemy, {
    setConfig: {
      value: function setConfig(opts) {
        this.speed = opts.speed;
        this.maxHealth = opts.heath || 8;
        this.anchor.setTo(0.5, 0.5);
        this.nextWaypoint = 0;

        this.offset = game.grid.tileSize / 2;
        this.height = opts.size;this.width = opts.size;
        this.death_animation = { height: 120, width: 120, alpha: 0, angle: -900 };
      }
    },
    spawn: {
      value: function spawn(x, y, spacing, health) {
        this.reset(x + this.offset, y + this.offset, health);

        game.add.tween(this).to({
          height: 50,
          width: 50
        }, spacing / 2, Phaser.Easing.Quadratic.InOut, true);

        game.add.tween(this).to({
          alpha: 1
        }, spacing / 2, Phaser.Easing.Quadratic.InOut, true);

        game.time.events.add(spacing / 2, this.startWave, this);
        this.nextWaypoint = 0;
      }
    },
    startWave: {
      value: function startWave() {
        var duration = game.rnd.integerInRange(this.speed * 90, this.speed * 100);
        var delay = game.rnd.integerInRange(100, 1000);
        this.pulsate = game.add.tween(this).to({ height: 60, width: 60 }, duration / 2, Phaser.Easing.Quadratic.InOut, true, delay, -1, true);
        this.spin = game.add.tween(this).to({ angle: 360 }, duration * 2, Phaser.Easing.Linear.None, true, delay, -1);

        this.pathTween = game.add.tween(this);
        if (this.nextWaypoint === 0) {
          this.pathTween.to({ x: this.x }, 10, Phaser.Easing.Linear.None);
          this.nextWaypoint++;
        }

        // determine the closest tile to the enemies current position
        var tile = game.grid.getWall(this.x, this.y);
        var path = game.grid.getPath({ x: tile.x, y: tile.y }, game.grid.waypoints[0]);

        // stop any tweens in progress
        if (this.lastTween) this.lastTween.stop();

        this.lastTween = this.pathTween;this.lastPath = path;

        // tween the enemy to that tile, and chain each tween needed to the next waypoint
        for (var j = 1; j < path.length; j++) {
          var nTile = game.grid.map.getTile(path[j].x, path[j].y, game.grid.wall_layer);
          var oTile = game.grid.map.getTile(path[j - 1].x, path[j - 1].y, game.grid.wall_layer);
          var nPos = { x: nTile.worldX, y: nTile.worldY };
          var oPos = { x: oTile.worldX, y: oTile.worldY };
          var distance = this.getDistance(nPos, oPos) * this.speed;
          this.pathTween.to({ x: nPos.x + this.offset, y: nPos.y + this.offset }, distance, Phaser.Easing.Linear.None);
        }
        this.pathTween.onComplete.add(this.kill, this);
        this.pathTween.start();
      }
    },
    kill: {
      value: function kill() {
        var _this = this;

        this.stopTweens();

        game.emitter.position.setTo(this.x, this.y);
        game.emitter.start(true, 4000, null, 10);

        game.add.tween(this).to(this.death_animation, 500, Phaser.Easing.Quadratic.Out, true).onComplete.add(function () {
          _this.scale.set(0, 0);
          Phaser.Sprite.prototype.kill.call(_this);
          game.ui.checkEndOfRound();
        });
      }
    },
    reset: {
      value: function reset(x, y, health) {
        this.scale.set(0, 0);
        this.alpha = 0;
        _get(Object.getPrototypeOf(Enemy.prototype), "reset", this).call(this, x, y, health);
      }
    },
    stopTweens: {
      value: function stopTweens() {
        if (this.pulsate) this.pulsate.stop();
        if (this.spin) this.spin.stop();
        if (this.pathTween) this.pathTween.stop();
      }
    },
    getDistance: {
      value: function getDistance(p1, p2) {
        return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
      }
    }
  });

  return Enemy;
})(Phaser.Sprite);

module.exports = Enemy;

},{}],"/Users/danielwhiffing/Dropbox/js/phaser/towerdefense/src/entities/grid.js":[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Grid = (function () {
  function Grid(opts) {
    _classCallCheck(this, Grid);

    // initialize config vars for grid
    opts = opts || {};
    this.width = opts.width || 15;
    this.height = opts.height || 25;
    this.tileSize = this.tileSize = opts.tileSize || 50;
    this.offset = { x: 50, y: 50 };

    var middle = Math.ceil((this.height - 1) / 2);
    this.waypoints = [{ x: 0, y: 0 }];

    this.newLevel();
  }

  _createClass(Grid, {
    newLevel: {
      value: function newLevel() {
        // temporary home base graphics
        this.graphics = game.add.graphics(this.offset.x, this.offset.y);
        this.graphics.lineStyle(0);
        this.graphics.beginFill(16776960);

        // temporary home base graphics
        this.gridLines = game.add.graphics(this.offset.x, this.offset.y);
        this.gridLines.lineStyle(1, 0);
        for (var x = 0; x <= this.tileSize * (this.width - 3); x += this.tileSize) {
          for (var y = 0; y <= this.tileSize * (this.height - 1); y += this.tileSize) {
            this.gridLines.moveTo(x, y);
            this.gridLines.drawRect(x, y, this.tileSize, this.tileSize);
          }
        }

        // initialize a Phaser tilemap to keep track of walls
        this.map = game.add.tilemap();
        this.map.setTileSize(this.tileSize, this.tileSize);
        this.map.addTilesetImage("tile");

        this.arrow = game.add.sprite(0, 0, "arrow");
        this.arrow.anchor.set(0.5, 0.5);

        // set up the tile layer to draw the walls
        this.wall_layer = this.map.create("wall_layer", this.width, this.height, // the number of tiles wide/high the grid is
        this.tileSize, this.tileSize // the size of the individual tiles
        );

        // adjust tile layer to be offset to center it and make room of the ui
        this.wall_layer.cameraOffset = {
          x: this.offset.x,
          y: this.offset.y
        };
        this.wall_layer.crop = {
          x: this.offset.x,
          y: this.offset.y,
          width: this.wall_layer.width - this.offset.x,
          height: this.wall_layer.height - this.offset.y
        };
        this.wall_layer.resizeWorld();

        // set up the tile layer to draw the towers
        this.tower_layer = this.map.createBlankLayer("tower_layer", this.width, this.height, // rowNum, colNum
        this.tileSize, this.tileSize // tile width/height
        );

        // adjust tile layer to be offset to center it and make room of the ui
        this.tower_layer.cameraOffset = {
          x: this.offset.x,
          y: this.offset.y
        };
        this.tower_layer.crop = {
          x: this.offset.x,
          y: this.offset.y,
          width: this.tower_layer.width - this.offset.x,
          height: this.tower_layer.height - this.offset.y
        };
        this.tower_layer.resizeWorld();

        // fill map with empty tiles
        this.map.fill(16, 0, 0, this.width, this.height, this.wall_layer);

        // initialize the pathfinder for the creeps
        this.finder = new PF.AStarFinder();

        this.center = {
          x: Math.floor(this.width / 2),
          y: Math.floor(this.height / 2)
        };
        this.center.tile = this.map.getTile(this.center.x, this.center.y) || this.map.putTileWorldXY(16, this.center.x, this.center.y, this.tileSize, this.tileSize, this.wall_layers);

        this.clear();
        this.drawWaypoints();
      }
    },
    clear: {
      value: function clear(direction) {
        // reset grid data to be completely walkable
        this.data = [];
        for (var i = 0; i < this.height; i++) {
          this.data[i] = [];
          for (var j = 0; j < this.width; j++) {
            this.data[i][j] = 0;
          }
        }
        if (this.map.getTile(this.center.y - 1, this.center.x - 1)) {

          this.map.getTile(this.center.y - 1, this.center.x - 1).index = 0;
          this.map.getTile(this.center.y - 1, this.center.x - 1).index = 0;
          this.map.getTile(this.center.y - 1, this.center.x + 1).index = 0;
          this.map.getTile(this.center.y, this.center.x).index = 0;
          this.map.getTile(this.center.y + 1, this.center.x - 1).index = 0;
          this.map.getTile(this.center.y + 1, this.center.x + 1).index = 0;
        }
        this.openCenter(0);
      }
    },
    getPath: {
      value: function getPath(start, end) {
        var toVector = arguments[2] === undefined ? true : arguments[2];

        // given a start and end point, return the shortest path to that point
        var grid = new PF.Grid(this.width, this.height, this.data);
        var path = this.finder.findPath(start.x, start.y, end.x, end.y, grid);
        if (path.length === 0) {
          return false;
        }path = PF.Util.expandPath(path);

        if (toVector) {
          for (var i = 0; i < path.length; i++) {
            path[i] = { x: path[i][0], y: path[i][1] };
          }
        }

        return path;
      }
    },
    setTileData: {
      value: function setTileData() {
        var layer = this.map.layers[0];
        for (var y = 0, h = layer.height; y < h; y++) {
          for (var x = 0, w = layer.width; x < w; x++) {
            var tile = layer.data[y][x];
            if (tile && tile.index !== 16) {
              var frame = 0,
                  above,
                  below,
                  left,
                  right;
              if (y > 0) above = layer.data[y - 1][x];
              if (y < layer.height - 1) below = layer.data[y + 1][x];
              if (x > 0) left = layer.data[y][x - 1];
              if (x < layer.width) right = layer.data[y][x + 1];
              if (above && above.index !== 16) frame += 1;
              if (right && right.index !== 16) frame += 2;
              if (below && below.index !== 16) frame += 4;
              if (left && left.index !== 16) frame += 8;
              this.map.putTile(frame, tile.x, tile.y, this.wall_layer);
            }
          }
        }
      }
    },
    drawWaypoints: {
      value: function drawWaypoints() {
        // draw each of the home bases
        for (var i = 0; i < this.waypoints.length; i++) {
          var tile = this.map.getTile(this.waypoints[i].x, this.waypoints[i].y, this.wall_layer);
          this.graphics.drawRect(tile.worldX, tile.worldY, this.tileSize, this.tileSize);
        }
      }
    },
    getCenterTile: {
      value: function getCenterTile() {
        return this.map.getTile(this.center.x, this.center.y, this.wall_layer);
      }
    },
    getWall: {
      value: function getWall(x, y) {
        return this.map.getTileWorldXY(x, y, this.tileSize, this.tileSize, this.wall_layer);
      }
    },
    set: {
      value: function set(val, x, y) {
        this.data[y][x] = val;
      }
    },
    get: {
      value: function get(x, y) {
        return this.data[y][x];
      }
    },
    getDataFor: {
      value: function getDataFor(tile) {
        return this.data[tile.y][tile.x];
      }
    },
    openCenter: {
      value: function openCenter(direction) {
        var x, y, angle;
        this.data[this.center.y - 1][this.center.x - 1] = 3;
        this.data[this.center.y - 1][this.center.x + 1] = 3;
        this.data[this.center.y][this.center.x] = 3;
        this.data[this.center.y + 1][this.center.x - 1] = 3;
        this.data[this.center.y + 1][this.center.x + 1] = 3;

        this.data[this.center.y - 1][this.center.x] = 3; // up
        this.data[this.center.y + 1][this.center.x] = 3; // down
        this.data[this.center.y][this.center.x - 1] = 3; // left
        this.data[this.center.y][this.center.x + 1] = 3; // right
        if (direction === 0) {
          x = this.center.x;y = this.center.y - 1;angle = 0;
        } else if (direction === 1) {
          x = this.center.x;y = this.center.y + 1;angle = 180;
        } else if (direction === 2) {
          x = this.center.x - 1;y = this.center.y;angle = 270;
        } else {
          x = this.center.x + 1;y = this.center.y;angle = 90;
        }
        this.data[y][x] = 0;
        this.arrow.position.set(x * 50 + this.arrow.width / 2, y * 50 + this.arrow.height / 2);
        this.arrow.angle = angle;
      }
    }
  });

  return Grid;
})();

module.exports = Grid;

},{}],"/Users/danielwhiffing/Dropbox/js/phaser/towerdefense/src/entities/interface.js":[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Tower = _interopRequire(require("../entities/tower.js"));

var Interface = (function () {
  function Interface() {
    _classCallCheck(this, Interface);

    this.buildTime = 3000;
    this.active = null;
    this.phase = 0;

    // create flesh wall
    game.backGroup.create(0, 0, "bg");

    // create cursor that will follow the active pointer
    this.marker = game.add.graphics();
    this.marker.lineStyle(2, 0, 1);
    this.marker.drawRect(0, 0, game.grid.tileSize, game.grid.tileSize);

    // create ui text
    this.waveText = game.add.text(game.width / 2, 50, "", { fill: "white", align: "center" });
    this.waveText.anchor.setTo(0.5, 0.5);
    this.status = game.add.text(100, game.height - 55, "", { fill: "white" });
    this.status.alpha = 0;

    game.input.onDown.add(this.attemptToPlace, this);
    game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR).onDown.add(this.rotateActive, this);
  }

  _createClass(Interface, {
    update: {
      value: function update() {
        this.updateMarker();
      }
    },
    updateMarker: {
      value: function updateMarker(sprite, pointer) {
        var pointer = game.input.activePointer;
        if (pointer.worldX > 0 && pointer.worldY > 0) {
          this.marker.x = game.grid.wall_layer.getTileX(pointer.worldX) * game.grid.tileSize;
          // this.marker.x += game.grid.offset.x
          this.marker.y = game.grid.wall_layer.getTileY(pointer.worldY) * game.grid.tileSize;
          // this.marker.y += game.grid.offset.y
        }
        if (this.active) {
          this.active.x = this.marker.x + game.grid.tileSize / 2;
          this.active.y = this.marker.y + game.grid.tileSize / 2;
        }
      }
    },
    rotateActive: {
      value: function rotateActive() {
        if (this.active) {
          this.active.angle += 90;
        }
      }
    },
    cloneArray: {
      value: function cloneArray(_arr) {
        var arr = _arr instanceof Array ? [] : {};
        for (var i in _arr) {
          if (i == "clone") continue;
          var recurse = _arr[i] && typeof _arr[i] == "object";
          arr[i] = recurse ? this.cloneArray(_arr[i]) : _arr[i];
        }
        return arr;
      }
    },
    attemptToPlace: {
      value: function attemptToPlace() {
        this.placementOk = true;
        this.backupData = this.cloneArray(game.grid.data);
        if (this.active) {
          var tiles = [];
          if (this.active instanceof Phaser.Group) {
            this.active.forEach(this.checkWallPos, this);
          } else {
            this.checkTowerPos(this.active, "tower");
          }
          if (this.placementOk) {
            this.placeActive();
          }
        }
      }
    },
    checkWallPos: {
      value: function checkWallPos(obj) {
        var tile = game.grid.getWall(obj.world.x, obj.world.y);
        // check if any tiles are over a wall already or out of boundsand flag if any are
        if (!tile) {
          this.setStatus(false, "wall is out of bounds");
        } else if (game.grid.data[tile.y][tile.x] !== 0) {
          this.setStatus(false, "wall is over another wall");
        }

        // try placing the tile and see if there is still a path to the exit
        game.grid.set(1, tile.x, tile.y);
        if (!game.grid.getPath(game.grid.center, game.grid.waypoints[0])) {
          this.setStatus(false, "creep path has been blocked");
        }
        game.grid.data = this.cloneArray(this.backupData);
      }
    },
    checkTowerPos: {
      value: function checkTowerPos(obj) {
        var tile = game.grid.getWall(obj.world.x, obj.world.y);
        if (game.grid.getDataFor(tile) === 0 || game.grid.getDataFor(tile) === 3) {
          this.setStatus(false, "tower must be placed on wall");
        } else if (game.grid.data[tile.y][tile.x] === 2) {
          this.setStatus(false, "tower cannot be placed on another tower");
        }
      }
    },
    placeActive: {
      value: function placeActive() {
        if (this.active instanceof Phaser.Group) {
          this.active.forEach(function (child) {
            this.placeThing(child.world.x, child.world.y, 1);
          }, this);
          this.active.destroy();
          this.active = game.walls.createTower();
        } else {
          this.placeThing(this.active.x, this.active.y, 2);
          this.active = null;
          this.startSpawnPhase();
        }
        game.grid.setTileData();
      }
    },
    placeThing: {
      value: function placeThing(x, y, i) {
        var size = game.grid.tileSize;
        var tile = game.grid.getWall(x - game.grid.offset.x, y - game.grid.offset.y);
        if (tile) {
          game.grid.map.putTile(i, tile.x, tile.y, game.grid.wall_layer);
          game.grid.set(i, tile.x, tile.y);
        }
      }
    },
    setStatus: {
      value: function setStatus(status) {
        var _this = this;

        var message = arguments[1] === undefined ? "" : arguments[1];

        this.status.text = message;
        this.placementOk = status;
        this.status.alpha = 1;
        game.time.events.add(1000, function () {
          _this.status.alpha = 0;
        });
        if (!this.placementOk) game.juicy.shake(20, 20);
      }
    },
    startBuildPhase: {
      value: function startBuildPhase() {
        this.phase = 0;
        game.grid.openCenter(game.enemies.direction);
        this.active = game.walls.createWall();
      }
    },
    startSpawnPhase: {
      value: function startSpawnPhase() {
        this.phase = 1;
        game.enemies.spawnWave();
      }
    },
    checkEndOfRound: {
      value: function checkEndOfRound() {
        if (game.enemies.getAliveEnemies().length === 0 && this.phase === 1) {
          this.startBuildPhase();
        }
      }
    }
  });

  return Interface;
})();

module.exports = Interface;

},{"../entities/tower.js":"/Users/danielwhiffing/Dropbox/js/phaser/towerdefense/src/entities/tower.js"}],"/Users/danielwhiffing/Dropbox/js/phaser/towerdefense/src/entities/tower.js":[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Tower = (function (_Phaser$Sprite) {
  function Tower(x, y) {
    _classCallCheck(this, Tower);

    _get(Object.getPrototypeOf(Tower.prototype), "constructor", this).call(this, game, x, y, "tower2");
    this.anchor.setTo(0.5, 0.5);
    this.range = 300;
    this.animations.add("idle", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18], 10, true);
    this.animations.play("idle");
    this.bulletSpeed = 200;
    this.shells = 1;
    game.towers.add(this);
    this.event = game.time.events.loop(Phaser.Timer.SECOND / 4, this.shoot, this);
  }

  _inherits(Tower, _Phaser$Sprite);

  _createClass(Tower, {
    update: {
      value: function update() {
        this.getTarget();
        this.pointAtTarget();
      }
    },
    getTarget: {
      value: function getTarget() {
        if (this.hasTarget) {
          return;
        }var enemies = game.enemies.getAliveEnemies();
        var lastDistance = null;
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = enemies[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var e = _step.value;

            var distance = game.physics.arcade.distanceToXY(this, e.x, e.y);
            if (!lastDistance || lastDistance > distance) {
              lastDistance = distance;
              this.target = e;
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator["return"]) {
              _iterator["return"]();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      }
    },
    shoot: {
      value: function shoot(enemy) {
        if (!this.hasTarget) {
          return;
        }var distance = game.physics.arcade.distanceToXY(this, this.target.x, this.target.y);
        if (this.range >= distance) {
          for (var i = 0; i < this.shells; i++) {
            this.createBullet();
          }
        } else {
          this.target = null;
        }
      }
    },
    createBullet: {
      value: function createBullet() {
        var target = arguments[0] === undefined ? this.target : arguments[0];
        var x = arguments[1] === undefined ? this.x : arguments[1];
        var y = arguments[2] === undefined ? this.y : arguments[2];
        var speed = arguments[3] === undefined ? this.bulletSpeed : arguments[3];

        var bullet = game.bullets.create(x, y, "bullet");
        game.physics.enable(bullet);
        bullet.outOfBoundsKill = true;
        game.physics.arcade.moveToXY(bullet, target.x, target.y, speed, speed);
      }
    },
    pointAtTarget: {
      value: function pointAtTarget() {
        if (!this.hasTarget) {
          return;
        }this.rotation = game.physics.arcade.angleToXY(this, this.target.x, this.target.y);
      }
    }
  });

  return Tower;
})(Phaser.Sprite);

Object.defineProperty(Tower.prototype, "hasTarget", {
  get: function get() {
    return this.target && this.target.alive;
  }
});

Object.defineProperty(Tower.prototype, "firerate", {
  get: function get() {
    return this.event.delay;
  },
  set: function set(value) {
    this.event.delay = value;
  }
});

module.exports = Tower;

},{}],"/Users/danielwhiffing/Dropbox/js/phaser/towerdefense/src/entities/wall-group.js":[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Wall = _interopRequire(require("../entities/wall.js"));

var WallGroup = (function (_Phaser$Group) {
  function WallGroup(shape) {
    _classCallCheck(this, WallGroup);

    _get(Object.getPrototypeOf(WallGroup.prototype), "constructor", this).call(this, game);
    for (var i = 0; i < shape.length; i++) {
      var x = shape[i][0] * game.grid.tileSize;
      var y = shape[i][1] * game.grid.tileSize;
      this.add(new Wall(x, y));
    }
  }

  _inherits(WallGroup, _Phaser$Group);

  return WallGroup;
})(Phaser.Group);

module.exports = WallGroup;

},{"../entities/wall.js":"/Users/danielwhiffing/Dropbox/js/phaser/towerdefense/src/entities/wall.js"}],"/Users/danielwhiffing/Dropbox/js/phaser/towerdefense/src/entities/wall-manager.js":[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var WallGroup = _interopRequire(require("../entities/wall-group.js"));

var Tower = _interopRequire(require("../entities/tower.js"));

var WallManager = (function () {
  function WallManager() {
    _classCallCheck(this, WallManager);

    this.test = [5, 4, 3, 2, 1];
    this.minos = [[], [// monomino
    [[0, 0]]], [// dominoes
    [[0, 0], [1, 0]]], [// triominoes
    [[0, 0], [1, 0], [2, 0]], [[0, 0], [1, 0], [0, 1]]], [// tetrominoes
    [[0, 0], [1, 0], [2, 0], [3, 0] // I
    ], [[0, 0], [1, 0], [0, 1], [1, 1] // O
    ], [[0, 0], [1, 0], [2, 0], [0, 1] // L
    ], [[0, 0], [1, 0], [2, 0], [2, 1] // J
    ], [[0, 0], [0, 1], [1, 1], [1, 2] // S
    ], [[0, 0], [1, 0], [1, 1], [1, 2] // Z
    ], [[0, 0], [1, 0], [2, 0], [1, 1] // T
    ]], [// pentominoes
    [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0] // I
    ], [[0, 0], [1, 0], [2, 0], [3, 0], [3, 1] // L
    ], [[0, 0], [1, 0], [2, 0], [3, 0], [1, 1] // Y
    ], [[0, 0], [0, 1], [1, 1], [1, 2], [2, 2] // W
    ], [[0, 0], [1, 0], [2, 0], [2, 1], [3, 1] // N
    ], [[0, 0], [1, 0], [2, 0], [0, 1], [2, 1] // U
    ], [[0, 0], [1, 0], [1, 1], [1, 2], [2, 2] // Z
    ], [[0, 0], [1, 0], [2, 0], [1, 1], [1, 2] // T
    ], [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2] // V
    ], [[1, 0], [2, 0], [1, 1], [0, 1], [1, 2] // F
    ], [[1, 0], [1, 1], [1, 2], [0, 1], [2, 1] // X
    ], [[0, 0], [1, 0], [0, 1], [1, 1], [0, 2] // P
    ]]];
  }

  _createClass(WallManager, {
    createWall: {
      value: function createWall() {
        var size = this.test[~ ~(Math.pow(game.rnd.frac(), 3) * (this.test.length - 1))];
        var shape = game.rnd.integerInRange(0, this.minos[size].length - 1);
        var wall = new WallGroup(this.minos[size][shape]);
        return wall;
      }
    },
    createTower: {
      value: function createTower() {
        var tower = new Tower(0, 0);
        return tower;
      }
    }
  });

  return WallManager;
})();

module.exports = WallManager;
// Straight
// Bent

},{"../entities/tower.js":"/Users/danielwhiffing/Dropbox/js/phaser/towerdefense/src/entities/tower.js","../entities/wall-group.js":"/Users/danielwhiffing/Dropbox/js/phaser/towerdefense/src/entities/wall-group.js"}],"/Users/danielwhiffing/Dropbox/js/phaser/towerdefense/src/entities/wall.js":[function(require,module,exports){
"use strict";

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Wall = (function (_Phaser$Sprite) {
  function Wall(x, y) {
    _classCallCheck(this, Wall);

    _get(Object.getPrototypeOf(Wall.prototype), "constructor", this).call(this, game, x, y, "wall");
    this.anchor.set(0.5, 0.5);
  }

  _inherits(Wall, _Phaser$Sprite);

  return Wall;
})(Phaser.Sprite);

module.exports = Wall;

},{}],"/Users/danielwhiffing/Dropbox/js/phaser/towerdefense/src/lib/juicy.js":[function(require,module,exports){
"use strict";

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
Phaser.Plugin.Juicy.ScreenFlash = function (game, color) {
  color = color || "white";
  var bmd = game.add.bitmapData(game.width, game.height);
  bmd.ctx.fillStyle = color;
  bmd.ctx.fillRect(0, 0, game.width, game.height);

  Phaser.Sprite.call(this, game, 0, 0, bmd);
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
Phaser.Plugin.Juicy.ScreenFlash.prototype.flash = function (maxAlpha, duration) {
  maxAlpha = maxAlpha || 1;
  duration = duration || 100;
  var flashTween = this.game.add.tween(this).to({ alpha: maxAlpha }, 100, Phaser.Easing.Bounce.InOut, true, 0, 0, true);
  flashTween.onComplete.add(function () {
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
Phaser.Plugin.Juicy.Trail = function (game, trailLength, color) {
  Phaser.Graphics.call(this, game, 0, 0);

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
  this.trailWidth = 15;

  /**
  * @property {boolean} trailScale - Whether or not to taper the trail towards the end
  */
  this.trailScaling = false;

  /**
  * @property {Phaser.Sprite} trailColor - The color of the trail
  */
  this.trailColor = color || 16777215;

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

  for (var i = 1; i < poly.points.length; i += 1) {
    this.lineTo(poly.points[i].x, poly.points[i].y);
  }

  this.lineTo(poly.points[0].x, poly.points[0].y);
};

Phaser.Plugin.Juicy.Trail.prototype.update = function () {
  if (this.target) {
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
Phaser.Plugin.Juicy.Trail.prototype.addSegment = function (x, y) {
  var segment;

  while (this._segments.length > this.trailLength) {
    segment = this._segments.shift();
  }
  if (!segment) {
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
Phaser.Plugin.Juicy.Trail.prototype.redrawSegments = function (offsetX, offsetY) {
  this.clear();
  var s1,
      // current segment
  s2,
      // previous segment
  vertIndex = 0,
      // keeps track of which vertex index we're at
  offset,
      // temporary storage for amount to extend line outwards, bigger = wider
  ang,
      //temporary storage of the inter-segment angles
  sin = 0,
      // as above
  cos = 0; // again as above

  // first we make sure that the vertice list is the same length as we we want
  // each segment (except the first) will create to vertices with two values each
  if (this._verts.length !== (this._segments.length - 1) * 4) {
    // if it's not correct, we clear the entire list
    this._verts = [];
  }

  // now we loop over all the segments, the list has the "youngest" segment at the end
  var prevAng = 0;

  for (var j = 0; j < this._segments.length; ++j) {
    // store the active segment for convenience
    s1 = this._segments[j];

    // if there's a previous segment, time to do some math
    if (s2) {
      // we calculate the angle between the two segments
      // the result will be in radians, so adding half of pi will "turn" the angle 90 degrees
      // that means we can use the sin and cos values to "expand" the line outwards
      ang = Math.atan2(s1.y - s2.y, s1.x - s2.x) + Math.PI / 2;
      sin = Math.sin(ang);
      cos = Math.cos(ang);

      // now it's time to creat ethe two vertices that will represent this pair of segments
      // using a loop here is probably a bit overkill since it's only two iterations
      for (var i = 0; i < 2; ++i) {
        // this makes the first segment stand out to the "left" of the line
        // annd the second to the right, changing that magic number at the end will alther the line width
        offset = (-0.5 + i / 1) * this.trailWidth;

        // if trail scale effect is enabled, we scale down the offset as we move down the list
        if (this.trailScaling) {
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
  if (this._verts.length >= 8) {
    // now, we have a triangle "strip", but flash can't draw that without
    // instructions for which vertices to connect, so it's time to make those

    // here, we loop over all the vertices and pair them together in triangles
    // each group of four vertices forms two triangles
    for (var k = 0; k < this._verts.length; k++) {
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

Phaser.Plugin.Juicy.prototype.createScreenFlash = function (color) {
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
Phaser.Plugin.Juicy.prototype.createTrail = function (length, color) {
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
Phaser.Plugin.Juicy.prototype.overScale = function (object, scale, initialScale) {
  scale = scale || 1.5;
  var id = this._overScalesCounter++;
  initialScale = initialScale || new Phaser.Point(1, 1);
  var scaleObj = this._overScales[id];
  if (!scaleObj) {
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
Phaser.Plugin.Juicy.prototype.jelly = function (object, strength, delay, initialScale) {
  strength = strength || 0.2;
  delay = delay || 0;
  initialScale = initialScale || new Phaser.Point(1, 1);

  this.game.add.tween(object.scale).to({ x: initialScale.x + initialScale.x * strength }, 50, Phaser.Easing.Quadratic.InOut, true, delay).to({ x: initialScale.x }, 600, Phaser.Easing.Elastic.Out, true);

  this.game.add.tween(object.scale).to({ y: initialScale.y + initialScale.y * strength }, 50, Phaser.Easing.Quadratic.InOut, true, delay + 50).to({ y: initialScale.y }, 600, Phaser.Easing.Elastic.Out, true);
};

/**
* Creates the mouse stretch effect on the given object
*
* @param {Phaser.Sprite} object - The object to mouse stretch
* @param {number} [strength=0.5] - The strength of the effect
* @param {Phaser.Point} [initialScale=new Phaser.Point(1,1)] - The initial scale of the object
* 
*/
Phaser.Plugin.Juicy.prototype.mouseStretch = function (object, strength, initialScale) {
  strength = strength || 0.5;
  initialScale = initialScale || new Phaser.Point(1, 1);
  object.scale.x = initialScale.x + Math.abs(object.x - this.game.input.activePointer.x) / 100 * strength;
  object.scale.y = initialScale.y + initialScale.y * strength - object.scale.x * strength;
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
  if (this._shakeWorldTime > 0) {
    var magnitude = this._shakeWorldTime / this._shakeWorldMax * this._shakeWorldMax;
    var x = this.game.rnd.integerInRange(-magnitude, magnitude);
    var y = this.game.rnd.integerInRange(-magnitude, magnitude);

    this.game.camera.x = x;
    this.game.camera.y = y;
    this._shakeWorldTime--;
    if (this._shakeWorldTime <= 0) {
      this.game.world.setBounds(this._boundsCache.x, this._boundsCache.x, this._boundsCache.width, this._boundsCache.height);
    }
  }

  // over scales
  for (var s in this._overScales) {
    if (this._overScales.hasOwnProperty(s)) {
      scaleObj = this._overScales[s];
      if (scaleObj.scale > 0.01) {
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
if (typeof module === "object" && module.exports) {
  module.exports = Phaser.Plugin.Juicy;
}

// Draw Triangles Polyfill for back compatibility
if (!Phaser.Graphics.prototype.drawTriangle) {
  Phaser.Graphics.prototype.drawTriangle = function (points, cull) {
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

  Phaser.Graphics.prototype.drawTriangles = function (vertices, indices, cull) {

    var point1 = new Phaser.Point(),
        point2 = new Phaser.Point(),
        point3 = new Phaser.Point(),
        points = [],
        i;

    if (!indices) {
      if (vertices[0] instanceof Phaser.Point) {
        for (i = 0; i < vertices.length / 3; i++) {
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
      if (vertices[0] instanceof Phaser.Point) {
        for (i = 0; i < indices.length / 3; i++) {
          points.push(vertices[indices[i * 3]]);
          points.push(vertices[indices[i * 3 + 1]]);
          points.push(vertices[indices[i * 3 + 2]]);
          if (points.length === 3) {
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

},{}],"/Users/danielwhiffing/Dropbox/js/phaser/towerdefense/src/states/boot.js":[function(require,module,exports){
"use strict";

module.exports = {

  preload: function preload() {
    this.load.baseURL = "assets/";
  },

  create: function create() {
    this.input.maxPointers = 1;

    this.stage.disableVisibilityChange = true;

    // set up scale mode
    game.scale.scaleMode = 2;
    // game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
    // this.scale.pageAlignHorizontally = true;
    // this.scale.pageAlignVertically = true;
    // game.scale.setScreenSize(true);
    // this.scale.forceOrientation(true);

    game.state.start("load", true, false);
  }
};

},{}],"/Users/danielwhiffing/Dropbox/js/phaser/towerdefense/src/states/load.js":[function(require,module,exports){
"use strict";

module.exports = {
  constructor: function constructor() {
    this.loadingSprite = null;
  },

  preload: function preload() {
    this.load.onLoadComplete.addOnce(this.onLoadComplete, this);

    this.load.spritesheet("button", "images/button.png", 193, 71);
    this.load.image("bullet", "images/bullet.png");
    this.load.image("gib", "images/gib.png");
    this.load.image("arrow", "images/arrow.png");
    this.load.atlasJSONHash("tower2", "images/tower.png", "images/tower.json");
    this.load.atlasJSONHash("spawner", "images/sphincter.png", "images/sphincter.json");
    this.load.image("tower", "images/tower.png");
    this.load.image("bg", "images/bg.jpg");
    this.load.image("enemy", "images/enemy.png");
    this.load.image("tile", "images/wall.png");
    this.load.image("wall", "images/tile.png");
  },

  onLoadComplete: function onLoadComplete() {
    game.state.start("play", true, false);
  }
};

},{}],"/Users/danielwhiffing/Dropbox/js/phaser/towerdefense/src/states/menu.js":[function(require,module,exports){
"use strict";

module.exports = {
  create: function create() {

    // display current connection status
    var style = { font: "22px Arial", fill: "#ffffff", align: "center" };
    game.connectionText = game.add.text(game.width / 2, game.height / 2, "Looking for connections...", style);
    game.connectionText.anchor.set(0.5);

    // display id for user
    game.displayUserIdText = game.add.text(game.width / 2, game.height / 2 - 300, "", style);
    game.displayUserIdText.anchor.set(0.5);

    // initialize the client
    // require('../client.js').create();
  }
};

},{}],"/Users/danielwhiffing/Dropbox/js/phaser/towerdefense/src/states/play.js":[function(require,module,exports){
"use strict";

var EnemyManager = require("../entities/enemy-manager.js");
var WallManager = require("../entities/wall-manager.js");
var Grid = require("../entities/grid.js");
var Interface = require("../entities/interface.js");

module.exports = {
  create: function create() {
    game.time.advancedTiming = true;
    game.time.desiredFps = 60;
    game.time.slowMotion = 1;
    game.juicy = game.plugins.add(require("../lib/juicy.js"));
    game.fpsProblemNotifier.add(this.handleFpsProblem, this);

    // initialize physics
    game.physics.startSystem(Phaser.Physics.ARCADE);

    // setup group for background elements
    game.backGroup = game.add.group();

    // initialize individual game components
    game.grid = new Grid();

    game.emitter = game.add.emitter(0, 0, 50);
    game.emitter.makeParticles("gib");
    game.emitter.gravity = 0;
    game.emitter.setScale(3, 0, 3, 0, 4000, Phaser.Easing.Quintic.Out);
    game.emitter.setAlpha(1, 0, 4000);

    game.walls = new WallManager();
    game.ui = new Interface();
    game.enemies = new EnemyManager();

    game.towers = game.add.group();
    game.bullets = game.add.group();

    // game.gui = new dat.GUI();
    // game.gui.add(game.time, 'slowMotion', 0.1, 3);

    // start the game up!
    game.ui.startBuildPhase();
  },

  goFull: function goFull() {
    game.scale.startFullScreen(false);
  },

  update: function update() {
    // overlap enemies and bullets
    game.physics.arcade.overlap(game.enemies.group, game.bullets, this.bulletOverlap);
    // update ui elements / text
    game.ui.update();
  },

  bulletOverlap: function bulletOverlap(enemy, bullet) {
    enemy.damage(1);
    bullet.kill();
  },

  handleFpsProblem: function handleFpsProblem() {
    // modify the game desired fps to match the current suggested fps
    game.time.desiredFps = game.time.suggestedFps;
  },

  render: function render() {
    var p = game.input.activePointer;
    game.debug.text(Math.floor(p.x) + ", " + Math.floor(p.y), 10, game.height - 10, "#00ff00");
    game.debug.text("fps: " + game.time.fps || "--", 10, game.height - 30, "#00ff00");
  }
};
// game.input.onDown.add(this.goFull, this)

},{"../entities/enemy-manager.js":"/Users/danielwhiffing/Dropbox/js/phaser/towerdefense/src/entities/enemy-manager.js","../entities/grid.js":"/Users/danielwhiffing/Dropbox/js/phaser/towerdefense/src/entities/grid.js","../entities/interface.js":"/Users/danielwhiffing/Dropbox/js/phaser/towerdefense/src/entities/interface.js","../entities/wall-manager.js":"/Users/danielwhiffing/Dropbox/js/phaser/towerdefense/src/entities/wall-manager.js","../lib/juicy.js":"/Users/danielwhiffing/Dropbox/js/phaser/towerdefense/src/lib/juicy.js"}]},{},["./src/game.js"]);
