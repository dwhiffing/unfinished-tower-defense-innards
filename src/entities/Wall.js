var Wall = function(x,y) {
  Phaser.Sprite.call(this, game, x, y, 'wall');
}

Wall.prototype = Object.create(Phaser.Sprite.prototype);
Wall.prototype.constructor = Wall;

module.exports = Wall