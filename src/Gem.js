import Phaser from 'phaser';

class Gem extends Phaser.GameObjects.Image {
  constructor(scene, x, y, frame, radius) {
    super(scene, x, y, 'gemImages', frame);

    this.radius = radius
    this.center
    this.selected = true
    scene.add.existing(this)
  }


  showRadius() {
    this.marker = this.scene.add.graphics()
    this.marker.lineStyle(2, 0xffffff, 1)
    this.marker.strokeCircle(this.getCenter().x, this.getCenter().y, this.radius)
  }
}

export default Gem