// TODO:
// gem can be used in multiple combinations
//
// monsters reduce life when riched last waypoint
//
// secret towers
// advanced types of monsters
//
// gems abilities
// advanced towers abilities
// monsters abilities
//
// show info
// healthbar
//
// advanced towers images
// monster images
//
// preloader
// start menu

import Phaser, { Game } from "phaser";
import Gem from "./Gem";
import Monster from "./Monster";
import Bullet from "./Bullet";
import AdvancedTower from "./AdvancedTower";

import EasyStar from "easystarjs";

import gemImages from "../assets/32px/gem_images.png";
import gemAtlas from "../assets/32px/gem_images.json";
import gemsData from "../assets/gemsData.json";
import atlas from "../assets/atlas.json";
import map from "../assets/32px/tilemap.json";
import tileset from "../assets/32px/map_tiles.png";

import monsterImages from "../assets/32px/monster_images.png";
import monsterAtlas from "../assets/32px/monster_images_atlas.json";

import monsterImg from "../assets/32px/Dungeon Crawl Stone Soup Full/monster/animals/spider.png";

import bulletImg from "../assets/32px/Dungeon Crawl Stone Soup Full/effect/sting_2.png";

import silverImg from "../assets/32px/Dungeon Crawl Stone Soup Full/dungeon/altars/altar_okawaru.png";
import Stone from "./Stone";

export default class MyGame extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene" });

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
    this.monstersCnt = 10;
    this.grid = [];
    this.plainGrid = [];
    this.path = [];
    this.pathExist;

    this.worldPoint;
    this.pointerTileX;
    this.pointerTileY;

    this.marker;

    this.hudScene;
  }

  preload() {
    this.load.tilemapTiledJSON("map", map);
    this.load.image("tileset", tileset);
    this.load.atlas("gemImages", gemImages, gemAtlas);
    this.load.json("gemsData", gemsData);

    this.load.atlas("monsterImages", monsterImages, monsterAtlas);

    this.load.image("monster", monsterImg);
    this.load.image("bullet", bulletImg);

    this.load.image("silver", silverImg);
  }

  create() {
    this.db = this.cache.json.get("gemsData");
    this.chances = this.db.chances;
    this.ranks = this.db.ranks;
    this.types = this.db.types;
    this.gemsData = this.db.gems;
    this.towersData = this.db.advancedTowers;
    this.monstersData = this.db.monsters;
    this.waypoints = this.db.points;
    this.defaultStones = this.db.defaultStones;
    this.expToNextLevel = this.db.expToNextLevel;
    this.plainGrid = this.db.plainGrid;
    this.abilitiesData = this.db.towerAbilities;

    this.scale = 128 / this.db.frameSize;

    this.registry.set({
      frameSize: this.db.frameSize,
      boardSize: this.db.boardSize,
      points: this.waypoints,
      difficultyHp: this.db.difficultyHp[0],
      difficultySpeed: this.db.difficultySpeed[0],
      scale: this.scale,
      level: 1,
      exp: this.exp,
      wave: 1,
      life: 100,
    });
    console.log(this.registry.get("scale"));

    this.hudScene = this.scene.get("HudScene");
    this.map = this.add.tilemap("map");
    this.tileset = this.map.addTilesetImage(
      "tileset",
      "tileset",
      this.db.frameSize,
      this.db.frameSize,
      2,
      4
    );
    this.bgLayer = this.map.createLayer(
      this.map.getLayer("bg").name,
      this.tileset,
      this.map.getLayer("bg").x,
      this.map.getLayer("bg").y
    );
    this.pointsLayer = this.map.createLayer(
      this.map.getLayer("numbers").name,
      this.tileset,
      this.map.getLayer("numbers").x,
      this.map.getLayer("numbers").y
    );

    this.bullets = this.physics.add.group();
    this.maze = this.physics.add.group();
    this.gems = this.physics.add.group({ runChildUpdate: true });
    this.newGems = this.physics.add.group({ maxSize: 5 });

    this.monsters = this.physics.add.group({
      classType: Monster,
      defaultKey: "monsterImages",
      maxSize: this.monstersCnt,
      runChildUpdate: true,
    });

    this.finder = new EasyStar.js();
    for (let i = 0; i < this.db.boardSize; i++) {
      const row = [];
      for (let j = 0; j < this.db.boardSize; j++) {
        row.push(0);
      }
      this.grid.push(row);
    }
    this.finder.setGrid(this.grid);
    this.finder.setAcceptableTiles([0]);
    // this.finder.enableDiagonals();
    // this.finder.disableCornerCutting();

    this.defaultStones.forEach((item) => {
      const stone = new Stone(
        this,
        item.x * this.db.frameSize,
        item.y * this.db.frameSize
      );
      this.maze.add(stone, true);
      this.grid[item.y][item.x] = 1;
    });

    this.marker = this.add.graphics();
    this.marker.lineStyle(2, 0xffffff, 1);
    this.marker.strokeRect(0, 0, this.map.tileWidth, this.map.tileHeight);

    this.cam = this.cameras.main.setBounds(
      0,
      0,
      this.db.frameSize * this.db.boardSize,
      this.db.frameSize * this.db.boardSize,
      true
    );
    this.cam.setViewport(0, 0, 900, 900);
    this.cam.zoom = 0.76;

    this.input.on("pointermove", (e) => {
      if (!e.isDown) return;
      if (e.button === 1) {
        this.cam.scrollX -= (e.x - e.prevPosition.x) / this.cam.zoom;
        this.cam.scrollY -= (e.y - e.prevPosition.y) / this.cam.zoom;
      }
    });

    this.input.on("wheel", (e) => {
      if (this.cam.zoom > 0.76 && e.deltaY > 0) {
        this.cam.zoom -= 0.01;
      }
      if (e.deltaY < 0) {
        this.cam.zoom += 0.01;
      }
    });

    this.input.keyboard.once("keydown", this.buildPhase, this);
    this.input.on("gameobjectdown", this.chooseItem, this);
  }

  update(time, delta) {
    this.worldPoint = this.input.activePointer.positionToCamera(
      this.cameras.main
    );

    this.pointerTileX = this.map.worldToTileX(this.worldPoint.x);
    this.pointerTileY = this.map.worldToTileY(this.worldPoint.y);

    this.marker.x = this.map.tileToWorldX(this.pointerTileX);
    this.marker.y = this.map.tileToWorldY(this.pointerTileY);

    if (this.phase === "attack" && this.monsters.getLength() === 0) {
      this.nextWave();
    }

    if (this.exp >= this.expToNextLevel[this.currentLevel]) {
      this.currentLevel++;
      this.registry.inc("level", 1);
    }
  }

  buildPhase() {
    this.phase = "build";
    this.hudScene.enableBtn(this.hudScene.buildBtn);
  }

  startBuild() {
    this.input.on("pointerdown", (pointer, currentlyOver) => {
      const worldPoint = pointer.positionToCamera(this.cam);
      const x = this.map.worldToTileX(worldPoint.x);
      const y = this.map.worldToTileY(worldPoint.y);
      if (pointer.button === 0) {
        const tile = this.map.getTileAt(x, y, true, "bg");
        this.path = [];
        if (this.grid[tile.y][tile.x]) {
          const object = this.maze.getChildren().find((value) => {
            return (
              value.x === tile.x * this.db.frameSize &&
              value.y === tile.y * this.db.frameSize
            );
          });
          if (object instanceof Stone) {
            object.destroy();
            this.grid[tile.y][tile.x] = 1;
            this.checkPath(this.waypoints[0], this.waypoints[1], tile);
          } else {
            console.log("building blocked");
          }
        } else {
          this.grid[tile.y][tile.x] = 1;
          this.checkPath(this.waypoints[0], this.waypoints[1], tile);
        }
      }
    });
  }

  checkPath(from, to, tile) {
    this.finder.findPath(from.x, from.y, to.x, to.y, (path) => {
      if (path === null) {
        console.log("path not found");
        this.grid[tile.y][tile.x] = 0;
      } else {
        console.log("path found");
        this.path.pop();
        this.path = this.path.concat(path);
        if (this.waypoints.indexOf(to) < this.waypoints.length - 1) {
          from = this.waypoints.at(this.waypoints.indexOf(to));
          to = this.waypoints.at(this.waypoints.indexOf(to) + 1);
          this.checkPath(from, to, tile);
        } else {
          this.addNewGem(tile);
        }
      }
    });
    this.finder.calculate();
  }

  attackPhase() {
    this.phase = "attack";
    this.monsters.createMultiple({
      active: false,
      visible: false,
      key: this.monsters.defaultKey,
      repeat: this.monsters.maxSize - 1,
      setOrigin: { x: 0, y: 0 },
      frame: this.monstersData[this.currentWave - 1].name,
    });

    this.time.addEvent({
      delay: 1000,
      repeat: this.monsters.maxSize - 1,
      callback: this.addMonsters,
      callbackScope: this,
    });
  }

  addNewGem(pos) {
    if (pos == null || pos.index == 2 || pos.index == 4) {
      console.log("building blocked!");
      return;
    }
    this.grid[pos.y][pos.x] = 1;
    const name = this.getFrame();
    const gemData = this.gemsData.find((value, index, obj) => {
      if (value.name == name) {
        return true;
      }
    });

    const gem = new Gem(
      this,
      pos.x * this.db.frameSize,
      pos.y * this.db.frameSize,
      name,
      gemData
    );

    this.maze.add(gem, true);
    this.newGems.add(gem);

    this.checkForCombine(this.newGems);

    if (this.newGems.isFull()) {
      this.input.off("pointerdown");
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
    this.hudScene.showInfo(gameObject);
    this.hudScene.controls.forEach((btn) => {
      if (!btn.frame.name.includes("build")) this.hudScene.disableBtn(btn);
    });
    this.maze.children.each((item) => {
      item.setSelected(false);
    });

    gameObject.setSelected(true);
    this.selectedGem = gameObject;

    if (gameObject.name === "stone") {
      this.hudScene.enableBtn(this.hudScene.removeBtn);
      this.stone = gameObject;
    }

    if (this.newGems.contains(gameObject) && this.newGems.isFull()) {
      this.hudScene.enableBtn(this.hudScene.selectBtn);
      switch (this.newGems.getMatching("name", gameObject.name).length) {
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
    this.grid[this.stone.y / this.db.frameSize][
      this.stone.x / this.db.frameSize
    ] = 0;
  }

  selectGem() {
    this.newGems.children.each((gem) => {
      if (!gem.selected) {
        this.maze.add(new Stone(this, gem.x, gem.y), true);
        gem.destroy();
      } else {
        this.gems.add(gem);
        gem.setSelected(false);
      }
    });
    this.newGems.clear();
    this.hudScene.controls.forEach((btn) => {
      this.hudScene.disableBtn(btn);
    });

    this.gems.getChildren().forEach((gem) => {
      gem.updateAuras();
    });

    this.attackPhase();
    this.checkForCombine(this.gems);
    console.log(this.gems);
  }

  changeGem(x) {
    this.gems.getChildren().forEach((gem) => {
      gem.disableAuras();
      gem.auras.clear();
    });
    const rank = this.ranks.find((value, index, obj) => {
      return obj[index - x] == this.selectedGem.rank;
    });
    const name = `${rank} ${this.selectedGem.type}`;
    const gemData = this.gemsData.find((value) => value.name == name);

    this.selectedGem.setFrame(name);
    this.selectedGem.setParams(gemData);

    this.selectGem();

    this.gems.getChildren().forEach((gem) => {
      gem.updateAuras();
    });
  }

  combineGem() {
    this.gems.getChildren().forEach((gem) => {
      gem.disableAuras();
      gem.auras.clear();
    });
    const x = this.selectedGem.x;
    const y = this.selectedGem.y;
    const name = this.selectedGem.combineTo;
    const data = this.towersData.find((value) => value.name == name);
    const combination = data.combination.filter(
      (value) => value != this.selectedGem.name
    );

    const tower = new AdvancedTower(this, x, y, name, data);
    tower.selected = true;

    this.gems.add(tower, true);
    this.maze.add(tower);
    console.log(tower);
    tower.refreshBody();

    this.selectedGem.setSelected(false);
    if (this.newGems.contains(this.selectedGem)) {
      this.selectedGem.destroy();
      this.selectGem();
    } else {
      this.selectedGem.name = "tmp";
      this.selectedGem.setVisible(false);
      this.selectedGem.setActive(false);

      this.gems.getChildren().forEach((gem) => {
        if (gem.combineTo === name && combination.includes(gem.name)) {
          this.maze.add(new Stone(this, gem.x, gem.y), true);
          const index = combination.findIndex((value) => value === gem.name);
          combination.splice(index, 1);
          gem.name = "tmp";
          gem.setVisible(false);
          gem.setActive(false);
        } else {
          gem.combineTo = null;
        }
      });
      this.checkForCombine(this.gems);
    }

    const timedEvent = new Phaser.Time.TimerEvent({
      delay: 100,
      callback: () => {
        this.gems.getChildren().forEach((gem) => {
          if (gem.name != "tmp") {
            gem.updateAuras();
          }
        });
      },
    });
    this.time.addEvent(timedEvent);
  }

  checkForCombine(gems) {
    const gemNames = gems.getChildren().map((gem) => gem.name);

    this.towersData.forEach((tower) => {
      if (
        tower.combination.every((item) => {
          return gemNames.includes(item);
        })
      ) {
        console.log(true);
        gems.getChildren().forEach((gem) => {
          if (tower.combination.includes(gem.name)) {
            gem.combineTo = tower.name;
          } else {
            gem.combineTo = null;
          }
        });
      }
    });
  }

  addMonsters() {
    let monster = this.monsters.get(
      this.waypoints[0].x * this.db.frameSize,
      this.waypoints[0].y * this.db.frameSize
    );
    monster
      .setActive(true)
      .setVisible(true)
      .setParams(this.monstersData[this.currentWave - 1]);
    this.moveMonster(monster, this.path);
    monster = null;
  }

  moveMonster(monster, path) {
    const tweens = [];
    for (let i = 0; i < path.length - 1; i++) {
      const ex = path[i + 1].x;
      const ey = path[i + 1].y;

      tweens.push({
        targets: monster,
        x: {
          value: ex * this.db.frameSize,
          duration: (this.db.frameSize / monster.baseSpeed) * 1000,
        },
        y: {
          value: ey * this.db.frameSize,
          duration: (this.db.frameSize / monster.baseSpeed) * 1000,
        },
      });
    }

    this.tweens.timeline({
      tweens: tweens,
      onUpdate: () => {
        monster.emit("move");
      },
    });
  }

  nextWave() {
    this.maze
      .getChildren()
      .filter((value) => value.name === "tmp")
      .forEach((value) => {
        console.log(value);
        value.destroy();
      });
    this.currentWave++;
    this.registry.set("wave", this.currentWave);

    this.monsters.maxSize = this.monstersCnt;
    if (this.monstersData[this.currentWave - 1].type.includes("boss")) {
      this.monsters.maxSize = 1;
    }

    if (this.monstersData[this.currentWave - 1].type.includes("flying")) {
      this.finder.setGrid(this.plainGrid);
    } else {
      this.finder.setGrid(this.grid);
    }
    this.buildPhase();
  }

  hit(bullet, enemy) {
    bullet.ability.forEach((value) => {
      const data = this.abilitiesData.find((val) => val.name === value);
      if (data.type === "on hit") {
        enemy.effect(data, bullet.damage);
      }
    });

    enemy.decreaseHp(bullet.damage);
    bullet.destroy();
    // if (enemy.hp <= 0) {
    //   // enemy.delete();
    //   this.exp += enemy.exp;
    //   this.registry.set("exp", this.exp);
    // }
  }
}
