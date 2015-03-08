import WallGroup from '../entities/wall-group.js';
import Tower from '../entities/tower.js';

class WallManager {
  constructor() {
    this.test = [5,4,3,2,1]
    this.minos = [
      [],
      [  // monomino
        [
          [0,0]
        ]
      ], [ // dominoes
        [
          [0,0], [1,0]
        ]
      ], [ // triominoes
        [
          [0,0], [1,0], [2,0], // Straight
        ], [
          [0,0], [1,0], [0,1], // Bent
        ]
      ], [ // tetrominoes
        [
          [0,0],[1,0],[2,0],[3,0] // I
        ], [
          [0,0],[1,0],[0,1],[1,1] // O
        ], [
          [0,0],[1,0],[2,0],[0,1] // L
        ], [
          [0,0],[1,0],[2,0],[2,1] // J
        ], [
          [0,0],[0,1],[1,1],[1,2] // S
        ], [
          [0,0],[1,0],[1,1],[1,2] // Z
        ], [
          [0,0],[1,0],[2,0],[1,1] // T
        ]
      ], [ // pentominoes
        [
          [0,0],[1,0],[2,0],[3,0],[4,0] // I
        ], [
          [0,0],[1,0],[2,0],[3,0],[3,1] // L
        ], [
          [0,0],[1,0],[2,0],[3,0],[1,1] // Y
        ], [
          [0,0],[0,1],[1,1],[1,2],[2,2] // W
        ], [
          [0,0],[1,0],[2,0],[2,1],[3,1] // N
        ], [
          [0,0],[1,0],[2,0],[0,1],[2,1] // U
        ], [
          [0,0],[1,0],[1,1],[1,2],[2,2] // Z
        ], [
          [0,0],[1,0],[2,0],[1,1],[1,2] // T
        ], [
          [0,0],[1,0],[2,0],[2,1],[2,2] // V
        ], [
          [1,0],[2,0],[1,1],[0,1],[1,2] // F
        ], [
          [1,0],[1,1],[1,2],[0,1],[2,1] // X
        ], [
          [0,0],[1,0],[0,1],[1,1],[0,2] // P
        ]
      ]
    ]
  }

  createWall() {
    var size = this.test[~~(Math.pow(game.rnd.frac(), 3) * (this.test.length - 1))]
    var shape = game.rnd.integerInRange(0,this.minos[size].length-1)
    var wall = new WallGroup(this.minos[size][shape]);
    return wall;
  }

  createTower() {
    var tower = new Tower(0,0);
    return tower;
  }
  
}

export default WallManager