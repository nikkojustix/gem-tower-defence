import Phaser from 'phaser';

export default class Monster extends Phaser.Physics.Arcade.Image {
  constructor(scene, x, y) {
    super(scene, x, y, 'monster');

    this.scene = scene;
    this.x = x;
    this.y = y;
    this.hp = 6;

    this.selected = false;
  }

  setSelected(selected) {
    this.selected = selected;
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
  }

  delete() {
    this.destroy();
  }
}
