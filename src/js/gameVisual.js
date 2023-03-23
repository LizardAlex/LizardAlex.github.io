import {
  Container,
  Sprite,
} from 'pixi.js';

import game from './game';
import Logic from './gameLogic';

class gameVisual extends Container {
  constructor(width, height) {
  	super();
    this.logic = new Logic(width, height);

    this.initPixiApp(this.logic.board);

    this.logic.addEventListener('tileDestroyed', (e) => this.onTileDestroyed(e));
    this.logic.addEventListener('tileSpawned', (e) => this.onTileSpawned(e));
    this.logic.addEventListener('tileMoved', (e) => this.onTileMoved(e));
  }
  initBoard(board) {
    this.board = new Container();
    this.addChild(this.board);
    // Initialize the Pixi.js application and load the required assets
  }
  onTileDestroyed(event) {
    // Update the sprites based on the destroyed tiles
  }

  onTileSpawned(event) {
    // Update the sprites based on the spawned tiles
  }

  onTileMoved(event) {
    // Update the sprites based on the moved tiles
  }
  onRotate() {

  }
}

export default gameVisual;