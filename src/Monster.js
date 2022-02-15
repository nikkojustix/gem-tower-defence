import Phaser from 'phaser';

export default class Monster extends Phaser.Physics.Arcade.Image {
  constructor(scene, x, y, data) {
    super(scene, x, y, 'monster');

    this.scene = scene;
    this.x = x;
    this.y = y;
    this.name;
    this.hp;
    this.speed;
    this.armor;
    this.magicResistance;
    this.type;
    this.ability;

    this.selected = false;
  }

  setSelected(selected) {
    this.selected = selected;
  }

  setParams(data) {
    this.name = data.name;
    this.hp = data.hp;
    this.speed = data.speed;
    this.armor = data.armor;
    this.magicResistance = data.magicResistance;
    this.type = data.type;
    this.ability = data.ability;
  }

  update() {
    if (
      this.x ==
        this.scene.registry.get('points')[6].x *
          this.scene.registry.get('frameSize') &&
      this.y ==
        this.scene.registry.get('points')[6].y *
          this.scene.registry.get('frameSize')
    ) {
      this.delete();
    }

    if (this.hp <= 0) {
      this.delete();
    }
  }

  delete() {
    this.destroy();
  }
}
