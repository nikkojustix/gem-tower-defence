import Phaser from 'phaser';
import atlas from './assets/atlas.json';
import MyGame from './MyGame';

const config = {
  type: Phaser.AUTO,
  width: 900,
  height: 900,
  scene: MyGame,
};


const game = new Phaser.Game(config);