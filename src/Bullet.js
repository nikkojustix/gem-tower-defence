import Phaser from 'phaser';

class Bullet extends Phaser.Physics.Arcade.Image {
  constructor(scene, x, y) {
    super(scene, x, y, 'bullet');
    this.scene = scene;
    this.speed = 900;
    // this.scene.physics.add.existing(this);
  }
}
export default Bullet;
