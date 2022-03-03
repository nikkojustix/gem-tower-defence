import Phaser from 'phaser';
import Bullet from './Bullet';
import Monster from './Monster';

class Tower extends Phaser.GameObjects.Image {
  constructor(scene, x, y, texture, name, data) {
    super(scene, x, y, texture, name);

    this.name = name;

    this.damage = data.damage || null;
    this.attackSpeed = (170 / data.attackSpeed) * 1000 || null;
    this.radius = (data.radius / 128) * this.scene.registry.get('frameSize');

    this.ability = data.ability || null;

    this.targetsCnt = data.ability.includes('split 1') ? 4 : 1;
    this.combineTo = null;
    this.selected = false;

    this.timer = 0;

    this.setInteractive().setOrigin(0);
    this.bullets = scene.physics.add.group({
      runChildUpdate: true,
    });
    console.log(this.targetsCnt);
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
    this.radius = (data.radius / 128) * this.scene.registry.get('frameSize');
    this.ability = data.ability;
  }

  update(time, delta) {
    const targets = this.scene.physics
      .overlapCirc(this.getCenter().x, this.getCenter().y, this.radius)
      .filter((value) => value.gameObject instanceof Monster);

    this.timer += delta;
    if (this.timer > this.attackSpeed) {
      for (let i = 0; i < this.targetsCnt; i++) {
        if (targets[i] && targets[i].gameObject.hp > 0) {
          console.log(i);
          const bullet = new Bullet(
            this.scene,
            this.getCenter().x,
            this.getCenter().y,
            this.damage
          );
          this.bullets.add(bullet, true);

          const enemy = targets[i].gameObject;
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
}

export default Tower;
