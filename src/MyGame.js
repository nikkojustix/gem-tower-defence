import Phaser from 'phaser';
// import gemImages from './assets/original/gem_spritesheet.png';
import gemImages from './assets/gems-img.png';
import gemAtlas from './assets/original/gem_spritesheet_atlas.json'
import atlas from './assets/atlas.json';
import GemSprite from './GemSprite';
import map from './assets/tilemap.json'
import tileset from './assets/Sprites/tileset.png'

class MyGame extends Phaser.Scene {

  constructor() {
    super({ key: 'GameScene' });

    this.map
    this.atlas
    this.cam
    this.newGemCounter = 1
    this.currentLevel = 1
    this.currentWave = 1
    this.maze

    this.worldPoint;
    this.pointerTileX;
    this.pointerTileY;
  }

  preload() {
    this.load.tilemapTiledJSON('map', map)
    this.load.image('tileset', tileset);
    this.load.spritesheet('gemImages', gemImages, { frameWidth: 32, frameHeight: 32 });

    // this.load.atlas('gemAtlas', gemImages, gemAtlas)
    this.load.tilemapTiledJSON('gemMap', gemAtlas)
    this.load.image('gemTileset', gemImages)
  }

  create() {
    this.map = this.add.tilemap('map');
    this.tileset = this.map.addTilesetImage('tileset', 'tileset', 256, 256, 2, 4)
    this.bgLayer = this.map.createLayer(this.map.getLayer('bg').name, this.tileset, this.map.getLayer('bg').x, this.map.getLayer('bg').y)
    this.pointsLayer = this.map.createLayer(this.map.getLayer('points').name, this.tileset, this.map.getLayer('points').x, this.map.getLayer('points').y)
    this.gameLayer = this.map.createBlankLayer('game', 'gemTileset')
    this.gemTileset = this.map.addTilesetImage('gemTileset', 'gemTileset', 256, 256)

    this.marker = this.add.graphics();
    this.marker.lineStyle(4, 0xffffff, 1);
    this.marker.strokeRect(0, 0, this.map.tileWidth, this.map.tileHeight);

    this.cam = this.cameras.main.setBounds(0, 0, 9472, 9472, true)
    this.cam.setViewport(0, 0, 900, 900)
    this.cam.zoom = 0.095

    this.input.on('pointermove', (e) => {
      if (!e.isDown) return
      if (e.button === 1) {
        this.cam.scrollX -= (e.x - e.prevPosition.x) / this.cam.zoom
        this.cam.scrollY -= (e.y - e.prevPosition.y) / this.cam.zoom
      }
    })

    this.input.on('wheel', (e) => {
      if (this.cam.zoom > 0.095 && e.deltaY > 0) {
        this.cam.zoom -= 0.005
      }
      if (e.deltaY < 0) {
        this.cam.zoom += 0.005
      }
    })
  }

  update(time, delta) {

    this.worldPoint = this.input.activePointer.positionToCamera(this.cameras.main);

    this.pointerTileX = this.map.worldToTileX(this.worldPoint.x);
    this.pointerTileY = this.map.worldToTileY(this.worldPoint.y);

    this.marker.x = this.map.tileToWorldX(this.pointerTileX);
    this.marker.y = this.map.tileToWorldY(this.pointerTileY);

    if (this.input.manager.activePointer.leftButtonDown()) {
      var tile = this.map.getTileAt(this.pointerTileX, this.pointerTileY);

      if (tile) {
        // Note: JSON.stringify will convert the object tile properties to a string
        // console.log(JSON.stringify(tile.id));
        console.log(tile);
        // propertiesText.setText('Properties: ' + JSON.stringify(tile.properties));
        // tile.properties.viewed = true;
      }
    }
  }

  buildPhase() {
    console.log('1');
    this.input.on('pointerdown', this.addNewGem)
  }

  addNewGem(e) {
    this.input.on('pointerdown', (e) => {
      if (e.button === 0) {
        const gem = new GemSprite(
          this,
          this.map.tileToWorldX(this.pointerTileX) + 128,
          this.map.tileToWorldY(this.pointerTileY) + 128,
          this.getFrame(),
          600).setInteractive();
        gem.on('pointerdown', function () {
          console.log(this.frame.name);
        })
        gem.setScale(8, 8)
        // this.map.putTileAt(1, this.pointerTileX, this.pointerTileY)


        if (this.newGemCounter === 5) {
          this.input.off('pointerdown')
          this.newGemCounter = 0
        }
        this.newGemCounter++
      }

    })
  }

  getFrame() {
    return Math.floor(40 * Math.random())
  }
}

export default MyGame