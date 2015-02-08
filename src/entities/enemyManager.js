var Enemy = require('../entities/enemy.js')

var EnemyManager = function (game, opts)  {
  var opts = opts || {};
  this.cursor = 0;
  this.waveNum = 0;

  this.setConfig(opts);
  this.createEnemyPool();
}

EnemyManager.prototype.constructor = EnemyManager;

EnemyManager.prototype.setConfig = function(opts) {
  // initialize configs
  this.tileSize = opts.tileSize || game.grid.tileSize;
  this.enemyHeight = opts.enemyHeight || this.tileSize*.9;
  this.enemySpeed = opts.enemySpeed || 5;
  
  // space between enemies in wave
  this.spacing = opts.spacing || 40 * this.tileSize;
  this.spacing /= (20/this.enemySpeed)

  // direction of next spawn (0: up, 1: down, 2: left, 3: right)
  this.direction = 0;
}

EnemyManager.prototype.createEnemyPool = function(opts) {
  // create pool of enemies for spawning
  this.group = game.add.group();
  for(var i = 0; i < 50; i++){
    var enemy = new Enemy(game, {size: this.enemyHeight, speed: this.enemySpeed});
    this.group.add(enemy);
  }
}

EnemyManager.prototype.spawnWave = function(wavesize){
  // null out time to next round until this round finishes
  game.timeToNextRound = null;
  if (this.isSpawning) return
  this.isSpawning = true;
  
  // create the next wave of enemies
  wavesize = wavesize || 5 + (1*this.waveNum);
  var deadEnemies = this.getDeadEnemies();
  this.enemiesToRevive = deadEnemies.splice(1, wavesize);

  var tile = game.grid.map.getTile(game.grid.center.x, game.grid.center.y, game.grid.layer)
  var spawnx = tile.worldX
  var spawny = tile.worldY

  this.cursor = 0;
  this.spawnEnemy(spawnx,spawny);
  game.time.events.repeat(this.spacing, this.enemiesToRevive.length-1, this.spawnEnemy, this, spawnx, spawny);
  this.enemyHealth = 3 + (1*this.waveNum)
  this.direction++;
  this.waveNum++;
  if (this.direction === 4) this.direction = 0;
}

EnemyManager.prototype.spawnEnemy = function(x, y) {
  var enemy = this.enemiesToRevive[this.cursor];
  if(!enemy) return
  this.cursor++;
  if (this.cursor == this.enemiesToRevive.length) {
    game.time.events.add(this.spacing, function(){
      this.isSpawning = false;
    },this)
  }
  enemy.spawn(x, y, this.spacing, this.enemyHealth);
}

EnemyManager.prototype.getAliveEnemies = function() {
  return this.group.filter(function(obj){if(obj.alive===true)return obj }).list
}

EnemyManager.prototype.getDeadEnemies = function() {
  return this.group.filter(function(obj){if(obj.alive===false)return obj }).list
}

module.exports = EnemyManager