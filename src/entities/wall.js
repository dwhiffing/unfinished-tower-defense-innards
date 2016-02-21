class Wall extends Phaser.Sprite {
  constructor(x,y) {
    super(game, x, y, 'wall');
    this.anchor.set(0.5,0.5)
  }
}
export default Wall;