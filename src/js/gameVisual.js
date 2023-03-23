import {
  Container,
  Sprite,
} from 'pixi.js';

import game from './game';
import Logic from './gameLogic';
import Tween from './tweenjs';

class gameVisual extends Container {
  constructor(width, height, scene) {
  	super();
  	this.widthPieces = width;
  	this.heightPieces = height;
    this.logic = new Logic(width, height);
    this.tileWidth = 71;
    this.tileHeight = 80;
    this.visualBoard = [];

    this.tilesTypes = ['red', 'yellow', 'green', 'blue', 'purple', 'booster5', 'booster6', 'booster7', 'booster8'];

    this.inMove = false;
    this.tilesInMovement = 0;

    this.initBoard(this.logic.board);

    this.logic.addEventListener('tileDestroyed', (e) => this.onTileDestroyed(e));
    this.logic.addEventListener('tileSpawned', (e) => this.onTileSpawned(e));
    this.logic.addEventListener('tileMoved', (e) => this.onTileMoved(e));

    scene.on('onRotate', () => { this.onRotate() });
  }
  initBoard(board) {
    this.board = new Container();
    this.addChild(this.board);

    this.boardTexture = new Sprite(game.loadImage('board'));
    this.boardTexture.anchor.set(0.5);
    this.board.addChild(this.boardTexture);

    this.clickFunction = (evt) => {
      if (this.inMove) return;
      this.inMove = true;
      const tile = evt.target;
      if (!this.logic.tap(tile.row, tile.col)) this.inMove = false;;
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
        if (this.tilesInMovement === 0) this.inMove = false;
      });
    }
  	this.visualBoard[row][col] = tile;
  	this.board.addChild(tile);
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
  onTileDestroyed(event) {
  	this.board.removeChild(this.visualBoard[event.detail.row][event.detail.col]);
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
      if (this.tilesInMovement === 0) this.inMove = false;
  	});
    tile.row = event.detail.toRow;
    tile.col = event.detail.toCol;
  }
  onRotate() {
    this.board.x = game.width / 2;
    this.board.y = game.height / 2;
  }
}

export default gameVisual;