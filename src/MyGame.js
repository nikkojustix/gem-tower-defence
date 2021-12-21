import Phaser from 'phaser';
import mapImg from './assets/new-map.png';
import spritesheet from './assets/original/gem_spritesheet.png';
import atlas from './assets/atlas.json';
import GemSprite from './GemSprite';

class MyGame extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });

    this.map
    this.atlas
    this.cam
    this.newGemCounter = 0
    this.roundLevel = 1
    this.maze
  }

  preload() {
    this.load.json('atlas', atlas);
    this.load.image('map', mapImg);
    this.load.spritesheet('spritesheet', spritesheet, { frameWidth: 256, frameHeight: 256, });
  }

  create() {
    this.map = this.add.image(0, 0, 'map',).setOrigin(0).setInteractive();
    this.atlas = this.cache.json.get('atlas');
    this.cam = this.cameras.main.setBounds(0, 0, 9472, 9472, true)
    this.cam.setViewport(0, 0, 900, 900)
    this.cam.zoom = 0.095

    this.map.on('pointermove', (e) => {
      if (!e.isDown) return
      if (e.button === 1) {
        this.cam.scrollX -= (e.x - e.prevPosition.x) / this.cam.zoom
        this.cam.scrollY -= (e.y - e.prevPosition.y) / this.cam.zoom
      }
    })

    this.input.on('wheel', (e) => {
      if (this.cam.zoom > 0.095 && e.deltaY > 0) {
        this.cam.zoom -= 0.005
      }
      if (e.deltaY < 0) {
        this.cam.zoom += 0.005
      }
    })

    // this.addNewGem()
  }

  update(time, delta) {
    // this.controls.update(delta)
  }

  buildPhase() {
    console.log('1');
    this.input.on('pointerdown', this.addNewGem)
  }

  addNewGem(e) {
    this.input.on('pointerdown', (e) => {

      if (this.newGemCounter < 5) {
        console.log(e.x, e.y);

        if (e.button === 0) {
          const gem = new GemSprite(this, (e.x / this.cam.zoom) + this.cam.worldView.x, (e.y / this.cam.zoom) + this.cam.worldView.y).setInteractive();
          gem.setFrame(15)
          this.add.existing(gem)
          this.newGemCounter++
        }
      }
      else {
        this.input.off('pointerdown')
        this.newGemCounter = 0
      }
    })
  }
}

export default MyGame