import Phaser from 'phaser';

class Monster extends Phaser.GameObjects.Image {
  constructor(scene, x, y) {
    super(scene, x, y, 'monster');

    this.selected = false;
  }

  setSelected(selected) {
    this.selected = selected;
  }
}

export default Monster;
