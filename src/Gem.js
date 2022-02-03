import Phaser from 'phaser';

class Gem extends Phaser.GameObjects.Image {
  constructor(scene, x, y, frame, data) {
    super(scene, x, y, 'gemImages', frame);

    this.name = frame;
    this.rank = frame.split(' ')[0];
    this.type = frame.split(' ')[1];
    this.damage = data.damage || null;
    this.attackSpeed = data.attackSpeed || null;
    this.radius = data.radius || null;
    this.ability = data.ability || null;

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

  setParams(name, data) {
    this.name = name;
    this.rank = name.split(' ')[0];
    this.type = name.split(' ')[1];
    this.damage = data.damage;
    this.attackSpeed = data.attackSpeed;
    this.radius = data.radius;
    this.ability = data.ability;
  }
}

export default Gem;
