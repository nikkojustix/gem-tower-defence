import Phaser from 'phaser';

class GemSprite extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'gemImages');

    // this.setFrame(1)
    // this.x = x;
    // this.y = y;
    // this.texture = texture || 'spritesheet';
    // this.frame = frame || 0
  }
}

export default GemSprite