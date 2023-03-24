import {
  Container,
  Sprite,
  Graphics,
} from 'pixi.js';

import game from './utils/game';
import Logic from './gameLogic';
import Tween from './utils/tweenjs';

class gameVisual extends Container {
  constructor(width, height, scene) {
    super();
    this.setup(width, height, scene);
  }

  setup(width, height, scene) {
    Tween.MotionGuidePlugin.install();
    this.initProperties(width, height, scene);
    this.initBoard(this.logic.board);
    this.initTutorialMove(width, height);


    this.attachLogicListeners();
    scene.on('onRotate', () => this.onRotate());
  }

  initTutorialMove(width, height) {
    const possibleCombos = [];
    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        const visited = new Set();
        const matches = this.logic.findAdjacentMatches(row, col, visited);
        possibleCombos.push(matches);
      }
    }
    possibleCombos.sort((a, b) => b.length - a.length);
    this.spawnHand(possibleCombos[0][0]);
  }
  spawnHand(position) {
    this.hand = new Sprite(game.loadImage('pointer'));
    this.board.addChild(this.hand);
    Tween.get(this.hand.scale, { loop: true }).to({ x: 0.9, y: 0.9 }, 250, Tween.Ease.sineInOut).to({ x: 1, y: 1 }, 250, Tween.Ease.sineInOut);

    this.hand.position = this.setCoordinates(position.row, position.col);
  }
  initProperties(width, height, scene) {
    this.scene = scene;
    this.widthPieces = width;
    this.heightPieces = height;
    this.logic = new Logic(width, height);
    this.tileWidth = 71;
    this.tileHeight = 80;
    this.visualBoard = [];
    this.explosionsPool = [];
    this.particlesPool = [];
    this.tilesPool = [];
    this.tilesTypes = ['red', 'yellow', 'green', 'blue', 'purple', 'booster5', 'booster6', 'booster7', 'booster8'];
    this.inMove = false;
    this.tilesInMovement = 0;
    this.dropDelay = 0;
  }
  attachLogicListeners() {
    this.logic.addEventListener('tileDestroyed', (e) => this.onTileDestroyed(e));
    this.logic.addEventListener('tileSpawned', (e) => this.onTileSpawned(e));
    this.logic.addEventListener('tileMoved', (e) => this.onTileMoved(e));
    this.logic.addEventListener('tileSwapped', (e) => this.onTileSwapped(e));
    this.logic.addEventListener('bonusActivated', (e) => this.onBonusActivated(e));
  }
  initBoard(board) {
    this.board = new Container();
    this.addChild(this.board);

    this.boardTexture = new Sprite(game.loadImage('board'));
    this.boardTexture.anchor.set(0.5);
    this.board.addChild(this.boardTexture);

    this.tilesCont = new Container();
    this.board.addChild(this.tilesCont);

    this.particlesLayer = new Container();
    this.board.addChild(this.particlesLayer);

    const mask = new Graphics();
    this.board.addChild(mask);
    mask.beginFill(0xffffff).drawRect(-350, -364, 700, 728);
    this.tilesCont.mask = mask;

    this.clickFunction = (evt) => {
      if (this.inMove) return;
      Tween.get(this.hand).to({ alpha: 0 }, 300).call(() => {
        this.board.removeChild(this.hand);
      });
      this.dropDelay = 100;
      this.inMove = true;
      const tile = evt.target;
      const clikcedOn = this.logic.board[tile.row][tile.col];
      const bombStatus = this.logic.bombBonusActive;

      const status = this.logic.tap(tile.row, tile.col);
      if (status === 'swap1') {
        Tween.get(tile.scale).to({ x: 1.2, y: 1.2 }, 50).to({ x: 1, y: 1 }, 50);
      }
      if (status === 'wrongMove' || status === 'swap1') this.inMove = false;
      if (status === 'correctMove' || status === 'swap2') game.play('match3_1');
      if (status !== 'swap1') this.scene.UI.moveMade();
      if (clikcedOn === 6 || clikcedOn === 7) game.play('firework');
      if (status === 'wrongMove') Tween.get(tile.pivot, { loop: 1 }).to({ x: -4 }, 25).to({ x: 4 }, 50).to({ x: 0 }, 0);
    };

    for (let row = 0; row < board.length; row++) {
      this.visualBoard[row] = [];
      for (let col = 0; col < board[row].length; col++) {
        this.spawnTile(row, col, board[row][col], false);
      }
    }
  }
  getEmptySpacesInColumn(col) {
    let emptySpaces = 0;
    for (let row = 0; row < this.heightPieces; row++) {
      if (this.visualBoard[row][col] === null) {
        emptySpaces++;
      }
    }
    return emptySpaces;
  }
  spawnTile(row, col, type, fresh) {
  	let tile;
    if (this.tilesPool.length === 0) tile = new Sprite(game.loadImage(this.tilesTypes[type - 1]));
    else tile = this.tilesPool.pop();
    Tween.removeTweens(tile);
    Tween.removeTweens(tile.scale);
    tile.rotation = 0;
  	tile.anchor.set(0.5);
    tile.scale.set(1);
    tile.texture = game.loadImage(this.tilesTypes[type - 1]);
  	tile.position = this.setCoordinates(row, col);
    if (fresh) {
      const emptySpaces = this.getEmptySpacesInColumn(col);
      const oldY = tile.position.y;
      tile.y = this.tileHeight * (-this.heightPieces / 2) - this.tileHeight * emptySpaces + this.tileHeight / 2;
      const dist = (oldY - tile.y) / this.tileHeight;
      this.tilesInMovement += 1;
      Tween.get(tile).wait(this.dropDelay).to({ y: oldY }, 100 * dist, Tween.Ease.sineInOut)
      .to({ y: oldY - 10 }, 25, Tween.Ease.sineInOut).to({ y: oldY }, 25, Tween.Ease.sineInOut).call(() => {
        this.tilesInMovement -= 1;
        if (this.tilesInMovement === 0) {
          this.inMove = false;
        }
      });
    }
  	this.visualBoard[row][col] = tile;
  	this.tilesCont.addChild(tile);
  	tile.interactive = true;
  	tile.row = row;
  	tile.col = col;
    tile.on('pointerdown', this.clickFunction);
    return tile;
  }
  setCoordinates(row, col) {
  	return {
  		x: this.tileWidth * (-this.widthPieces / 2) + this.tileWidth * col + this.tileWidth / 2,
  		y: this.tileHeight * (-this.heightPieces / 2) + this.tileHeight * row + this.tileHeight / 2
  	}
  }
  onBonusActivated(event) {
    if (event.detail.type === 10) {
      this.scene.shake(5);
      this.dropExplosion(this.setCoordinates(event.detail.row, event.detail.col));
    }
    if (event.detail.type === 9) {
      this.scene.shake(10);
      Tween.get(this, { loop: 5}).call(() => {
        this.dropExplosion({
          x: (Math.random() * this.boardTexture.width - this.boardTexture.width / 2) * 0.8,
          y: (Math.random() * this.boardTexture.height - this.boardTexture.height / 2) * 0.8
        });
      }).wait(70);
    }
  }
  dropExplosion(coords) {
    let explosion;
    if (this.explosionsPool.length === 0) explosion = game.createSpriteSheet('explosion_spritesheet', 5, 5, 0.5, false);
    else explosion = this.explosionsPool.pop();
    explosion.gotoAndPlay(0);
    explosion.scale.set(2.2);
    explosion.position = coords;
    this.particlesLayer.addChild(explosion);
    explosion.onComplete = () => {
      this.explosionsPool.push(explosion);
      this.particlesLayer.removeChild(explosion);
    };
    game.play('explosion');
  }
  onTileSwapped(event) {
    this.inMove = true;
    const tile1 = this.visualBoard[event.detail.fromRow][event.detail.fromCol];
    const tile2 = this.visualBoard[event.detail.toRow][event.detail.toCol];
    tile1.row = event.detail.toRow;
    tile1.col = event.detail.toCol;
    tile2.row = event.detail.fromRow;
    tile2.col = event.detail.fromCol;
    this.tilesCont.addChild(tile1);
    this.tilesCont.addChild(tile2);
    this.visualBoard[event.detail.toRow][event.detail.toCol] = tile1;
    this.visualBoard[event.detail.fromRow][event.detail.fromCol] = tile2;
    const endC1 = this.setCoordinates(event.detail.toRow, event.detail.toCol);
    const endC2 = this.setCoordinates(event.detail.fromRow, event.detail.fromCol);
    const xOff = (event.detail.toCol - event.detail.fromCol) / (event.detail.toCol - event.detail.fromCol) || 0;
    const yOff = (event.detail.toRow - event.detail.fromRow) / (event.detail.toRow - event.detail.fromRow) || 0;
    Tween.get(tile1.position).to({guide:
      { path:[
        tile1.x,
        tile1.y,
        (tile1.x + endC1.x) / 2 - this.widthPieces * 15 * yOff,
        (tile1.y + endC1.y) / 2 + this.heightPieces * 15 * xOff,
        endC1.x,
        endC1.y]
      }}, 100);
    Tween.get(tile2.position).to({guide:
      { path:[
        tile2.x,
        tile2.y,
        (tile2.x + endC2.x) / 2 + this.widthPieces * 15 * yOff,
        (tile2.y + endC2.y) / 2 - this.heightPieces * 15 * xOff,
        endC2.x,
        endC2.y
      ] }}, 100).call(() => {
        this.inMove = false;
      });

  }
  onTileDestroyed(event) {
    const tile = this.visualBoard[event.detail.row][event.detail.col];
    if (tile) {
      const type = event.detail.type;
      let time = 0;
      if (event.detail.delay) time = 30 * event.detail.delay;
      if (time !== 0) this.dropDelay = 250;
      Tween.get(tile.scale).wait(time).call(() => {
        if (type >= 1 && type <= 5) this.spawnParticles(tile.position, type);
      }).to({ x: 0, y: 0 }, 100, Tween.Ease.sineInOut).call(() => {
        this.tilesCont.removeChild(tile);
        this.tilesPool.push(tile);
      });
    }
  	this.visualBoard[event.detail.row][event.detail.col] = null;
  }
  spawnParticles(position, type) {
    for (let i = 0; i < 15; i += 1) {
      let part;
      if (this.particlesPool.length === 0) part = new Sprite(game.loadImage(`p${type}`));
      else part = this.particlesPool.pop();
      part.texture = game.loadImage(`p${type}`);
      this.particlesLayer.addChild(part);
      part.position = position;
      part.scale.set(0.5);
      part.alpha = 1;
      part.rotation = Math.random() * Math.PI * 2;
      Tween.get(part).wait(100).to({ alpha: 0 }, 150);
      Tween.get(part).to({ x: part.x + Math.random() * 200 - 100, y: part.y + Math.random() * 200 - 100 }, 250).call(() => {
        this.particlesLayer.removeChild(part);
        this.particlesPool.push(part);
      });
    }
  }
  onTileSpawned(event) {
  	const item = this.spawnTile(event.detail.row, event.detail.col, event.detail.type, !event.detail.bonus);
    if (event.detail.type > 5) {
      item.scale.set(0);
      Tween.get(item.scale).to({ x: 1, y: 1 }, 150).call(() => {
        Tween.get(item.scale, { loop: true }).to({ x: 1.05, y: 1.05 }, 150, Tween.Ease.sineInOut).to({ x: 1, y: 1 }, 150, Tween.Ease.sineInOut);
        Tween.get(item, { loop: true }).to({ rotation: -Math.PI / 20 }, 150).to({ rotation: Math.PI / 20 }, 300).to({ rotation: 0 }, 150);
      });
    }
  }

  onTileMoved(event) {
  	const tile = this.visualBoard[event.detail.fromRow][event.detail.fromCol];
  	this.visualBoard[event.detail.fromRow][event.detail.fromCol] = null;
  	this.visualBoard[event.detail.toRow][event.detail.toCol] = tile;
  	const dist = event.detail.toRow - event.detail.fromRow;
  	this.tilesInMovement += 1;
    const endCoordinates = this.setCoordinates(event.detail.toRow, event.detail.toCol);
  	Tween.get(tile).wait(this.dropDelay).to(endCoordinates, 100 * dist, Tween.Ease.sineInOut)
    .to({ y: endCoordinates.y - 10 }, 25, Tween.Ease.sineInOut).to({ y: endCoordinates.y }, 25, Tween.Ease.sineInOut).call(() => {
      this.tilesInMovement -= 1;
      if (this.tilesInMovement === 0) {
        this.inMove = false;
      }
  	});
    tile.row = event.detail.toRow;
    tile.col = event.detail.toCol;
  }
  onRotate() {
    if (game.width > game.height) {
      this.board.x = game.width / 4;
      this.board.y = game.height / 2;
      this.board.scale.set(0.9 - 0.22 * game.tablet);
    } else {
      this.board.x = game.width / 2;
      this.board.y = game.height / 2 + 73 - 30 * game.tablet;
      this.board.scale.set(0.95 - 0.22 * game.tablet + 0.05 * game.wide);
    }
  }
}

export default gameVisual;