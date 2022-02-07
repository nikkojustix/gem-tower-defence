import Phaser from 'phaser';
import Bullet from './Bullet';

class Gem extends Phaser.GameObjects.Image {
  constructor(scene, x, y, frame, data) {
    super(scene, x, y, 'gemImages', frame);

    this.scene = scene;
    this.name = frame;
    this.rank = frame.split(' ')[0];
    this.type = frame.split(' ')[1];
    this.damage = data.damage || null;
    this.attackSpeed = (170 / data.attackSpeed) * 1000 || null;
    this.radius = data.radius || null;
    this.ability = data.ability || null;

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
    this.rank = name.split(' ')[0];
    this.type = name.split(' ')[1];
    this.damage = data.damage;
    this.attackSpeed = (170 / data.attackSpeed) * 1000;
    this.radius = data.radius;
    this.ability = data.ability;
  }

  // attack(enemy, delta) {
  //   this.timer += delta;
  //   if (this.timer >= this.attackSpeed) {
  //     const bullet = new Bullet(this.scene, this.x, this.y);
  //     console.log(bullet);
  //     // this.physics.add.existing(bullet);
  //     // this.scene.physics.moveToObject(bullet, enemy, bullet.speed);
  //     this.timer = 0;
  //   }
  // }
}

export default Gem;
