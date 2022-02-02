import Phaser from 'phaser';
import gemImages from './assets/32px/gem_images.png';
import gemAtlas from './assets/32px/gem_images.json';
import gemsData from './assets/gemsData.json';
import atlas from './assets/atlas.json';
import Gem from './Gem';
import map from './assets/32px/tilemap.json';
import tileset from './assets/32px/map_tiles.png';

const FRAME_SIZE = 32;
const BOARD_SIZE = 37;

class MyGame extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });

    this.map;
    this.atlas;
    this.cam;

    this.currentLevel = 5;
    this.currentWave = 1;
    this.life = 100;

    this.newGemCounter = 1;
    this.newGems;
    this.maze;

    this.stone;

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
    this.newGems = this.add.group();

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
  }

  addNewGem() {
    this.input.on('pointerdown', (pointer, currentlyOver) => {
      if (pointer.button === 0) {
        const tile = this.map.getTileAtWorldXY(
          pointer.x / this.cam.zoom,
          pointer.y / this.cam.zoom,
          true,
          this.cam,
          'bg'
        );

        if (
          currentlyOver.length != 0 ||
          tile == null ||
          tile.index == 2 ||
          tile.index == 4
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
          this.map.tileToWorldX(this.pointerTileX) + FRAME_SIZE / 2,
          this.map.tileToWorldY(this.pointerTileY) + FRAME_SIZE / 2,
          name,
          gemData.damage,
          gemData.attackSpeed,
          gemData.radius,
          gemData.ability
        ).setInteractive();

        this.maze.add(gem, true);
        this.gems.add(gem);
        this.newGems.add(gem);

        if (this.newGems.getLength() === 5) {
          this.input.off('pointerdown');
        }
      }
    });
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
    this.hudScene.controls.forEach((btn) => {
      this.hudScene.disableBtn(btn);
    });
    this.maze.children.each((item) => {
      item.setSelected(false);
    });

    console.log(gameObject.frame.name);

    gameObject.setSelected(true);

    if (gameObject.name === 'stone') {
      this.hudScene.enableBtn(this.hudScene.removeBtn);
      this.stone = gameObject;
    }

    if (this.newGems.contains(gameObject)) {
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
      }
    });
    this.newGems.clear();
  }
}

export default MyGame;
