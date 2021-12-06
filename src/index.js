import Phaser from 'phaser';
import MyGame from './MyGame';
import Hud from './Hud';

const config = {
  type: Phaser.AUTO,
  width: 1100,
  height: 900,
  scene: [MyGame, Hud],
};


const game = new Phaser.Game(config);