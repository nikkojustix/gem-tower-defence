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
    this.controls
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


    this.buildBtn = this.add.image(930, 140, 'btns', 'build_btn_disable')
    this.removeBtn = this.add.image(930, 210, 'btns', 'remove_btn')
    this.infoField = this.add.image(930, 280, 'infoField').setOrigin(0)
    this.selectBtn = this.add.image(930, 470, 'btns', 'select_btn_disable')
    this.mergeBtn = this.add.image(930, 540, 'btns', 'merge_btn_disable')
    this.merge2Btn = this.add.image(930, 610, 'btns', 'merge2_btn_disable')
    this.downgradeBtn = this.add.image(930, 680, 'btns', 'downgrade_btn_disable')
    this.combineBtn = this.add.image(930, 750, 'btns', 'combine_btn_disable')


    this.controls = [this.buildBtn, this.removeBtn, this.selectBtn, this.mergeBtn, this.merge2Btn, this.downgradeBtn, this.combineBtn]


    this.enableBtn(this.buildBtn)


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
              this.gameScene.selectGem()
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
    if (!btn.frame.name.includes('disable')) {
      btn.disableInteractive().setFrame(`${btn.frame.name}_disable`)
        .setY(btn.getTopLeft().y + 4)
    }
  }

  enableBtn(btn) {
    if (btn.frame.name.includes('disable') || btn.frame.name.includes('pressed')) {
      btn.setInteractive({ useHandCursor: 'true' }).setFrame(btn.frame.name.slice(0, -8))
        .setY(btn.getTopLeft().y - 4)
    }
  }
}

export default Hud