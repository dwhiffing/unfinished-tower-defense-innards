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