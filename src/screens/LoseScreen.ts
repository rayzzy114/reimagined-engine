import { Container, Text, TextStyle, Graphics } from "pixi.js";
import { GAME_WIDTH, GAME_HEIGHT } from "../utils/constants";

export class LoseScreen {
  container: Container;

  constructor(onRetry: () => void) {
    this.container = new Container();
    this.container.visible = false;

    const overlay = new Graphics();
    overlay.rect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    overlay.fill({ color: 0x000000, alpha: 0.6 });
    this.container.addChild(overlay);

    const title = new Text({
      text: "You didn't make it!",
      style: new TextStyle({
        fontFamily: "Arial",
        fontSize: 42,
        fontWeight: "bold",
        fill: 0xff4444,
        stroke: { color: 0x000000, width: 5 },
      }),
    });
    title.anchor.set(0.5);
    title.x = GAME_WIDTH / 2;
    title.y = GAME_HEIGHT * 0.35;
    this.container.addChild(title);

    const subtitle = new Text({
      text: "Try again on the app!",
      style: new TextStyle({
        fontFamily: "Arial",
        fontSize: 28,
        fill: 0xffffff,
        stroke: { color: 0x000000, width: 3 },
      }),
    });
    subtitle.anchor.set(0.5);
    subtitle.x = GAME_WIDTH / 2;
    subtitle.y = GAME_HEIGHT * 0.43;
    this.container.addChild(subtitle);

    // Download button
    const btnBg = new Graphics();
    btnBg.roundRect(GAME_WIDTH / 2 - 120, GAME_HEIGHT * 0.53, 240, 60, 15);
    btnBg.fill({ color: 0xff8800 });
    this.container.addChild(btnBg);

    const btnText = new Text({
      text: "DOWNLOAD",
      style: new TextStyle({
        fontFamily: "Arial",
        fontSize: 28,
        fontWeight: "bold",
        fill: 0xffffff,
      }),
    });
    btnText.anchor.set(0.5);
    btnText.x = GAME_WIDTH / 2;
    btnText.y = GAME_HEIGHT * 0.53 + 30;
    this.container.addChild(btnText);
  }
}
