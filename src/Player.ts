import { Container, AnimatedSprite, Texture } from "pixi.js";
import { GAME_WIDTH, GAME_HEIGHT, PLAYER_X_RATIO, JUMP_HEIGHT, JUMP_DURATION } from "./utils/constants";
import { runnerSpritesheet } from "./utils/assets";

export class Player {
  container: Container;
  private runAnim: AnimatedSprite;
  private jumpAnim: AnimatedSprite;
  private hurtAnim: AnimatedSprite;
  private currentAnim: AnimatedSprite;
  private groundY: number;
  private jumping = false;
  private jumpProgress = 0;
  private invincible = false;
  private blinkTimer = 0;

  constructor() {
    this.container = new Container();
    this.groundY = GAME_HEIGHT * 0.72;

    const runFrames = runnerSpritesheet.animations["run"];
    const jumpFrames = runnerSpritesheet.animations["jump"];
    const hurtFrames = runnerSpritesheet.animations["hurt"];

    this.runAnim = new AnimatedSprite(runFrames);
    this.runAnim.anchor.set(0.5, 1);
    this.runAnim.animationSpeed = 0.2;
    this.runAnim.play();

    this.jumpAnim = new AnimatedSprite(jumpFrames);
    this.jumpAnim.anchor.set(0.5, 1);
    this.jumpAnim.animationSpeed = 0.15;
    this.jumpAnim.loop = false;
    this.jumpAnim.visible = false;

    this.hurtAnim = new AnimatedSprite(hurtFrames);
    this.hurtAnim.anchor.set(0.5, 1);
    this.hurtAnim.animationSpeed = 0.15;
    this.hurtAnim.loop = false;
    this.hurtAnim.visible = false;

    this.container.addChild(this.runAnim);
    this.container.addChild(this.jumpAnim);
    this.container.addChild(this.hurtAnim);

    this.currentAnim = this.runAnim;

    this.container.x = GAME_WIDTH * PLAYER_X_RATIO;
    this.container.y = this.groundY;
  }

  private switchAnim(anim: AnimatedSprite) {
    if (this.currentAnim === anim) return;
    this.currentAnim.visible = false;
    this.currentAnim.stop();
    this.currentAnim = anim;
    this.currentAnim.visible = true;
    this.currentAnim.gotoAndPlay(0);
  }

  jump() {
    if (this.jumping) return;
    this.jumping = true;
    this.jumpProgress = 0;
    this.switchAnim(this.jumpAnim);
  }

  playHurt() {
    this.switchAnim(this.hurtAnim);
    this.hurtAnim.onComplete = () => {
      if (this.jumping) {
        this.switchAnim(this.jumpAnim);
      } else {
        this.switchAnim(this.runAnim);
      }
    };
  }

  update(dt: number) {
    if (this.jumping) {
      this.jumpProgress += (dt * 1000) / JUMP_DURATION;
      if (this.jumpProgress >= 1) {
        this.jumpProgress = 0;
        this.jumping = false;
        this.container.y = this.groundY;
        this.switchAnim(this.runAnim);
      } else {
        this.container.y = this.groundY - JUMP_HEIGHT * Math.sin(Math.PI * this.jumpProgress);
      }
    }

    if (this.invincible) {
      this.blinkTimer += dt;
      this.currentAnim.alpha = Math.sin(this.blinkTimer * 20) > 0 ? 1 : 0.3;
    }
  }

  setInvincible(value: boolean) {
    this.invincible = value;
    if (!value) {
      this.currentAnim.alpha = 1;
      this.blinkTimer = 0;
    }
  }

  isOnGround(): boolean {
    return !this.jumping;
  }

  getBounds() {
    const anim = this.currentAnim;
    const w = anim.width * 0.6;
    const h = anim.height * 0.8;
    return {
      x: this.container.x - w / 2,
      y: this.container.y - h,
      width: w,
      height: h,
    };
  }
}
