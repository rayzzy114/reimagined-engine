import { Container, Text, TextStyle, Sprite, Assets, Texture, Graphics } from "pixi.js";
import { GAME_WIDTH, GAME_HEIGHT } from "../utils/constants";

export class StartScreen {
  container: Container;
  private handSprite: Sprite | null = null;
  private pulseTimer = 0;

  constructor(onStart: () => void) {
    this.container = new Container();

    // Semi-transparent overlay
    const overlay = new Graphics();
    overlay.rect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    overlay.fill({ color: 0x040814, alpha: 0.42 });
    this.container.addChild(overlay);

    const lightsTex = Assets.get("lights") as Texture;
    if (lightsTex) {
      const lights = new Sprite(lightsTex);
      lights.anchor.set(0.5);
      lights.x = GAME_WIDTH / 2;
      lights.y = GAME_HEIGHT * 0.28;
      lights.scale.set(1.45);
      lights.alpha = 0.48;
      this.container.addChild(lights);
    }

    const title = new Text({
      text: "Tap to start",
      style: new TextStyle({
        fontFamily: "Arial",
        fontSize: 54,
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
    title.y = GAME_HEIGHT * 0.2;
    this.container.addChild(title);

    const handTex = Assets.get("hand") as Texture;
    if (handTex) {
      this.handSprite = new Sprite(handTex);
      this.handSprite.anchor.set(0.5);
      this.handSprite.x = GAME_WIDTH / 2;
      this.handSprite.y = GAME_HEIGHT * 0.56;
      this.handSprite.scale.set(0.27);
      this.handSprite.angle = -12;
      this.container.addChild(this.handSprite);
    }
  }

  update(dt: number) {
    if (this.handSprite) {
      this.pulseTimer += dt;
      const scale = 0.27 + Math.sin(this.pulseTimer * 3.2) * 0.018;
      this.handSprite.scale.set(scale);
      this.handSprite.y = GAME_HEIGHT * 0.56 + Math.sin(this.pulseTimer * 3.2) * 10;
    }
  }
}
