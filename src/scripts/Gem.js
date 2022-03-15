import Phaser from 'phaser';
import Tower from './Tower';

export default class Gem extends Tower {
  constructor(scene, x, y, name, data) {
    super(scene, x, y, 'gemImages', name, data);

    this.rank = name.split(' ')[0];
    this.type = name.split(' ')[1];
  }

  setParams(data) {
    super.setParams(data);
    this.rank = data.name.split(' ')[0];
    this.type = data.name.split(' ')[1];
  }
}
