var EnemyManager = require('../entities/enemyManager.js');
var WallManager = require('../entities/WallManager.js');
var Grid = require('../entities/grid.js');
var Interface = require('../entities/interface.js');

module.exports = {
  create: function() {
    game.time.advancedTiming = true;
    game.time.desiredFps = 60;
    game.time.slowMotion = 1;
    game.juicy = game.plugins.add(require('../lib/juicy.js'));
    game.fpsProblemNotifier.add(this.handleFpsProblem, this);
    
    // initialize physics
    game.physics.startSystem(Phaser.Physics.ARCADE);

    // setup group for background elements
    game.backGroup = game.add.group();
    game.bullets = game.add.group()
    game.towers = game.add.group()

    // initialize individual game components
    game.grid = new Grid(game);
    game.enemies = new EnemyManager(game);
    game.walls = new WallManager(game);
    game.ui = new Interface(game);

    game.gui = new dat.GUI();
    game.gui.add(game.time, 'slowMotion', 0.1, 3);

    // start the game up!
    game.ui.startBuildPhase()
  },

  update: function() {
    // overlap enemies and bullets
    game.physics.arcade.overlap(game.enemies.group, game.bullets, this.bulletOverlap)
    // update ui elements / text
    game.ui.update();
  },

  bulletOverlap: function(enemy, bullet) {
    enemy.damage(1);
    bullet.kill();
  },
  
  handleFpsProblem: function() {
    // modify the game desired fps to match the current suggested fps
    game.time.desiredFps = game.time.suggestedFps;
  },

  render: function() {
    var p = game.input.activePointer;
    game.debug.text(Math.floor(p.x)+', '+Math.floor(p.y), 10, game.height-10, "#00ff00");  
    game.debug.text('fps: '+game.time.fps || '--', 10, game.height-30, "#00ff00");
  }
}
