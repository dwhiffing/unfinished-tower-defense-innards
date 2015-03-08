import Enemy from '../entities/enemy.js';

class EnemyManager {
  constructor(opts)  {
    var opts = opts || {};
    this.wave_num = 0;
    this.wave_size = 5;
    this.setConfig(opts);
    this.setSpawnPoint();
    this.createEnemyPool();
  }

  setConfig(opts) {
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

  createEnemyPool(opts) {
    this.group = game.add.group();
    for (var i = 0; i < 50; i++) {
      this.group.add(new Enemy({size: this.enemyHeight, speed: this.enemySpeed}));
    }
  }

  setSpawnPoint(x, y) {
    if (!x && !y) {
      this.spawn_point =  {x: game.grid.center.tile.worldX, y: game.grid.center.tile.worldY};
    } else {
      if (x) this.spawn_point.x = x;
      if (y) this.spawn_point.y = y;
    }
  }

  spawnWave(){
    var i = 0;
    this.enemiesLeft = this.getDeadEnemies().splice(1, this.wave_size++);
    for (let enemy of this.enemiesLeft) {
      game.time.events.add(this.spacing*i++, () => {
        enemy.spawn(this.spawn_point.x, this.spawn_point.y, this.spacing, this.wave_num);
      })
    }
    this.direction = this.wave_num++ % 4;
  }

  getAliveEnemies(group=this.group) {
    return group.filter(function(obj){if(obj.alive===true)return obj }).list
  }

  getDeadEnemies(group=this.group) {
    return group.filter(function(obj){if(obj.alive===false)return obj }).list
  }

}

export default EnemyManager