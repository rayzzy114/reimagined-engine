import { Assets, Container, Graphics, Sprite, Text, TextStyle, Texture } from "pixi.js";
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

    const footerTex = Assets.get("footerPortrait") as Texture;
    if (footerTex) {
      const footer = new Sprite(footerTex);
      footer.x = 0;
      footer.y = GAME_HEIGHT - 320;
      footer.width = GAME_WIDTH;
      footer.height = 320;
      this.container.addChild(footer);
    }

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
    title.y = GAME_HEIGHT * 0.24;
    this.container.addChild(title);

    // Install button
    const btnBg = new Graphics();
    btnBg.roundRect(GAME_WIDTH / 2 - 150, GAME_HEIGHT * 0.42, 300, 70, 20);
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
    btnText.y = GAME_HEIGHT * 0.42 + 35;
    this.container.addChild(btnText);
  }
}
