var Enemy = function(game, opts) {
  var opts = opts || {}
  Phaser.Sprite.call(this, game, -50, -50, 'enemy');
  this.setConfig(opts);
  
  game.physics.enable(this);
  this.kill();
}

Enemy.prototype = Object.create(Phaser.Sprite.prototype)
Enemy.prototype.constructor = Enemy;

Enemy.prototype.setConfig = function(opts) {
  // initialize configs
  this.height = opts.size
  this.width = opts.size
  this.anchor.setTo(0.5,0.5);

  this.speed = opts.speed;
  this.maxHealth = opts.heath || 8;
  
  this.offset = game.grid.tileSize/2;
  this.nextWaypoint = 0;
}

Enemy.prototype.pulsateTween = function(opts) {
  this.spin = game.add.tween(this);
  this.pulsate = game.add.tween(this);
  var duration = game.rnd.integerInRange(this.speed*90,this.speed*100)
  var delay = game.rnd.integerInRange(100,1000)
  var angle = 360;
  this.pulsate.to({height: 60, width:60}, duration/2, Phaser.Easing.Quadratic.InOut, true, delay, -1, true)
  this.spin.to({angle: angle}, duration*2, Phaser.Easing.Linear.None, true, delay, -1)
}

Enemy.prototype.spawnTween = function(duration) {
  this.startTween = game.add.tween(this);
  this.startTweenAlpha = game.add.tween(this);

  this.scale.set(0,0)
  this.alpha = 0;

  this.startTween.to({height: 50, width:50}, duration, Phaser.Easing.Quadratic.InOut, true)
  this.startTweenAlpha.to({alpha: 1}, duration, Phaser.Easing.Quadratic.InOut, true)
}

Enemy.prototype.spawn = function(x, y, spacing, health) {
  // initialize this enemy from the spawner
  this.reset(x+this.offset, y+this.offset, health);
  this.spawnTween(spacing/2);
  game.time.events.add(spacing/2, this.startMoving, this)
  this.nextWaypoint = 0;
}

Enemy.prototype.startMoving = function() {
  var self = this;
  
  this.pulsateTween();
  var tween = game.add.tween(this)
  if (this.nextWaypoint === 0) {
    tween.to({x: this.x}, 10, Phaser.Easing.Linear.None);
    this.nextWaypoint++;
  }
  
  // determine the closest tile to the enemies current position
  var tile = game.grid.map.getTileWorldXY(this.x, this.y, game.grid.tileSize, game.grid.tileSize, game.grid.layer)
  var start = {x: tile.x, y: tile.y};

  // determine the next waypoint we want to go to
  var path1 = game.grid.getPath(start, game.grid.waypoints[0], true);
  // var path2 = game.grid.getPath(start, game.grid.waypoints[1], true);
  var path;
  // if (PF.Util.pathLength(path1) > PF.Util.pathLength(path2)) {
    // path = game.grid.getPath(start, game.grid.waypoints[1]);
  // } else {
    path = game.grid.getPath(start, game.grid.waypoints[0]);
  // }
  
  // stop any tweens in progress 
  if (this.lastTween) {this.lastTween.stop();}
  this.lastTween = tween;
  this.lastPath = path

  // tween the enemy to that tile, and chain each tween needed to the next waypoint
  for(var j = 1; j < path.length; j++) {
    var nTile = game.grid.map.getTile(path[j].x, path[j].y, game.grid.layer);
    var oTile = game.grid.map.getTile(path[j-1].x, path[j-1].y, game.grid.layer);
    var nPos = {x: nTile.worldX + this.offset, y: nTile.worldY + this.offset};
    var oPos = {x: oTile.worldX + this.offset, y: oTile.worldY + this.offset};
    var distance = this.getDistance(nPos, oPos) * this.speed;
    tween.to({x: nPos.x, y: nPos.y }, distance, Phaser.Easing.Linear.None);
  }
  tween.onComplete.add(this.doKill, this)
  tween.start();
};

Enemy.prototype.doKill = function(enemy) {
  enemy.kill()
  enemy.pulsate.stop()
  enemy.spin.stop()
  game.ui.checkEndOfRound()
}

Enemy.prototype.getDistance = function(p1,p2) {
  return Math.sqrt( Math.pow((p1.x - p2.x), 2) + Math.pow((p1.y - p2.y), 2) );
}

module.exports = Enemy