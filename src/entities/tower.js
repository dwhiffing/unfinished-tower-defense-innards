class Tower extends Phaser.Sprite { 
  constructor(x, y) {
    super(game, x, y, 'tower2');
    this.anchor.setTo(0.5,0.5)
    this.range = 300;
    this.animations.add('idle',[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18], 10, true)
    this.animations.play('idle')
    this.bulletSpeed = 200;
    this.shells = 1;
    game.towers.add(this);
    this.event = game.time.events.loop(Phaser.Timer.SECOND/4, this.shoot, this)
  }

  update() {
    this.getTarget()
    this.pointAtTarget();
  }

  getTarget() {
    if (this.hasTarget) return;
    var enemies = game.enemies.getAliveEnemies();
    var lastDistance = null;
    for(var e of enemies) {
      var distance = game.physics.arcade.distanceToXY(this, e.x, e.y);
      if(!lastDistance || lastDistance > distance) {
        lastDistance = distance;
        this.target = e;
      }
    }
  }

  shoot(enemy) {
    if(!this.hasTarget) return
    var distance = game.physics.arcade.distanceToXY(this, this.target.x, this.target.y);
    if (this.range >= distance) {
      for (var i = 0; i < this.shells; i++){
        this.createBullet()
      }
    } else {
      this.target = null;

    }
  }

  createBullet(target=this.target, x=this.x, y=this.y, speed=this.bulletSpeed) {
    var bullet = game.bullets.create(x, y, 'bullet')
    game.physics.enable(bullet)
    bullet.outOfBoundsKill = true;
    game.physics.arcade.moveToXY(bullet, target.x, target.y, speed, speed)
  }

  pointAtTarget() {
    if(!this.hasTarget) return
    this.rotation = game.physics.arcade.angleToXY(this, this.target.x, this.target.y);
  }

}

Object.defineProperty(Tower.prototype, 'hasTarget', {
  get: function() { return (this.target && this.target.alive); }
});

Object.defineProperty(Tower.prototype, 'firerate', {
  get: function() { return this.event.delay; },
  set: function(value) { this.event.delay = value; }
});

export default Tower