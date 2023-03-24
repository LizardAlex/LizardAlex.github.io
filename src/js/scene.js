import {
  Container,
  Sprite,
  Filter,
} from 'pixi.js';

import game from './utils/game';
import GameVisual from './gameVisual';
import UI from './UI';
import Tween from './utils/tweenjs';

class Scene extends Container {
  constructor() {
  	super();
    
   // game.play('music', 0.7, true);
    this.background = new Sprite(game.loadImage("background"));
    this.background.anchor.set(0.5);
    this.addChild(this.background);

    this.gameVisual = new GameVisual(9, 9, this);
    this.addChild(this.gameVisual);

    this.UI = new UI(this);
    this.addChild(this.UI);

    this.initTrippyShader();

    this.on("onRotate", () => { this.onRotate() });
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
  onRotate() {
    this.background.x = game.width / 2;
    this.background.y = game.height / 2;
    this.background.scale.set(1 + 0.3 * game.wide)
  }
}

export default Scene;