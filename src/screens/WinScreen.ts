import { Assets, Container, Graphics, Sprite, Text, TextStyle, Texture } from "pixi.js";
import { GAME_WIDTH, GAME_HEIGHT } from "../utils/constants";

export class WinScreen {
  container: Container;
  private rewardText: Text;
  private getMoney: () => number;

  constructor(onContinue: () => void, getMoney: () => number) {
    this.container = new Container();
    this.container.visible = false;
    this.getMoney = getMoney;

    const overlay = new Graphics();
    overlay.rect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    overlay.fill({ color: 0x090d1f, alpha: 0.7 });
    this.container.addChild(overlay);

    const lightsTex = Assets.get("lights") as Texture;
    if (lightsTex) {
      const lights = new Sprite(lightsTex);
      lights.anchor.set(0.5);
      lights.x = GAME_WIDTH / 2;
      lights.y = GAME_HEIGHT * 0.23;
      lights.scale.set(1.55);
      lights.alpha = 0.52;
      this.container.addChild(lights);
    }

    const paypalCardTex = Assets.get("paypalCard") as Texture;
    if (paypalCardTex) {
      const card = new Sprite(paypalCardTex);
      card.anchor.set(0.5);
      card.x = GAME_WIDTH / 2;
      card.y = GAME_HEIGHT * 0.44;
      card.scale.set(0.36);
      this.container.addChild(card);
    }

    const title = new Text({
      text: "Congratulations",
      style: new TextStyle({
        fontFamily: "Arial",
        fontSize: 50,
        fontWeight: "bold",
        fill: 0xffdd00,
        stroke: { color: 0x29174d, width: 5 },
      }),
    });
    title.anchor.set(0.5);
    title.x = GAME_WIDTH / 2;
    title.y = GAME_HEIGHT * 0.3;
    this.container.addChild(title);

    const subtitle = new Text({
      text: "Your PayPal reward is ready",
      style: new TextStyle({
        fontFamily: "Arial",
        fontSize: 28,
        fill: 0xffffff,
        stroke: { color: 0x101939, width: 3 },
      }),
    });
    subtitle.anchor.set(0.5);
    subtitle.x = GAME_WIDTH / 2;
    subtitle.y = GAME_HEIGHT * 0.38;
    this.container.addChild(subtitle);

    const coinTex = Assets.get("coin") as Texture;
    if (coinTex) {
      const coinBanner = new Sprite(coinTex);
      coinBanner.anchor.set(0.5);
      coinBanner.x = GAME_WIDTH / 2;
      coinBanner.y = GAME_HEIGHT * 0.61;
      coinBanner.scale.set(0.86);
      this.container.addChild(coinBanner);
    }

    this.rewardText = new Text({
      text: "$0",
      style: new TextStyle({
        fontFamily: "Arial",
        fontSize: 42,
        fontWeight: "bold",
        fill: 0xffffff,
        stroke: { color: 0x143d8c, width: 4 },
      }),
    });
    this.rewardText.anchor.set(0.5);
    this.rewardText.x = GAME_WIDTH / 2;
    this.rewardText.y = GAME_HEIGHT * 0.61;
    this.container.addChild(this.rewardText);

    const btnBg = new Graphics();
    btnBg.roundRect(GAME_WIDTH / 2 - 150, GAME_HEIGHT * 0.75, 300, 72, 18);
    btnBg.fill({ color: 0xff8800 });
    this.container.addChild(btnBg);

    const btnText = new Text({
      text: "CLAIM",
      style: new TextStyle({
        fontFamily: "Arial",
        fontSize: 30,
        fontWeight: "bold",
        fill: 0xffffff,
      }),
    });
    btnText.anchor.set(0.5);
    btnText.x = GAME_WIDTH / 2;
    btnText.y = GAME_HEIGHT * 0.75 + 36;
    this.container.addChild(btnText);
  }

  show(money: number) {
    this.rewardText.text = `$${money}`;
  }
}
