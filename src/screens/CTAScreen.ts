import { Container, Text, TextStyle, Graphics } from "pixi.js";
import { GAME_WIDTH, GAME_HEIGHT } from "../utils/constants";

export class CTAScreen {
  container: Container;

  constructor() {
    this.container = new Container();
    this.container.visible = false;

    const overlay = new Graphics();
    overlay.rect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    overlay.fill({ color: 0x000000, alpha: 0.7 });
    this.container.addChild(overlay);

    const title = new Text({
      text: "Play Now!",
      style: new TextStyle({
        fontFamily: "Arial",
        fontSize: 52,
        fontWeight: "bold",
        fill: 0xffdd00,
        stroke: { color: 0x000000, width: 5 },
      }),
    });
    title.anchor.set(0.5);
    title.x = GAME_WIDTH / 2;
    title.y = GAME_HEIGHT * 0.3;
    this.container.addChild(title);

    // Install button
    const btnBg = new Graphics();
    btnBg.roundRect(GAME_WIDTH / 2 - 150, GAME_HEIGHT * 0.45, 300, 70, 20);
    btnBg.fill({ color: 0x00cc00 });
    this.container.addChild(btnBg);

    const btnText = new Text({
      text: "INSTALL AND EARN",
      style: new TextStyle({
        fontFamily: "Arial",
        fontSize: 28,
        fontWeight: "bold",
        fill: 0xffffff,
      }),
    });
    btnText.anchor.set(0.5);
    btnText.x = GAME_WIDTH / 2;
    btnText.y = GAME_HEIGHT * 0.45 + 35;
    this.container.addChild(btnText);

    const info = new Text({
      text: "Next payment in one minute",
      style: new TextStyle({
        fontFamily: "Arial",
        fontSize: 22,
        fill: 0xcccccc,
      }),
    });
    info.anchor.set(0.5);
    info.x = GAME_WIDTH / 2;
    info.y = GAME_HEIGHT * 0.58;
    this.container.addChild(info);

    const disclaimer = new Text({
      text: "The actual payment depends on\nplaying and interacting with\nthe JustPlay app.",
      style: new TextStyle({
        fontFamily: "Arial",
        fontSize: 16,
        fill: 0x999999,
        align: "center",
        lineHeight: 22,
      }),
    });
    disclaimer.anchor.set(0.5);
    disclaimer.x = GAME_WIDTH / 2;
    disclaimer.y = GAME_HEIGHT * 0.68;
    this.container.addChild(disclaimer);
  }
}
