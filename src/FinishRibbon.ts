import { Container, Graphics } from "pixi.js";
import { GAME_HEIGHT, GAME_WIDTH, PLAYER_GROUND_Y_RATIO } from "./utils/constants";

interface BrokenTapeState {
  vx: number;
  vy: number;
  rotationSpeed: number;
}

export class FinishRibbon {
  container: Container;
  private intactRibbon: Container;
  private leftBrokenRibbon: Container;
  private rightBrokenRibbon: Container;
  private active = false;
  private broken = false;
  private ribbonX = GAME_WIDTH + 200;
  private groundY = GAME_HEIGHT * PLAYER_GROUND_Y_RATIO;
  private readonly torsoOffset = 164;
  private readonly bannerY = this.groundY - this.torsoOffset;
  private readonly bannerWidth = 248;
  private readonly bannerHeight = 14;
  private readonly ribbonAngle = -0.17;
  private leftBrokenState: BrokenTapeState = { vx: -180, vy: -140, rotationSpeed: -2.4 };
  private rightBrokenState: BrokenTapeState = { vx: 180, vy: -120, rotationSpeed: 2.1 };

  constructor() {
    this.container = new Container();
    this.container.visible = false;

    this.intactRibbon = this.createRibbon("full");
    this.leftBrokenRibbon = this.createRibbon("left");
    this.rightBrokenRibbon = this.createRibbon("right");

    this.leftBrokenRibbon.visible = false;
    this.rightBrokenRibbon.visible = false;

    this.container.addChild(this.intactRibbon);
    this.container.addChild(this.leftBrokenRibbon);
    this.container.addChild(this.rightBrokenRibbon);

    this.layoutRibbon();
    this.setPosition(this.ribbonX);
  }

  private createRibbon(mode: "full" | "left" | "right") {
    const width = mode === "full" ? this.bannerWidth : this.bannerWidth / 2;
    const segment = new Container();
    const body = new Graphics();
    const rope = new Graphics();

    const left = mode === "right" ? 0 : -width;
    const checkerWidth = 12;
    const ropeTopY = -this.bannerHeight / 2 - 2;
    const ropeBottomY = this.bannerHeight / 2 + 2;

    for (let index = 0; index < Math.ceil(width / checkerWidth); index++) {
      const cellX = left + index * checkerWidth;
      body.rect(cellX, -this.bannerHeight / 2, checkerWidth, this.bannerHeight);
      body.fill({ color: index % 2 === 0 ? 0x151515 : 0xf8f5ee });
    }

    body.roundRect(left, -this.bannerHeight / 2, width, this.bannerHeight, 6);
    body.stroke({ color: 0xd7c2ab, width: 1.4, alpha: 0.92 });

    rope.moveTo(left, ropeTopY);
    rope.lineTo(left + width, ropeTopY);
    rope.stroke({ color: 0xcba17a, width: 2.2 });
    rope.moveTo(left, ropeBottomY);
    rope.lineTo(left + width, ropeBottomY);
    rope.stroke({ color: 0xcba17a, width: 2.2 });

    for (let x = 0; x <= width; x += 10) {
      const worldX = left + x;
      rope.circle(worldX, ropeTopY, 1.8);
      rope.fill({ color: 0xe2bb95, alpha: 0.95 });
      rope.circle(worldX, ropeBottomY, 1.8);
      rope.fill({ color: 0xe2bb95, alpha: 0.95 });

      if (x < width) {
        const nextX = Math.min(left + width, worldX + 6);
        rope.moveTo(worldX, ropeTopY - 1.2);
        rope.lineTo(nextX, ropeTopY + 1.2);
        rope.stroke({ color: 0xf3d7bc, width: 0.9, alpha: 0.7 });
        rope.moveTo(worldX, ropeBottomY - 1.2);
        rope.lineTo(nextX, ropeBottomY + 1.2);
        rope.stroke({ color: 0xf3d7bc, width: 0.9, alpha: 0.7 });
      }
    }

    segment.addChild(body);
    segment.addChild(rope);
    return segment;
  }

  private layoutRibbon() {
    this.intactRibbon.position.set(0, this.bannerY);
    this.intactRibbon.rotation = this.ribbonAngle;
  }

  show() {
    this.active = true;
    this.container.visible = true;
  }

  setPosition(x: number) {
    this.ribbonX = x;
    this.container.x = x;
  }

  breakRibbon(playerY: number) {
    if (this.broken) return;

    this.show();
    this.broken = true;
    this.intactRibbon.visible = false;

    const brokenY = Math.max(this.bannerY - 10, Math.min(this.bannerY + 10, playerY));
    this.leftBrokenRibbon.visible = true;
    this.rightBrokenRibbon.visible = true;
    this.leftBrokenRibbon.position.set(-8, brokenY);
    this.rightBrokenRibbon.position.set(8, brokenY);
    this.leftBrokenRibbon.rotation = this.ribbonAngle - 0.05;
    this.rightBrokenRibbon.rotation = this.ribbonAngle + 0.08;
  }

  update(dt: number) {
    if (!this.active || !this.broken) return;

    this.leftBrokenRibbon.x += this.leftBrokenState.vx * dt;
    this.leftBrokenRibbon.y += this.leftBrokenState.vy * dt;
    this.leftBrokenRibbon.rotation += this.leftBrokenState.rotationSpeed * dt;
    this.leftBrokenState.vy += 520 * dt;

    this.rightBrokenRibbon.x += this.rightBrokenState.vx * dt;
    this.rightBrokenRibbon.y += this.rightBrokenState.vy * dt;
    this.rightBrokenRibbon.rotation += this.rightBrokenState.rotationSpeed * dt;
    this.rightBrokenState.vy += 520 * dt;
  }

  getDebugMeta() {
    return {
      visible: this.container.visible,
      hasPosts: false,
      bannerHeight: this.bannerHeight,
      bannerY: this.bannerY,
      groundY: this.groundY,
      x: this.container.x,
      broken: this.broken,
    };
  }
}
