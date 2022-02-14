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
      runUpdateChild: true,
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

    if (time > this.timer) {
      if (targets[0] && targets[0].gameObject instanceof Monster) {
        const bullet = this.bullets.get(this.x, this.y);
        this.bullets.add(bullet, true);
        bullet.setBodySize(8, 8);
        console.log('bullet from: ', this.name);
        console.log(targets);
        const enemy = targets[0].gameObject;
        enemy.on('move', () => {
          this.scene.physics.moveTo(
            bullet,
            enemy.body.center.x,
            enemy.body.center.y,
            bullet.speed
          );

          const distance = Phaser.Math.Distance.Between(
            bullet.body.center.x,
            bullet.body.center.y,
            enemy.body.center.x,
            enemy.body.center.y
          );
          if (distance < 4) {
            this.scene.hit(bullet, enemy);
          }

          // this.physics.overlap(bullet, enemy, this.hit, undefined, this);
          const tweens = this.scene.tweens.getTweensOf(enemy);
          if (!tweens[0].isPlaying()) {
            console.log('no enemy');
            bullet.destroy();
          }

          this.timer = time + this.attackSpeed;
        });
      }
    }
  }
}

export default Tower;
