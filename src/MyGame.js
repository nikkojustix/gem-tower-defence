import Phaser from 'phaser';
import mapImg from './assets/new-map.png';
import spritesheet from './assets/original/gem_spritesheet.png';
import atlas from './assets/atlas.json';

class MyGame extends Phaser.Scene {
  constructor() {
    super();

    this.scale
  }

  preload() {
    this.load.json('atlas', atlas);
    this.load.image('map', mapImg);
    this.load.spritesheet('spritesheet', spritesheet, { frameWidth: 256, frameHeight: 256, });
  }

  create() {
    const map = this.add.image(0, 0, 'map').setOrigin(0).setInteractive();
    const atlas = this.cache.json.get('atlas');

    const cam = this.cameras.main.setBounds(0, 0, 9472, 9472, true)
    cam.zoom = 0.12

    map.on('pointerdown', (e) => {
      console.log(e.x, e.y);
      if (e.button === 0) {
        const gem = this.add.sprite((e.x / cam.zoom) + cam.worldView.x, (e.y / cam.zoom) + cam.worldView.y, 'spritesheet', 36)
      }
    })

    map.on('pointermove', (e) => {
      if (!e.isDown) return
      if (e.button === 1) {
        cam.scrollX -= (e.x - e.prevPosition.x) / cam.zoom
        cam.scrollY -= (e.y - e.prevPosition.y) / cam.zoom
      }
    })

    map.on('keydown', (e) => {
      console.log(e.target);
    })

    this.input.on('wheel', (e) => {
      console.log(cam.zoom);
      if (cam.zoom > 0.085 && e.deltaY > 0) {
        cam.zoom -= 0.005
      }
      if (e.deltaY < 0) {
        cam.zoom += 0.005
      }
    })
  }

  update(time, delta) {
    // this.controls.update(delta)
  }
}

export default MyGame