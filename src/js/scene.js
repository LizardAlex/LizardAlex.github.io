import {
  Container,
  Sprite,
} from 'pixi.js';

import game from './game';

class Scene extends Container {
  constructor() {
  	super();
  	this.bg = new Sprite(game.loadImage('background'));
  	this.bg.anchor.set(0.5);
  	this.addChild(this.bg);

  	this.logo = new Sprite(game.loadImage('logo'));
  	this.logo.anchor.set(0.5);
  	this.addChild(this.logo);
  }
  onRotate() {
    this.bg.x = game.width / 2;
    this.bg.y = game.height / 2;
    this.bg.scale.set(game.width / 1280, game.height / 1280);
    this.logo.x = game.width / 2;
    this.logo.y = game.height * 0.3;
  }
}

export default Scene;