var Grid = function (game)  {
  
  this.setConfig();
  this.group = game.add.group();
  
  // temporary home base graphics
  this.graphics = game.add.graphics(0,0);
  this.graphics.lineStyle(0);
  this.graphics.beginFill(0xffff00);
  
  // initialize a Phaser tilemap to keep track of walkable tiles
  this.map = game.add.tilemap();
  this.map.setTileSize(this.tileSize, this.tileSize);
  this.map.addTilesetImage('tile');

  // set up the tile layer to draw the walls and towers
  this.layer = this.map.create(
    'layer', // key of layer
    this.width, this.height, // the number of tiles wide/high the grid is
    this.tileSize, this.tileSize, // the size of the individual tiles
    this.group // the group the layer is added to
  )
  
  // fill map with empty tiles
  this.map.fill(0, 0, 0, this.width, this.height, this.layer)

  // create a buffer around the tile map to make room for user interface and background elements
  // TODO: This method sucks. Find a better way.
  game.world.setBounds(0,-this.buffer, this.map.widthInPixels+this.buffer*2, this.map.heightInPixels+this.buffer*2);
  game.camera.x = 0; game.camera.y = -this.buffer;
  this.layer.resizeWorld();

  // initialize the pathfinder for the creeps
  this.finder = new PF.AStarFinder();

  this.center = {};
  this.center.x = Math.floor(this.width/2);
  this.center.y = Math.floor(this.height/2);
  this.center.tile = this.map.getTile(this.center.x, this.center.y);

  this.clear();
  this.drawWaypoints();
}

Grid.prototype.constructor = Grid;

Grid.prototype.setConfig = function(opts){
  // initialize config vars for grid
  opts = opts || {};
  this.width = opts.width || 15;
  this.height = opts.height || 25;
  this.tileSize = this.tileSize = opts.tileSize || 50;
  this.buffer = (game.height - this.height*this.tileSize)/2;
  
  var middle = Math.ceil( (this.height-1) / 2);
  this.waypoints = [
    {x: 0, y: 0}
  ];
}

Grid.prototype.setData = function(val, x, y){
  // set status for an individual node and trigger an update to enemies and server
  this.data[y][x] = val;
  // game.enemies.updatePaths();
  // game.eurecaServer.syncGridData(this.data);
}

Grid.prototype.clear = function(direction) {
  // reset grid data to be completely walkable
  this.data = [];
  for(var i = 0; i < this.height; i++) {
    this.data[i] = [];
    for(var j = 0; j < this.width; j++) {
      this.data[i][j] = 0;
    }
  }
  this.openCenter(0);
}

Grid.prototype.openCenter = function(direction) {
  this.data[this.center.y-1][this.center.x-1] = 1;
  this.data[this.center.y-1][this.center.x+1] = 1;
  this.data[this.center.y  ][this.center.x  ] = 1;
  this.data[this.center.y+1][this.center.x-1] = 1;
  this.data[this.center.y+1][this.center.x+1] = 1;

  this.data[this.center.y-1][this.center.x] = 1; // up
  this.data[this.center.y+1][this.center.x] = 1; // down
  this.data[this.center.y][this.center.x-1] = 1; // left
  this.data[this.center.y][this.center.x+1] = 1; // right

  if (direction === 0) {
    this.data[this.center.y-1][this.center.x] = 0; // up
  } else if (direction === 1) {
    this.data[this.center.y+1][this.center.x] = 0; // down
  } else if (direction === 2) {
    this.data[this.center.y][this.center.x-1] = 0; // left
  } else {
    this.data[this.center.y][this.center.x+1] = 0; // right
  }

}

Grid.prototype.getPath = function(start, end, toVector) {
  // given a start and end point, return the shortest path to that point
  var toVector = toVector || true;
  var grid = new PF.Grid(this.width, this.height, this.data);
  var path = this.finder.findPath(start.x, start.y, end.x, end.y, grid);
  if (path.length === 0) return
  path = PF.Util.expandPath(path);
  if(toVector) {
    for(var i = 0; i < path.length; i++) {
      path[i] = {x: path[i][0], y: path[i][1]}
    }
  }
  return path
}

Grid.prototype.drawWaypoints = function() {
  // draw each of the home bases
  for(var i = 0; i < this.waypoints.length; i++) {
    var tile = this.map.getTile(this.waypoints[i].x, this.waypoints[i].y, this.layer);
    this.graphics.drawRect(tile.worldX, tile.worldY, this.tileSize, this.tileSize);
  }
}

Grid.prototype.syncTowersVsData = function() {
    this.map.removeTile()
  // compare the current tower setup the the data stored for the grid and reconcile
  for(var i = 0; i < this.data.length; i++) {
    for(var j = 0; j < this.data[i].length; j++) {
      if (this.data[j][i] > 0) {
        var type = this.data[j][i]
        var tile = this.map.getTile(i,j,this.layer)
        game.grid.map.putTile(type, tile.x, tile.y, this.layer);
        game.ui.placeTower(tile.worldX, tile.worldY)
      }
    }
  }
}
module.exports = Grid;