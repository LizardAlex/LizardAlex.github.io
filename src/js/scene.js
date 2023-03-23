import {
  Container,
  Sprite,
} from 'pixi.js';

import game from './game';
import GameVisual from './gameVisual';
import UI from './UI';

class Scene extends Container {
  constructor() {
  	super();

    this.background = new Sprite(game.loadImage("background"));
    this.background.anchor.set(0.5);
    this.addChild(this.background);

    this.gameVisual = new GameVisual(9, 9, this);
    this.addChild(this.gameVisual);

    this.UI = new UI(this);
    this.addChild(this.UI);

    this.on("onRotate", () => { this.onRotate() });
  }
  onRotate() {
    this.background.x = game.width / 2;
    this.background.y = game.height / 2;
    this.background.scale.set(1 + 0.3 * game.wide)
  }
}

export default Scene;