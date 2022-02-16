import Phaser from 'phaser';
import Bullet from './Bullet';
import Tower from './Tower';

export default class AdvancedTower extends Tower {
  constructor(scene, x, y, name, data) {
    super(scene, x, y, 'silver', name, data);

    this.combination = data.combination;
  }

  setSelected(selected) {
    super.setSelected(selected);
  }

  setParams(name, data) {
    this.combination = data.combination;
    super.setParams(name, data);
  }
}
