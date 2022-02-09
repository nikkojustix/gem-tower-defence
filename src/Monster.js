import Phaser from 'phaser';

export default class Monster extends Phaser.Physics.Arcade.Image {
  constructor(scene, x, y) {
    super(scene, x, y, 'monster');

    this.hp = 6;

    this.selected = false;
  }

  setSelected(selected) {
    this.selected = selected;
  }
}
