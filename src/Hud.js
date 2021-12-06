import Phaser from "phaser"
import bg from './assets/CartoonTexturePack/bricks4_dark.png'
import btn from './assets/Wenrexa Assets GUI Dark Miko/Standart Button V1/Standart Button Normal/standart button normal 3.png'
import btnHover from './assets/Wenrexa Assets GUI Dark Miko/Standart Button V1/Standart Button Hover/standart button hover 3.png'

class Hud extends Phaser.Scene {
  constructor() {
    super({ key: 'HudScene', active: true })
  }

  preload() {
    this.load.image('btn', btn)
    this.load.image('btnHover', btnHover)
  }

  create() {
    const buildBtn = this.add.image(940, 50, 'btn').setOrigin(0).setInteractive()
    const buildBtnHover = this.add.image(940, 50, 'btnHover').setOrigin(0).setInteractive().setVisible(0)
    const buildText = this.add.text(960, 59, 'BUILD').setFont('24px Arial Black')
    buildBtn.on('pointerdown', () => {
      const gameScene = this.scene.get('GameScene')
      gameScene.placeGem()
    })
    buildBtn.on('pointerover', () => {
      buildBtn.setVisible(0)
      buildBtnHover.setVisible(1)
    })
    // buildBtn.on('pointerout', () => {
    //   buildBtn.setVisible(1)
    //   buildBtnHover.setVisible(0)
    // })

  }
}

export default Hud