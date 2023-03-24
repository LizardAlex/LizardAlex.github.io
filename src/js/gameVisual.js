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

    this.attachLogicListeners();
    scene.on('onRotate', () => this.onRotate());
  }

  initProperties(width, height, scene) {
    this.scene = scene;
    this.widthPieces = width;
    this.heightPieces = height;
    this.logic = new Logic(width, height);
    this.tileWidth = 71;
    this.tileHeight = 80;
    this.visualBoard = [];
    this.tilesTypes = ['red', 'yellow', 'green', 'blue', 'purple', 'booster5', 'booster6', 'booster7', 'booster8'];
    this.inMove = false;
    this.tilesInMovement = 0;
  }
  attachLogicListeners() {
    this.logic.addEventListener('tileDestroyed', (e) => this.onTileDestroyed(e));
    this.logic.addEventListener('tileSpawned', (e) => this.onTileSpawned(e));
    this.logic.addEventListener('tileMoved', (e) => this.onTileMoved(e));
    this.logic.addEventListener('tileSwapped', (e) => this.onTileSwapped(e));
  }
  initBoard(board) {
    this.board = new Container();
    this.addChild(this.board);

    this.boardTexture = new Sprite(game.loadImage('board'));
    this.boardTexture.anchor.set(0.5);
    this.board.addChild(this.boardTexture);

    this.tilesCont = new Container();
    this.board.addChild(this.tilesCont);

    const mask = new Graphics();
    this.board.addChild(mask);
    mask.beginFill(0xffffff).drawRect(-350, -364, 700, 728);
    this.tilesCont.mask = mask;

    this.clickFunction = (evt) => {
      if (this.inMove) return;
      this.inMove = true;
      const tile = evt.target;
      if (!this.logic.tap(tile.row, tile.col)) {
        this.inMove = false;
      }
      if (!this.logic.swapBonusActive) this.scene.UI.moveMade();
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
  	const tile = new Sprite(game.loadImage(this.tilesTypes[type - 1]));
  	tile.anchor.set(0.5);
  	tile.position = this.setCoordinates(row, col);
    if (fresh) {
      const emptySpaces = this.getEmptySpacesInColumn(col);
      const oldY = tile.position.y;
      tile.y = this.tileHeight * (-this.heightPieces / 2) - this.tileHeight * emptySpaces + this.tileHeight / 2;
      const dist = (oldY - tile.y) / this.tileHeight;
      this.tilesInMovement += 1;
      Tween.get(tile).to({ y: oldY }, 100 * dist, Tween.Ease.sineInOut).call(() => {
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
      Tween.get(tile.scale).to({ x: 0, y: 0 }, 100, Tween.Ease.sineInOut).call(() => {
        this.tilesCont.removeChild(tile);
      });
    }
  	this.visualBoard[event.detail.row][event.detail.col] = null;
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
  	Tween.get(tile).to(this.setCoordinates(event.detail.toRow, event.detail.toCol), 100 * dist, Tween.Ease.sineInOut).call(() => {
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