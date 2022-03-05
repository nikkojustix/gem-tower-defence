import Phaser from 'phaser';

export default class Bullet extends Phaser.Physics.Arcade.Image {
  constructor(scene, x, y, damage, ability) {
    super(scene, x, y, 'bullet');

    this.scene = scene;
    this.damage = damage;
    this.ability = ability;

    this.incX = 0;
    this.incY = 0;
    this.speed = Phaser.Math.GetSpeed(750, 1);
    this.target = null;
  }

  fire(target) {
    this.target = target;
    if (target.hp > 0) {
      const angle = Phaser.Math.Angle.Between(
        this.getCenter().x,
        this.getCenter().y,
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

    if (this.target && this.target.hp <= 0) {
      this.destroy();
    }
  }
}
