import Phaser from "phaser"
import bg from './assets/UI/bg.png'
import btn from './assets/UI/btn.png'
import btnActive from './assets/UI/btn_pressed.png'
import btnDisabled from './assets/UI/btn_disabled.png'

const FONT_STYLE = { fontSize: '18px', fontFamily: 'KenVector', color: '#88E060', }

class Hud extends Phaser.Scene {
  constructor() {
    super({ key: 'HudScene', active: true })
  }

  preload() {
    this.load.image('bg', bg)
    this.load.image('btn', btn)
    this.load.image('btnActive', btnActive)
    this.load.image('btnDisabled', btnDisabled)
  }

  create() {
    this.add.image(900, 0, 'bg').setOrigin(0)
    const buildBtn = this.add.image(930, 26, 'btn').setOrigin(0).setInteractive({ useHandCursor: 'true' })
    const buildText = this.add.text(972, 36, 'BUILD', FONT_STYLE,)
    const removeBtn = this.add.image(940, 120, 'btn').setOrigin(0).setInteractive({ useHandCursor: 'true' })
    const removeText = this.add.text(960, 129, 'REMOVE', FONT_STYLE)



    buildBtn.on('pointerdown', () => {
      this.scene.get('GameScene').addNewGem()
    })


    // this.input.on('gameobjectover', (pointer, gameObject) => {
    //   gameObject.setTexture('btnHover')
    // })
    // this.input.on('gameobjectout', (pointer, gameObject) => {
    //   gameObject.setTexture('btn')
    // })
    this.input.on('gameobjectdown', (pointer, gameObject) => {
      gameObject.setTexture('btnActive').setPosition(gameObject.getTopLeft().x, gameObject.getTopLeft().y + 4)
      gameObject.setPosition(gameObject.getTopLeft().x, gameObject.getTopLeft().y + 4)
    })
    this.input.on('gameobjectup', (pointer, gameObject) => {
      gameObject.setTexture('btn').setPosition(gameObject.getTopLeft().x, gameObject.getTopLeft().y - 4)
      gameObject.setPosition(gameObject.getTopLeft().x, gameObject.getTopLeft().y - 4)
    })

  }
}

export default Hud