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