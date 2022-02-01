import Phaser from 'phaser';

class Gem extends Phaser.GameObjects.Image {
  constructor(scene, x, y, frame, radius) {
    super(scene, x, y, 'gemImages', frame);

    this.radius = radius
    this.center
    this.selected = false
    this.test = false
  }

  setSelected(selected) {
    this.selected = selected
    if (this.selected) {
      this.marker = this.scene.add.graphics()
      this.marker.lineStyle(2, 0xffffff, 1)
      this.marker.strokeCircle(this.getCenter().x, this.getCenter().y, this.radius)
    } else if (this.marker) {
      this.marker.destroy()
    }
  }
}

export default Gem