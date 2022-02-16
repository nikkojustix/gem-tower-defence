import Phaser, { Game } from 'phaser';
import Gem from './Gem';
import Monster from './Monster';
import Bullet from './Bullet';
import AdvancedTower from './AdvancedTower';

import EasyStar from 'easystarjs';

import gemImages from '../assets/32px/gem_images.png';
import gemAtlas from '../assets/32px/gem_images.json';
import gemsData from '../assets/gemsData.json';
import atlas from '../assets/atlas.json';
import map from '../assets/32px/tilemap.json';
import tileset from '../assets/32px/map_tiles.png';

import monsterImg from '../assets/32px/Dungeon Crawl Stone Soup Full/monster/animals/spider.png';

import bulletImg from '../assets/32px/Dungeon Crawl Stone Soup Full/effect/sting_2.png';

import silverImg from '../assets/32px/Dungeon Crawl Stone Soup Full/dungeon/altars/altar_okawaru.png';
import Stone from './Stone';

const FRAME_SIZE = 32;
const BOARD_SIZE = 37;

export default class MyGame extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });

    this.map;
    this.atlas;
    this.cam;

    this.currentLevel = 1;
    this.currentWave = 1;
    this.life = 100;
    this.exp = 0;

    this.phase;

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
    this.load.atlas('gemImages', gemImages, gemAtlas);
    this.load.json('gemsData', gemsData);

    this.load.image('monster', monsterImg);
    this.load.image('bullet', bulletImg);

    this.load.image('silver', silverImg);
  }

  create() {
    this.db = this.cache.json.get('gemsData');
    this.chances = this.db.chances;
    this.ranks = this.db.ranks;
    this.types = this.db.types;
    this.gemsData = this.db.gems;
    this.towersData = this.db.advancedTowers;
    this.monstersData = this.db.monsters;
    this.waypoints = this.db.points;
    this.defaultStones = this.db.defaultStones;
    this.expToNextLevel = this.db.expToNextLevel;

    this.registry.set({
      frameSize: FRAME_SIZE,
      boardSize: BOARD_SIZE,
      points: this.waypoints,
      level: 1,
      wave: 1,
      life: 100,
    });

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

    this.bullets = this.physics.add.group();
    this.maze = this.add.group();
    this.gems = this.add.group({ runChildUpdate: true });
    this.newGems = this.add.group({ maxSize: 5 });

    this.monsters = this.physics.add.group({
      classType: Monster,
      defaultKey: 'monster',
      maxSize: 10,
      runChildUpdate: true,
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

    this.defaultStones.forEach((item) => {
      const stone = new Stone(this, item.x * FRAME_SIZE, item.y * FRAME_SIZE);
      this.maze.add(stone, true);
      this.finder.avoidAdditionalPoint(item.x, item.y);
    });

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

    this.input.keyboard.once('keydown', this.buildPhase, this);
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

    if (this.phase === 'attack' && this.monsters.getLength() === 0) {
      this.nextWave();
    }

    if (this.exp >= this.expToNextLevel[this.currentLevel]) {
      this.currentLevel++;
      this.registry.inc('level', 1);
    }
  }

  buildPhase() {
    this.phase = 'build';
    this.hudScene.enableBtn(this.hudScene.buildBtn);
  }

  startBuild() {
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
        this.checkPath(
          this.waypoints[0],
          this.waypoints[1],
          tile,
          currentlyOver
        );
      }
    });
  }

  checkPath(from, to, tile, currentlyOver) {
    this.finder.findPath(from.x, from.y, to.x, to.y, (path) => {
      if (path === null) {
        console.log('building block');
        this.finder.stopAvoidingAdditionalPoint(tile.x, tile.y);
      } else {
        this.path.pop();
        this.path = this.path.concat(path);
        if (this.waypoints.indexOf(to) < this.waypoints.length - 1) {
          from = this.waypoints.at(this.waypoints.indexOf(to));
          to = this.waypoints.at(this.waypoints.indexOf(to) + 1);
          this.checkPath(from, to, tile, currentlyOver);
        } else {
          this.addNewGem(tile, currentlyOver);
        }
      }
    });
    this.finder.calculate();
  }

  attackPhase() {
    this.phase = 'attack';
    this.monsters.createMultiple({
      active: false,
      visible: false,
      key: this.monsters.defaultKey,
      repeat: this.monsters.maxSize - 1,
      setOrigin: { x: 0, y: 0 },
    });

    this.time.addEvent({
      delay: 1000,
      repeat: this.monsters.maxSize - 1,
      callback: this.addMonsters,
      callbackScope: this,
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
      pos.x * FRAME_SIZE + FRAME_SIZE / 2,
      pos.y * FRAME_SIZE + FRAME_SIZE / 2,
      name,
      gemData
    ).setInteractive();

    this.maze.add(gem, true);
    this.newGems.add(gem);

    const gemNames = this.newGems.getChildren().map((gem) => gem.name);

    this.towersData.forEach((tower) => {
      if (
        tower.combination.every((item) => {
          return gemNames.includes(item);
        })
      ) {
        // TODO: combine;
        console.log(true);
        this.newGems.getChildren().forEach((gem) => {
          if (tower.combination.includes(gem.name)) {
            gem.combineTo = tower.name;
          }
        });
      }
    });

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
      if (!btn.frame.name.includes('build')) this.hudScene.disableBtn(btn);
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
      if (gameObject.combineTo) {
        this.hudScene.enableBtn(this.hudScene.combineBtn);
      }
    }
    if (gameObject.combineTo) {
      this.hudScene.enableBtn(this.hudScene.combineBtn);
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
        gem.rank = null;
        gem.type = null;
        gem.damage = null;
        gem.attackSpeed = null;
        gem.radius = null;
        gem.ability = null;
        gem.combineTo = null;
      } else {
        this.gems.add(gem);
        gem.setSelected(false);
      }
    });
    this.newGems.clear();
    this.hudScene.controls.forEach((btn) => {
      this.hudScene.disableBtn(btn);
    });
    this.attackPhase();
    this.checkForCombine();
  }

  changeGem(x) {
    const rank = this.ranks.find((value, index, obj) => {
      return obj[index - x] == this.selectedGem.rank;
    });
    const name = `${rank} ${this.selectedGem.type}`;
    const gemData = this.gemsData.find((value) => value.name == name);

    this.selectedGem.setFrame(name);
    this.selectedGem.setParams(name, gemData);

    this.selectGem();
  }

  combineGem() {
    const x = this.selectedGem.x;
    const y = this.selectedGem.y;
    const name = this.selectedGem.combineTo;
    const data = this.towersData.find((value) => value.name == name);

    // this.selectedGem.setSelected(false);
    // this.newGems.remove(this.selectedGem, true, true);
    // this.selectedGem.destroy()

    const tower = new AdvancedTower(this, x, y, name, data).setInteractive();
    tower.selected = true;

    this.maze.add(tower, true);
    this.gems.add(tower);

    // this.selectedGem = tower;
    this.selectedGem.setSelected(false);
    if (this.newGems.contains(this.selectedGem)) {
      this.selectedGem.destroy();
      this.selectGem();
    } else {
      this.gems.children.each((gem) => {
        if (gem.combineTo) {
          gem.setFrame('stone');
          gem.name = 'stone';
          gem.rank = null;
          gem.type = null;
          gem.damage = null;
          gem.attackSpeed = null;
          gem.radius = null;
          gem.ability = null;
          gem.combineTo = null;
        }
      });
    }
  }

  checkForCombine() {
    const gemNames = this.gems.getChildren().map((gem) => gem.name);

    this.towersData.forEach((tower) => {
      if (
        tower.combination.every((item) => {
          return gemNames.includes(item);
        })
      ) {
        // TODO: combine;
        console.log(true);
        this.gems.getChildren().forEach((gem) => {
          if (tower.combination.includes(gem.name)) {
            gem.combineTo = tower.name;
          }
        });
      }
    });
  }

  addMonsters() {
    const monster = this.monsters.get(128, 128);
    // console.log(monster);
    monster
      .setActive(true)
      .setVisible(true)
      .setInteractive()
      .setParams(this.monstersData[this.currentWave - 1]);
    this.moveMonster(monster, this.path);
  }

  moveMonster(monster, path) {
    const tweens = [];
    for (let i = 0; i < path.length - 1; i++) {
      const ex = path[i + 1].x;
      const ey = path[i + 1].y;

      const speed = Phaser.Math.GetSpeed(446, 0.001);
      tweens.push({
        targets: monster,
        x: { value: ex * FRAME_SIZE, duration: 250 },
        y: { value: ey * FRAME_SIZE, duration: 250 },
      });
    }

    this.tweens.timeline({
      tweens: tweens,
      onUpdate: () => {
        monster.emit('move');
      },
    });
  }

  nextWave() {
    this.currentWave++;
    this.registry.set('wave', this.currentWave);
    this.buildPhase();
  }

  hit(bullet, enemy) {
    bullet.destroy();
    enemy.hp -= bullet.damage;
    if (enemy.hp <= 0) {
      enemy.delete();
      this.exp += enemy.exp;
    }
    // if (enemy.hp <= 0) {
    //   const tweens = this.tweens.getTweensOf(enemy);
    //   if (tweens[0].isPlaying()) {
    //     tweens[0].stop();
    //   }
    //   enemy.setVisible(false);
    //   this.time.delayedCall(200, enemy.delete());
    // }
  }
}
