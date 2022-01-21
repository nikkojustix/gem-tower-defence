import Phaser from "phaser"
import bg from './assets/UI/bg.png'
import buttons from './assets/UI/buttons/buttons.png'
import buttonsAtlas from './assets/UI/buttons/buttons_atlas.json'
import infoField from './assets/UI/buttons/info_field.png'

const FONT_STYLE = { fontSize: '18px', fontFamily: 'KenVector', color: '#88E060', stroke: '1px solid #5FB13A' }

class Hud extends Phaser.Scene {
  constructor() {
    super({ key: 'HudScene', active: true })

    this.bg
    this.buildBtn
    this.removeBtn
  }

  preload() {
    this.load.image('bg', bg,)
    this.load.atlas('btns', buttons, buttonsAtlas)
    this.load.image('infoField', infoField)
  }

  create() {
    this.gameScene = this.scene.get('GameScene')
    const bg = this.add.image(900, 0, 'bg').setOrigin(0)

    this.add.text(952, 30, 'level:', FONT_STYLE).setShadow(1, 1, '#386723', 0, true)
    this.add.text(1027, 30, this.gameScene.currentLevel, FONT_STYLE).setShadow(1, 1, '#386723', 0, true)
    this.add.text(952, 60, 'wave:', FONT_STYLE).setShadow(1, 1, '#386723', 0, true)
    this.add.text(1027, 60, this.gameScene.currentWave, FONT_STYLE).setShadow(1, 1, '#386723', 0, true)
    this.add.text(952, 90, 'life:', FONT_STYLE).setShadow(1, 1, '#386723', 0, true)
    this.add.text(1027, 90, this.gameScene.life, FONT_STYLE).setShadow(1, 1, '#386723', 0, true)

    this.buildBtn = this.add.image(930, 136, 'btns', 'build_btn',).setInteractive({ useHandCursor: 'true' })
    this.removeBtn = this.add.image(930, 206, 'btns', 'remove_btn').setInteractive({ useHandCursor: 'true' })
    this.infoField = this.add.image(930, 280, 'infoField').setOrigin(0)
    this.selectBtn = this.add.image(930, 466, 'btns', 'select_btn').setInteractive({ useHandCursor: 'true' })
    this.mergeBtn = this.add.image(930, 536, 'btns', 'merge_btn').setInteractive({ useHandCursor: 'true' })
    this.merge2Btn = this.add.image(930, 606, 'btns', 'merge2_btn').setInteractive({ useHandCursor: 'true' })
    this.downgradeBtn = this.add.image(930, 676, 'btns', 'downgrade_btn').setInteractive({ useHandCursor: 'true' })
    this.combineBtn = this.add.image(930, 746, 'btns', 'combine_btn').setInteractive({ useHandCursor: 'true' })


    this.input.on('gameobjectdown', (pointer, gameObject) => {
      gameObject.setFrame(`${gameObject.frame.name}_pressed`)
        .setY(gameObject.getTopLeft().y + 4)
        .once('pointerout', () => {
          gameObject.setFrame(gameObject.frame.name.slice(0, -8))
            .setY(gameObject.getTopLeft().y - 4)
            .removeAllListeners()
        })
        .on('pointerup', () => {
          switch (gameObject.frame.name) {
            case 'build_btn_pressed':
              this.gameScene.addNewGem()
              break;
            case 'remove_btn_pressed':

              break;
            case 'select_btn_pressed':

              break;
            case 'merge_btn_pressed':

              break;
            default:
              break;
          }

          gameObject.setFrame(gameObject.frame.name.slice(0, -8))
            .setY(gameObject.getTopLeft().y - 4)
            .removeAllListeners()
          this.disableBtn(gameObject)
        })
    })
  }

  disableBtn(btn) {
    btn.disableInteractive().setFrame(`${btn.frame.name}_disable`)
      .setY(btn.getTopLeft().y + 4)
  }
}

export default Hud