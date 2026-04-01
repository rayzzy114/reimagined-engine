import { Assets, Container, Graphics, Sprite, Texture } from "pixi.js";
import { GAME_WIDTH, GAME_HEIGHT, BASE_SPEED, viewBounds } from "./utils/constants";

interface SidewalkDecor {
  sprite: Container;
  speed: number;
  lane: "rear" | "front";
}

export class Background {
  container: Container;
  private bgSprite: Sprite | null = null;
  private stripeLayer: Container;
  private stripeMask: Graphics;
  private stripes: Graphics[] = [];
  private stripeOffset = 0;
  private readonly stripeSpeed = 280;
  private readonly stripeSpacing = 170;
  private readonly stripeRotation = 0;

  private rearDecorLayer: Container;
  private frontDecorLayer: Container;
  private decors: SidewalkDecor[] = [];
  private rearSpawnTimer = 0;
  private frontSpawnTimer = 0;
  private elapsed = 0;

  constructor() {
    this.container = new Container();

    const bgTex = Assets.get("bgMain") as Texture;
    if (bgTex) {
      this.bgSprite = new Sprite(bgTex);
      this.layoutBg();
      this.container.addChild(this.bgSprite);
    }

    this.rearDecorLayer = new Container();
    this.container.addChild(this.rearDecorLayer);

    this.stripeLayer = new Container();
    this.stripeMask = new Graphics();
    this.container.addChild(this.stripeLayer);
    this.container.addChild(this.stripeMask);

    this.frontDecorLayer = new Container();
    this.container.addChild(this.frontDecorLayer);

    this.rebuildStripes();

    // Seed initial decorations so sidewalk isn't empty at start
    this.seedInitialDecor();
  }

  onResize() {
    this.layoutBg();
    this.rebuildStripes();
    this.rebuildDecor();
  }

  private layoutBg() {
    if (!this.bgSprite) return;
    const bgTex = this.bgSprite.texture;
    // Scale bg to cover the full visible height, then center horizontally
    const scaleH = Math.max(viewBounds.height, GAME_HEIGHT) / bgTex.height;
    const scaledWidth = bgTex.width * scaleH;
    // Center on the visible area
    const visibleCenterX = (viewBounds.left + viewBounds.right) / 2;
    this.bgSprite.x = visibleCenterX - scaledWidth / 2;
    this.bgSprite.y = viewBounds.top;
    this.bgSprite.width = scaledWidth;
    this.bgSprite.height = Math.max(viewBounds.height, GAME_HEIGHT);
  }

  private rebuildStripes() {
    // Clear old stripes
    for (const s of this.stripes) {
      this.stripeLayer.removeChild(s);
      s.destroy();
    }
    this.stripes = [];

    // Rebuild mask to cover full visible width
    this.stripeMask.clear();
    this.stripeMask.roundRect(
      viewBounds.left - 20,
      GAME_HEIGHT * 0.56,
      viewBounds.width + 40,
      GAME_HEIGHT * 0.22,
      18
    );
    this.stripeMask.fill({ color: 0xffffff });
    this.stripeLayer.mask = this.stripeMask;

    // Create enough stripes to cover the full visible width
    const stripeCount = Math.ceil(viewBounds.width / this.stripeSpacing) + 3;
    for (let index = 0; index < stripeCount; index++) {
      const stripe = new Graphics();
      stripe.roundRect(-84, -8, 168, 16, 8);
      stripe.fill({ color: 0xffffff, alpha: 0.16 });
      stripe.rotation = this.stripeRotation;
      stripe.y = GAME_HEIGHT * 0.69;
      stripe.x = index * this.stripeSpacing;
      this.stripeLayer.addChild(stripe);
      this.stripes.push(stripe);
    }
    this.layoutStripes();
  }

  update(dt: number) {
    this.elapsed += dt;
    if (this.bgSprite) {
      // Subtle parallax sway — recalculate base position each frame
      const bgTex = this.bgSprite.texture;
      const scaleH = Math.max(viewBounds.height, GAME_HEIGHT) / bgTex.height;
      const scaledWidth = bgTex.width * scaleH;
      const visibleCenterX = (viewBounds.left + viewBounds.right) / 2;
      this.bgSprite.x = visibleCenterX - scaledWidth / 2 + Math.sin(this.elapsed * 0.2) * 6;
    }

    this.stripeOffset = (this.stripeOffset + dt * this.stripeSpeed) % this.stripeSpacing;
    this.layoutStripes();

    this.updateDecor(dt);
  }

  getDebugMeta() {
    return {
      stripeOffset: Number(this.stripeOffset.toFixed(2)),
      stripeCount: this.stripes.length,
      stripeRotation: this.stripeRotation,
    };
  }

  private layoutStripes() {
    // Move one continuous stripe belt instead of repositioning each stripe independently.
    this.stripeLayer.x = viewBounds.left - this.stripeSpacing * 2 - this.stripeOffset;
  }

  private seedInitialDecor() {
    const rearStartX = viewBounds.left + 120;
    const rearEndX = viewBounds.right - 120;
    const frontStartX = viewBounds.left + 90;
    const frontEndX = viewBounds.right - 90;

    for (let x = rearStartX; x <= rearEndX; x += 240) {
      this.spawnDecor("rear", x);
    }

    for (let x = frontStartX; x <= frontEndX; x += 180) {
      this.spawnDecor("front", x);
    }
  }

  private rebuildDecor() {
    for (const decor of this.decors) {
      (decor.lane === "rear" ? this.rearDecorLayer : this.frontDecorLayer).removeChild(decor.sprite);
      decor.sprite.destroy();
    }
    this.decors = [];
    this.rearSpawnTimer = 0;
    this.frontSpawnTimer = 0;
    this.seedInitialDecor();
  }

  private spawnDecor(lane: "rear" | "front", startX?: number) {
    const sprite = this.createTreeDecor(lane);
    const baseScale = lane === "rear" ? 0.68 + Math.random() * 0.1 : 0.92 + Math.random() * 0.18;
    sprite.scale.set(baseScale);

    const yBase = lane === "rear" ? GAME_HEIGHT * 0.505 : GAME_HEIGHT * 0.548;
    const yJitter = (Math.random() - 0.5) * GAME_HEIGHT * (lane === "rear" ? 0.006 : 0.008);
    sprite.y = yBase + yJitter;
    sprite.x = startX ?? viewBounds.right + (lane === "rear" ? 160 : 140) + Math.random() * 110;
    sprite.alpha = lane === "rear" ? 0.46 + Math.random() * 0.12 : 0.82 + Math.random() * 0.18;

    const speedBase = lane === "rear" ? 0.24 : 0.42;
    const speed = BASE_SPEED * (speedBase + Math.random() * 0.08);

    (lane === "rear" ? this.rearDecorLayer : this.frontDecorLayer).addChild(sprite);
    this.decors.push({ sprite, speed, lane });
  }

  private createTreeDecor(lane: "rear" | "front") {
    const tree = new Container();
    const trunk = new Graphics();
    const canopyBack = new Graphics();
    const canopyFront = new Graphics();
    const style = Math.floor(Math.random() * 3);
    const trunkHeight = 48 + Math.random() * 18;
    const trunkColor = lane === "rear" ? 0x705848 : 0x6d3f2a;
    const canopyBackColor = lane === "rear" ? 0x8aa563 : 0x6d8a2d;
    const canopyFrontColor = lane === "rear" ? 0x9fbc70 : 0x88a93f;

    trunk.moveTo(-5, 0);
    trunk.lineTo(6, 0);
    trunk.lineTo(3, -trunkHeight * 0.58);
    trunk.lineTo(10, -trunkHeight);
    trunk.lineTo(2, -trunkHeight);
    trunk.lineTo(-4, -trunkHeight * 0.55);
    trunk.lineTo(-9, 0);
    trunk.closePath();
    trunk.fill({ color: trunkColor });

    if (style === 0) {
      canopyBack.ellipse(0, -trunkHeight - 6, 34, 10);
      canopyBack.fill({ color: canopyBackColor });
      canopyFront.ellipse(-18, -trunkHeight + 2, 16, 14);
      canopyFront.ellipse(16, -trunkHeight + 1, 18, 13);
      canopyFront.ellipse(0, -trunkHeight - 1, 24, 14);
    } else if (style === 1) {
      canopyBack.ellipse(0, -trunkHeight - 4, 28, 12);
      canopyBack.fill({ color: canopyBackColor });
      canopyFront.ellipse(-20, -trunkHeight + 3, 15, 15);
      canopyFront.ellipse(18, -trunkHeight + 4, 14, 14);
      canopyFront.ellipse(0, -trunkHeight - 8, 26, 10);
    } else {
      canopyBack.ellipse(0, -trunkHeight - 8, 30, 11);
      canopyBack.fill({ color: canopyBackColor });
      canopyFront.ellipse(-16, -trunkHeight - 1, 17, 12);
      canopyFront.ellipse(14, -trunkHeight, 17, 12);
      canopyFront.ellipse(0, -trunkHeight - 4, 21, 13);
    }

    canopyFront.fill({ color: canopyFrontColor });

    tree.addChild(trunk, canopyBack, canopyFront);
    return tree;
  }

  private updateDecor(dt: number) {
    for (let i = this.decors.length - 1; i >= 0; i--) {
      const d = this.decors[i];
      d.sprite.x -= d.speed * dt;

      // Remove when off the left edge of visible area
      if (d.sprite.x < viewBounds.left - 260) {
        (d.lane === "rear" ? this.rearDecorLayer : this.frontDecorLayer).removeChild(d.sprite);
        d.sprite.destroy();
        this.decors.splice(i, 1);
      }
    }

    this.rearSpawnTimer -= dt;
    if (this.rearSpawnTimer <= 0) {
      this.spawnDecor("rear");
      this.rearSpawnTimer = 1.45 + Math.random() * 0.55;
    }

    this.frontSpawnTimer -= dt;
    if (this.frontSpawnTimer <= 0) {
      this.spawnDecor("front");
      this.frontSpawnTimer = 0.82 + Math.random() * 0.38;
    }
  }
}
