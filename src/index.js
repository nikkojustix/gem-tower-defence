import Phaser from 'phaser';
import MyGame from './scripts/MyGame';
import Hud from './scripts/Hud';

const config = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1100,
    height: 900,
  },
  physics: {
    default: 'arcade',
    // arcade: {
    //   debug: true,
    // },
  },
  scene: [MyGame, Hud],
};

const game = new Phaser.Game(config);
