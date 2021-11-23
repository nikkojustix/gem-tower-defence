import Phaser from 'phaser';
import mapImg from './assets/blank_map.png';
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

    const cursors = this.input.keyboard.createCursorKeys();

    const controlConfig = {
      camera: this.cameras.main,
      left: cursors.left,
      right: cursors.right,
      up: cursors.up,
      down: cursors.down,
      zoomIn: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
      zoomOut: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
      acceleration: 0.06,
      drag: 0.0005,
      maxSpeed: 1.0
    };

    this.controls = new Phaser.Cameras.Controls.SmoothedKeyControl(controlConfig);

    this.scale = 0.5
    const spritesheet =
      map.on('pointerdown', (e) => {
        console.log(e.x, e.y);
        const gem = this.add.sprite(e.x / this.scale, e.y / this.scale, 'spritesheet')

      })

    const cam = this.cameras.main.setBounds(0, 0, 9472, 9472)

    cam.setZoom(this.scale)
    this.input.on('wheel', (e) => {
      if (cam.zoom > 0.095)
        if (e.deltaY > 0) {
          this.scale -= 0.005
          cam.setZoom(this.scale)
        }
      if (e.deltaY < 0) {
        this.scale += 0.01
        cam.setZoom(this.scale)
      }
    })
  }

  update(time, delta) {
    this.controls.update(delta)
  }
}

export default MyGame