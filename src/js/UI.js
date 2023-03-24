import {
  Container,
  Sprite,
  Text,
  filters,
  Graphics,
} from 'pixi.js';

import game from './utils/game';
import Tween from './utils/tweenjs';

class UI extends Container {
  constructor(scene) {
    super();
    this.scene = scene;
    this.bwFilter = new filters.ColorMatrixFilter();
    this.bwFilter.desaturate();

    this.spawnUIElements();
    this.scene.on('onRotate', () => { this.onRotate() });
  }

  spawnUIElements() {
    this.spawnTopBar();
    this.spawnMoveCounter();
    this.spawnBonusButtons();
  }

  spawnMoveCounter() {
    this.movesContainer = this.createContainer('moves', 0.5, 0.5);
    this.createText('ОЧКИ:', 32, 65, this.movesContainer);
    this.movesText = this.createText(this.scene.gameVisual.logic.moves, 112, -95, this.movesContainer);
    this.pointsText = this.createText(0, 82, 115, this.movesContainer, true);
  }

  spawnTopBar() {
    this.topCounter = this.createContainer('topBar', 0.5, 0);
    this.createText('ПРОГРЕСС', 35, 22, this.topCounter);
    this.createProgressBar();
  }

  createProgressBar() {
    this.line = this.createSprite('line', 0.5, 70, this.topCounter);
    this.lineProgress = this.createSprite('lineFilled', 0.5, 0, this.line);

    const mask = new Graphics();
    mask.beginFill(0xffffff).drawRoundedRect(-this.lineProgress.width / 2, -this.lineProgress.height / 2, this.lineProgress.width, this.lineProgress.height, 27);
    this.line.addChild(mask);
    this.lineProgress.mask = mask;
    this.lineProgress.x = -this.lineProgress.width;
  }

  spawnBonusButtons() {
    this.bonus1 = this.createBonusButton('booster7', () => {
      this.scene.gameVisual.logic.activateBombBonus();
      this.deactivateBonus2();
    });
    this.bonus1AmountText = this.createText(this.scene.gameVisual.logic.bombsRemaining, 43, 32, this.bonus1);

    this.bonus2 = this.createBonusButton('swap', () => {
      this.scene.gameVisual.logic.activateSwapBonus();
      this.deactivateBonus1();
    });
    this.bonus2AmountText = this.createText(this.scene.gameVisual.logic.swapsRemaining, 43, 32, this.bonus2);
  }

  createContainer(imageName, anchorX, anchorY) {
    const container = new Sprite(game.loadImage(imageName));
    container.anchor.set(anchorX, anchorY);
    this.addChild(container);
    return container;
  }

  createSprite(imageName, anchorX, y, parent) {
    const sprite = new Sprite(game.loadImage(imageName));
    sprite.anchor.set(anchorX);
    sprite.y = y;
    parent.addChild(sprite);
    return sprite;
  }

  createText(text, fontSize, y, parent, value = false) {
    const textObj = new Text(text, {
      fontFamily: 'Marvin',
      fontSize: fontSize,
      fill: 0xffffff,
      align: 'center',
    });
    textObj.anchor.set(0.5);
    textObj.y = y;
    parent.addChild(textObj);
    if (value) {
      textObj.value = 0;
    }
    return textObj;
  }

  createBonusButton(imageName, onActivate) {
    const button = this.createSprite('bonusButton', 0.5, 0, this);
    const bonusImg = this.createSprite(imageName, 0.5, -30, button);
    button.interactive = true;
    button.buttonMode = true;
    button.on('pointerdown', () => {
      if (this.scene.gameVisual.logic.moves === 0) return;
      if (!button.activated) {
        button.filters = [this.bwFilter];
        button.activated = true;
        onActivate();
      } else {
        this.deactivateButton(button);
      }
    });
    return button;
  }

  deactivateButton(button) {
    button.filters = [];
    button.activated = false;
  }

  deactivateBonus1() {
    this.deactivateButton(this.bonus1);
    this.scene.gameVisual.logic.bombBonusActive = false;
  }

  deactivateBonus2() {
    this.deactivateButton(this.bonus2);
    this.scene.gameVisual.logic.swapBonusActive = false;
    this.scene.gameVisual.logic.swapTile1 = null;
  }

  moveMade() {
    this.deactivateBonus1();
    this.deactivateBonus2();
    this.updateTextsAndProgress();
  }

  updateTextsAndProgress() {
    this.bonus1AmountText.text = this.scene.gameVisual.logic.bombsRemaining;
    this.bonus2AmountText.text = this.scene.gameVisual.logic.swapsRemaining;
    if (this.scene.gameVisual.logic.bombsRemaining === 0) this.bonus1.filters = [this.bwFilter];
    if (this.scene.gameVisual.logic.swapsRemaining === 0) this.bonus2.filters = [this.bwFilter];
    this.movesText.text = this.scene.gameVisual.logic.moves;

    Tween.removeTweens(this.pointsText);
    const tw = Tween.get(this.pointsText).to({ value: this.scene.gameVisual.logic.score }, 300);
    tw.on('change', () => {
      this.pointsText.text = Math.floor(this.pointsText.value);
      this.lineProgress.x = -this.lineProgress.width + this.lineProgress.width * this.pointsText.value / 150;
      if (this.lineProgress.x > 0) this.lineProgress.x = 0;
    });
    this.pointsText.text = this.scene.gameVisual.logic.score;
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