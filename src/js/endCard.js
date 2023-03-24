import {
  Container,
  Sprite,
  Graphics,
} from 'pixi.js';

import game from './utils/game';
import Tween from './utils/tweenjs';

class EndCard extends Container {
  constructor(win, scene) {
    super();
    this.scene = scene;
    this.win = win;

    this.scene.on('onRotate', () => {
      this.onRotate();
    })

    this.prepareEndScene();
  }

  prepareEndScene() {
    this.overlay = new Graphics();
    this.overlay.beginFill(0x000000).drawRect(0, 0, 3000, 3000);
    this.addChild(this.overlay);

    this.particles = new Container();
    this.addChild(this.particles);

    this.button = new Sprite(game.loadImage('button'));
    this.addChild(this.button);
    this.button.anchor.set(0.5);

    this.button.interactive = true;
    this.button.button = true;
    this.button.on('pointerdown', () => {
      if (this.restartHitted) return;
      this.restartHitted = true;
      Tween.get(this.button.scale).to({ x: 1.1, y: 1.1 }, 150).to({ x: 1, y: 1 }, 150).call(() => {
        this.scene.removeChildren();
        this.scene.initGame();
        this.scene.emit('onRotate');
        this.scene.finished = false;
      });
    });

    this.buttonText = this.scene.UI.createText('Ещё раз?', 70, -10, this.button);

    this.winText = this.scene.UI.createText(this.win ? 'Победа!' : 'Поражение!', this.win ? 110 : 100, 0, this);

    this.overlay.alpha = 0.6;
    this.alpha = 0;
    Tween.get(this).wait(600).to({ alpha: 1 }, 400);

    this.spawnParticles();
    this.onRotate();
  }

  spawnParticles() {
    for (let i = 0; i < 15; i += 1) {
      const confetti = new Sprite(game.loadImage(`p${Math.ceil(Math.random() * 5)}`));
      confetti.i = i;
      confetti.anchor.set(0.5);

      const animateParticle = (el) => {
        confetti.scale.set(0.6 + 0.4 * Math.random());
        if (confetti.i > 15) confetti.scale.set(confetti.scale.x - 0.2);
        confetti.x = game.width * Math.random();
        confetti.y = -150;
        confetti.rotation = Math.random() * Math.PI * 4 - Math.PI * 2;
        this.particles.addChild(confetti);
        const time = 1700 + Math.random() * 800;
        const t = Tween.get(confetti).to({
          x: Math.random() * game.width,
          y: 1700,
          rotation: confetti.rotation + Math.random() * Math.PI * 8 - Math.PI * 4,
        }, time, Tween.Ease.sineInOut).call(() => {
          animateParticle(confetti);
        });
        if (!el) t.rawPosition = Math.random() * 1700;
      };

      animateParticle();
    }
  }

  onRotate() {
    this.button.x = game.width / 2;
    this.button.y = game.height * 0.7;

    this.winText.x = game.width / 2;
    this.winText.y = game.height * 0.3;
  }
}

export default EndCard;
