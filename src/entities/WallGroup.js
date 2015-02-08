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
