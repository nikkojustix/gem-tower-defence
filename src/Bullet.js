import Phaser from 'phaser';

export default class Bullet extends Phaser.Physics.Arcade.Image {
  constructor(scene, x, y, damage) {
    super(scene, x, y, 'bullet');

    this.scene = scene;
    this.damage = damage;
    this.speed = 600;
  }
}
