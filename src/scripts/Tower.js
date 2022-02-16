import Phaser from 'phaser';
import Bullet from './Bullet';
import Monster from './Monster';

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

    this.timer = 0;

    this.bullets = this.scene.physics.add.group({
      classType: Bullet,
      runChildUpdate: true,
    });
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

  update(time, delta) {
    const targets = this.scene.physics
      .overlapCirc(this.x, this.y, this.radius)
      .filter((value) => value.gameObject instanceof Monster);

    this.timer += delta;
    if (targets[0] && targets[0].gameObject.hp > 0) {
      if (this.timer > this.attackSpeed) {
        const bullet = this.bullets.get(this.x, this.y);
        bullet.damage = this.damage;
        bullet.setBodySize(8, 8);
        const enemy = targets[0].gameObject;
        enemy.on('move', () => {
          bullet.fire(enemy);

          this.scene.physics.overlap(
            bullet,
            enemy,
            this.scene.hit,
            undefined,
            this.scene
          );
        });
        this.timer = 0;
      }
    }
  }
}

export default Tower;
