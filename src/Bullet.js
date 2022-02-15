import Phaser from 'phaser';

export default class Bullet extends Phaser.Physics.Arcade.Image {
  constructor(scene, x, y, damage) {
    super(scene, x, y, 'bullet');

    this.scene = scene;
    this.damage = damage;

    this.incX = 0;
    this.incY = 0;
    this.speed = Phaser.Math.GetSpeed(600, 1);
  }

  fire(target) {
    if (target.hp > 0) {
      const angle = Phaser.Math.Angle.Between(
        this.x,
        this.y,
        target.body.center.x,
        target.body.center.y
      );
      this.incX = Math.cos(angle);
      this.incY = Math.sin(angle);
    } else {
      this.destroy();
    }
  }

  update(time, delta) {
    this.x += this.incX * (this.speed * delta);
    this.y += this.incY * (this.speed * delta);
  }
}
