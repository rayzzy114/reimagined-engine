import { Container, AnimatedSprite, Graphics, Texture } from "pixi.js";
import { GAME_WIDTH, GAME_HEIGHT, PLAYER_X_RATIO, JUMP_HEIGHT, JUMP_DURATION, PLAYER_GROUND_Y_RATIO } from "./utils/constants";
import { getRunnerSpritesheet } from "./utils/assets";
import { ParticleSystem } from "./ParticleSystem";

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
  private anticipationTimer = 0;
  private readonly anticipationDuration = 0.08;
  private particles: ParticleSystem;

  constructor(particles: ParticleSystem) {
    this.particles = particles;
    this.container = new Container();
    this.groundY = GAME_HEIGHT * PLAYER_GROUND_Y_RATIO;

    // Ground shadow (rendered separately, stays on ground)
    this.shadow = new Graphics();
    this.shadow.ellipse(0, 0, 36, 9);
    this.shadow.fill({ color: 0x000000, alpha: 0.22 });
    this.shadow.x = GAME_WIDTH * PLAYER_X_RATIO;
    this.shadow.y = this.groundY + 2;

    const runnerSpritesheet = getRunnerSpritesheet();
    const runFrames = runnerSpritesheet.animations["run"];
    const jumpFrames = runnerSpritesheet.animations["jump"];
    const hurtFrames = runnerSpritesheet.animations["hurt"];

    this.runAnim = new AnimatedSprite(runFrames);
    this.runAnim.anchor.set(0.5, 1);
    this.runAnim.animationSpeed = 0.15;
    this.runAnim.play();
    this.bindFrameOffsets(this.runAnim);
    this.updateFrameOffset(this.runAnim);

    this.jumpAnim = new AnimatedSprite(jumpFrames);
    this.jumpAnim.anchor.set(0.5, 1);
    this.jumpAnim.animationSpeed = 0.225;
    this.jumpAnim.loop = false;
    this.jumpAnim.visible = false;
    this.bindFrameOffsets(this.jumpAnim);
    this.updateFrameOffset(this.jumpAnim);

    this.hurtAnim = new AnimatedSprite(hurtFrames);
    this.hurtAnim.anchor.set(0.5, 1);
    this.hurtAnim.animationSpeed = 0.30;
    this.hurtAnim.loop = false;
    this.hurtAnim.visible = false;
    this.bindFrameOffsets(this.hurtAnim);
    this.updateFrameOffset(this.hurtAnim);

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

  private bindFrameOffsets(anim: AnimatedSprite) {
    anim.onFrameChange = () => {
      this.updateFrameOffset(anim);
    };
  }

  private updateFrameOffset(anim: AnimatedSprite) {
    const texture = anim.textures[anim.currentFrame] as Texture | undefined;
    if (!texture) return;

    const origHeight = texture.orig?.height ?? texture.height;
    const trimY = texture.trim?.y ?? 0;
    const trimHeight = texture.trim?.height ?? texture.height;
    const bottomGap = Math.max(0, origHeight - (trimY + trimHeight));
    anim.y = bottomGap;
  }

  private switchAnim(anim: AnimatedSprite) {
    if (this.currentAnim === anim) return;
    this.currentAnim.visible = false;
    this.currentAnim.stop();
    this.currentAnim.tint = 0xFFFFFF; // Reset tint on switch
    this.currentAnim = anim;
    this.currentAnim.visible = true;
    this.currentAnim.gotoAndPlay(0);
    this.updateFrameOffset(this.currentAnim);
  }

  jump() {
    if (this.jumping) return;

    // Start anticipation animation before jumping
    this.anticipationTimer = this.anticipationDuration;
    this.setVisualScale(1.08, 0.92);
  }

  playHurt() {
    this.anticipationTimer = 0;
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
    // Handle anticipation timer - trigger jump when it expires
    if (this.anticipationTimer > 0) {
      this.anticipationTimer -= dt;
      if (this.anticipationTimer <= 0) {
        this.anticipationTimer = 0;
        if (!this.jumping) {
          this.jumping = true;
          this.jumpProgress = 0;
          this.switchAnim(this.jumpAnim);
        }
      }
    }

    if (this.jumping) {
      this.jumpProgress += (dt * 1000) / JUMP_DURATION;
      if (this.jumpProgress >= 1) {
        this.jumpProgress = 0;
        this.jumping = false;
        this.container.y = this.groundY;
        this.landSquashTimer = 0.12;
        this.particles.burstHit(this.container.x, this.groundY);
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
