import Phaser from "phaser";
import bg from "../assets/UI/bg.png";
import buttons from "../assets/UI/buttons/buttons.png";
import buttonsAtlas from "../assets/UI/buttons/buttons_atlas.json";
import infoField from "../assets/UI/buttons/info_field.png";

const FONT_STYLE = {
  fontSize: "18px",
  fontFamily: "KenVector",
  color: "#88E060",
  stroke: "1px solid #5FB13A",
  shadow: { offsetX: 1, offsetY: 1, color: "#386723", stroke: true },
};

const INFO_STYLE = {
  fontSize: "12px",
  fontFamily: "KenVector",
  color: "#386723",
  align: "center",
  fixedWidth: 132,
};

export default class Hud extends Phaser.Scene {
  constructor() {
    super({ key: "HudScene", active: true });

    this.bg;
    this.buildBtn;
    this.removeBtn;
    this.controls;
  }

  preload() {
    this.load.image("bg", bg);
    this.load.atlas("btns", buttons, buttonsAtlas);
    this.load.image("infoField", infoField);
  }

  create() {
    this.gameScene = this.scene.get("GameScene");
    const bg = this.add.image(900, 0, "bg").setOrigin(0);

    this.add.text(952, 30, "level:", FONT_STYLE);
    const level = this.add.text(1027, 30, "1", FONT_STYLE).setInteractive();
    this.add.text(952, 60, "wave:", FONT_STYLE);
    const wave = this.add.text(1027, 60, "1", FONT_STYLE);
    this.add.text(952, 90, "life:", FONT_STYLE);
    const life = this.add.text(1027, 90, "100", FONT_STYLE);

    // const exp = new Phaser.GameObjects.Text(this, 1050, 30, "0", FONT_STYLE);
    const exp = this.add.text(1050, 30, "0", FONT_STYLE);

    level.on("pointerover", () => {
      exp.setVisible(true);
    });
    level.on("pointerout", () => {
      exp.setVisible(false);
    });

    this.buildBtn = this.add.image(930, 140, "btns", "build_btn_disable");
    this.removeBtn = this.add.image(930, 210, "btns", "remove_btn_disable");
    this.infoField = this.add.image(930, 280, "infoField").setOrigin(0);
    this.selectBtn = this.add.image(930, 470, "btns", "select_btn_disable");
    this.mergeBtn = this.add.image(930, 540, "btns", "merge_btn_disable");
    this.merge2Btn = this.add.image(930, 610, "btns", "merge2_btn_disable");
    this.downgradeBtn = this.add.image(
      930,
      680,
      "btns",
      "downgrade_btn_disable"
    );
    this.combineBtn = this.add.image(930, 750, "btns", "combine_btn_disable");

    this.infoName = this.add.text(934, 292, "", INFO_STYLE);

    this.controls = [
      this.buildBtn,
      this.removeBtn,
      this.selectBtn,
      this.mergeBtn,
      this.merge2Btn,
      this.downgradeBtn,
      this.combineBtn,
    ];

    this.input.on("gameobjectdown", (pointer, gameObject) => {
      gameObject
        .setFrame(`${gameObject.frame.name}_pressed`)
        .setY(gameObject.getTopLeft().y + 4)
        .once("pointerout", () => {
          gameObject
            .setFrame(gameObject.frame.name.slice(0, -8))
            .setY(gameObject.getTopLeft().y - 4)
            .removeAllListeners();
        })
        .on("pointerup", () => {
          switch (gameObject.frame.name) {
            case "build_btn_pressed":
              this.gameScene.startBuild();
              break;
            case "remove_btn_pressed":
              this.gameScene.removeStone();
              break;
            case "select_btn_pressed":
              this.gameScene.selectGem();
              break;
            case "merge_btn_pressed":
              this.gameScene.changeGem(1);
              break;
            case "merge2_btn_pressed":
              this.gameScene.changeGem(2);
              break;
            case "downgrade_btn_pressed":
              this.gameScene.changeGem(-1);
              break;
            case "combine_btn_pressed":
              this.gameScene.combineGem();
              break;
            default:
              break;
          }

          gameObject
            .setFrame(gameObject.frame.name.slice(0, -8))
            .setY(gameObject.getTopLeft().y - 4)
            .removeAllListeners();
          this.disableBtn(gameObject);
        });
    });

    this.registry.events.on("changedata", (parent, key, data) => {
      eval(key).setText(data);
    });
  }

  update() {}

  disableBtn(btn) {
    if (
      !btn.frame.name.includes("disable") &&
      !btn.frame.name.includes("pressed")
    ) {
      btn
        .disableInteractive()
        .setFrame(`${btn.frame.name}_disable`)
        .setY(btn.getTopLeft().y + 4);
    }
  }

  enableBtn(btn) {
    if (
      btn.frame.name.includes("disable") ||
      btn.frame.name.includes("pressed")
    ) {
      btn
        .setInteractive({ useHandCursor: "true" })
        .setFrame(btn.frame.name.slice(0, -8))
        .setY(btn.getTopLeft().y - 4);
    }
  }

  showInfo(obj) {
    this.infoName.setText(obj.name);
  }
}
