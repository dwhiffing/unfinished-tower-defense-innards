var Tower = function(x, y) {
  Phaser.Sprite.call(this, game, x, y, 'tower2');
  this.anchor.setTo(0.5,0.5)
  this.range = 300;
  this.animations.add('idle',[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18], 10, true)
  this.animations.play('idle')
  game.towers.add(this);
  game.time.events.loop(Phaser.Timer.SECOND/4, this.shoot, this)
}

Tower.prototype = Object.create(Phaser.Sprite.prototype)
Tower.prototype.constructor = Tower;


Tower.prototype.update = function() {
  if (!this.hasTarget) {
    this.getTarget()
  }
  this.pointAtTarget();
}

Tower.prototype.getTarget = function() {
  var enemies = game.enemies.getAliveEnemies();
  var lastDistance = null;
  for(var i = 0; i < enemies.length; i++) {
    var distance = game.physics.arcade.distanceToXY(this, enemies[i].x, enemies[i].y);
    if(!lastDistance || lastDistance > distance) {
      lastDistance = distance;
      this.target = enemies[i];
    }
  }
}

Tower.prototype.shoot = function(enemy) {
  if(!this.hasTarget) return
  var distance = game.physics.arcade.distanceToXY(this, this.target.x, this.target.y);
  if (this.range >= distance) {
    var bullet = game.bullets.create(this.x, this.y, 'bullet')
    game.physics.enable(bullet)
    bullet.outOfBoundsKill = true;
    game.physics.arcade.moveToXY(bullet, this.target.x, this.target.y, 200, 200)
  } else {
    this.target = null;
  }
}

Tower.prototype.pointAtTarget = function() {
  if(!this.hasTarget) return
  this.rotation = game.physics.arcade.angleToXY(this, this.target.x, this.target.y);
}

Object.defineProperty(Tower.prototype, 'hasTarget', {
    get: function() {
        return (this.target && this.target.alive);
    }
});
module.exports = Tower