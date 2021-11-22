import Phaser from 'phaser';
import mapImg from './assets/map.png';
import spritesheet from './assets/gem_spritesheet.png';
import atlas from './assets/atlas.json';

class MyGame extends Phaser.Scene {
  constructor() {
    super();

    this.test = '123'
  }

  preload() {
    this.load.json('atlas', atlas);
    this.load.image('map', mapImg);
    this.load.spritesheet('spritesheet', spritesheet, { frameWidth: 128, frameHeight: 128, });
  }

  create() {
    const map = this.add.image(444, 444, 'map').setInteractive();
    const atlas = this.cache.json.get('atlas');
    const spritesheet =
      map.on('pointerdown', (e) => {
        console.log(e.x, e.y);
        const gem = this.add.sprite(e.x, e.y, 'spritesheet')

      })
  }

  update() {

  }
}

export default MyGame