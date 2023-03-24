import {
  BaseTexture,
  Texture,
} from 'pixi.js';

import * as images from './js/assets/images';
import * as sounds from './js/assets/sounds';
import Game from './js/utils/game';
import './css/style.css';

const game = new Game(document.getElementById('canvas'));
Game.images = {};
Game.sounds = {};
window.game = game;
game.Game = Game;
Game.game = game;
Object.keys(images).forEach((key) => {
  const image = new Image();
  image.src = images[key];
  image.onload = () => {
  	Game.images[key] = new Texture(new BaseTexture(image));
  	if (Object.keys(Game.images).length === Object.keys(images).length) game.init();
  };
});

Object.keys(sounds).forEach((key) => {
  Game.sounds[key] = sounds[key];
});