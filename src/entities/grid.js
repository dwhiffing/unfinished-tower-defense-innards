var Tile = require('../entities/tile.js')

var Grid = function (game)  {
  this.game = game;
  this.tiles = game.add.group();
  this.finder = new PF.AStarFinder();
  this.pathGraphics = this.game.add.graphics(0,0);
  this.reset();
}

Grid.prototype.constructor = Grid;

Grid.prototype.reset = function() {
  this.setConfig();
  this.clear();
  this.createTiles();
  this.updatePath();
}

Grid.prototype.setConfig = function(opts){
  opts = opts || {};
  this.gridWidth = opts.gridWidth || 15;
  this.gridHeight = opts.gridHeight || 15;
  this.tileSizeToFit = this.game.width/this.gridWidth;
  this.tileSize = this.tileSize = opts.tileSize || this.tileSizeToFit || 40;

  this.gridSizeX = this.tileSize * this.gridWidth;
  this.gridSizeY = this.tileSize * this.gridHeight;
  this.tileHalf = this.tileSize / 2;

  var tooLargeX = this.gridSizeX > this.game.width;
  var tooLargeY = this.gridSizeY > this.game.height;
  var xBuffer = tooLargeX ? 200 : 0;
  var yBuffer = tooLargeY ? 200 : 0;

  var bX = tooLargeX ? xBuffer/2 + this.tileHalf : (this.game.width - this.gridSizeX)/2 + this.tileHalf;
  var bY = tooLargeY ? yBuffer/2 + this.tileHalf : (this.game.height - this.gridSizeY)/2 + this.tileHalf;

  this.tx = tx = function(s) { return bX + s * this.tileSize - this.tileHalf; };
  this.ty = ty = function(s) { return bY + s * this.tileSize - this.tileHalf; };
  
  this.game.world.setBounds(0, 0, this.gridSizeX + xBuffer, this.gridSizeY + yBuffer);

  this.waypoints = [
    // top-left
    [0, 0], 
    // top-right
    [this.gridWidth-1, 0], 
    // middle-left
    [this.gridWidth-1, Math.ceil((this.gridHeight-1)/2)], 
    // middle-right
    [0, Math.ceil((this.gridHeight-1)/2)], 
    // bottom-left
    [0, this.gridHeight-1], 
    // bottom-right
    [this.gridWidth-1, this.gridHeight-1]
  ];
}

Grid.prototype.clear = function() {
  this.data = [];
  for(var i = 0; i < this.gridHeight; i++) {
    this.data[i] = [];
    for(var j = 0; j < this.gridWidth; j++) {
      this.data[i][j] = 0;
    }
  }
}

Grid.prototype.createTiles = function() {
  for(var tileX = 0; tileX < this.gridWidth; tileX++) {
    for(var tileY = 0; tileY < this.gridHeight; tileY++) {
      var tile = new Tile(this.game, this.tx(tileX), this.ty(tileY), tileX, tileY, this.tileSize);
      this.tiles.add(tile);
    }
  }
}

Grid.prototype.updatePath = function() {
  this.pathGraphics.clear();
  this.fullPath = [];
  for(var start = 0, end = 1; end < this.waypoints.length; start++, end++) {
    this.drawWaypointSet(this.waypoints[start], this.waypoints[end]);
    this.drawSinglePath(this.waypoints[start], this.waypoints[end]);
  }
}

Grid.prototype.drawSinglePath = function(s, e) {
  var grid = new PF.Grid(this.gridWidth, this.gridHeight, this.data);
  var path = this.finder.findPath(s[0], s[1], e[0], e[1], grid);
  if (path.length === 0) return
  // path = PF.Util.expandPath(path);
  path = PF.Util.smoothenPath(grid, path);
  path = PF.Util.compressPath(path);
  if (this.fullPath.length>1){
    this.fullPath.pop();
  }
  this.fullPath = this.fullPath.concat(path);

  this.pathGraphics.lineStyle(3,0x000000);
  for(var i = 0, j = 1; j < path.length; i++, j++) {
    this.pathGraphics.moveTo(this.tx(path[i][0]) + this.tileHalf, this.ty(path[i][1]) + this.tileHalf);
    this.pathGraphics.lineTo(this.tx(path[j][0]) + this.tileHalf, this.ty(path[j][1]) + this.tileHalf);
  }
}

Grid.prototype.drawWaypointSet = function(s, e) {
  this.pathGraphics.lineStyle(0);
  this.pathGraphics.beginFill(0xffff00);
  this.pathGraphics.drawRect(this.tx(s[0])+this.tileHalf/2, this.ty(s[1])+this.tileHalf/2, this.tileHalf, this.tileHalf);
  if (s !== 0) {
    if (e === this.waypoints.length-1) { this.pathGraphics.beginFill(0x00ff00); }
    this.pathGraphics.drawRect(this.tx(e[0])+this.tileHalf/2, this.ty(e[1])+this.tileHalf/2, this.tileHalf, this.tileHalf);
  }
}

module.exports = Grid;