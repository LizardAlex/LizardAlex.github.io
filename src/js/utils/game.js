import {
  Application,
  Texture,
  AnimatedSprite,
} from 'pixi.js';

import Scene from '../scene';
import { Howler, Howl } from './howler';

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
    gameClass.width = this.canvas.width;
    gameClass.height = this.canvas.height;

    gameClass.tablet = Math.abs((Math.min(Math.max(this.canvas.width, this.canvas.height), 1280) - 960) / 320 - 1);
    gameClass.wide = (Math.max(Math.max(this.canvas.width, this.canvas.height), 1280) - 1280) / 278;

    this.app.renderer.resize(this.canvas.width, this.canvas.height);

    if (this.scene) this.scene.emit('onRotate');
  }
  init() {
  	this.loaded = true;
  	this.scene = new Scene();
  	this.app.stage.addChild(this.scene);
    gameClass.scene = this.scene;

  	this.scene.emit('onRotate');
  }
  static play(name, vol = 1, loop = false) {
    if (this.sounds[name]) {
      const sound = new Howl({
        autoplay: true,
        src: [this.sounds[name]],
        volume: vol,
        loop,
        format: 'mp3',
      });
      return sound;
    }
  }
  static loadImage(key) {
    return gameClass.images[key];
  }
  static createSpriteSheet(name, path, horizontalFrames, verticalFrames, animationSpeed, loop = true, customFrameOrder = null) {
    const spriteSheet = game.loadImage(name);
    const textureArray = [];
    const amountOfFrames = horizontalFrames * verticalFrames;
    const frameWidth = spriteSheet.width / horizontalFrames;
    const frameHeight = spriteSheet.height / verticalFrames;
    // Choose the custom frame order or create a default sequential order
    let frameOrder = [];
    if (customFrameOrder) {
      frameOrder = customFrameOrder;
    } else {
      for (let i = 0; i < amountOfFrames; i += 1) {
        frameOrder.push(i);
      }
    }
    // create an array with the separate frames in the order of the animation
    for (let i = 0; i < frameOrder.length; i += 1) {
      textureArray.push(
        new Texture(
          spriteSheet,
          {
            x: spriteSheet.orig.x + frameWidth * (frameOrder[i] % horizontalFrames),
            y: spriteSheet.orig.y + frameHeight * (Math.floor(frameOrder[i] / horizontalFrames)),
            width: frameWidth,
            height: frameHeight,
          },
        ),
      );
    }

    const object = new AnimatedSprite(textureArray);
    object.animationSpeed = animationSpeed;
    object.loop = loop;
    object.anchor.set(0.5);
    if (path) {
      addAnchoring(object, path);
    }
    object.play();
    return object;
  }
}

window.addEventListener('resize', () => {
  if (typeof game !== 'undefined') {
    game.proceedRotation();
  }
});

window.addEventListener('blur', () => { Howler.mute(true); });
window.addEventListener('focus', () => { Howler.mute(false); });

export default gameClass;