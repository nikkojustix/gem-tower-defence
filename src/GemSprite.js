import Phaser from 'phaser';

class GemSprite extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, frame, attackRadius) {
    super(scene, x, y, 'gemImages', frame);

    this.attackRadius = attackRadius

    scene.add.existing(this)
  }
}

export default GemSprite