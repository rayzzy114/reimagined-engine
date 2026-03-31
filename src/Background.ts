import { Assets, Container, Graphics, Sprite, Texture } from "pixi.js";
import { GAME_WIDTH, GAME_HEIGHT } from "./utils/constants";

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

  constructor() {
    this.container = new Container();

    const bgTex = Assets.get("bgMain") as Texture;
    if (bgTex) {
      this.bgSprite = new Sprite(bgTex);
      const scale = GAME_HEIGHT / bgTex.height;
      const scaledWidth = bgTex.width * scale;
      this.bgSprite.x = (GAME_WIDTH - scaledWidth) / 2;
      this.bgSprite.y = 0;
      this.bgSprite.width = scaledWidth;
      this.bgSprite.height = GAME_HEIGHT;
      this.container.addChild(this.bgSprite);
    }

    this.stripeLayer = new Container();
    this.stripeMask = new Graphics();
    this.stripeMask.roundRect(0, GAME_HEIGHT * 0.56, GAME_WIDTH, GAME_HEIGHT * 0.22, 18);
    this.stripeMask.fill({ color: 0xffffff });
    this.stripeLayer.mask = this.stripeMask;
    this.container.addChild(this.stripeLayer);
    this.container.addChild(this.stripeMask);

    for (let index = 0; index < 7; index++) {
      const stripe = new Graphics();
      stripe.roundRect(-84, -8, 168, 16, 8);
      stripe.fill({ color: 0xffffff, alpha: 0.16 });
      stripe.rotation = this.stripeRotation;
      stripe.y = GAME_HEIGHT * 0.69 + (index % 2 === 0 ? -16 : 16);
      this.stripeLayer.addChild(stripe);
      this.stripes.push(stripe);
    }
    this.layoutStripes();
  }

  update(dt: number) {
    if (this.bgSprite) {
      const bgTex = this.bgSprite.texture;
      const scale = GAME_HEIGHT / bgTex.height;
      const scaledWidth = bgTex.width * scale;
      this.bgSprite.x = (GAME_WIDTH - scaledWidth) / 2 + Math.sin(Date.now() * 0.0002) * 6;
    }

    this.stripeOffset = (this.stripeOffset + dt * this.stripeSpeed) % this.stripeSpacing;
    this.layoutStripes();
  }

  getDebugMeta() {
    return {
      stripeOffset: Number(this.stripeOffset.toFixed(2)),
      stripeCount: this.stripes.length,
      stripeRotation: this.stripeRotation,
    };
  }

  private layoutStripes() {
    const startX = -120;
    for (let index = 0; index < this.stripes.length; index++) {
      this.stripes[index].x = startX + index * this.stripeSpacing - this.stripeOffset;
    }
  }
}
