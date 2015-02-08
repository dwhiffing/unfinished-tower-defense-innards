var Wall = require('../entities/wall.js');

var WallGroup = function(shape) {
  Phaser.Group.call(this, game);
  this.classType = Wall;
  for(var i = 0; i < shape.length; i++) {
    var x = shape[i][0]*game.grid.tileSize;
    var y = shape[i][1]*game.grid.tileSize;
    var wall = new Wall(x, y)
    this.add(wall)
  }
}

WallGroup.prototype = Object.create(Phaser.Group.prototype);
WallGroup.prototype.constructor = WallGroup;

module.exports = WallGroup
