import { Assets, Container, Graphics, Sprite, Text, TextStyle, Texture } from "pixi.js";
import { GAME_WIDTH, GAME_HEIGHT, viewBounds } from "../utils/constants";

export class TutorialOverlay {
  container: Container;
  private overlay: Graphics;
  private content: Container;
  private introTimer = 0;

  constructor(onDismiss: () => void) {
    this.container = new Container();
    this.container.visible = false;

    this.overlay = new Graphics();
    this.layoutOverlay();
    this.container.addChild(this.overlay);

    this.content = new Container();
    this.container.addChild(this.content);

    const lightsTex = Assets.get("lights") as Texture;
    if (lightsTex) {
      const lights = new Sprite(lightsTex);
      lights.anchor.set(0.5);
      lights.x = GAME_WIDTH / 2;
      lights.y = GAME_HEIGHT * 0.28;
      lights.scale.set(1.25);
      lights.alpha = 0.4;
      this.content.addChild(lights);
    }

    const text = new Text({
      text: "Jump over the thief",
      style: new TextStyle({
        fontFamily: "PP Mori",
        fontSize: 42,
        fontWeight: "bold",
        fill: 0xffffff,
        stroke: { color: 0x11193b, width: 5 },
        align: "center",
        lineHeight: 52,
      }),
    });
    text.anchor.set(0.5);
    text.x = GAME_WIDTH / 2;
    text.y = GAME_HEIGHT * 0.24;
    this.content.addChild(text);

    const handTex = Assets.get("hand") as Texture;
    if (handTex) {
      const hand = new Sprite(handTex);
      hand.anchor.set(0.5);
      hand.x = GAME_WIDTH / 2;
      hand.y = GAME_HEIGHT * 0.56;
      hand.scale.set(0.24);
      hand.angle = -10;
      this.content.addChild(hand);
    }
  }

  show() {
    this.introTimer = 0;
    this.content.alpha = 0;
    this.content.scale.set(0.92);
  }

  update(dt: number) {
    if (!this.container.visible) return;
    this.introTimer += dt;
    const t = Math.min(this.introTimer / 0.3, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    this.content.alpha = eased;
    this.content.scale.set(0.92 + eased * 0.08);
  }

  onResize() {
    this.layoutOverlay();
  }

  private layoutOverlay() {
    this.overlay.clear();
    this.overlay.rect(viewBounds.left, viewBounds.top, viewBounds.width, viewBounds.height);
    this.overlay.fill({ color: 0x08101f, alpha: 0.5 });
  }
}
