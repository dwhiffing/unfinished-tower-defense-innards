var EnemyManager = function (game, opts)  {
  var opts = opts || {};
  this.game = game;
  // initialize configs
  this.setConfig(opts);
  // create enemy pool
  this.group = this.game.add.group();
  for(var i = 0; i < 10; i++){
    var enemy = this.game.add.sprite(-50, -50, 'enemy');
    enemy.height = this.tileSize;
    enemy.width = this.tileSize;
    this.group.add(enemy);
  }
  this.updateTweens()
}

EnemyManager.prototype.constructor = EnemyManager;

EnemyManager.prototype.setConfig = function(opts) {
  this.tileSize = opts.tileSize || this.game.grid.tileSize;
  this.enemyHeight = opts.enemyHeight || this.tileSize/2;
  this.enemySpeed = opts.enemySpeed || 10;
  // space between enemies in wave
  this.spacing = opts.spacing || 10*this.tileSize;
}

EnemyManager.prototype.spawnWave = function(wavesize){
  wavesize = wavesize || 5;
}

EnemyManager.prototype.setCoords = function(array, thing) {
  thing = thing || {};
  thing.x = this.game.grid.tx(array[0])+this.enemyHeight/2;
  thing.y = this.game.grid.ty(array[1])+this.enemyHeight/2;
  return thing;
}

EnemyManager.prototype.updateTweens = function() {
  var waypoints = this.game.grid.fullPath;
  if (waypoints.length === 0) return;
  // var deadEnemies = this.group.filter(function(obj){obj.dead===true})

  for(var i = 0; i < this.group.length; i++) {
    var enemy = this.group.children[i];
    if (enemy.lastTween) {enemy.lastTween.stop();}
    this.setCoords(waypoints[0], enemy);
    var tween = this.game.add.tween(enemy).to({x: this.x}, this.spacing*i+1, Phaser.Easing.Linear.None);
    enemy.lastTween = tween;
    for(var j = 1; j < waypoints.length; j++) {
      var nPos = this.setCoords(waypoints[j]);
      var oPos = this.setCoords(waypoints[j-1]);
      var distance = this.getDistance(nPos, oPos) * this.enemySpeed;
      tween.to({x: nPos.x, y: nPos.y }, distance, Phaser.Easing.Linear.None);
    }
    tween.onComplete.add(function(enemy) {
      enemy.kill();
    }, enemy)
    tween.start();
  }
}

EnemyManager.prototype.getDistance = function(p1,p2) {
  return Math.sqrt( Math.pow((p1.x - p2.x), 2) + Math.pow((p1.y - p2.y), 2) );
}
module.exports = EnemyManager