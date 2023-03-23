import {
  Container,
  Sprite,
} from 'pixi.js';

import game from './game';
import GameVisual from './gameVisual';

class Scene extends Container {
  constructor() {
  	super();

    this.gameLogic = new GameVisual(9, 9);
  }
  onRotate() {

  }
}

export default Scene;