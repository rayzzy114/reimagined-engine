import { Assets, Container, Graphics, Sprite, Text, TextStyle, Texture } from "pixi.js";
import { GAME_WIDTH, GAME_HEIGHT } from "../utils/constants";

export class WinScreen {
  container: Container;
  private content: Container;
  private rewardAmountText: Text;
  private buttonText: Text;
  private introTimer = 0;

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

    const paypalCardTex = (Assets.get("paypalCounter") as Texture) || (Assets.get("paypalCard") as Texture);
    if (paypalCardTex) {
      const card = new Sprite(paypalCardTex);
      card.anchor.set(0.5);
      card.x = GAME_WIDTH / 2;
      card.y = GAME_HEIGHT * 0.52;
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

    const btnBg = new Graphics();
    btnBg.roundRect(GAME_WIDTH / 2 - 150, GAME_HEIGHT * 0.74, 300, 66, 14);
    btnBg.fill({ color: 0xef3b39 });
    btnBg.stroke({ color: 0x901d1b, width: 3 });
    this.content.addChild(btnBg);

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
    this.buttonText.y = GAME_HEIGHT * 0.74 + 33;
    this.content.addChild(this.buttonText);
  }

  show(money: number) {
    this.rewardAmountText.text = `$${money.toFixed(2)}`;
    this.introTimer = 0;
    this.content.alpha = 0;
    this.content.scale.set(0.94);
    this.content.x = GAME_WIDTH * 0.03;
    this.content.y = GAME_HEIGHT * 0.02;
  }

  update(dt: number) {
    if (!this.container.visible) return;
    this.introTimer += dt;
    const t = Math.min(this.introTimer / 0.42, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    this.content.alpha = eased;
    this.content.scale.set(0.94 + eased * 0.06);
    this.content.x = GAME_WIDTH * 0.03 * (1 - eased);
    this.content.y = GAME_HEIGHT * 0.02 * (1 - eased);
  }

  getDebugMeta() {
    return {
      overlayVariant: "install",
      hasSkyBurstOverlay: false,
      primaryCtaLabel: this.buttonText.text,
      introActive: this.introTimer < 0.42,
      contentScale: this.content.scale.x,
    };
  }
}
