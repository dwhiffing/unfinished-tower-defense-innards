var EnemyManager = require('../entities/enemyManager.js');
var Grid = require('../entities/grid.js');
var Interface = require('../entities/interface.js');

module.exports = {
  create: function() {
    // initialize physics
    game.physics.startSystem(Phaser.Physics.ARCADE);

    // setup group for background elements
    game.backGroup = game.add.group();
    game.bullets = game.add.group()
    game.towers = game.add.group()

    // initialize individual game components
    game.grid = new Grid(game);
    game.enemies = new EnemyManager(game);
    game.ui = new Interface(game);

    // start the game up!
    game.ui.startSpawnPhase()
  },

  update: function() {
    // overlap enemies and bullets
    game.physics.arcade.overlap(game.enemies.group, game.bullets, this.bulletOverlap)
    // update ui elements / text
    game.ui.updateTimer();
  },

  bulletOverlap: function(enemy, bullet) {
    enemy.damage(1);
    bullet.kill();
  },

  render: function() {
    var p = game.input.activePointer;
    game.debug.text(Math.floor(p.x)+', '+Math.floor(p.y), 10, game.height-10, "#00ff00");  
    game.debug.text('fps: '+game.time.fps || '--', 10, game.height-30, "#00ff00");
  }
}