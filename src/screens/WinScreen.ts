import { Assets, Container, Graphics, Sprite, Text, TextStyle, Texture } from "pixi.js";
import { GAME_WIDTH, GAME_HEIGHT } from "../utils/constants";

export class WinScreen {
  container: Container;
  private rewardAmountText: Text;
  private getMoney: () => number;

  constructor(onContinue: () => void, getMoney: () => number) {
    this.container = new Container();
    this.container.visible = false;
    this.getMoney = getMoney;

    const overlay = new Graphics();
    overlay.rect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    overlay.fill({ color: 0x090d1f, alpha: 0.66 });
    this.container.addChild(overlay);

    const lightsTex = Assets.get("lights") as Texture;
    if (lightsTex) {
      const lights = new Sprite(lightsTex);
      lights.anchor.set(0.5);
      lights.x = GAME_WIDTH / 2;
      lights.y = GAME_HEIGHT * 0.22;
      lights.scale.set(1.42);
      lights.alpha = 0.42;
      this.container.addChild(lights);
    }

    const paypalCardTex = Assets.get("paypalCard") as Texture;
    if (paypalCardTex) {
      const card = new Sprite(paypalCardTex);
      card.anchor.set(0.5);
      card.x = GAME_WIDTH / 2;
      card.y = GAME_HEIGHT * 0.47;
      card.scale.set(0.33);
      this.container.addChild(card);
    }

    const title = new Text({
      text: "Congratulations",
      style: new TextStyle({
        fontFamily: "PP Mori",
        fontSize: 50,
        fontWeight: "bold",
        fill: 0xffdd00,
        stroke: { color: 0x29174d, width: 5 },
      }),
    });
    title.anchor.set(0.5);
    title.x = GAME_WIDTH / 2;
    title.y = GAME_HEIGHT * 0.285;
    this.container.addChild(title);

    const subtitle = new Text({
      text: "Your PayPal reward is ready",
      style: new TextStyle({
        fontFamily: "PP Mori",
        fontSize: 28,
        fill: 0xffffff,
        stroke: { color: 0x101939, width: 3 },
      }),
    });
    subtitle.anchor.set(0.5);
    subtitle.x = GAME_WIDTH / 2;
    subtitle.y = GAME_HEIGHT * 0.345;
    this.container.addChild(subtitle);

    const amountCard = new Container();
    amountCard.x = GAME_WIDTH / 2;
    amountCard.y = GAME_HEIGHT * 0.61;

    const amountShadow = new Graphics();
    amountShadow.roundRect(-162, -28, 324, 56, 18);
    amountShadow.fill({ color: 0x000000, alpha: 0.18 });
    amountCard.addChild(amountShadow);

    const amountBg = new Graphics();
    amountBg.roundRect(-160, -30, 320, 60, 18);
    amountBg.fill({ color: 0xffffff });
    amountBg.stroke({ color: 0x1d4fb0, width: 4 });
    amountCard.addChild(amountBg);

    const amountLogoTex = Assets.get("paypalCounter") as Texture;
    if (amountLogoTex) {
      const amountLogo = new Sprite(amountLogoTex);
      amountLogo.anchor.set(0.5);
      amountLogo.x = -90;
      amountLogo.y = 0;
      amountLogo.scale.set(0.42);
      amountCard.addChild(amountLogo);
    }

    this.rewardAmountText = new Text({
      text: "$0",
      style: new TextStyle({
        fontFamily: "PP Mori",
        fontSize: 40,
        fontWeight: "bold",
        fill: 0xffffff,
        stroke: { color: 0x143d8c, width: 4 },
      }),
    });
    this.rewardAmountText.anchor.set(0.5, 0.5);
    this.rewardAmountText.x = 92;
    this.rewardAmountText.y = 1;
    amountCard.addChild(this.rewardAmountText);
    this.container.addChild(amountCard);

    const btnBg = new Graphics();
    btnBg.roundRect(GAME_WIDTH / 2 - 132, GAME_HEIGHT * 0.765, 264, 62, 16);
    btnBg.fill({ color: 0xff8800 });
    this.container.addChild(btnBg);

    const btnText = new Text({
      text: "CLAIM",
      style: new TextStyle({
        fontFamily: "PP Mori",
        fontSize: 30,
        fontWeight: "bold",
        fill: 0xffffff,
      }),
    });
    btnText.anchor.set(0.5);
    btnText.x = GAME_WIDTH / 2;
    btnText.y = GAME_HEIGHT * 0.765 + 31;
    this.container.addChild(btnText);
  }

  show(money: number) {
    this.rewardAmountText.text = `$${money}`;
  }
}
