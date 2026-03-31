import { Container, Graphics } from "pixi.js";
import { GAME_HEIGHT, GAME_WIDTH, PLAYER_GROUND_Y_RATIO } from "./utils/constants";

interface BrokenTapeState {
  vx: number;
  vy: number;
  rotationSpeed: number;
}

export class FinishRibbon {
  backContainer: Container;
  frontContainer: Container;
  private leftPost: Graphics;
  private rightPost: Graphics;
  private intactRibbon: Container;
  private leftBrokenRibbon: Container;
  private rightBrokenRibbon: Container;
  private active = false;
  private broken = false;
  private breakTimer = 0;
  private ribbonX = GAME_WIDTH + 200;
  private readonly groundY = GAME_HEIGHT * PLAYER_GROUND_Y_RATIO;
  private readonly torsoOffset = 162;
  private readonly bannerY = this.groundY - this.torsoOffset;
  private readonly bannerWidth = 244;
  private readonly bannerHeight = 12;
  private readonly ribbonAngle = -0.11;
  private readonly postOffsetX = 128;
  private readonly postTopY = this.bannerY - 96;
  private readonly breakDuration = 0.42;
  private leftBrokenState: BrokenTapeState = { vx: -240, vy: -126, rotationSpeed: -2.5 };
  private rightBrokenState: BrokenTapeState = { vx: 225, vy: -116, rotationSpeed: 2.3 };

  constructor() {
    this.backContainer = new Container();
    this.frontContainer = new Container();
    this.backContainer.visible = false;
    this.frontContainer.visible = false;

    this.leftPost = this.createPost();
    this.rightPost = this.createPost();
    this.intactRibbon = this.createRibbon("full");
    this.leftBrokenRibbon = this.createRibbon("left");
    this.rightBrokenRibbon = this.createRibbon("right");

    this.leftBrokenRibbon.visible = false;
    this.rightBrokenRibbon.visible = false;

    this.backContainer.addChild(this.leftPost);
    this.backContainer.addChild(this.rightPost);
    this.frontContainer.addChild(this.intactRibbon);
    this.frontContainer.addChild(this.leftBrokenRibbon);
    this.frontContainer.addChild(this.rightBrokenRibbon);

    this.layout();
    this.setPosition(this.ribbonX);
  }

  private createPost() {
    const post = new Graphics();
    const postHeight = this.groundY - this.postTopY + 14;

    post.roundRect(-5, 0, 10, postHeight, 4);
    post.fill({ color: 0xa98f98 });
    post.stroke({ color: 0x7e6872, width: 1.5, alpha: 0.8 });

    post.roundRect(-7, -8, 14, 12, 4);
    post.fill({ color: 0xb7a1aa, alpha: 0.95 });

    post.roundRect(-7, postHeight - 18, 14, 18, 5);
    post.fill({ color: 0x8f7781, alpha: 0.9 });

    return post;
  }

  private createRibbon(mode: "full" | "left" | "right") {
    const width = mode === "full" ? this.bannerWidth : this.bannerWidth / 2;
    const segment = new Container();
    const body = new Graphics();
    const rope = new Graphics();
    const left = mode === "full" ? -width / 2 : mode === "right" ? 0 : -width;
    const checkerWidth = 12;
    const ropeTopY = -this.bannerHeight / 2 - 2;
    const ropeBottomY = this.bannerHeight / 2 + 2;

    for (let index = 0; index < Math.ceil(width / checkerWidth); index++) {
      const cellX = left + index * checkerWidth;
      body.rect(cellX, -this.bannerHeight / 2, checkerWidth, this.bannerHeight);
      body.fill({ color: index % 2 === 0 ? 0x141414 : 0xf7f4ec });
    }

    body.roundRect(left, -this.bannerHeight / 2, width, this.bannerHeight, 4);
    body.stroke({ color: 0xdbc9b4, width: 1.2, alpha: 0.9 });

    rope.moveTo(left, ropeTopY);
    rope.lineTo(left + width, ropeTopY);
    rope.stroke({ color: 0xcba17a, width: 1.9 });
    rope.moveTo(left, ropeBottomY);
    rope.lineTo(left + width, ropeBottomY);
    rope.stroke({ color: 0xcba17a, width: 1.9 });

    for (let x = 0; x <= width; x += 10) {
      const worldX = left + x;
      rope.circle(worldX, ropeTopY, 1.5);
      rope.fill({ color: 0xe7c4a2, alpha: 0.95 });
      rope.circle(worldX, ropeBottomY, 1.5);
      rope.fill({ color: 0xe7c4a2, alpha: 0.95 });
    }

    segment.addChild(body);
    segment.addChild(rope);
    return segment;
  }

  private layout() {
    const postBaseY = this.postTopY;

    this.leftPost.position.set(-this.postOffsetX, postBaseY);
    this.rightPost.position.set(this.postOffsetX, postBaseY);
    this.intactRibbon.position.set(0, this.bannerY);
    this.intactRibbon.rotation = this.ribbonAngle;
  }

  show() {
    this.active = true;
    this.backContainer.visible = true;
    this.frontContainer.visible = true;
  }

  setPosition(x: number) {
    this.ribbonX = x;
    this.backContainer.x = x;
    this.frontContainer.x = x;
  }

  breakRibbon(playerY: number) {
    if (this.broken) return;

    this.show();
    this.broken = true;
    this.breakTimer = this.breakDuration;
    this.intactRibbon.visible = false;
    this.leftBrokenState = { vx: -240, vy: -126, rotationSpeed: -2.5 };
    this.rightBrokenState = { vx: 225, vy: -116, rotationSpeed: 2.3 };

    const brokenY = Math.max(this.bannerY - 18, Math.min(this.bannerY + 18, playerY - 8));
    this.leftBrokenRibbon.visible = true;
    this.rightBrokenRibbon.visible = true;
    this.leftBrokenRibbon.position.set(-14, brokenY);
    this.rightBrokenRibbon.position.set(14, brokenY);
    this.leftBrokenRibbon.rotation = this.ribbonAngle - 0.06;
    this.rightBrokenRibbon.rotation = this.ribbonAngle + 0.08;
    this.leftBrokenRibbon.alpha = 1;
    this.rightBrokenRibbon.alpha = 1;
  }

  update(dt: number) {
    if (!this.active || !this.broken) return;

    this.breakTimer = Math.max(0, this.breakTimer - dt);
    const fade = this.breakTimer / this.breakDuration;

    this.leftBrokenRibbon.x += this.leftBrokenState.vx * dt;
    this.leftBrokenRibbon.y += this.leftBrokenState.vy * dt;
    this.leftBrokenRibbon.rotation += this.leftBrokenState.rotationSpeed * dt;
    this.leftBrokenState.vy += 460 * dt;
    this.leftBrokenRibbon.alpha = fade;

    this.rightBrokenRibbon.x += this.rightBrokenState.vx * dt;
    this.rightBrokenRibbon.y += this.rightBrokenState.vy * dt;
    this.rightBrokenRibbon.rotation += this.rightBrokenState.rotationSpeed * dt;
    this.rightBrokenState.vy += 460 * dt;
    this.rightBrokenRibbon.alpha = fade;

    if (this.breakTimer === 0) {
      this.leftBrokenRibbon.visible = false;
      this.rightBrokenRibbon.visible = false;
      this.frontContainer.visible = false;
    }
  }

  getDebugMeta() {
    return {
      visible: this.backContainer.visible || this.frontContainer.visible,
      hasPosts: true,
      bannerHeight: this.bannerHeight,
      bannerY: this.bannerY,
      groundY: this.groundY,
      x: this.frontContainer.x,
      broken: this.broken,
    };
  }
}
