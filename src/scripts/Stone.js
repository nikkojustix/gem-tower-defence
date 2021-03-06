import Phaser from "phaser";

export default class Stone extends Phaser.GameObjects.Image {
  constructor(scene, x, y) {
    super(scene, x, y, "gemImages", "stone");

    this.name = "stone";
    this.selected = false;

    this.setOrigin(0);
    this.setInteractive();
  }

  setSelected(selected) {
    this.selected = selected;
  }
}
