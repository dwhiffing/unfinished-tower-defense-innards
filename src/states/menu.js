module.exports = {
  create: function() {
    this.logo = this.add.sprite(
      this.game.width / 2, this.game.height / 2,
      'logo'
    );
    this.logo.anchor.setTo(0.5);

    // this.game.input.onDown.add(this.startGame, this);
    this.game.state.start('play');
  },

  startGame: function() {
    this.game.state.start('play');
  }
}