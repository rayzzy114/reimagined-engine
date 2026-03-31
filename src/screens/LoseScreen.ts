import { Assets, Container, Graphics, Sprite, Text, TextStyle, Texture } from "pixi.js";
import { GAME_WIDTH, GAME_HEIGHT } from "../utils/constants";

export class LoseScreen {
  container: Container;

  constructor(onRetry: () => void) {
    this.container = new Container();
    this.container.visible = false;

    const overlay = new Graphics();
    overlay.rect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    overlay.fill({ color: 0x120815, alpha: 0.76 });
    this.container.addChild(overlay);

    const failTex = Assets.get("failImage") as Texture;
    if (failTex) {
      const failSprite = new Sprite(failTex);
      failSprite.anchor.set(0.5);
      failSprite.x = GAME_WIDTH / 2;
      failSprite.y = GAME_HEIGHT * 0.38;
      failSprite.scale.set(1.28);
      this.container.addChild(failSprite);
    }

    const title = new Text({
      text: "Try again",
      style: new TextStyle({
        fontFamily: "Arial",
        fontSize: 50,
        fontWeight: "bold",
        fill: 0xff4444,
        stroke: { color: 0x3a0f1d, width: 5 },
      }),
    });
    title.anchor.set(0.5);
    title.x = GAME_WIDTH / 2;
    title.y = GAME_HEIGHT * 0.25;
    this.container.addChild(title);

    const subtitle = new Text({
      text: "Install the app to keep earning",
      style: new TextStyle({
        fontFamily: "Arial",
        fontSize: 28,
        fill: 0xffffff,
        stroke: { color: 0x1a1128, width: 3 },
      }),
    });
    subtitle.anchor.set(0.5);
    subtitle.x = GAME_WIDTH / 2;
    subtitle.y = GAME_HEIGHT * 0.58;
    this.container.addChild(subtitle);

    const btnBg = new Graphics();
    btnBg.roundRect(GAME_WIDTH / 2 - 150, GAME_HEIGHT * 0.71, 300, 72, 18);
    btnBg.fill({ color: 0xff8800 });
    this.container.addChild(btnBg);

    const btnText = new Text({
      text: "DOWNLOAD",
      style: new TextStyle({
        fontFamily: "Arial",
        fontSize: 30,
        fontWeight: "bold",
        fill: 0xffffff,
      }),
    });
    btnText.anchor.set(0.5);
    btnText.x = GAME_WIDTH / 2;
    btnText.y = GAME_HEIGHT * 0.71 + 36;
    this.container.addChild(btnText);
  }
}
