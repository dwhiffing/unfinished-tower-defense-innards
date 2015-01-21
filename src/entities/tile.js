var Tile = function(game, x, y, tileX, tileY, tileSize) {
  Phaser.Sprite.call(this, game, x, y, 'tile');
  this.tileX = tileX;
  this.tileY = tileY;
  this.height = tileSize;
  this.width = tileSize;
  this.inputEnabled = true;
  this.grid = this.game.state.callbackContext;
  this.pointer = game.input.activePointer;
}

Tile.prototype = Object.create(Phaser.Sprite.prototype)
Tile.prototype.constructor = Tile;

Tile.prototype.update = function() {
  if (this.input.checkPointerDown(this.pointer) && !game.input.current.dragging && !this.justChanged) {
    if (!game.input.current.paint) {
      game.input.current.paint = this.frame;
    }
    this.justChanged = true;
    this.changeFrame(game.input.current.paint)
  }
}

Tile.prototype.released = function() {
  this.justChanged = false;
}

Tile.prototype.changeFrame = function(value) {
  var newValue = (value === 0) ? 1 : 0;
  this.frame = newValue;
  this.grid.setGridData(this.tileY, this.tileX, newValue);
}


module.exports = Tile