import { Assets, Container, Graphics, Sprite, Text, TextStyle, Texture } from "pixi.js";
import { GAME_WIDTH, GAME_HEIGHT, viewBounds } from "../utils/constants";

export class LoseScreen {
  private static readonly COUNTDOWN_SECONDS = 56;
  container: Container;
  private overlay: Graphics;
  private getMoney: () => number;
  private failSprite: Sprite | null = null;
  private panel: Container;
  private amountText: Text;
  private countdownText: Text;
  private buttonContainer: Container;
  private buttonText: Text;
  private timer = 0;
  private countdownDanger = false;
  private startedAtMs = 0;

  constructor(onRetry: () => void, getMoney: () => number) {
    this.container = new Container();
    this.container.visible = false;
    this.getMoney = getMoney;

    this.overlay = new Graphics();
    this.layoutOverlay();
    this.container.addChild(this.overlay);

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

    this.buttonContainer = new Container();
    this.buttonContainer.x = GAME_WIDTH / 2;
    this.buttonContainer.y = GAME_HEIGHT * 0.74 + 30;
    this.panel.addChild(this.buttonContainer);

    const btn = new Graphics();
    btn.roundRect(-148, -30, 296, 60, 14);
    btn.fill({ color: 0xef3b39 });
    btn.stroke({ color: 0x901d1b, width: 3 });
    this.buttonContainer.addChild(btn);

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
    this.buttonContainer.addChild(this.buttonText);
  }

  play() {
    this.timer = 0;
    this.startedAtMs = performance.now();
    this.container.visible = true;
    this.panel.visible = false;
    this.panel.alpha = 0;
    if (this.failSprite) {
      this.failSprite.visible = true;
      this.failSprite.alpha = 1;
      this.failSprite.scale.set(0);
      this.failSprite.rotation = 0;
    }
    this.countdownText.text = `00:${String(LoseScreen.COUNTDOWN_SECONDS).padStart(2, "0")}`;
    this.amountText.text = `$${this.getMoney().toFixed(2)}`;
    this.countdownDanger = false;
    this.countdownText.style.fill = 0xffffff;
    this.countdownText.scale.set(1);
    this.buttonContainer.scale.set(1);
  }

  update(dt: number) {
    if (!this.container.visible) {
      this.startedAtMs = 0;
      return;
    }

    if (this.startedAtMs === 0) {
      this.startedAtMs = performance.now();
    }

    this.timer = Math.max(0, (performance.now() - this.startedAtMs) / 1000);

    if (this.failSprite && this.timer < 0.45) {
      const t = Math.min(this.timer / 0.45, 1);
      this.failSprite.scale.set(0.02 + t * 0.98);
      this.failSprite.rotation = Math.sin(t * Math.PI) * 0.02;
    }

    if (this.timer >= 0.45) {
      const fade = Math.min((this.timer - 0.45) / 0.35, 1);
      this.panel.visible = true;
      this.panel.alpha = fade;
      if (this.failSprite) this.failSprite.alpha = 1 - fade;
    }

    const secondsLeft = Math.max(0, LoseScreen.COUNTDOWN_SECONDS - Math.floor(this.timer));
    this.countdownText.text = `00:${String(secondsLeft).padStart(2, "0")}`;
    const buttonScale = 1.08 + Math.sin(this.timer * 6.1) * 0.035;
    this.buttonContainer.scale.set(buttonScale);
    this.countdownDanger = secondsLeft < 10;
    if (this.countdownDanger) {
      const pulse = Math.sin(this.timer * 9.4) * 0.5 + 0.5;
      this.countdownText.style.fill = 0xff5353;
      this.countdownText.scale.set(1.05 + pulse * 0.14);
    } else {
      this.countdownText.style.fill = 0xffffff;
      this.countdownText.scale.set(1);
    }
  }

  debugSetTimer(seconds: number) {
    this.timer = Math.max(0, seconds);
    this.startedAtMs = performance.now() - this.timer * 1000;
    this.panel.visible = this.timer >= 0.45;
    this.panel.alpha = this.panel.visible ? 1 : 0;
    if (this.failSprite) {
      this.failSprite.alpha = this.panel.visible ? 0 : 1;
    }
    this.update(0);
  }

  getDebugMeta() {
    return {
      overlayVariant: "install",
      hasSkyBurstOverlay: false,
      primaryCtaLabel: this.buttonText.text,
      countdownLabel: this.countdownText.text,
      countdownDanger: this.countdownDanger,
      countdownScale: this.countdownText.scale.x,
      ctaButtonScale: this.buttonContainer.scale.x,
    };
  }

  onResize() {
    this.layoutOverlay();
  }

  private layoutOverlay() {
    this.overlay.clear();
    this.overlay.rect(viewBounds.left, viewBounds.top, viewBounds.width, viewBounds.height);
    this.overlay.fill({ color: 0x121018, alpha: 0.72 });
  }
}
