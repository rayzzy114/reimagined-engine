import { Container, Text, TextStyle, Graphics } from "pixi.js";
import { GAME_WIDTH, GAME_HEIGHT } from "../utils/constants";

export class TutorialOverlay {
  container: Container;

  constructor(onDismiss: () => void) {
    this.container = new Container();
    this.container.visible = false;

    const overlay = new Graphics();
    overlay.rect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    overlay.fill({ color: 0x000000, alpha: 0.4 });
    this.container.addChild(overlay);

    const text = new Text({
      text: "Jump to avoid\nenemies",
      style: new TextStyle({
        fontFamily: "Arial",
        fontSize: 44,
        fontWeight: "bold",
        fill: 0xffffff,
        stroke: { color: 0x000000, width: 5 },
        align: "center",
        lineHeight: 52,
      }),
    });
    text.anchor.set(0.5);
    text.x = GAME_WIDTH / 2;
    text.y = GAME_HEIGHT * 0.35;
    this.container.addChild(text);
  }
}
