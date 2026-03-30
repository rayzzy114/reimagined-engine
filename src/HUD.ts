import { Container, Sprite, Text, TextStyle, Texture, Assets, Graphics } from "pixi.js";
import { GAME_WIDTH, GAME_HEIGHT, MAX_LIVES } from "./utils/constants";

export class HUD {
  container: Container;
  private heartSprites: Graphics[] = [];
  private moneyText: Text;
  private footerContainer: Container;

  constructor() {
    this.container = new Container();

    // Hearts (drawn as Graphics since we don't have a heart asset that's separate)
    const heartContainer = new Container();
    heartContainer.x = 30;
    heartContainer.y = 40;

    for (let i = 0; i < MAX_LIVES; i++) {
      const heart = this.createHeart(0xff4466);
      heart.x = i * 50;
      heartContainer.addChild(heart);
      this.heartSprites.push(heart);
    }
    this.container.addChild(heartContainer);

    // PayPal money counter
    const moneyContainer = new Container();
    moneyContainer.x = GAME_WIDTH - 180;
    moneyContainer.y = 30;

    // PayPal counter bg
    const paypalBg = new Graphics();
    paypalBg.roundRect(0, 0, 160, 50, 12);
    paypalBg.fill({ color: 0xffffff });
    paypalBg.stroke({ color: 0x0070ba, width: 2 });
    moneyContainer.addChild(paypalBg);

    // PayPal icon (using counter image or drawing P logo)
    const paypalIcon = new Graphics();
    paypalIcon.circle(22, 25, 14);
    paypalIcon.fill({ color: 0x0070ba });
    moneyContainer.addChild(paypalIcon);

    const pText = new Text({
      text: "P",
      style: new TextStyle({
        fontFamily: "Arial",
        fontSize: 18,
        fontWeight: "bold",
        fill: 0xffffff,
      }),
    });
    pText.x = 15;
    pText.y = 13;
    moneyContainer.addChild(pText);

    this.moneyText = new Text({
      text: "$0",
      style: new TextStyle({
        fontFamily: "Arial",
        fontSize: 30,
        fontWeight: "bold",
        fill: 0x333333,
      }),
    });
    this.moneyText.x = 50;
    this.moneyText.y = 8;
    moneyContainer.addChild(this.moneyText);

    this.container.addChild(moneyContainer);

    // Footer / bottom bar
    this.footerContainer = new Container();
    this.footerContainer.y = GAME_HEIGHT - 90;

    const footerBg = new Graphics();
    footerBg.roundRect(0, 0, GAME_WIDTH, 90, 20);
    footerBg.fill({ color: 0x6b4fa0 });
    this.footerContainer.addChild(footerBg);

    const playoffText = new Text({
      text: "Playoff",
      style: new TextStyle({
        fontFamily: "Arial",
        fontSize: 32,
        fontWeight: "bold",
        fill: 0xffffff,
      }),
    });
    playoffText.x = 30;
    playoffText.y = 25;
    this.footerContainer.addChild(playoffText);

    // Download button
    const dlBtn = new Graphics();
    dlBtn.roundRect(GAME_WIDTH - 190, 18, 160, 50, 12);
    dlBtn.fill({ color: 0xff8800 });
    this.footerContainer.addChild(dlBtn);

    const dlText = new Text({
      text: "DOWNLOAD",
      style: new TextStyle({
        fontFamily: "Arial",
        fontSize: 22,
        fontWeight: "bold",
        fill: 0xffffff,
      }),
    });
    dlText.x = GAME_WIDTH - 172;
    dlText.y = 30;
    this.footerContainer.addChild(dlText);

    this.container.addChild(this.footerContainer);
  }

  private createHeart(color: number): Graphics {
    const g = new Graphics();
    // Simple heart shape
    g.moveTo(20, 8);
    g.bezierCurveTo(20, 4, 14, 0, 10, 0);
    g.bezierCurveTo(4, 0, 0, 6, 0, 12);
    g.bezierCurveTo(0, 20, 10, 28, 20, 36);
    g.bezierCurveTo(30, 28, 40, 20, 40, 12);
    g.bezierCurveTo(40, 6, 36, 0, 30, 0);
    g.bezierCurveTo(26, 0, 20, 4, 20, 8);
    g.fill({ color });
    return g;
  }

  updateLives(lives: number) {
    for (let i = 0; i < MAX_LIVES; i++) {
      this.heartSprites[i].alpha = i < lives ? 1 : 0.3;
    }
  }

  updateMoney(amount: number) {
    this.moneyText.text = `$${amount}`;
  }
}
