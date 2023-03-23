import {
  BaseTexture,
  Texture,
} from 'pixi.js';

import * as images from './js/images';
import Game from './js/game';
import './css/style.css';

const game = new Game(document.getElementById('canvas'));
Game.images = {};
window.game = game;
Object.keys(images).forEach((key) => {
  const image = new Image();
  image.src = images[key];
  image.onload = () => {
  	Game.images[key] = new Texture(new BaseTexture(image));
  	if (Object.keys(Game.images).length === Object.keys(images).length) game.init();
  };
});