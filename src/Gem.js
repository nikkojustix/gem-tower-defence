import Phaser from 'phaser';

class Gem extends Phaser.GameObjects.Image {
  constructor(scene, x, y, frame, damage, attackSpeed, radius, ability) {
    super(scene, x, y, 'gemImages', frame);

    this.name = frame;
    this.damage = damage || null;
    this.attackSpeed = attackSpeed || null;
    this.radius = radius || null;
    this.ability = ability || null;

    this.selected = false;
  }

  setSelected(selected) {
    this.selected = selected;
    if (this.selected) {
      this.marker = this.scene.add.graphics();
      this.marker.lineStyle(2, 0xffffff, 1);
      this.marker.strokeCircle(
        this.getCenter().x,
        this.getCenter().y,
        this.radius
      );
    } else if (this.marker) {
      this.marker.destroy();
    }
  }
}

export default Gem;
