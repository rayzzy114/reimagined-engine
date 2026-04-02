import { Container, AnimatedSprite, Graphics, Texture, Color } from "pixi.js";
import { GAME_WIDTH, GAME_HEIGHT, PLAYER_X_RATIO, JUMP_HEIGHT, JUMP_DURATION, PLAYER_GROUND_Y_RATIO } from "./utils/constants";
import { getRunnerSpritesheet, type RunnerSkinId } from "./utils/assets";

export class Player {
  private readonly baseScale = 0.54;
  container: Container;
  shadow: Graphics;
  private runAnim: AnimatedSprite;
  private jumpAnim: AnimatedSprite;
  private hurtAnim: AnimatedSprite;
  private currentAnim: AnimatedSprite;
  private groundY: number;
  private jumping = false;
  private jumpProgress = 0;
  private invincible = false;
  private blinkTimer = 0;
  private landSquashTimer = 0;

  constructor() {
    this.container = new Container();
    this.groundY = GAME_HEIGHT * PLAYER_GROUND_Y_RATIO;

    // Ground shadow (rendered separately, stays on ground)
    this.shadow = new Graphics();
    this.shadow.ellipse(0, 0, 38, 10);
    this.shadow.fill({ color: 0x000000, alpha: 0.22 });
    this.shadow.x = GAME_WIDTH * PLAYER_X_RATIO;
    this.shadow.y = this.groundY + 4;

    const runnerSpritesheet = getRunnerSpritesheet();
    const runFrames = runnerSpritesheet.animations["run"];
    const jumpFrames = runnerSpritesheet.animations["jump"];
    const hurtFrames = runnerSpritesheet.animations["hurt"];

    this.runAnim = new AnimatedSprite(runFrames);
    this.runAnim.anchor.set(0.5, 1);
    this.runAnim.animationSpeed = 0.15;
    this.runAnim.play();

    this.jumpAnim = new AnimatedSprite(jumpFrames);
    this.jumpAnim.anchor.set(0.5, 1);
    this.jumpAnim.animationSpeed = 0.225;
    this.jumpAnim.loop = false;
    this.jumpAnim.visible = false;

    this.hurtAnim = new AnimatedSprite(hurtFrames);
    this.hurtAnim.anchor.set(0.5, 1);
    this.hurtAnim.animationSpeed = 0.30;
    this.hurtAnim.loop = false;
    this.hurtAnim.visible = false;

    this.container.addChild(this.runAnim);
    this.container.addChild(this.jumpAnim);
    this.container.addChild(this.hurtAnim);

    this.currentAnim = this.runAnim;

    this.setVisualScale(1, 1);
    this.container.x = GAME_WIDTH * PLAYER_X_RATIO;
    this.container.y = this.groundY;
  }

  private setVisualScale(scaleX: number, scaleY: number) {
    this.container.scale.set(this.baseScale * scaleX, this.baseScale * scaleY);
  }

  private applySkinTextures() {
    const spritesheet = getRunnerSpritesheet();
    this.runAnim.textures = spritesheet.animations["run"];
    this.jumpAnim.textures = spritesheet.animations["jump"];
    this.hurtAnim.textures = spritesheet.animations["hurt"];

    if (this.currentAnim === this.runAnim) {
      this.runAnim.gotoAndPlay(0);
    } else if (this.currentAnim === this.jumpAnim) {
      this.jumpAnim.gotoAndPlay(0);
    } else {
      this.hurtAnim.gotoAndPlay(0);
    }
  }

  private switchAnim(anim: AnimatedSprite) {
    if (this.currentAnim === anim) return;
    this.currentAnim.visible = false;
    this.currentAnim.stop();
    this.currentAnim.tint = 0xFFFFFF; // Reset tint on switch
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
        this.landSquashTimer = 0.12;
        this.switchAnim(this.runAnim);
      } else {
        this.container.y = this.groundY - JUMP_HEIGHT * Math.sin(Math.PI * this.jumpProgress);
        const jumpPhase = Math.sin(Math.PI * this.jumpProgress);
        const stretchX = 1 - jumpPhase * 0.12;
        const stretchY = 1 + jumpPhase * 0.15;
        this.setVisualScale(stretchX, stretchY);
      }
    }

    if (!this.jumping) {
      if (this.landSquashTimer > 0) {
        this.landSquashTimer = Math.max(0, this.landSquashTimer - dt);
        const progress = this.landSquashTimer / 0.12;
        const squashX = 1 + progress * 0.12;
        const squashY = 1 - progress * 0.1;
        this.setVisualScale(squashX, squashY);
      } else {
        this.setVisualScale(1, 1);
      }
    }

    // Update shadow: shrink and fade as player goes higher
    const heightRatio = (this.groundY - this.container.y) / JUMP_HEIGHT;
    const shadowScale = 1 - heightRatio * 0.4;
    this.shadow.scale.set(shadowScale, shadowScale * 0.8);
    this.shadow.alpha = 0.22 * (1 - heightRatio * 0.6);

    if (this.invincible) {
      this.blinkTimer += dt;
      this.currentAnim.tint = Math.sin(this.blinkTimer * 30) > 0 ? 0xFF2244 : 0xFFFFFF;
    }
  }

  setInvincible(value: boolean) {
    this.invincible = value;
    if (!value) {
      this.currentAnim.tint = 0xFFFFFF;
      this.blinkTimer = 0;
    }
  }

  isOnGround(): boolean {
    return !this.jumping;
  }

  getBounds() {
    // Reference hitbox: scale {X: 0.25, Y: 0.7}, offset {X: 0, Y: -0.15}
    const bounds = this.container.getBounds();
    const w = bounds.width * 0.25;
    const h = bounds.height * 0.7;
    const centerX = bounds.x + bounds.width / 2;
    const centerY = bounds.y + bounds.height / 2 + (-0.15 * bounds.height);

    return {
      x: centerX - w / 2,
      y: centerY - h / 2,
      width: w,
      height: h,
    };
  }

  getDebugMeta() {
    return {
      jumping: this.jumping,
      scaleX: Number(this.container.scale.x.toFixed(3)),
      scaleY: Number(this.container.scale.y.toFixed(3)),
      y: Number(this.container.y.toFixed(2)),
    };
  }
}
