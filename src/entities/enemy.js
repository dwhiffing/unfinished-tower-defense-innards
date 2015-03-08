class Enemy extends Phaser.Sprite {

  constructor(opts={}) {
    super(game, -50, -50, 'enemy');
    game.physics.enable(this);
    this.setConfig(opts);
    Phaser.Sprite.prototype.kill.call(this);
  }

  setConfig(opts) {
    this.speed = opts.speed;
    this.maxHealth = opts.heath || 8;
    this.anchor.setTo(0.5,0.5);
    this.nextWaypoint = 0;

    this.offset = game.grid.tileSize/2;
    this.height = opts.size; this.width = opts.size
    this.death_animation = {height: 120, width:120, alpha: 0, angle: -900};
  }

  spawn(x, y, spacing, health) {
    this.reset(x+this.offset, y+this.offset, health);

    game.add.tween(this).to({
        height: 50,
        width:50
      },
      spacing/2,
      Phaser.Easing.Quadratic.InOut,
      true
    );

    game.add.tween(this).to({
        alpha: 1
      },
      spacing/2,
      Phaser.Easing.Quadratic.InOut,
      true
    );

    game.time.events.add(spacing/2, this.startWave, this)
    this.nextWaypoint = 0;
  }

  startWave() {
    var duration = game.rnd.integerInRange(this.speed*90,this.speed*100)
    var delay = game.rnd.integerInRange(100,1000)
    this.pulsate = game.add.tween(this).to({height: 60, width:60}, duration/2, Phaser.Easing.Quadratic.InOut, true, delay, -1, true)
    this.spin = game.add.tween(this).to({angle: 360}, duration*2, Phaser.Easing.Linear.None, true, delay, -1)

    this.pathTween = game.add.tween(this);
    if (this.nextWaypoint === 0) {
      this.pathTween.to({x: this.x}, 10, Phaser.Easing.Linear.None);
      this.nextWaypoint++;
    }
    
    // determine the closest tile to the enemies current position
    var tile = game.grid.getWall(this.x, this.y);
    var path = game.grid.getPath({x: tile.x, y: tile.y}, game.grid.waypoints[0]);
    
    // stop any tweens in progress 
    if (this.lastTween) this.lastTween.stop();
    
    this.lastTween = this.pathTween; this.lastPath = path;

    // tween the enemy to that tile, and chain each tween needed to the next waypoint
    for(var j = 1; j < path.length; j++) {
      var nTile = game.grid.map.getTile(path[j].x, path[j].y, game.grid.wall_layer);
      var oTile = game.grid.map.getTile(path[j-1].x, path[j-1].y, game.grid.wall_layer);
      var nPos = {x: nTile.worldX, y: nTile.worldY};
      var oPos = {x: oTile.worldX, y: oTile.worldY};
      var distance = this.getDistance(nPos, oPos) * this.speed;
      this.pathTween.to({x: nPos.x+this.offset, y: nPos.y+this.offset }, distance, Phaser.Easing.Linear.None);
    }
    this.pathTween.onComplete.add(this.kill, this)
    this.pathTween.start();
  }

  kill() {
    this.stopTweens();
    
    game.emitter.position.setTo(this.x, this.y);
    game.emitter.start(true, 4000, null, 10);

    game.add.tween(this)
      .to(this.death_animation, 500, Phaser.Easing.Quadratic.Out, true)
      .onComplete.add(() => {
        this.scale.set(0,0);
        Phaser.Sprite.prototype.kill.call(this);
        game.ui.checkEndOfRound()
      })
  }

  reset(x ,y, health) {
    this.scale.set(0,0);
    this.alpha = 0;
    super.reset(x ,y, health);
  }

  stopTweens() {
    if (this.pulsate) this.pulsate.stop();
    if (this.spin) this.spin.stop();
    if (this.pathTween) this.pathTween.stop();
  }

  getDistance(p1,p2) {
    return Math.sqrt( Math.pow((p1.x - p2.x), 2) + Math.pow((p1.y - p2.y), 2) );
  }

}

export default Enemy