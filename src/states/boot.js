module.exports = {

  preload: function () {
    this.load.baseURL = 'src/assets/';
    game.time.advancedTiming = true;
  },

  create: function () {
    this.input.maxPointers = 1;

    // auto pause if window loses focus
    this.stage.disableVisibilityChange = true;
    
    // set up scale mode
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.scale.pageAlignHorizontally = true;
    this.scale.pageAlignVertically = true;
    game.scale.setScreenSize(true);

    game.state.start('load', true, false);
  }
};