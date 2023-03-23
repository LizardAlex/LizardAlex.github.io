import {
  Container,
  Sprite,
  Text,
} from 'pixi.js';

import game from './game';
import GameVisual from './gameVisual';

class UI extends Container {
  constructor(scene) {
  	super();
    this.spawnUIElements();
    scene.on("onRotate", () => { this.onRotate() });
  }
  spawnUIElements() {
    this.movesContainer = new Sprite(game.loadImage("moves"));
    this.movesContainer.anchor.set(0.5);
    this.addChild(this.movesContainer);

    this.topCounter = new Sprite(game.loadImage("topBar"));
    this.addChild(this.topCounter);
    this.topCounter.anchor.set(0.5, 0);

    this.bonus1 = new Sprite(game.loadImage("bonusButton"));
    this.bonus1.anchor.set(.5);
    this.addChild(this.bonus1);
    const bonus1Img = new Sprite(game.loadImage("booster7"));
    bonus1Img.anchor.set(.5);
    bonus1Img.y = -30;
    this.bonus1.addChild(bonus1Img);

    this.bonus2 = new Sprite(game.loadImage("bonusButton"));
    this.addChild(this.bonus2);
    const bonus2Img = new Sprite(game.loadImage("swap"));
    bonus2Img.anchor.set(.5);
    bonus2Img.y = -30;
    this.bonus2.addChild(bonus2Img);
    this.bonus2.anchor.set(.5);
  }
  onRotate() {
    if (game.width > game.height) {
      this.topCounter.x = game.width / 4 * 3;
      this.topCounter.scale.set(1 - 0.2 * game.tablet);

      this.movesContainer.x = game.width / 4 * 3;
      this.movesContainer.y = game.height / 2 - 40;
      this.movesContainer.scale.set(0.8);

      this.bonus1.x = game.width / 4 * 3 - 100;
      this.bonus1.y = game.height - 100;
      this.bonus1.scale.set(1);

      this.bonus2.x = game.width / 4 * 3 + 100;
      this.bonus2.y = game.height - 100;
      this.bonus2.scale.set(1);
    } else {
      this.topCounter.x = game.width / 2;
      this.topCounter.scale.set(0.9 + 0.1 * game.wide - 0.15 * game.tablet);

      this.bonus1.x = game.width / 3;
      this.bonus1.y = game.height - 95 - 60 * game.wide + 20 * game.tablet;
      this.bonus1.scale.set(1 - 0.1 * game.tablet);

      this.bonus2.x = game.width / 3 * 2;
      this.bonus2.y = game.height - 95 - 60 * game.wide + 20 * game.tablet;
      this.bonus2.scale.set(1 - 0.1 * game.tablet);

      this.movesContainer.x = game.width / 2;
      this.movesContainer.y = 230 + 70 * game.wide - 65 * game.tablet;
      this.movesContainer.scale.set(0.5 + 0.2 * game.wide - 0.15 * game.tablet);
    }
  }
}

export default UI;