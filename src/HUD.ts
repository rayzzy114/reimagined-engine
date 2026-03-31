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

    const moneyContainer = new Container();
    moneyContainer.x = GAME_WIDTH - 180;
    moneyContainer.y = 30;

    const paypalBg = new Graphics();
    paypalBg.roundRect(0, 0, 160, 50, 12);
    paypalBg.fill({ color: 0xffffff });
    paypalBg.stroke({ color: 0x0070ba, width: 2 });
    moneyContainer.addChild(paypalBg);

    const moneyPill = new Graphics();
    moneyPill.circle(22, 25, 14);
    moneyPill.fill({ color: 0x0070ba });
    moneyContainer.addChild(moneyPill);

    const moneySymbol = new Text({
      text: "$",
      style: new TextStyle({
        fontFamily: "Arial",
        fontSize: 18,
        fontWeight: "bold",
        fill: 0xffffff,
      }),
    });
    moneySymbol.anchor.set(0.5);
    moneySymbol.x = 22;
    moneySymbol.y = 25;
    moneyContainer.addChild(moneySymbol);

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

    this.footerContainer = new Container();
    this.footerContainer.y = GAME_HEIGHT - 90;

    const footerTex = Assets.get("footerPortrait") as Texture;
    if (footerTex) {
      const footerSprite = new Sprite(footerTex);
      footerSprite.x = 0;
      footerSprite.y = 0;
      footerSprite.width = GAME_WIDTH;
      footerSprite.height = 90;
      this.footerContainer.addChild(footerSprite);
    }
    if (!footerTex) {
      const footerBg = new Graphics();
      footerBg.roundRect(0, 0, GAME_WIDTH, 90, 20);
      footerBg.fill({ color: 0x6b4fa0 });
      this.footerContainer.addChild(footerBg);
    }

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
