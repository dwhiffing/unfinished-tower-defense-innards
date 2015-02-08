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