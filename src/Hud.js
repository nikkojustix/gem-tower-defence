import Phaser from "phaser"
import btn from './assets/UI/Wenrexa Assets GUI Dark Miko/Standart Button V1/Standart Button Normal/standart button normal 3.png'
import btnHover from './assets/UI/Wenrexa Assets GUI Dark Miko/Standart Button V1/Standart Button Hover/standart button hover 3.png'
import btnActive from './assets/UI/Wenrexa Assets GUI Dark Miko/Standart Button V1/Standart Button Active/standart button active 3.png'

class Hud extends Phaser.Scene {
  constructor() {
    super({ key: 'HudScene', active: true })
  }

  preload() {
    this.load.image('btn', btn)
    this.load.image('btnHover', btnHover)
    this.load.image('btnActive', btnActive)
  }

  create() {
    const buildBtn = this.add.image(940, 50, 'btn').setOrigin(0).setInteractive({ cursor: 'pointer' })
    // const buildBtnHover = this.add.image(940, 50, 'btnHover').setOrigin(0).setInteractive().setVisible(0)
    const buildText = this.add.text(960, 59, 'BUILD').setFont('24px Arial Black')

    buildBtn.on('pointerdown', () => {
      this.scene.get('GameScene').addNewGem()
    })


    this.input.on('gameobjectover', (pointer, gameObject) => {
      gameObject.setTexture('btnHover')
    })
    this.input.on('gameobjectout', (pointer, gameObject) => {
      gameObject.setTexture('btn')
    })
    this.input.on('gameobjectdown', (pointer, gameObject) => {
      buildBtn.setTexture('btnActive')
    })
    this.input.on('gameobjectup', (pointer, gameObject) => {
      buildBtn.setTexture('btn')
    })

  }
}

export default Hud