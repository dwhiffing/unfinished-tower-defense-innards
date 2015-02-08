var Wall = function(x,y) {
  Phaser.Sprite.call(this, game, x, y, 'wall');
  this.anchor.set(0.5,0.5)
}

Wall.prototype = Object.create(Phaser.Sprite.prototype);
Wall.prototype.constructor = Wall;

module.exports = Wall