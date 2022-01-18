import Phaser from "phaser"
import bg from './assets/UI/bg.png'
import buttons from './assets/UI/buttons/buttons.png'
import buttonsAtlas from './assets/UI/buttons/buttons_atlas.json'

class Hud extends Phaser.Scene {
  constructor() {
    super({ key: 'HudScene', active: true })
  }

  preload() {
    this.load.image('bg', bg,)
    this.load.atlas('btns', buttons, buttonsAtlas)
  }

  create() {
    const bg = this.add.image(900, 0, 'bg').setOrigin(0)
    const buildBtn = this.add.image(930, 26, 'btns', 'build_btn',).setInteractive({ useHandCursor: 'true' })
    const removeBtn = this.add.image(940, 120, 'btns', 'remove_btn').setInteractive({ useHandCursor: 'true' })


    // this.input.on('gameobjectover', (pointer, gameObject) => {
    //   gameObject.setTexture('btnHover')
    // })
    // this.input.on('gameobjectout', (pointer, gameObject) => {
    //   gameObject.setTexture('btn')
    // })
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
              this.scene.get('GameScene').addNewGem()
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
        })

    })
    // this.input.on('gameobjectup', (pointer, gameObject) => {
    //   gameObject.setFrame('build_btn', true, false)
    //     .setY(gameObject.getTopLeft().y - 4)

    // })

  }
}

export default Hud