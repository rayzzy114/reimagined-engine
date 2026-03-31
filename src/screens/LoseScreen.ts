import { Assets, Container, Graphics, Sprite, Text, TextStyle, Texture } from "pixi.js";
import { GAME_WIDTH, GAME_HEIGHT } from "../utils/constants";

export class LoseScreen {
  container: Container;
  private getMoney: () => number;
  private failSprite: Sprite | null = null;
  private panel: Container;
  private amountText: Text;
  private countdownText: Text;
  private buttonText: Text;
  private timer = 0;

  constructor(onRetry: () => void, getMoney: () => number) {
    this.container = new Container();
    this.container.visible = false;
    this.getMoney = getMoney;

    const overlay = new Graphics();
    overlay.rect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    overlay.fill({ color: 0x121018, alpha: 0.72 });
    this.container.addChild(overlay);

    const topCapsule = new Graphics();
    topCapsule.roundRect(GAME_WIDTH / 2 - 88, 18, 176, 34, 17);
    topCapsule.fill({ color: 0x101010, alpha: 0.95 });
    this.container.addChild(topCapsule);

    const failTex = Assets.get("failImage") as Texture;
    if (failTex) {
      this.failSprite = new Sprite(failTex);
      this.failSprite.anchor.set(0.5);
      this.failSprite.x = GAME_WIDTH / 2;
      this.failSprite.y = GAME_HEIGHT * 0.46;
      this.failSprite.scale.set(0);
      this.container.addChild(this.failSprite);
    }

    this.panel = new Container();
    this.panel.visible = false;
    this.panel.alpha = 0;
    this.container.addChild(this.panel);

    const paypalCardTex = (Assets.get("paypalCounter") as Texture) || (Assets.get("paypalCard") as Texture);
    if (paypalCardTex) {
      const logo = new Sprite(paypalCardTex);
      logo.anchor.set(0.5);
      logo.x = GAME_WIDTH / 2;
      logo.y = GAME_HEIGHT * 0.52;
      logo.scale.set(0.46);
      this.panel.addChild(logo);
    }

    this.amountText = new Text({
      text: `$${this.getMoney().toFixed(2)}`,
      style: new TextStyle({
        fontFamily: "PP Mori",
        fontSize: 42,
        fontWeight: "bold",
        fill: 0x111111,
        stroke: { color: 0xffffff, width: 5 },
      }),
    });
    this.amountText.anchor.set(0.5);
    this.amountText.x = GAME_WIDTH / 2 + 98;
    this.amountText.y = GAME_HEIGHT * 0.585;
    this.panel.addChild(this.amountText);

    const title = new Text({
      text: "You didn't make it!",
      style: new TextStyle({
        fontFamily: "PP Mori",
        fontSize: 38,
        fontWeight: "bold",
        fill: 0xffffff,
        stroke: { color: 0x242424, width: 4 },
      }),
    });
    title.anchor.set(0.5);
    title.x = GAME_WIDTH / 2;
    title.y = GAME_HEIGHT * 0.26;
    this.panel.addChild(title);

    const subtitle = new Text({
      text: "Try again on the app!",
      style: new TextStyle({
        fontFamily: "PP Mori",
        fontSize: 22,
        fontWeight: "bold",
        fill: 0xffffff,
        stroke: { color: 0x5b5b5b, width: 3 },
      }),
    });
    subtitle.anchor.set(0.5);
    subtitle.x = GAME_WIDTH / 2;
    subtitle.y = GAME_HEIGHT * 0.315;
    this.panel.addChild(subtitle);

    this.countdownText = new Text({
      text: "00:56",
      style: new TextStyle({
        fontFamily: "PP Mori",
        fontSize: 38,
        fontWeight: "bold",
        fill: 0xffffff,
      }),
    });
    this.countdownText.anchor.set(0.5);
    this.countdownText.x = GAME_WIDTH / 2;
    this.countdownText.y = GAME_HEIGHT * 0.67;
    this.panel.addChild(this.countdownText);

    const payment = new Text({
      text: "Next payment in one minute",
      style: new TextStyle({
        fontFamily: "PP Mori",
        fontSize: 14,
        fontWeight: "bold",
        fill: 0xffffff,
      }),
    });
    payment.anchor.set(0.5);
    payment.x = GAME_WIDTH / 2;
    payment.y = GAME_HEIGHT * 0.70;
    this.panel.addChild(payment);

    const btn = new Graphics();
    btn.roundRect(GAME_WIDTH / 2 - 148, GAME_HEIGHT * 0.74, 296, 60, 14);
    btn.fill({ color: 0xef3b39 });
    btn.stroke({ color: 0x901d1b, width: 3 });
    this.panel.addChild(btn);

    this.buttonText = new Text({
      text: "INSTALL AND EARN",
      style: new TextStyle({
        fontFamily: "PP Mori",
        fontSize: 24,
        fontWeight: "bold",
        fill: 0xffffff,
        stroke: { color: 0x7f1214, width: 3 },
      }),
    });
    this.buttonText.anchor.set(0.5);
    this.buttonText.x = GAME_WIDTH / 2;
    this.buttonText.y = GAME_HEIGHT * 0.74 + 30;
    this.panel.addChild(this.buttonText);
  }

  play() {
    this.timer = 0;
    this.container.visible = true;
    this.panel.visible = false;
    this.panel.alpha = 0;
    if (this.failSprite) {
      this.failSprite.visible = true;
      this.failSprite.alpha = 1;
      this.failSprite.scale.set(0);
      this.failSprite.rotation = 0;
    }
    this.countdownText.text = "00:56";
    this.amountText.text = `$${this.getMoney().toFixed(2)}`;
  }

  update(dt: number) {
    if (!this.container.visible) return;
    this.timer += dt;

    if (this.failSprite && this.timer < 0.45) {
      const t = Math.min(this.timer / 0.45, 1);
      this.failSprite.scale.set(0.02 + t * 1.15);
      this.failSprite.rotation = Math.sin(t * Math.PI) * 0.02;
    }

    if (this.timer >= 0.45) {
      const fade = Math.min((this.timer - 0.45) / 0.35, 1);
      this.panel.visible = true;
      this.panel.alpha = fade;
      if (this.failSprite) this.failSprite.alpha = 1 - fade;
    }

    const secondsLeft = Math.max(0, 56 - Math.floor(this.timer));
    this.countdownText.text = `00:${String(secondsLeft).padStart(2, "0")}`;
  }

  getDebugMeta() {
    return {
      overlayVariant: "install",
      hasSkyBurstOverlay: false,
      primaryCtaLabel: this.buttonText.text,
      countdownLabel: this.countdownText.text,
    };
  }
}
