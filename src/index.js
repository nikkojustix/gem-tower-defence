import Phaser from 'phaser';
import atlas from './assets/atlas.json';
import MyGame from './MyGame';

const config = {
  type: Phaser.AUTO,
  width: atlas.board.cols * atlas.board.size,
  height: atlas.board.rows * atlas.board.size,
  scene: MyGame,
};


const game = new Phaser.Game(config);