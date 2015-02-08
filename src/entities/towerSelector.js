
Interface.prototype.createTowerSelector = function() {
  // create context menu for selecting next tower type
  var th = game.grid.tileSize/2;
  this.selectorOpen = false;

  this.towerMenu = game.add.group();
  game.world.bringToTop(this.towerMenu);

  this.menuBackground = this.towerMenu.create(0, 0, 'towerMenu')
  this.towerMenu.alpha = 0;
  this.menuBackground.anchor.setTo(0.5,0.5)

  this.vertTowerButton = game.add.button(0-100, 0-th, 'towerbutton', this.selectTower, this);
  this.vertWallButton = game.add.button(0+50, 0-th, 'wallbutton', this.selectWall, this);
  
  this.towerMenu.add(this.vertTowerButton)
  this.towerMenu.add(this.vertWallButton)

  this.horizTowerButton = game.add.button(0-th, -100, 'wallbutton', this.selectWall, this);
  this.horizWallButton = game.add.button(0-th, 50, 'towerbutton', this.selectTower, this);
  this.towerMenu.add(this.horizTowerButton)
  this.towerMenu.add(this.horizWallButton)
}


Interface.prototype.closeTowerSelector = function(x, y) {
  this.selectorOpen = false;
  this.lastPos = null;
  var tween = game.add.tween(this.towerMenu);
  tween.to({alpha: 0}, 500, Phaser.Easing.Quadratic.Out, true).start();
  this.vertWallButton.inputEnabled = false; this.vertTowerButton.inputEnabled = false;
  this.horizWallButton.inputEnabled = false; this.horizTowerButton.inputEnabled = false;
  this.marker.position.setTo(-999,-999)
}

Interface.prototype.selectTower = function() {
  this.placeTower(this.lastPos.x,this.lastPos.y)
  this.closeTowerSelector();
}

Interface.prototype.selectWall = function() {
  this.placeWall(this.lastPos.x,this.lastPos.y)
  this.closeTowerSelector();
}

Interface.prototype.placeTower = function(x,y) {
  var tileX = game.grid.layer.getTileX(x);
  var tileY = game.grid.layer.getTileY(y);
  // place tile with our tower frame
  game.grid.map.putTile(this.teamTowerFrame, tileX, tileY, game.grid.layer);
  
  // if there is no tower where we are clicking
  if (game.grid.data[tileY][tileX] != 2 && game.grid.data[tileY][tileX] != 3) {
    var tower = new Tower(game, x+game.grid.tileSize/2, y+game.grid.tileSize/2);
  }
  // update data with new 
  game.grid.setData(this.teamTowerFrame, tileX, tileY);
}

Interface.prototype.placeWall = function(x,y) {
  var tileX = game.grid.layer.getTileX(x);
  var tileY = game.grid.layer.getTileY(y);
  // place tile with our tower frame
  
  game.grid.map.putTile(this.teamWallFrame, tileX, tileY, game.grid.layer);
  game.grid.setData(this.teamWallFrame, tileX, tileY);
}
Interface.prototype.openTowerSelector = function(x, y) {
  var mode;
  if(x < 100 || x > game.width -100) mode = 1
  if(y < 100 || x > game.height -100) mode = 0

  if (mode === 1) { 
    // layout buttons vertically
    this.horizWallButton.alpha = 1; this.horizTowerButton.alpha = 1;
    this.vertWallButton.alpha = 0; this.vertTowerButton.alpha = 0;
    this.horizWallButton.inputEnabled = true; this.horizTowerButton.inputEnabled = true;
  } else {
    // layout buttons horizontally
    this.horizWallButton.alpha = 0; this.horizTowerButton.alpha = 0;
    this.vertWallButton.alpha = 1; this.vertTowerButton.alpha = 1;
    this.vertWallButton.inputEnabled = true; this.vertTowerButton.inputEnabled = true;
  }
  
  this.selectorOpen = true;
  this.towerMenu.x = x+game.grid.tileSize/2;
  this.towerMenu.y = y+game.grid.tileSize/2;

  var tween = game.add.tween(this.towerMenu);
  tween.to({alpha: 1}, 500, Phaser.Easing.Quadratic.Out, true).start();
}
