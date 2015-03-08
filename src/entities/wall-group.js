import Wall from '../entities/wall.js';

class WallGroup extends Phaser.Group{
  constructor(shape) {
    super(game);
    for(var i = 0; i < shape.length; i++) {
      var x = shape[i][0]*game.grid.tileSize;
      var y = shape[i][1]*game.grid.tileSize;
      this.add(new Wall(x, y));
    }
  }
}
export default WallGroup
