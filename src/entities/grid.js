class Grid  {
  constructor(opts)  {
    // initialize config vars for grid
    opts = opts || {};
    this.width = opts.width || 15;
    this.height = opts.height || 25;
    this.tileSize = this.tileSize = opts.tileSize || 50;
    this.offset = {x: 50, y: 50}
    
    var middle = Math.ceil( (this.height-1) / 2);
    this.waypoints = [
      {x: 0, y: 0}
    ];

    this.newLevel()
  }

  newLevel() {
    // temporary home base graphics
    this.graphics = game.add.graphics(this.offset.x,this.offset.y);
    this.graphics.lineStyle(0);
    this.graphics.beginFill(0xffff00);

    // temporary home base graphics
    this.gridLines = game.add.graphics(this.offset.x,this.offset.y);
    this.gridLines.lineStyle(1, 0x000000);
    for (var x = 0; x <= this.tileSize*(this.width-3); x+=this.tileSize) {
      for (var y = 0; y <= this.tileSize*(this.height-1); y+=this.tileSize) {
        this.gridLines.moveTo(x, y)
        this.gridLines.drawRect(x, y, this.tileSize, this.tileSize)
      }
    }
    
    // initialize a Phaser tilemap to keep track of walls
    this.map = game.add.tilemap();
    this.map.setTileSize(this.tileSize, this.tileSize);
    this.map.addTilesetImage('tile');
    
    this.arrow = game.add.sprite(0,0,'arrow');
    this.arrow.anchor.set(0.5,0.5)

    // set up the tile layer to draw the walls
    this.wall_layer = this.map.create('wall_layer',
      this.width, this.height, // the number of tiles wide/high the grid is
      this.tileSize, this.tileSize // the size of the individual tiles
    )

    // adjust tile layer to be offset to center it and make room of the ui
    this.wall_layer.cameraOffset = {
      x: this.offset.x, 
      y: this.offset.y
    }
    this.wall_layer.crop = {
      x: this.offset.x,
      y: this.offset.y,
      width: this.wall_layer.width - this.offset.x,
      height: this.wall_layer.height - this.offset.y
    }
    this.wall_layer.resizeWorld()

    // set up the tile layer to draw the towers
    this.tower_layer = this.map.createBlankLayer('tower_layer',
      this.width, this.height, // rowNum, colNum
      this.tileSize, this.tileSize // tile width/height
    )

    // adjust tile layer to be offset to center it and make room of the ui
    this.tower_layer.cameraOffset = {
      x: this.offset.x, 
      y: this.offset.y
    }
    this.tower_layer.crop = {
      x: this.offset.x,
      y: this.offset.y,
      width: this.tower_layer.width - this.offset.x,
      height: this.tower_layer.height - this.offset.y
    }
    this.tower_layer.resizeWorld()
    
    // fill map with empty tiles
    this.map.fill(16, 0, 0, this.width, this.height, this.wall_layer)

    // initialize the pathfinder for the creeps
    this.finder = new PF.AStarFinder();

    this.center = {
      x: Math.floor(this.width/2),
      y: Math.floor(this.height/2)
    };
    this.center.tile = this.map.getTile(this.center.x, this.center.y) || this.map.putTileWorldXY(16, this.center.x, this.center.y, this.tileSize, this.tileSize, this.wall_layers);

    this.clear();
    this.drawWaypoints();
  }

  clear(direction) {
    // reset grid data to be completely walkable
    this.data = [];
    for(var i = 0; i < this.height; i++) {
      this.data[i] = [];
      for(var j = 0; j < this.width; j++) {
        this.data[i][j] = 0;
      }
    }
    if(this.map.getTile(this.center.y-1, this.center.x-1)) {

    this.map.getTile(this.center.y-1, this.center.x-1).index = 0;
    this.map.getTile(this.center.y-1, this.center.x-1).index = 0;
    this.map.getTile(this.center.y-1, this.center.x+1).index = 0;
    this.map.getTile(this.center.y  , this.center.x  ).index = 0;
    this.map.getTile(this.center.y+1, this.center.x-1).index = 0;
    this.map.getTile(this.center.y+1, this.center.x+1).index = 0;
    }
    this.openCenter(0);
  }

  getPath(start, end, toVector = true) {
    // given a start and end point, return the shortest path to that point
    var grid = new PF.Grid(this.width, this.height, this.data);
    var path = this.finder.findPath(start.x, start.y, end.x, end.y, grid);
    if (path.length === 0) return false
    path = PF.Util.expandPath(path);

    if (toVector) {
      for(var i = 0; i < path.length; i++) {
        path[i] = {x: path[i][0], y: path[i][1]}
      }
    }

    return path
  }

  setTileData() {
    var layer = this.map.layers[0];
    for (var y = 0, h = layer.height; y < h; y++) {
      for (var x = 0, w = layer.width; x < w; x++) {
        var tile = layer.data[y][x];
        if(tile && tile.index !== 16) {
          var frame = 0, above, below, left, right;
          if (y>0) above = layer.data[y-1][x];
          if (y<layer.height-1) below = layer.data[y+1][x];
          if (x>0) left = layer.data[y][x-1];
          if (x<layer.width) right = layer.data[y][x+1];
          if (above && above.index !== 16) frame += 1;
          if (right && right.index !== 16) frame += 2;
          if (below && below.index !== 16) frame += 4;
          if (left && left.index !== 16) frame += 8;
          this.map.putTile(frame, tile.x, tile.y, this.wall_layer);
        }
      }
    }
  }

  drawWaypoints() {
    // draw each of the home bases
    for(var i = 0; i < this.waypoints.length; i++) {
      var tile = this.map.getTile(this.waypoints[i].x, this.waypoints[i].y, this.wall_layer);
      this.graphics.drawRect(tile.worldX, tile.worldY, this.tileSize, this.tileSize);
    }
  }

  getCenterTile() {
    return this.map.getTile(this.center.x, this.center.y, this.wall_layer);
  }

  getWall(x, y) {
    return this.map.getTileWorldXY(x, y, this.tileSize, this.tileSize, this.wall_layer);
  }

  set(val, x, y){
    this.data[y][x] = val;
  }

  get(x, y){
    return this.data[y][x];
  }
  
  getDataFor(tile){
    return this.data[tile.y][tile.x];
  }

  openCenter(direction) {
    var x,y, angle
    this.data[this.center.y-1][this.center.x-1] = 3;
    this.data[this.center.y-1][this.center.x+1] = 3;
    this.data[this.center.y  ][this.center.x  ] = 3;
    this.data[this.center.y+1][this.center.x-1] = 3;
    this.data[this.center.y+1][this.center.x+1] = 3;

    this.data[this.center.y-1][this.center.x] = 3; // up
    this.data[this.center.y+1][this.center.x] = 3; // down
    this.data[this.center.y][this.center.x-1] = 3; // left
    this.data[this.center.y][this.center.x+1] = 3; // right
    if (direction === 0) {
      x = this.center.x; y = this.center.y-1; angle = 0;
    } else if (direction === 1) {
      x = this.center.x; y = this.center.y+1; angle = 180;
    } else if (direction === 2) {
      x = this.center.x-1; y = this.center.y; angle = 270;
    } else {
      x = this.center.x+1; y = this.center.y; angle = 90;
    }
    this.data[y][x] = 0;
    this.arrow.position.set(x*50+this.arrow.width/2, y*50+this.arrow.height/2)
    this.arrow.angle = angle
  }

}

export default Grid;