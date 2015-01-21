var CameraManager = function (game) {
    this.game = game;
    this.cameraDrag = 0.52;
    this.cameraAccel = 0.8;
    this.camVel = new Phaser.Point();
    this.camMaxSpeed = 50;
    this.cursors = game.input.keyboard.createCursorKeys();
}

CameraManager.prototype.constructor = CameraManager;
CameraManager.prototype.update = function() {
  if (this.cursors.up.isDown) {
      this.game.camera.y -= 4;
  } else if (this.cursors.down.isDown) {
      this.game.camera.y += 4;
  } if (this.cursors.left.isDown) {
      this.game.camera.x -= 4;
  } else if (this.cursors.right.isDown) {
      this.game.camera.x += 4;
  }
  if (game.this.cursorState === 0 || game.this.cursorState === 2 ) {
    game.this.cursorState = 2;
    this.dragCamera(this.game.input.mousePointer);
    this.dragCamera(this.game.input.pointer1);
  }
  this.updateCamera();
}

CameraManager.prototype.dragCamera = function(pointer) {
  if (!pointer.timeDown) return;
  if (pointer.isDown && !pointer.targetObject) {
    if (this.oCamera) {
      this.camVel.setTo(((this.oCamera.x - pointer.position.x) * this.cameraAccel),((this.oCamera.y - pointer.position.y) * this.cameraAccel));
    }
    this.oCamera = pointer.position.clone();
  }

  if (pointer.isUp) {
    this.oCamera = null;
  }
}

CameraManager.prototype.updateCamera = function() {
  this.camVel.clamp(-this.camMaxSpeed,this.camMaxSpeed);

  this.game.camera.x += this.camVel.x;
  this.game.camera.y += this.camVel.y;

  if (this.camVel.x > this.cameraDrag) {
    this.camVel.x -= this.cameraDrag;
  } else if (this.camVel.x < -this.cameraDrag) {
    this.camVel.x += this.cameraDrag;
  } else {
    this.camVel.x = 0;
  }

  if (this.camVel.y > this.cameraDrag) {
    this.camVel.y -= this.cameraDrag;
  } else if (this.camVel.y < -this.cameraDrag) {
    this.camVel.y += this.cameraDrag;
  } else {
    this.camVel.y = 0;
  }
}

module.exports = CameraManager
