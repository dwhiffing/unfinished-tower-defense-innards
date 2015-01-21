module.exports = {

    constructor: function() {
        this.loadingSprite = null;
    },

    preload: function() {
        this.loadingSprite = this.add.sprite(320, 480, 'preloader');
        this.loadingSprite.anchor.setTo(0.5, 0.5);

        this.load.onLoadComplete.addOnce(this.onLoadComplete, this);
        this.load.setPreloadSprite(this.loadingSprite);

        // Load game assets here
        this.load.image('logo', 'images/logo.png');
        this.load.image('enemy', 'images/enemy.png');
        this.load.spritesheet('tile', 'images/tile.png', 50, 50);
    },

    create: function() {},

    onLoadComplete: function() {
        this.game.state.start('menu', true, false);
    }

}