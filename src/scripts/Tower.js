import Phaser from 'phaser';
import Bullet from './Bullet';
import Monster from './Monster';
import Gem from './Gem';

class Tower extends Phaser.Physics.Arcade.Image {
  constructor(scene, x, y, texture, name, data) {
    super(scene, x, y, texture, name);

    this.name = name;

    this.baseDamage = data.damage || null;
    this.curDamage = this.baseDamage;

    this.baseAttackSpeed = data.attackSpeed || null;
    this.curAttackSpeed = this.baseAttackSpeed;
    this.setAttackRate();

    this.baseRadius = data.radius / this.scene.registry.get('scale');
    this.curRadius = this.baseRadius;

    this.ability = data.ability || null;
    this.auras = new Set();

    this.targetsCnt = 1;

    this.combineTo = null;
    this.selected = false;

    this.timer = 0;

    this.setInteractive().setOrigin(0);
    this.bullets = scene.physics.add.group({
      runChildUpdate: true,
    });

    this.on('addedtoscene', () => {
      this.ability.forEach((value) => {
        const data = this.scene.abilitiesData.find((val) => val.name === value);
        if (data.type === 'selfEffect') {
          this.useEffect(data);
        }
      });
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
        this.curRadius
      );
    } else if (this.marker) {
      this.marker.destroy();
    }
  }

  setParams(data) {
    this.name = data.name;

    this.baseDamage = data.damage;
    this.curDamage = this.baseDamage;

    this.baseAttackSpeed = data.attackSpeed;
    this.curAttackSpeed = this.baseAttackSpeed;
    this.setAttackRate();

    this.baseRadius = data.radius / this.scene.registry.get('scale');
    this.curRadius = this.baseRadius;

    this.ability = data.ability;
    this.emit('addedtoscene');
  }

  update(time, delta) {
    const targets = this.scene.physics
      .overlapCirc(this.getCenter().x, this.getCenter().y, this.curRadius)
      .filter((value) => value.gameObject instanceof Monster);

    this.timer += delta;
    if (this.timer > this.attackRate) {
      for (let i = 0; i < this.targetsCnt; i++) {
        if (targets[i] && targets[i].gameObject.hp > 0) {
          const bullet = new Bullet(
            this.scene,
            this.getCenter().x,
            this.getCenter().y,
            this.curDamage,
            this.ability
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

  useEffect(data) {
    if (data.name.includes('split')) {
      this.targetsCnt = data.value;
    }
    if (data.name.includes('damage')) {
      this.curDamage += data.value;
    }
    if (data.name.includes('speed')) {
      this.curAttackSpeed += (this.baseAttackSpeed * data.value) / 100;
      this.setAttackRate();
    }
  }

  updateAuras() {
    this.ability.forEach((value) => {
      const data = this.scene.abilitiesData.find((val) => val.name === value);
      if (data.type === 'aura') {
        if (!this.auras.has(data)) {
          this.auras.add(data);
          this.enableAura(data);
        }
        const towers = this.scene.physics
          .overlapCirc(
            this.getCenter().x,
            this.getCenter().y,
            data.radius / this.scene.registry.get('scale'),
            true,
            true
          )
          .filter((value) => value.gameObject instanceof Tower);
        console.log(towers);
        towers.forEach((tower) => {
          if (!tower.gameObject.auras.has(data)) {
            tower.gameObject.auras.add(data);
            tower.gameObject.enableAura(data);
            console.log(tower);
          }
        });
      }
    });
  }

  enableAura(aura) {
    if (aura.name.includes('aura')) {
      this.curAttackSpeed += (this.baseAttackSpeed * aura.value) / 100;
      this.setAttackRate();
    }
  }

  disableAuras() {
    for (const aura of this.auras) {
      if (aura.name.includes('aura')) {
        this.curAttackSpeed -= (this.baseAttackSpeed * aura.value) / 100;
        this.setAttackRate();
      }
    }
  }

  setAttackRate() {
    this.attackRate = (170 / this.curAttackSpeed) * 1000;
  }
}

export default Tower;
