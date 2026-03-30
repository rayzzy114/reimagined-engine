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
    overlay.fill({ color: 0x000000, alpha: 0.3 });
    this.container.addChild(overlay);

    // Title text
    const title = new Text({
      text: "Tap to start\nearning!",
      style: new TextStyle({
        fontFamily: "Arial",
        fontSize: 48,
        fontWeight: "bold",
        fill: 0xffffff,
        stroke: { color: 0x000000, width: 5 },
        align: "center",
        lineHeight: 56,
      }),
    });
    title.anchor.set(0.5);
    title.x = GAME_WIDTH / 2;
    title.y = GAME_HEIGHT * 0.35;
    this.container.addChild(title);

    // Hand icon
    const handTex = Assets.get("hand") as Texture;
    if (handTex) {
      this.handSprite = new Sprite(handTex);
      this.handSprite.anchor.set(0.5);
      this.handSprite.x = GAME_WIDTH / 2;
      this.handSprite.y = GAME_HEIGHT * 0.55;
      this.handSprite.scale.set(0.5);
      this.container.addChild(this.handSprite);
    }
  }

  update(dt: number) {
    if (this.handSprite) {
      this.pulseTimer += dt;
      const scale = 0.5 + Math.sin(this.pulseTimer * 3) * 0.05;
      this.handSprite.scale.set(scale);
    }
  }
}
