module.exports = {
  constructor: function() {
    this.loadingSprite = null;
  },

  preload: function() {
    this.load.onLoadComplete.addOnce(this.onLoadComplete, this);

    this.load.spritesheet('button', 'images/button.png', 193, 71);
    this.load.image('spawner', 'images/spawner.png');
    this.load.image('bullet', 'images/bullet.png');
    this.load.image('arrow', 'images/arrow.png');
    this.load.image('towerMenu', 'images/selector2.png');
    this.load.image('tower', 'images/tower.png');
    this.load.image('towerbutton', 'images/towerbutton.png');
    this.load.image('wallbutton', 'images/wallbutton.png');
    this.load.image('bg', 'images/bg.jpg');
    this.load.image('enemy', 'images/enemy4.png');
    this.load.image('tile', 'images/tile3.png');
    this.load.image('wall', 'images/tile.png');
  },

  onLoadComplete: function() {
    game.state.start('play', true, false);
  }
}