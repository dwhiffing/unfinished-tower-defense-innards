var EnemyManager = require('../entities/enemyManager.js');
var Grid = require('../entities/grid.js');
var CameraManager = require('../entities/cameraManager.js');
module.exports = {
  create: function() {
    game = this.game;
    this.game.input.current = {painting: false, dragging: false};
    this.game.grid = new Grid(this.game);

    this.game.enemies = new EnemyManager(this.game);

    this.game.input.onUp.add(function(){
      this.game.input.current.painting = false;
      this.game.input.current.paint = undefined;
      this.game.input.current.dragging = false;
      this.game.grid.tiles.callAll('released')
    })
    this.camMan = new CameraManager(this.game);
  },

  setGridData: function(x, y, val) {
    this.game.grid.data[x][y] = val;
    this.game.grid.updatePath();
    this.game.enemies.updateTweens();
  },

  update: function() {
    this.camMan.update();
  },

  render: function() {
    var p = this.game.input.activePointer;
    this.game.debug.text(Math.floor(p.x)+', '+Math.floor(p.y), 10, 24, "#00ff00");  
    this.game.debug.text('fps: '+this.game.time.fps || '--', 80, 24, "#00ff00");  
    this.game.debug.text('debug: '+(this.game.debugString || '--'), 10, 54, "#00ff00");  
  }
}