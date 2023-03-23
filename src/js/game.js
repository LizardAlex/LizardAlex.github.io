import {
  Application,
} from 'pixi.js';

import Scene from './scene';

window.addEventListener('resize', () => {
  if (typeof game !== 'undefined') {
    game.proceedRotation();
  }
});

class gameClass {
  constructor(canvas) {
  	this.canvas = canvas;
    this.app = new Application({
      view: canvas,
    });
    this.proceedRotation();
  }
  proceedRotation() {
    const width = document.documentElement.clientWidth;
    const height = document.documentElement.clientHeight;

    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    this.ratio = width / height;
    if (this.ratio <= 1) {
      this.canvas.width = 720;
      this.canvas.height = 720 / this.ratio;
    } else {
      this.canvas.width = 720 * this.ratio;
      this.canvas.height = 720;
    }
    gameClass.width = width;
    gameClass.height = height;

    gameClass.tablet = Math.abs((Math.min(Math.max(this.canvas.width, this.canvas.height), 1280) - 960) / 320 - 1);
    gameClass.wide = (Math.max(Math.max(this.canvas.width, this.canvas.height), 1280) - 1280) / 278;

    this.app.renderer.resize(width, height);

    if (this.scene) this.scene.onRotate();
  }
  init() {
  	this.loaded = true;
  	this.scene = new Scene();
  	this.app.stage.addChild(this.scene);
    gameClass.scene = this.scene;
  	this.scene.onRotate();
  }
}

gameClass.loadImage = (key) => {
  return gameClass.images[key];
}

export default gameClass;