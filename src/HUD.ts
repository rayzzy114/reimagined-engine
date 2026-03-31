import { Container, Sprite, Text, TextStyle, Texture, Assets, Graphics } from "pixi.js";
import { GAME_WIDTH, GAME_HEIGHT, MAX_LIVES } from "./utils/constants";

export class HUD {
  container: Container;
  private heartSprites: Graphics[] = [];
  private moneyText: Text;
  private footerContainer: Container;
  private muteButton: Container;
  private muteWaves: Graphics;
  private muteSlash: Graphics;
  private muted = false;

  constructor(onToggleMute: () => void, isMuted: () => boolean) {
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
    moneyContainer.x = GAME_WIDTH - 172;
    moneyContainer.y = 18;

    const counterTex = Assets.get("paypalCounter") as Texture;
    if (counterTex) {
      const counter = new Sprite(counterTex);
      counter.width = 165;
      counter.height = 112;
      moneyContainer.addChild(counter);
    } else {
      const paypalBg = new Graphics();
      paypalBg.roundRect(0, 0, 160, 50, 12);
      paypalBg.fill({ color: 0xffffff });
      paypalBg.stroke({ color: 0x0070ba, width: 2 });
      moneyContainer.addChild(paypalBg);
    }

    this.moneyText = new Text({
      text: "$0",
      style: new TextStyle({
        fontFamily: "PP Mori",
        fontSize: 26,
        fontWeight: "bold",
        fill: 0x103a8b,
        stroke: { color: 0xffffff, width: 3 },
      }),
    });
    this.moneyText.anchor.set(1, 0.5);
    this.moneyText.x = 152;
    this.moneyText.y = 27;
    moneyContainer.addChild(this.moneyText);

    this.container.addChild(moneyContainer);

    this.muteButton = new Container();
    this.muteButton.eventMode = "static";
    this.muteButton.cursor = "pointer";
    this.muteButton.x = GAME_WIDTH - 220;
    this.muteButton.y = 34;

    const muteBg = new Graphics();
    muteBg.roundRect(-18, -18, 36, 36, 10);
    muteBg.fill({ color: 0xffffff, alpha: 0.95 });
    muteBg.stroke({ color: 0x2d66b3, width: 2 });
    this.muteButton.addChild(muteBg);

    const speaker = new Graphics();
    speaker.moveTo(-8, -5);
    speaker.lineTo(-2, -5);
    speaker.lineTo(4, -10);
    speaker.lineTo(4, 10);
    speaker.lineTo(-2, 5);
    speaker.lineTo(-8, 5);
    speaker.closePath();
    speaker.fill({ color: 0x2d66b3 });
    this.muteButton.addChild(speaker);

    this.muteWaves = new Graphics();
    this.muteWaves.arc(6, 0, 5, -0.75, 0.75);
    this.muteWaves.stroke({ color: 0x2d66b3, width: 2 });
    this.muteWaves.arc(6, 0, 10, -0.75, 0.75);
    this.muteWaves.stroke({ color: 0x2d66b3, width: 2 });
    this.muteButton.addChild(this.muteWaves);

    this.muteSlash = new Graphics();
    this.muteSlash.moveTo(-9, 9);
    this.muteSlash.lineTo(10, -10);
    this.muteSlash.stroke({ color: 0xd13a3a, width: 3 });
    this.muteSlash.visible = false;
    this.muteButton.addChild(this.muteSlash);

    this.muteButton.on("pointertap", (event) => {
      event.stopPropagation();
      onToggleMute();
      this.setMuted(isMuted());
    });

    this.setMuted(isMuted());
    this.container.addChild(this.muteButton);

    this.footerContainer = new Container();
    this.footerContainer.y = GAME_HEIGHT - 134;

    const footerTex = Assets.get("footerPortrait") as Texture;
    if (footerTex) {
      const footerSprite = new Sprite(footerTex);
      footerSprite.x = 0;
      footerSprite.y = 0;
      footerSprite.width = GAME_WIDTH;
      footerSprite.height = 134;
      this.footerContainer.addChild(footerSprite);
    }
    if (!footerTex) {
      const footerBg = new Graphics();
      footerBg.roundRect(0, 0, GAME_WIDTH, 134, 20);
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

  setFooterVisible(value: boolean) {
    this.footerContainer.visible = value;
  }

  setMuted(value: boolean) {
    this.muted = value;
    this.muteSlash.visible = value;
    this.muteWaves.alpha = value ? 0.25 : 1;
  }
}
