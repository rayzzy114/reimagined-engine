import { Assets, Container, Graphics, Sprite, Text, TextStyle, Texture } from "pixi.js";
import { GAME_WIDTH, GAME_HEIGHT } from "../utils/constants";

export class WinScreen {
  container: Container;
  private content: Container;
  private heroGlow: Graphics;
  private rewardAmountText: Text;
  private buttonContainer: Container;
  private buttonText: Text;
  private introTimer = 0;
  private pulseTimer = 0;
  private glowStrength = 0;
  private cardCenterY = GAME_HEIGHT * 0.52;
  private rewardDisplayAmount = 0;
  private rewardTargetAmount = 0;
  private rewardTickTimer = 0;
  private readonly rewardTickDuration = 0.9;

  constructor(onContinue: () => void, getMoney: () => number) {
    this.container = new Container();
    this.container.visible = false;

    const overlay = new Graphics();
    overlay.rect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    overlay.fill({ color: 0x17151f, alpha: 0.72 });
    this.container.addChild(overlay);

    const topCapsule = new Graphics();
    topCapsule.roundRect(GAME_WIDTH / 2 - 88, 18, 176, 34, 17);
    topCapsule.fill({ color: 0x101010, alpha: 0.95 });
    this.container.addChild(topCapsule);

    this.content = new Container();
    this.container.addChild(this.content);

    this.heroGlow = new Graphics();
    this.content.addChild(this.heroGlow);

    const paypalCardTex = (Assets.get("paypalCounter") as Texture) || (Assets.get("paypalCard") as Texture);
    if (paypalCardTex) {
      const card = new Sprite(paypalCardTex);
      card.anchor.set(0.5);
      card.x = GAME_WIDTH / 2;
      card.y = this.cardCenterY;
      card.scale.set(0.46);
      this.content.addChild(card);
    }

    const title = new Text({
      text: "Congratulations",
      style: new TextStyle({
        fontFamily: "PP Mori",
        fontSize: 52,
        fontWeight: "bold",
        fill: 0xffffff,
        stroke: { color: 0x2f2f2f, width: 6 },
      }),
    });
    title.anchor.set(0.5);
    title.x = GAME_WIDTH / 2;
    title.y = GAME_HEIGHT * 0.26;
    this.content.addChild(title);

    const subtitle = new Text({
      text: "Cash out in the app!",
      style: new TextStyle({
        fontFamily: "PP Mori",
        fontSize: 24,
        fontWeight: "bold",
        fill: 0xffffff,
        stroke: { color: 0x6b6b6b, width: 4 },
      }),
    });
    subtitle.anchor.set(0.5);
    subtitle.x = GAME_WIDTH / 2;
    subtitle.y = GAME_HEIGHT * 0.315;
    this.content.addChild(subtitle);

    this.rewardAmountText = new Text({
      text: `$${getMoney().toFixed(2)}`,
      style: new TextStyle({
        fontFamily: "PP Mori",
        fontSize: 46,
        fontWeight: "bold",
        fill: 0x111111,
        stroke: { color: 0xffffff, width: 6 },
      }),
    });
    this.rewardAmountText.anchor.set(0.5);
    this.rewardAmountText.x = GAME_WIDTH / 2 + 98;
    this.rewardAmountText.y = GAME_HEIGHT * 0.585;
    this.content.addChild(this.rewardAmountText);

    this.buttonContainer = new Container();
    this.buttonContainer.x = GAME_WIDTH / 2;
    this.buttonContainer.y = GAME_HEIGHT * 0.74 + 33;
    this.content.addChild(this.buttonContainer);

    const btnBg = new Graphics();
    btnBg.roundRect(-150, -33, 300, 66, 14);
    btnBg.fill({ color: 0xef3b39 });
    btnBg.stroke({ color: 0x901d1b, width: 3 });
    this.buttonContainer.addChild(btnBg);

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

  show(money: number) {
    this.rewardTargetAmount = money;
    this.rewardDisplayAmount = 0;
    this.rewardTickTimer = 0;
    this.rewardAmountText.text = "$0.00";
    this.introTimer = 0;
    this.pulseTimer = 0;
    this.content.alpha = 0;
    this.content.scale.set(0.9);
    this.content.x = GAME_WIDTH * 0.03;
    this.content.y = GAME_HEIGHT * 0.02;
    this.buttonContainer.scale.set(1);
  }

  update(dt: number) {
    if (!this.container.visible) return;
    this.introTimer += dt;
    this.pulseTimer += dt;
    const t = Math.min(this.introTimer / 0.48, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    const pulse = Math.sin(this.pulseTimer * 5.4) * 0.5 + 0.5;
    this.rewardTickTimer = Math.min(this.rewardTickDuration, this.rewardTickTimer + dt);
    const rewardProgress = this.rewardTickTimer / this.rewardTickDuration;
    const rewardEased = 1 - Math.pow(1 - rewardProgress, 3);
    this.rewardDisplayAmount = Number((this.rewardTargetAmount * rewardEased).toFixed(2));
    this.rewardAmountText.text = `$${this.rewardDisplayAmount.toFixed(2)}`;
    const buttonScale = 1 + Math.sin(this.pulseTimer * 6.4) * 0.095;
    this.buttonContainer.scale.set(buttonScale);
    this.content.alpha = eased;
    this.content.scale.set(0.9 + eased * 0.12 + pulse * 0.018);
    this.content.x = GAME_WIDTH * 0.035 * (1 - eased);
    this.content.y = GAME_HEIGHT * 0.026 * (1 - eased) - pulse * 4;
    this.glowStrength = 0.12 + pulse * 0.12;
    this.heroGlow.clear();
    this.heroGlow.roundRect(
      GAME_WIDTH / 2 - (126 + pulse * 4),
      this.cardCenterY - (82 + pulse * 4),
      252 + pulse * 8,
      164 + pulse * 8,
      30
    );
    this.heroGlow.fill({ color: 0xffd86b, alpha: this.glowStrength });
    this.heroGlow.stroke({ color: 0xfff0b9, width: 4, alpha: 0.4 + pulse * 0.12 });
  }

  getDebugMeta() {
    return {
      overlayVariant: "install",
      hasSkyBurstOverlay: false,
      primaryCtaLabel: this.buttonText.text,
      introActive: this.introTimer < 0.48,
      contentScale: this.content.scale.x,
      accentGlowStrength: this.glowStrength,
      ctaButtonScale: this.buttonContainer.scale.x,
      rewardDisplayAmount: this.rewardDisplayAmount,
    };
  }
}
