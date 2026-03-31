import { Assets, Container, Graphics, Sprite, Text, TextStyle, Texture } from "pixi.js";
import { GAME_WIDTH, GAME_HEIGHT } from "../utils/constants";

export class TutorialOverlay {
  container: Container;

  constructor(onDismiss: () => void) {
    this.container = new Container();
    this.container.visible = false;

    const overlay = new Graphics();
    overlay.rect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    overlay.fill({ color: 0x08101f, alpha: 0.5 });
    this.container.addChild(overlay);

    const lightsTex = Assets.get("lights") as Texture;
    if (lightsTex) {
      const lights = new Sprite(lightsTex);
      lights.anchor.set(0.5);
      lights.x = GAME_WIDTH / 2;
      lights.y = GAME_HEIGHT * 0.28;
      lights.scale.set(1.25);
      lights.alpha = 0.4;
      this.container.addChild(lights);
    }

    const text = new Text({
      text: "Jump over the thief",
      style: new TextStyle({
        fontFamily: "Arial",
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
    this.container.addChild(text);

    const handTex = Assets.get("hand") as Texture;
    if (handTex) {
      const hand = new Sprite(handTex);
      hand.anchor.set(0.5);
      hand.x = GAME_WIDTH / 2;
      hand.y = GAME_HEIGHT * 0.56;
      hand.scale.set(0.24);
      hand.angle = -10;
      this.container.addChild(hand);
    }
  }
}
