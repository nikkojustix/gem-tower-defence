import Phaser from 'phaser';
import Bullet from './Bullet';

class Tower extends Phaser.GameObjects.Image {
  constructor(scene, x, y, texture, name, data) {
    super(scene, x, y, texture, name);

    this.scene = scene;
    this.name = name;

    this.damage = data.damage || null;
    this.attackSpeed = (170 / data.attackSpeed) * 1000 || null;
    this.radius = data.radius || null;
    this.ability = data.ability || null;

    this.combineTo = null;
    this.selected = false;

    this.timer = this.attackSpeed;
  }

  setSelected(selected) {
    this.selected = selected;
    if (this.selected) {
      this.marker = this.scene.add.graphics();
      this.marker.lineStyle(2, 0xffffff, 1);
      this.marker.strokeCircle(
        this.getCenter().x,
        this.getCenter().y,
        this.radius
      );
    } else if (this.marker) {
      this.marker.destroy();
    }
  }

  setParams(name, data) {
    this.name = name;
    this.damage = data.damage;
    this.attackSpeed = (170 / data.attackSpeed) * 1000;
    this.radius = data.radius;
    this.ability = data.ability;
  }
}

export default Tower;
