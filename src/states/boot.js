module.exports = {

  preload: function () {
    this.load.baseURL = 'assets/';
  },

  create: function () {
    this.input.maxPointers = 1;

    this.stage.disableVisibilityChange = true;

    // set up scale mode
    game.scale.scaleMode = 2;
    // game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
    // this.scale.pageAlignHorizontally = true;
    // this.scale.pageAlignVertically = true;
    // game.scale.setScreenSize(true);
    // this.scale.forceOrientation(true);

    game.state.start('load', true, false);
  }
};