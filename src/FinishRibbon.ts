import { Assets, Container, Sprite, Texture } from "pixi.js";
import { GAME_HEIGHT, GAME_WIDTH } from "./utils/constants";

interface BrokenTapeState {
  vx: number;
  vy: number;
  rotationSpeed: number;
}

export class FinishRibbon {
  container: Container;
  private frameContainer: Container;
  private leftPost: Sprite;
  private rightPost: Sprite;
  private finishBanner: Sprite;
  private intactTape: Sprite;
  private leftBrokenTape: Sprite;
  private rightBrokenTape: Sprite;
  private active = false;
  private broken = false;
  private ribbonX = GAME_WIDTH + 200;
  private intactTapeY = GAME_HEIGHT * 0.58;
  private leftBrokenState: BrokenTapeState = { vx: -180, vy: -140, rotationSpeed: -2.4 };
  private rightBrokenState: BrokenTapeState = { vx: 180, vy: -120, rotationSpeed: 2.1 };

  constructor() {
    this.container = new Container();
    this.container.visible = false;

    this.frameContainer = new Container();
    this.container.addChild(this.frameContainer);

    this.leftPost = this.createSprite("finishPost", 0.5, 0);
    this.rightPost = this.createSprite("finishPost", 0.5, 0);
    this.finishBanner = this.createSprite("finishLine", 0.5, 0.5);
    this.intactTape = this.createSprite("finishTapeTop", 0.5, 0.5);
    this.leftBrokenTape = this.createSprite("finishTapeLeft", 1, 0.5);
    this.rightBrokenTape = this.createSprite("finishTapeRight", 0, 0.5);

    this.leftPost.height = 560;
    this.rightPost.height = 560;
    this.leftPost.width = 18;
    this.rightPost.width = 18;

    this.finishBanner.width = 300;
    this.finishBanner.height = 42;
    this.intactTape.width = 220;
    this.intactTape.height = 18;

    this.leftBrokenTape.visible = false;
    this.rightBrokenTape.visible = false;
    this.leftBrokenTape.scale.set(1.2);
    this.rightBrokenTape.scale.set(1.2);

    this.frameContainer.addChild(this.leftPost);
    this.frameContainer.addChild(this.rightPost);
    this.frameContainer.addChild(this.finishBanner);
    this.frameContainer.addChild(this.intactTape);
    this.frameContainer.addChild(this.leftBrokenTape);
    this.frameContainer.addChild(this.rightBrokenTape);

    this.layoutFrame();
    this.setPosition(this.ribbonX);
  }

  private createSprite(alias: string, anchorX: number, anchorY: number) {
    const texture = Assets.get(alias) as Texture;
    const sprite = new Sprite(texture);
    sprite.anchor.set(anchorX, anchorY);
    return sprite;
  }

  private layoutFrame() {
    const leftX = -148;
    const rightX = 148;
    const topY = GAME_HEIGHT * 0.34;

    this.leftPost.position.set(leftX, topY);
    this.rightPost.position.set(rightX, topY);
    this.finishBanner.position.set(0, topY + 62);
    this.intactTape.position.set(0, this.intactTapeY);
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
    this.intactTape.visible = false;

    const brokenY = Math.max(GAME_HEIGHT * 0.44, Math.min(GAME_HEIGHT * 0.76, playerY));
    this.leftBrokenTape.visible = true;
    this.rightBrokenTape.visible = true;
    this.leftBrokenTape.position.set(-4, brokenY);
    this.rightBrokenTape.position.set(4, brokenY);
    this.leftBrokenTape.rotation = 0;
    this.rightBrokenTape.rotation = 0;
  }

  update(dt: number) {
    if (!this.active) return;

    if (!this.broken) {
      this.intactTape.position.y = this.intactTapeY + Math.sin(Date.now() * 0.008) * 2;
      return;
    }

    this.leftBrokenTape.x += this.leftBrokenState.vx * dt;
    this.leftBrokenTape.y += this.leftBrokenState.vy * dt;
    this.leftBrokenTape.rotation += this.leftBrokenState.rotationSpeed * dt;
    this.leftBrokenState.vy += 520 * dt;

    this.rightBrokenTape.x += this.rightBrokenState.vx * dt;
    this.rightBrokenTape.y += this.rightBrokenState.vy * dt;
    this.rightBrokenTape.rotation += this.rightBrokenState.rotationSpeed * dt;
    this.rightBrokenState.vy += 520 * dt;
  }
}
