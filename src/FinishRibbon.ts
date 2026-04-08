import { Container, Graphics } from "pixi.js";
import { GAME_HEIGHT, GAME_WIDTH, PLAYER_GROUND_Y_RATIO } from "./utils/constants";

interface LineGroup {
  container: Container;
  cells: Graphics[];
  width: number;
  seed: number;
}

interface BrokenState {
  vx: number;
  vy: number;
  rotationSpeed: number;
}

export class FinishRibbon {
  backContainer: Container;
  frontContainer: Container;
  private leftPost: Graphics;
  private rightPost: Graphics;
  private intactLine: LineGroup;
  private leftBrokenLine: LineGroup;
  private rightBrokenLine: LineGroup;
  private active = false;
  private broken = false;
  private breakTimer = 0;
  private waveTime = 0;
  private ribbonX = GAME_WIDTH + 200;
  private readonly groundY = GAME_HEIGHT * PLAYER_GROUND_Y_RATIO;
  private readonly bannerY = this.groundY - 162;
  private readonly lineThickness = 16;
  private readonly segmentSize = 12;
  private readonly intactSegmentCount = 20;
  private readonly brokenSegmentCount = 10;
  private readonly postOffsetX = 128;
  private readonly postTopY = this.bannerY - 96;
  private readonly ribbonAngle = -0.11;
  private readonly leftPostYOffset = 8;
  private readonly rightPostYOffset = -4;
  private readonly breakDuration = 0.46;
  private leftBrokenState: BrokenState = { vx: -240, vy: -126, rotationSpeed: -2.5 };
  private rightBrokenState: BrokenState = { vx: 225, vy: -116, rotationSpeed: 2.3 };

  constructor() {
    this.backContainer = new Container();
    this.frontContainer = new Container();
    this.backContainer.visible = false;
    this.frontContainer.visible = false;

    this.leftPost = this.createPost();
    this.rightPost = this.createPost();
    this.intactLine = this.createLineGroup(this.intactSegmentCount, 0, false);
    this.leftBrokenLine = this.createLineGroup(this.brokenSegmentCount, 1, false);
    this.rightBrokenLine = this.createLineGroup(this.brokenSegmentCount, 2, false);

    this.backContainer.addChild(this.leftPost, this.rightPost);
    this.frontContainer.addChild(this.intactLine.container, this.leftBrokenLine.container, this.rightBrokenLine.container);

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

  private createLineGroup(segmentCount: number, seedOffset: number, visible: boolean): LineGroup {
    const container = new Container();
    const cells: Graphics[] = [];

    for (let index = 0; index < segmentCount; index++) {
      const cell = new Graphics();
      const color = (index + seedOffset) % 2 === 0 ? 0x111111 : 0xf4f4f4;
      cell.roundRect(-this.segmentSize / 2, -this.lineThickness / 2, this.segmentSize, this.lineThickness, 2.5);
      cell.fill({ color });
      cells.push(cell);
      container.addChild(cell);
    }

    container.visible = visible;

    return {
      container,
      cells,
      width: segmentCount * this.segmentSize,
      seed: Math.random() * Math.PI * 2 + seedOffset,
    };
  }

  private layoutLineGroup(group: LineGroup, curveStrength: number, wobbleStrength: number) {
    const count = group.cells.length;
    const totalWidth = group.width;
    const halfWidth = totalWidth / 2;

    for (let index = 0; index < count; index++) {
      const progress = count <= 1 ? 0.5 : index / (count - 1);
      const envelope = Math.sin(progress * Math.PI);
      const curve = envelope * curveStrength;
      const wobble = Math.sin(this.waveTime * 2.15 + progress * Math.PI * 2.3 + group.seed) * wobbleStrength * envelope;
      const cell = group.cells[index];

      cell.x = -halfWidth + this.segmentSize / 2 + index * this.segmentSize;
      cell.y = curve + wobble;
      cell.rotation = Math.sin((progress - 0.5) * Math.PI) * 0.02;
    }
  }

  private updateBrokenGroup(group: LineGroup, state: BrokenState, dt: number) {
    group.container.x += state.vx * dt;
    group.container.y += state.vy * dt;
    group.container.rotation += state.rotationSpeed * dt;
    state.vy += 460 * dt;
  }

  private layout() {
    const postBaseY = this.postTopY;

    this.leftPost.position.set(-this.postOffsetX, postBaseY + this.leftPostYOffset);
    this.rightPost.position.set(this.postOffsetX, postBaseY + this.rightPostYOffset);

    this.intactLine.container.position.set(0, this.bannerY);
    this.intactLine.container.rotation = this.ribbonAngle;
    this.leftBrokenLine.container.position.set(-this.leftBrokenLine.width / 2, this.bannerY);
    this.leftBrokenLine.container.rotation = this.ribbonAngle - 0.02;
    this.rightBrokenLine.container.position.set(this.rightBrokenLine.width / 2, this.bannerY);
    this.rightBrokenLine.container.rotation = this.ribbonAngle + 0.02;
  }

  show() {
    this.active = true;
    this.backContainer.visible = true;
    this.frontContainer.visible = true;

    if (this.broken && this.breakTimer === 0) {
      this.backContainer.visible = false;
      this.frontContainer.visible = false;
      return;
    }

    if (!this.broken) {
      this.intactLine.container.visible = true;
      this.leftBrokenLine.container.visible = false;
      this.rightBrokenLine.container.visible = false;
      return;
    }

    this.intactLine.container.visible = false;
    this.leftBrokenLine.container.visible = true;
    this.rightBrokenLine.container.visible = true;
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
    this.intactLine.container.visible = false;
    this.leftBrokenLine.container.visible = true;
    this.rightBrokenLine.container.visible = true;

    const impactOffset = Math.max(-18, Math.min(18, playerY - this.bannerY)) * 0.08;
    this.leftBrokenState = { vx: -240, vy: -126 - impactOffset * 8, rotationSpeed: -2.5 };
    this.rightBrokenState = { vx: 225, vy: -116 - impactOffset * 7, rotationSpeed: 2.3 };

    this.leftBrokenLine.container.x = -this.leftBrokenLine.width / 2;
    this.rightBrokenLine.container.x = this.rightBrokenLine.width / 2;
    this.leftBrokenLine.container.y = this.bannerY + impactOffset;
    this.rightBrokenLine.container.y = this.bannerY + impactOffset;
    this.leftBrokenLine.container.rotation = this.ribbonAngle - 0.05;
    this.rightBrokenLine.container.rotation = this.ribbonAngle + 0.05;
    this.leftBrokenLine.container.alpha = 1;
    this.rightBrokenLine.container.alpha = 1;

    this.layoutLineGroup(this.leftBrokenLine, 0.7, 0.18);
    this.layoutLineGroup(this.rightBrokenLine, 0.7, 0.18);
  }

  update(dt: number) {
    if (!this.active) return;

    this.waveTime += dt;

    if (!this.broken) {
      this.layoutLineGroup(this.intactLine, 0.9, 0.16);
      this.intactLine.container.rotation = this.ribbonAngle + Math.sin(this.waveTime * 0.55) * 0.006;
      return;
    }

    this.breakTimer = Math.max(0, this.breakTimer - dt);
    const fade = this.breakTimer / this.breakDuration;

    this.updateBrokenGroup(this.leftBrokenLine, this.leftBrokenState, dt);
    this.updateBrokenGroup(this.rightBrokenLine, this.rightBrokenState, dt);

    this.leftBrokenLine.container.alpha = fade;
    this.rightBrokenLine.container.alpha = fade;

    if (this.breakTimer === 0) {
      this.backContainer.visible = false;
      this.frontContainer.visible = false;
    }
  }

  getDebugMeta() {
    return {
      visible: this.backContainer.visible || this.frontContainer.visible,
      hasPosts: true,
      bannerHeight: this.lineThickness,
      bannerY: this.bannerY,
      groundY: this.groundY,
      x: this.frontContainer.x,
      broken: this.broken,
      waveTime: Number(this.waveTime.toFixed(2)),
    };
  }
}
