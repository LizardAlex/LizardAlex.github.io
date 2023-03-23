import {
  Container,
  Sprite,
  Text,
  filters,
} from 'pixi.js';

import game from './game';
import GameVisual from './gameVisual';

class UI extends Container {
  constructor(scene) {
  	super();
    this.scene = scene;
    this.spawnUIElements();
    this.scene.on("onRotate", () => { this.onRotate() });
  }
  spawnUIElements() {
    this.movesContainer = new Sprite(game.loadImage("moves"));
    this.movesContainer.anchor.set(0.5);
    this.addChild(this.movesContainer);

    this.topCounter = new Sprite(game.loadImage("topBar"));
    this.addChild(this.topCounter);
    this.topCounter.anchor.set(0.5, 0);

    this.bwFilter = new filters.ColorMatrixFilter();
    this.bwFilter.desaturate();

    this.bonus1 = new Sprite(game.loadImage("bonusButton"));
    this.bonus1.anchor.set(.5);
    this.addChild(this.bonus1);
    const bonus1Img = new Sprite(game.loadImage("booster7"));
    bonus1Img.anchor.set(.5);
    bonus1Img.y = -30;
    this.bonus1.addChild(bonus1Img);
    this.bonus1.interactive = true;
    this.bonus1.buttonMode = true;
    this.bonus1.on('pointerdown', () => {
      if (this.bonus1AmountText.text == 0) return;
      if (!this.bonus1.activated) {
        this.bonus1.filters = [this.bwFilter];
        this.bonus1.activated = true;
        this.scene.gameVisual.logic.activateBombBonus();
        this.deactivateBonus2();
      } else {
        this.deactivateBonus1();
      }
    });
    this.bonus1AmountText = new Text(this.scene.gameVisual.logic.bombsRemaining, {
      fontFamily: 'Marvin',
      fontSize: 43,
      fill: 0xffffff,
      align: 'center',
    });
    this.bonus1AmountText.anchor.set(0.5);
    this.bonus1AmountText.y = 32;
    this.bonus1.addChild(this.bonus1AmountText);


    this.bonus2 = new Sprite(game.loadImage("bonusButton"));
    this.addChild(this.bonus2);
    const bonus2Img = new Sprite(game.loadImage("swap"));
    bonus2Img.anchor.set(.5);
    bonus2Img.y = -30;
    this.bonus2.addChild(bonus2Img);
    this.bonus2.anchor.set(.5);
    this.bonus2.interactive = true;
    this.bonus2.buttonMode = true;
    this.bonus2.on('pointerdown', () => {
      if (this.bonus2AmountText.text == 0) return;
      if (!this.bonus2.activated) {
        this.bonus2.filters = [this.bwFilter];
        this.bonus2.activated = true;
        this.scene.gameVisual.logic.activateSwapBonus();
        this.deactivateBonus1();
      } else {
        this.deactivateBonus2();
      }
    });
    this.bonus2AmountText = new Text(this.scene.gameVisual.logic.swapsRemaining, {
      fontFamily: 'Marvin',
      fontSize: 43,
      fill: 0xffffff,
      align: 'center',
    });
    this.bonus2AmountText.anchor.set(0.5);
    this.bonus2AmountText.y = 32;
    this.bonus2.addChild(this.bonus2AmountText);
  }
  deactivateBonus1() {
    this.bonus1.filters = [];
    this.bonus1.activated = false;
    this.scene.gameVisual.logic.bombBonusActive = false;
  }
  deactivateBonus2() {
    this.bonus2.filters = [];
    this.bonus2.activated = false;
    this.scene.gameVisual.logic.swapBonusActive = false;
    this.scene.gameVisual.logic.swapTile1 = null;
  }
  moveMade() {
    this.deactivateBonus1();
    this.deactivateBonus2();
    this.bonus1AmountText.text = this.scene.gameVisual.logic.bombsRemaining;
    this.bonus2AmountText.text = this.scene.gameVisual.logic.swapsRemaining;
    if (this.scene.gameVisual.logic.bombsRemaining === 0) this.bonus1.filters = [this.bwFilter];
    if (this.scene.gameVisual.logic.swapsRemaining === 0) this.bonus2.filters = [this.bwFilter];
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