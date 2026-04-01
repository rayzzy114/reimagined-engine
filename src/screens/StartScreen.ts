import { Container, Text, TextStyle, Sprite, Assets, Texture, Graphics } from "pixi.js";
import { GAME_WIDTH, GAME_HEIGHT, viewBounds } from "../utils/constants";

export class StartScreen {
  container: Container;
  private overlay: Graphics;
  private handSprite: Sprite | null = null;
  private pulseTimer = 0;

  constructor(onStart: () => void) {
    this.container = new Container();

    // Semi-transparent overlay
    this.overlay = new Graphics();
    this.layoutOverlay();
    this.container.addChild(this.overlay);

    const lightsTex = Assets.get("lights") as Texture;
    if (lightsTex) {
      const lights = new Sprite(lightsTex);
      lights.anchor.set(0.5);
      lights.x = GAME_WIDTH / 2;
      lights.y = GAME_HEIGHT * 0.25;
      lights.scale.set(1.35);
      lights.alpha = 0.42;
      this.container.addChild(lights);
    }

    const title = new Text({
      text: "Tap to start\nearning!",
      style: new TextStyle({
        fontFamily: "PP Mori",
        fontSize: 46,
        fontWeight: "bold",
        fill: 0xffffff,
        stroke: { color: 0x1d2456, width: 5 },
        align: "center",
        dropShadow: {
          color: 0x0b1638,
          blur: 8,
          distance: 2,
          angle: Math.PI / 4,
        },
      }),
    });
    title.anchor.set(0.5);
    title.x = GAME_WIDTH / 2;
    title.y = GAME_HEIGHT * 0.43;
    this.container.addChild(title);

    const handTex = Assets.get("hand") as Texture;
    if (handTex) {
      this.handSprite = new Sprite(handTex);
      this.handSprite.anchor.set(0.5);
      this.handSprite.x = GAME_WIDTH / 2 + 10;
      this.handSprite.y = GAME_HEIGHT * 0.76;
      this.handSprite.scale.set(0.13);
      this.handSprite.angle = -10;
      this.container.addChild(this.handSprite);
    }
  }

  update(dt: number) {
    if (this.handSprite) {
      this.pulseTimer += dt;
      const scale = 0.13 + Math.sin(this.pulseTimer * 3.2) * 0.01;
      this.handSprite.scale.set(scale);
      this.handSprite.y = GAME_HEIGHT * 0.76 + Math.sin(this.pulseTimer * 3.2) * 6;
    }
  }

  onResize() {
    this.layoutOverlay();
  }

  private layoutOverlay() {
    this.overlay.clear();
    this.overlay.rect(viewBounds.left, viewBounds.top, viewBounds.width, viewBounds.height);
    this.overlay.fill({ color: 0x040814, alpha: 0.38 });
  }
}
