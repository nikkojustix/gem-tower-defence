import Phaser from 'phaser';
import atlas from './assets/atlas.json';
import MyGame from './MyGame';

const config = {
  type: Phaser.AUTO,
  width: 804,
  height: 804,
  scene: MyGame,
};


const game = new Phaser.Game(config);