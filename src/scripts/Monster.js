import Phaser from 'phaser';

export default class Monster extends Phaser.Physics.Arcade.Image {
  constructor(scene, x, y, data) {
    super(scene, x, y, 'monster');

    this.scene = scene;
    this.x = x;
    this.y = y;
    this.name;
    this.hp;
    this.speed;
    this.armor;
    this.magicResistance;
    this.type;
    this.ability;
    this.exp =
      this.scene.currentWave % 10 != 0
        ? Math.floor(this.scene.currentWave / 10 + 1) * 5
        : 300;

    this.selected = false;

    this.modifires = [];
    this.speedX = 0;
    this.speedY = 0;
    this.path;
    this.pathN = 0;

    this.difficultyHp = this.scene.registry.get('difficultyHp');
    this.difficultySpeed = this.scene.registry.get('difficultySpeed');
    this.scaleSize = this.scene.registry.get('scale');
    this.frameSize = this.scene.registry.get('frameSize');
    this.points = this.scene.registry.get('points');

    this.setInteractive();
  }

  setSelected(selected) {
    this.selected = selected;
  }

  setParams(data) {
    this.name = data.name;
    this.hp = Math.round(data.hp * this.difficultyHp);
    this.speed = Math.round(
      (data.speed * this.difficultySpeed) / this.scaleSize
    );
    this.armor = data.armor;
    this.magicResistance = data.magicResistance;
    this.type = data.type;
    this.ability = data.ability;
  }

  update(time, delta) {
    // this.x += this.speedX;
    // this.y += this.speedY;
    // this.emit('move');
    // for (let j = 0; j < this.path[this.pathN].length; j++) {
    //   if (
    //     this.x == this.path[this.pathN][j].x * this.frameSize &&
    //     this.y == this.path[this.pathN][j].y * this.frameSize
    //   ) {
    //     if (j == this.path[this.pathN].length - 1) {
    //       console.log('1');
    //       this.pathN++;
    //       // this.speedX =
    //       //   (this.path[this.pathN][1].x - this.path[this.pathN][0].x) * 4;
    //       // this.speedY =
    //       //   (this.path[this.pathN][1].y - this.path[this.pathN][0].y) * 4;
    //       this.scene.physics.moveTo(
    //         this,
    //         this.path[this.pathN][1].x * this.frameSize,
    //         this.path[this.pathN][1].y * this.frameSize,
    //         91
    //       );
    //     } else {
    //       console.log('2');
    //       // this.speedX =
    //       //   (this.path[this.pathN][j + 1].x - this.path[this.pathN][j].x) * 4;
    //       // this.speedY =
    //       //   (this.path[this.pathN][j + 1].y - this.path[this.pathN][j].y) * 4;
    //       this.scene.physics.moveTo(
    //         this,
    //         this.path[this.pathN][j + 1].x * this.frameSize,
    //         this.path[this.pathN][j + 1].y * this.frameSize,
    //         91
    //       );
    //     }
    //   }
    // }
    // console.log(this.y);
    // this.scene.physics.moveTo(this, 192, 192, 91);

    console.log(this.x, this.y);

    if (
      this.x == this.points[6].x * this.frameSize &&
      this.y == this.points[6].y * this.frameSize
    ) {
      this.delete();
    }
  }

  delete() {
    const tween = this.scene.tweens.getTweensOf(this);
    if (tween[0]) tween[0].destroy();
    this.destroy();
  }

  slow() {}
}
