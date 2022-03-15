import Phaser from 'phaser';

export default class Monster extends Phaser.Physics.Arcade.Image {
  constructor(scene, x, y, data) {
    super(scene, x, y, 'monster');

    this.scene = scene;
    this.x = x;
    this.y = y;
    this.name;
    this.hp;
    this.baseSpeed;
    this.currentSpeed;
    this.armor;
    this.magicResistance;
    this.type;
    this.ability;
    this.exp =
      this.scene.currentWave % 10 != 0
        ? Math.floor(this.scene.currentWave / 10 + 1) * 5
        : 300;

    this.selected = false;

    this.modifires = [];
    this.speedX = 0;
    this.speedY = 0;
    this.path;
    this.pathN = 0;

    this.difficultyHp = this.scene.registry.get('difficultyHp');
    this.difficultySpeed = this.scene.registry.get('difficultySpeed');
    this.scaleSize = this.scene.registry.get('scale');
    this.frameSize = this.scene.registry.get('frameSize');
    this.points = this.scene.registry.get('points');

    this.setInteractive();
  }

  setSelected(selected) {
    this.selected = selected;
  }

  setParams(data) {
    this.name = data.name;
    this.hp = Math.round(data.hp * this.difficultyHp);
    this.baseSpeed = Math.round(
      (data.speed * this.difficultySpeed) / this.scaleSize
    );
    this.currentSpeed = this.baseSpeed;
    this.armor = data.armor;
    this.magicResistance = data.magicResistance;
    this.type = data.type;
    this.ability = data.ability;
  }

  update(time, delta) {
    if (
      this.x == this.points[6].x * this.frameSize &&
      this.y == this.points[6].y * this.frameSize
    ) {
      this.delete();
    }
  }

  delete() {
    const tween = this.scene.tweens.getTweensOf(this);
    if (tween[0]) tween[0].destroy();
    this.destroy();
  }

  effect(data) {
    if (data.name.includes('slow')) {
      const timedEvent = new Phaser.Time.TimerEvent({
        delay: data.duration,
        callback: () => {
          this.currentSpeed += data.value / this.scaleSize;
          if (this.hp > 0) {
            this.scene.tweens.getTweensOf(this)[0].timeScale +=
              data.value / this.scaleSize / this.baseSpeed;
          }
          this.modifires.splice(
            this.modifires.findIndex((val) => val === data.name),
            1
          );
        },
      });
      if (this.modifires.includes(data.name)) {
        this.scene.time.addEvent(timedEvent);
      } else {
        this.currentSpeed -= data.value / this.scaleSize;
        this.scene.tweens.getTweensOf(this)[0].timeScale -=
          data.value / this.scaleSize / this.baseSpeed;
        this.modifires.push(data.name);
        this.scene.time.addEvent(timedEvent);
      }
    }
  }
}
