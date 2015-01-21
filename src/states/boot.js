module.exports = {

  preload: function () {
    this.load.baseURL = 'src/assets/';
    this.load.image('preloader', 'images/preloader.gif');
    this.game.time.advancedTiming = true;
  },

  create: function () {
    this.input.maxPointers = 1;

    // auto pause if window loses focus
    this.stage.disableVisibilityChange = true;
    
    if (this.game.device.desktop) {
      this.stage.scale.pageAlignHorizontally = true;
    }

    this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.game.scale.setScreenSize(true);

    this.game.state.start('load', true, false);
  }
};