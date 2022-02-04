import Phaser, { Game } from 'phaser';
import Gem from './Gem';
import Monster from './Monster';

import EasyStar from 'easystarjs';

import gemImages from './assets/32px/gem_images.png';
import gemAtlas from './assets/32px/gem_images.json';
import gemsData from './assets/gemsData.json';
import atlas from './assets/atlas.json';
import map from './assets/32px/tilemap.json';
import tileset from './assets/32px/map_tiles.png';

import monsterImg from './assets/32px/Dungeon Crawl Stone Soup Full/monster/animals/spider.png';

const FRAME_SIZE = 32;
const BOARD_SIZE = 37;

const POINTS = [
  { x: 4, y: 4 },
  { x: 4, y: 18 },
  { x: 32, y: 18 },
  { x: 32, y: 4 },
  { x: 18, y: 4 },
  { x: 18, y: 32 },
  { x: 32, y: 32 },
];

class MyGame extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });

    this.map;
    this.atlas;
    this.cam;

    this.currentLevel = 1;
    this.currentWave = 1;
    this.life = 100;

    this.newGemCounter = 1;
    this.newGems;
    this.maze;

    this.stone;
    this.selectedGem;

    this.monsters;
    this.path = [];
    this.pathExist;

    this.worldPoint;
    this.pointerTileX;
    this.pointerTileY;

    this.marker;

    this.hudScene;
  }

  preload() {
    this.load.tilemapTiledJSON('map', map);
    this.load.image('tileset', tileset);
    // this.load.spritesheet('gemImages', gemImages, {
    //   frameWidth: FRAME_SIZE,
    //   frameHeight: FRAME_SIZE,
    // });
    this.load.atlas('gemImages', gemImages, gemAtlas);
    this.load.json('gemsData', gemsData);

    this.load.image('monster', monsterImg);
  }

  create() {
    this.chances = this.cache.json.get('gemsData').chances;
    this.ranks = this.cache.json.get('gemsData').ranks;
    this.types = this.cache.json.get('gemsData').types;
    this.gemsData = this.cache.json.get('gemsData').gems;

    this.hudScene = this.scene.get('HudScene');
    this.map = this.add.tilemap('map');
    this.tileset = this.map.addTilesetImage(
      'tileset',
      'tileset',
      FRAME_SIZE,
      FRAME_SIZE,
      2,
      4
    );
    this.bgLayer = this.map.createLayer(
      this.map.getLayer('bg').name,
      this.tileset,
      this.map.getLayer('bg').x,
      this.map.getLayer('bg').y
    );
    this.pointsLayer = this.map.createLayer(
      this.map.getLayer('numbers').name,
      this.tileset,
      this.map.getLayer('numbers').x,
      this.map.getLayer('numbers').y
    );

    this.maze = this.add.group();
    this.gems = this.add.group();
    this.newGems = this.add.group({ maxSize: 5 });

    this.monsters = this.add.group({
      classType: Monster,
      defaultKey: 'monster',
      maxSize: 10,
    });

    this.finder = new EasyStar.js();
    const grid = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
      const row = [];
      for (let j = 0; j < BOARD_SIZE; j++) {
        row.push(0);
      }
      grid.push(row);
    }
    this.finder.setGrid(grid);
    this.finder.setAcceptableTiles([0]);
    // this.finder.enableDiagonals();
    // this.finder.disableCornerCutting();

    this.marker = this.add.graphics();
    this.marker.lineStyle(2, 0xffffff, 1);
    this.marker.strokeRect(0, 0, this.map.tileWidth, this.map.tileHeight);

    this.cam = this.cameras.main.setBounds(
      0,
      0,
      FRAME_SIZE * BOARD_SIZE,
      FRAME_SIZE * BOARD_SIZE,
      true
    );
    this.cam.setViewport(0, 0, 900, 900);
    this.cam.zoom = 0.76;

    this.input.on('pointermove', (e) => {
      if (!e.isDown) return;
      if (e.button === 1) {
        this.cam.scrollX -= (e.x - e.prevPosition.x) / this.cam.zoom;
        this.cam.scrollY -= (e.y - e.prevPosition.y) / this.cam.zoom;
      }
    });

    this.input.on('wheel', (e) => {
      if (this.cam.zoom > 0.76 && e.deltaY > 0) {
        this.cam.zoom -= 0.01;
      }
      if (e.deltaY < 0) {
        this.cam.zoom += 0.01;
      }
    });

    this.input.keyboard.once('keydown', this.startGame, this);
    this.input.on('gameobjectdown', this.chooseItem, this);
  }

  update(time, delta) {
    this.worldPoint = this.input.activePointer.positionToCamera(
      this.cameras.main
    );

    this.pointerTileX = this.map.worldToTileX(this.worldPoint.x);
    this.pointerTileY = this.map.worldToTileY(this.worldPoint.y);

    this.marker.x = this.map.tileToWorldX(this.pointerTileX);
    this.marker.y = this.map.tileToWorldY(this.pointerTileY);

    this.monsters.getChildren().forEach((monster) => {
      if (
        monster.x == POINTS[6].x * FRAME_SIZE &&
        monster.y == POINTS[6].y * FRAME_SIZE
      ) {
        this.deleteMonster(monster);
      }
    });
    // Phaser.Actions.IncY(this.monsters.getChildren(), 1.74);
  }

  startGame() {
    this.hudScene.enableBtn(this.hudScene.buildBtn);
  }

  buildPhase() {
    this.input.on('pointerdown', (pointer, currentlyOver) => {
      if (pointer.button === 0) {
        const tile = this.map.getTileAtWorldXY(
          pointer.x / this.cam.zoom,
          pointer.y / this.cam.zoom,
          true,
          this.cam,
          'bg'
        );
        this.path = [];
        this.finder.avoidAdditionalPoint(tile.x, tile.y);
        this.checkPath(POINTS[0], POINTS[1], tile, currentlyOver);
      }
    });
  }

  addNewGem(pos, currentlyOver) {
    if (
      currentlyOver.length != 0 ||
      pos == null ||
      pos.index == 2 ||
      pos.index == 4
    ) {
      console.log('building blocked!');
      return;
    }
    const name = this.getFrame();
    const gemData = this.gemsData.find((value, index, obj) => {
      if (value.name == name) {
        return true;
      }
    });

    const gem = new Gem(
      this,
      pos.x * FRAME_SIZE,
      pos.y * FRAME_SIZE,
      name,
      gemData
    )
      .setInteractive()
      .setOrigin(0);

    this.maze.add(gem, true);
    this.gems.add(gem);
    this.newGems.add(gem);

    if (this.newGems.isFull()) {
      this.input.off('pointerdown');
    }
  }

  getRandomRank() {
    this.chances[this.currentLevel - 1].forEach((chance, i) => {
      if (Math.random() < chance) {
        return this.ranks[i];
      }
    });
  }

  getFrame() {
    const randType = this.types[Math.floor(this.types.length * Math.random())];
    let randRank;
    const rand = Math.random();
    for (let i = 0; i < this.chances[this.currentLevel - 1].length; i++) {
      const element = this.chances[this.currentLevel - 1][i];
      if (rand < element) {
        randRank = this.ranks[i];
        break;
      }
    }

    return `${randRank} ${randType}`;
  }

  chooseItem(pointer, gameObject) {
    console.log(gameObject);
    this.hudScene.controls.forEach((btn) => {
      this.hudScene.disableBtn(btn);
    });
    this.maze.children.each((item) => {
      item.setSelected(false);
    });

    gameObject.setSelected(true);
    this.selectedGem = gameObject;

    if (gameObject.name === 'stone') {
      this.hudScene.enableBtn(this.hudScene.removeBtn);
      this.stone = gameObject;
    }

    if (this.newGems.contains(gameObject) && this.newGems.isFull()) {
      this.hudScene.enableBtn(this.hudScene.selectBtn);
      switch (this.newGems.getMatching('name', gameObject.name).length) {
        case 5:
        case 4:
          this.hudScene.enableBtn(this.hudScene.merge2Btn);
        case 3:
        case 2:
          this.hudScene.enableBtn(this.hudScene.mergeBtn);
          break;
      }
      if (!gameObject.name.includes(this.ranks[0])) {
        this.hudScene.enableBtn(this.hudScene.downgradeBtn);
      }
    }
  }

  removeStone() {
    this.maze.remove(this.stone, true, true);
    console.log(this.stone.x);
    this.finder.stopAvoidingAdditionalPoint(
      (this.stone.x - 16) / 32,
      (this.stone.y - 16) / 32
    );
  }

  selectGem() {
    this.newGems.children.each((gem) => {
      if (!gem.selected) {
        gem.setFrame('stone');
        gem.name = 'stone';
        gem.damage = null;
        gem.attackSpeed = null;
        gem.radius = null;
        gem.ability = null;
        this.gems.remove(gem);
      } else {
        gem.setSelected(false);
      }
    });
    this.newGems.clear();
    this.hudScene.controls.forEach((btn) => {
      this.hudScene.disableBtn(btn);
    });
    this.startWave();
  }

  changeGem(x) {
    const rank = this.ranks.find((value, index, obj) => {
      if (obj[index - x] == this.selectedGem.rank) {
        return true;
      }
    });
    const name = `${rank} ${this.selectedGem.type}`;
    const gemData = this.gemsData.find((value, index, obj) => {
      if (value.name == name) {
        return true;
      }
    });

    this.selectedGem.setFrame(name);
    this.selectedGem.setParams(name, gemData);

    this.selectGem();
  }

  startWave() {
    // for (let i = 0; i < this.monsters.maxSize; i++) {
    //   const monster = new Monster(this, 128, 128).setOrigin(0).setInteractive();
    //   this.monsters.add(monster);
    // }

    // this.monsters.createMultiple({
    //   active: false,
    //   setXY: {
    //     x: 128,
    //     y: 128,
    //   },
    //   repeat: this.monsters.maxSize - 1,
    //   setOrigin: { x: 0.5, y: 0.5 },
    // });

    this.time.addEvent({
      delay: 1000,
      repeat: this.monsters.maxSize - 1,
      callback: this.addMonsters,
      callbackScope: this,
    });
  }

  addMonsters() {
    const monster = this.monsters.get(128, 128);
    monster.setActive(true).setVisible(true).setOrigin(0).setInteractive();
    console.log(this.path);
    this.moveMonster(monster, this.path);

    // this.finder.findPath(4, 4, 4, 18, (path) => {
    //   if (path === null) {
    //     console.log('not found');
    //   } else {
    //     this.path = path;
    //   }
    // });
    // this.finder.calculate();
  }

  checkPath(from, to, tile, currentlyOver) {
    this.finder.findPath(from.x, from.y, to.x, to.y, (path) => {
      if (path === null) {
        console.log('building block');
        this.finder.stopAvoidingAdditionalPoint(tile.x, tile.y);
      } else {
        console.log('found');
        this.path.pop();
        this.path = this.path.concat(path);
        if (POINTS.indexOf(to) < POINTS.length - 1) {
          from = POINTS.at(POINTS.indexOf(to));
          to = POINTS.at(POINTS.indexOf(to) + 1);
          this.checkPath(from, to, tile, currentlyOver);
        } else {
          this.addNewGem(tile, currentlyOver);
        }
      }
    });
    this.finder.calculate();
  }

  moveMonster(monster, path) {
    monster.setActive(true).setVisible(true);
    const tweens = [];
    for (let i = 0; i < path.length - 1; i++) {
      const ex = path[i + 1].x;
      const ey = path[i + 1].y;
      tweens.push({
        targets: monster,
        x: { value: ex * FRAME_SIZE, duration: 100 },
        y: { value: ey * FRAME_SIZE, duration: 100 },
      });
    }

    this.tweens.timeline({
      tweens: tweens,
    });
  }

  deleteMonster(monster) {
    console.log(monster);
    monster.destroy();
    if (this.monsters.getTotalFree() === this.monsters.maxSize) {
      this.nextWave();
    }
  }

  nextWave() {
    this.currentWave++;
    console.log(this.currentWave);
    this.hudScene.enableBtn(this.hudScene.buildBtn);
  }
}

export default MyGame;
