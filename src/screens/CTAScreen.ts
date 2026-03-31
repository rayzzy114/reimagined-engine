import { Assets, Container, Graphics, Sprite, Text, TextStyle, Texture } from "pixi.js";
import { GAME_WIDTH, GAME_HEIGHT } from "../utils/constants";

export class CTAScreen {
  container: Container;
  private buttonContainer: Container;
  private buttonText: Text;
  private pulseTimer = 0;

  constructor() {
    this.container = new Container();
    this.container.visible = false;

    const overlay = new Graphics();
    overlay.rect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    overlay.fill({ color: 0x121018, alpha: 0.76 });
    this.container.addChild(overlay);

    const topCapsule = new Graphics();
    topCapsule.roundRect(GAME_WIDTH / 2 - 88, 18, 176, 34, 17);
    topCapsule.fill({ color: 0x101010, alpha: 0.95 });
    this.container.addChild(topCapsule);

    const title = new Text({
      text: "Play in the app",
      style: new TextStyle({
        fontFamily: "PP Mori",
        fontSize: 48,
        fontWeight: "bold",
        fill: 0xffffff,
        stroke: { color: 0x2f2f2f, width: 6 },
      }),
    });
    title.anchor.set(0.5);
    title.x = GAME_WIDTH / 2;
    title.y = GAME_HEIGHT * 0.26;
    this.container.addChild(title);

    const subtitle = new Text({
      text: "Cash out with PayPal",
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
    this.container.addChild(subtitle);

    const paypalCardTex = Assets.get("paypalCard") as Texture;
    if (paypalCardTex) {
      const card = new Sprite(paypalCardTex);
      card.anchor.set(0.5);
      card.x = GAME_WIDTH / 2;
      card.y = GAME_HEIGHT * 0.52;
      card.scale.set(0.44);
      this.container.addChild(card);
    }

    this.buttonContainer = new Container();
    this.buttonContainer.x = GAME_WIDTH / 2;
    this.buttonContainer.y = GAME_HEIGHT * 0.74 + 33;
    this.buttonContainer.eventMode = "static";
    this.buttonContainer.cursor = "pointer";

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
    this.buttonContainer.on("pointertap", () => this.triggerCTA());
    this.container.addChild(this.buttonContainer);
  }

  update(dt: number) {
    if (!this.container.visible) return;
    this.pulseTimer += dt;
    const scale = 1 + Math.sin(this.pulseTimer * 4) * 0.03;
    this.buttonContainer.scale.set(scale);
  }

  triggerCTA() {
    const globalScope = window;
    const extended = globalScope as Window & {
      clickTag?: string;
      install?: () => void;
      openStore?: () => void;
      mraid?: { open?: (url: string) => void };
      ExitApi?: { exit?: () => void };
    };

    if (typeof extended.install === "function") {
      extended.install();
      return;
    }

    if (typeof extended.openStore === "function") {
      extended.openStore();
      return;
    }

    if (typeof extended.ExitApi?.exit === "function") {
      extended.ExitApi.exit();
      return;
    }

    if (typeof extended.clickTag === "string" && extended.clickTag.length > 0) {
      if (typeof extended.mraid?.open === "function") {
        extended.mraid.open(extended.clickTag);
        return;
      }

      window.open(extended.clickTag, "_blank", "noopener,noreferrer");
    }
  }

  getDebugMeta() {
    return {
      overlayVariant: "install",
      hasSkyBurstOverlay: false,
      primaryCtaLabel: this.buttonText.text,
    };
  }
}
