import {
  Container,
  Sprite,
  Filter,
} from 'pixi.js';

import game from './utils/game';
import GameVisual from './gameVisual';
import UI from './UI';
import Tween from './utils/tweenjs';
import EndCard from './endCard';

class Scene extends Container {
  constructor() {
  	super();
    game.play('music', 0.7, true);
    this.initGame();
    this.initTrippyShader();
    this.on("onRotate", () => { this.onRotate() });
  }
  initGame() {
    this.background = new Sprite(game.loadImage("background"));
    this.background.anchor.set(0.5);
    this.addChild(this.background);

    this.gameVisual = new GameVisual(9, 9, this);
    this.addChild(this.gameVisual);

    this.UI = new UI(this);
    this.addChild(this.UI);

    this.confettiLeft = new Container();
    this.confettiRight = new Container();
    this.addChild(this.confettiLeft);
    this.addChild(this.confettiRight);
  }
  buildConfetti(side, angle) {
    const confettiContainer = game.scene[`confetti${side}`];
    const confettiAmount = 75;
    for (let i = 0; i < confettiAmount; i += 1) {
      const confetti = new Sprite(game.loadImage(`p${Math.ceil(Math.random() * 5)}`));
      confetti.anchor.set(0.5);
      confetti.angle = Math.random() * 360;
      confettiContainer.addChild(confetti);
      const randomRotateTime = 250 + Math.random() * 250;
      Tween.get(confetti.scale, { loop: true }).to({ x: 0.1 }, randomRotateTime).to({ x: 1 }, randomRotateTime);
      Tween.get(confetti, { loop: true }).to({ angle: 360 + confetti.angle });
      Tween.get(confetti)
        .wait(i * 5)
        .call(() => {
          const direction = side === 'Left' ? 1 : -1;
          Tween.get(confetti)
            .to({
              x: Math.random() * (game.width / 2) * direction,
              y: -(game.height / 2) - (Math.random() * (game.height / 2)),
            }, 1250, Tween.Ease.cubicOut);
        })
        .wait(900)
        .to({ alpha: 0 }, 150);
    }
  }
  buildEndCard(win) {
    if (this.finished) return;
    this.finished = true;

    if (win) {
      this.buildConfetti('Left', 25);
      this.buildConfetti('Right', -25);
      Tween.get(this).wait(500).call(() => {
        this.buildConfetti('Left', 25);
        this.buildConfetti('Right', -25);
      });
      game.play('banner_game_won');
    } else {
      game.play('banner_lose');
    }
    this.endCard = new EndCard(win, this);
    this.addChild(this.endCard);
    this.addChild(this.confettiLeft);
    this.addChild(this.confettiRight);
  }
  initTrippyShader() {
    const fragShader = `
      varying vec2 vTextureCoord;
      varying vec4 vColor;
      uniform sampler2D uSampler;
      uniform float iTime;
      uniform float strong;
      vec2 computeUV( vec2 uv, float k, float kcube ){
          
          vec2 t = uv - .5;
          float r2 = t.x * t.x + t.y * t.y;
        float f = 0.;
          
          if( kcube == 0.0){
              f = 1. + r2 * k;
          }else{
              f = 1. + r2 * ( k + kcube * sqrt( r2 ) );
          }
          
          vec2 nUv = f * t + .5;
          nUv.y = 1. - nUv.y;
       
          return nUv;
      }

      void main(void) {
          
        vec2 uv = vTextureCoord;
        uv.y = 1. - uv.y;
          float k = 0.02 * sin( iTime * .9 ) / strong;
          float kcube = .5 * sin( iTime ) / strong;
          
          float offset = .1 * sin( iTime * .5 ) / strong;
          
          float red = texture2D( uSampler, computeUV( uv, k + offset, kcube ) ).r; 
          float green = texture2D( uSampler, computeUV( uv, k, kcube ) ).g; 
          float blue = texture2D( uSampler, computeUV( uv, k - offset, kcube ) ).b; 
          
          gl_FragColor = vec4( red, green,blue, 1. );
      }
    `;
    const uniforms = {
      iTime: 0,
      strong: 14,
    };
    this.uni = uniforms;
    Tween.get(uniforms, { loop: true }).to({ iTime: 125 }, 125000);
    this.waveUniform = uniforms;
    const shader = new Filter(undefined, fragShader, uniforms);
    this.filters = [shader];
  }
  shake(amplitude) {
    Tween.get(this.pivot)
      .to({ x: -amplitude }, 50)
      .to({ x: amplitude }, 100)
      .to({ x: -amplitude / 2 }, 30)
      .to({ x: amplitude / 2 }, 60)
      .to({ x: 0 }, 30);
  }
  onRotate() {
    this.background.x = game.width / 2;
    this.background.y = game.height / 2;
    this.background.scale.set(1.04 + 0.3 * game.wide)

    this.confettiLeft.y = game.height + 50;
    this.confettiRight.x = game.width;
    this.confettiRight.y = game.height + 50;
  }
}

export default Scene;