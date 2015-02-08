var Wall = function() {
  Phaser.Group.call(this, game);
}

Wall.prototype = Object.create(Phaser.Group.prototype);
Wall.prototype.constructor = Wall;

module.exports = Wall