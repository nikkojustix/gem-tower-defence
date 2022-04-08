import Phaser from "phaser";

export default class Monster extends Phaser.Physics.Arcade.Image {
  constructor(scene, x, y, texture, name, data) {
    super(scene, x, y, texture, name);

    this.helthBar = this.scene.add
      .rectangle(this.x, this.y - 8, 32, 4, 0x000000)
      .setOrigin(0);

    this.scene = scene;
    this.x = x;
    this.y = y;
    this.name = name;
    this.baseHp;
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

    this.modifires = {};
    this.speedX = 0;
    this.speedY = 0;
    this.path;
    this.pathN = 0;
    this.difficultyHp = this.scene.registry.get("difficultyHp");
    this.difficultySpeed = this.scene.registry.get("difficultySpeed");
    this.scaleSize = this.scene.registry.get("scale");
    this.frameSize = this.scene.registry.get("frameSize");
    this.points = this.scene.registry.get("points");

    this.setInteractive();
  }

  setSelected(selected) {
    this.selected = selected;
  }

  setParams(data) {
    this.name = data.name;
    this.hp = this.baseHp = Math.round(data.hp * this.difficultyHp);
    this.baseSpeed = Math.round(
      (data.speed * this.difficultySpeed) / this.scaleSize
    );
    this.currentSpeed = this.baseSpeed;
    this.armor = data.armor;
    this.magicResistance = data.magicResistance;
    this.type = data.type;
    this.ability = data.ability;
    // this.drawBar();
    // this.scene.add.existing(this.helthBar);
  }

  decreaseHp(damage) {
    this.hp -= damage;
    if (this.hp <= 0) {
      this.delete();
    }
    this.helthBar.displayWidth = Math.max(
      0,
      (this.frameSize / this.baseHp) * this.hp
    );
    // this.drawBar();
  }

  update(time, delta) {
    this.helthBar.setX(this.x);
    this.helthBar.setY(this.y - 8);

    if (
      this.x == this.points[6].x * this.frameSize &&
      this.y == this.points[6].y * this.frameSize
    ) {
      this.delete();
    }
  }

  drawBar() {
    this.helthBar.clear();

    this.helthBar.fillStyle(0x000000);

    this.helthBar.fillRect(
      this.x * this.scene.cam.zoom,
      this.y - 8,
      (this.frameSize / this.baseHp) * this.hp,
      4
    );
    console.log(this.x, this.helthBar.x);
  }

  delete() {
    if (this.scene) {
      const tween = this.scene.tweens.getTweensOf(this);
      if (tween[0]) tween[0].destroy();
      this.destroy();
    }
  }

  effect(data, damage) {
    if (data.name.includes("slow")) {
      const timedEventConfig = {
        delay: data.duration,
        callback: () => {
          this.currentSpeed += data.value / this.scaleSize;
          if (this.scene && this.hp > 0) {
            this.scene.tweens.getTweensOf(this)[0].timeScale +=
              data.value / this.scaleSize / this.baseSpeed;
          }
          delete this.modifires[data.name];
        },
      };

      if (data.name in this.modifires) {
        this.modifires[data.name].reset(timedEventConfig);
      } else {
        this.currentSpeed -= data.value / this.scaleSize;
        this.scene.tweens.getTweensOf(this)[0].timeScale -=
          data.value / this.scaleSize / this.baseSpeed;
        const slowEvent = this.scene.time.addEvent(timedEventConfig);
        this.modifires[data.name] = slowEvent;
      }
    }

    if (data.name.includes("pierce")) {
      const timedEventConfig = {
        delay: data.duration,
        callback: () => {
          this.armor += data.value;
          delete this.modifires[data.name];
        },
      };

      if (data.name in this.modifires) {
        this.modifires[data.name].reset(timedEventConfig);
      } else {
        this.armor -= data.value;
        const pierceEvent = this.scene.time.addEvent(timedEventConfig);
        this.modifires[data.name] = pierceEvent;
      }
    }

    if (data.name.includes("poison")) {
      const timedEventConfig = {
        delay: 1000,
        repeat: data.duration / 1000,
        callback: () => {
          this.decreaseHp(data.value);
          if (poisonEvent.repeatCount === 0) {
            console.log("finished");

            const index = this.modifires[data.name].findIndex(
              (value) => value === poisonEvent
            );
            this.modifires[data.name].splice(index, 1);
            console.log(this.modifires);
          }
        },
      };
      const poisonEvent = this.scene.time.addEvent(timedEventConfig);
      if (this.modifires[data.name]) {
        this.modifires[data.name].push(poisonEvent);
      } else {
        this.modifires[data.name] = [poisonEvent];
      }

      console.log(this.modifires);
    }

    if (data.name.includes("cleave")) {
      const nearMonsters = this.scene.physics
        .overlapCirc(
          this.getCenter().x,
          this.getCenter().y,
          data.radius / this.scaleSize
        )
        .filter(
          (value) =>
            value.gameObject instanceof Monster && value.gameObject != this
        );
      nearMonsters.forEach((monster) => {
        monster.gameObject.decreaseHp(damage * data.value);
      });
    }
  }
}
