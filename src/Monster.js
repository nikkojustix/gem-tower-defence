import Phaser from 'phaser';

class Monster extends Phaser.Physics.Arcade.Image {
  constructor(scene, x, y) {
    super(scene, x, y, 'monster');

    this.selected = false;
  }

  setSelected(selected) {
    this.selected = selected;
  }
}

export default Monster;
