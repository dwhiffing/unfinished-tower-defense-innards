import Enemy from '../entities/enemy.js';

export default class EnemyManager {
  constructor(opts)  {
    var opts = opts || {};
    this.wave_num = 0;
    this.wave_size = 5;
    this.setConfig(opts);
    this.setSpawnPoint();
    this.createEnemyPool();
    this.createSphincter();
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

  setSpawnPoint(x, y) {
    let center_tile = game.grid.getCenterTile()
    x = x || center_tile.worldX
    y = y || center_tile.worldY
    this.spawn_point = {x, y};
  }

  createSphincter() {
    let center = game.grid.getCenterTile()
    let offset = game.grid.tileSize/2
    this.spawner = game.backGroup.create(center.worldX+offset, center.worldY+offset, 'spawner');
    this.spawn_anim = this.spawner.animations.add('spawn',[0,1,2,3,4,5,6,7,6,5,4,3,2,1], 60, true)
    this.idle_anim = this.spawner.animations.add('idle',[0,1,2,3,4,5,6,7,6,5,4,3,2,1], 5, true)
    this.spawner.animations.play('idle')
    this.spawner.anchor.setTo(0.5,0.5)
  }

  createEnemyPool(opts) {
    this.group = game.add.group();
    for (var i = 0; i < 50; i++) {
      this.group.add(new Enemy({
        size: this.enemyHeight, 
        speed: this.enemySpeed
      }));
    }
  }

  spawnWave(){
    this.spawn_anim.speed = this.spacing/10;
    this.spawner.animations.play('spawn')
    this.enemiesLeft = this.getDeadEnemies().splice(1, this.wave_size);
    this.enemiesLeft.forEach((enemy, index) => {
      game.time.events.add(this.spacing*index, () => {
        enemy.spawn(this.spawn_point.x, this.spawn_point.y, this.spacing, this.wave_num*2);
        if (index+1 === this.wave_size) {
          this.spawner.animations.play('idle')
        }
      })
    })
    this.direction = this.wave_num++ % 4;
  }

  getAliveEnemies(group=this.group) {
    return group.filter(obj => obj.alive).list
  }

  getDeadEnemies(group=this.group) {
    return group.filter(obj => !obj.alive).list
  }
}
