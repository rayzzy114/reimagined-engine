import { Assets, Container, Graphics, Sprite, Text, TextStyle, Texture } from "pixi.js";
import { GAME_WIDTH, GAME_HEIGHT } from "../utils/constants";

export class CTAScreen {
  container: Container;

  constructor() {
    this.container = new Container();
    this.container.visible = false;

    const overlay = new Graphics();
    overlay.rect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    overlay.fill({ color: 0x080c1d, alpha: 0.72 });
    this.container.addChild(overlay);

    const paypalCardTex = Assets.get("paypalCard") as Texture;
    if (paypalCardTex) {
      const card = new Sprite(paypalCardTex);
      card.anchor.set(0.5);
      card.x = GAME_WIDTH / 2;
      card.y = GAME_HEIGHT * 0.32;
      card.scale.set(0.38);
      this.container.addChild(card);
    }

    const footerTex = Assets.get("footerPortrait") as Texture;
    if (footerTex) {
      const footer = new Sprite(footerTex);
      footer.x = 0;
      footer.y = GAME_HEIGHT - 260;
      footer.width = GAME_WIDTH;
      footer.height = 260;
      this.container.addChild(footer);
    }

    const title = new Text({
      text: "Install and earn",
      style: new TextStyle({
        fontFamily: "Arial",
        fontSize: 52,
        fontWeight: "bold",
        fill: 0xffdd00,
        stroke: { color: 0x24124d, width: 5 },
      }),
    });
    title.anchor.set(0.5);
    title.x = GAME_WIDTH / 2;
    title.y = GAME_HEIGHT * 0.24;
    this.container.addChild(title);

    const btnBg = new Graphics();
    btnBg.roundRect(GAME_WIDTH / 2 - 160, GAME_HEIGHT * 0.53, 320, 74, 20);
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
    btnText.y = GAME_HEIGHT * 0.53 + 37;
    this.container.addChild(btnText);

    const note = new Text({
      text: "Cash out with Playoff",
      style: new TextStyle({
        fontFamily: "Arial",
        fontSize: 26,
        fontWeight: "bold",
        fill: 0xffffff,
        stroke: { color: 0x111937, width: 3 },
      }),
    });
    note.anchor.set(0.5);
    note.x = GAME_WIDTH / 2;
    note.y = GAME_HEIGHT * 0.45;
    this.container.addChild(note);
  }
}
