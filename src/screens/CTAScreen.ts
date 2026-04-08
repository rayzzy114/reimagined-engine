import gsap from "gsap";
import { Assets, Container, Graphics, Sprite, Text, TextStyle, Texture } from "pixi.js";
import { GAME_WIDTH, GAME_HEIGHT, viewBounds } from "../utils/constants";

export class CTAScreen {
  container: Container;
  private overlay: Graphics;
  private content: Container;
  private heroGlow: Graphics;
  private buttonContainer: Container;
  private buttonText: Text;
  private pulseTimer = 0;
  private introTimer = 0;
  private glowStrength = 0;
  private cardCenterY = GAME_HEIGHT * 0.52;
  private timeline?: gsap.core.Timeline;

  constructor() {
    this.container = new Container();
    this.container.visible = false;

    this.overlay = new Graphics();
    this.layoutOverlay();
    this.container.addChild(this.overlay);

    const topCapsule = new Graphics();
    topCapsule.roundRect(GAME_WIDTH / 2 - 88, 18, 176, 34, 17);
    topCapsule.fill({ color: 0x101010, alpha: 0.95 });
    this.container.addChild(topCapsule);

    this.content = new Container();
    this.container.addChild(this.content);

    this.heroGlow = new Graphics();
    this.content.addChild(this.heroGlow);

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
    this.content.addChild(title);

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
    this.content.addChild(subtitle);

    const paypalCardTex = (Assets.get("paypalCounter") as Texture) || (Assets.get("paypalCard") as Texture);
    if (paypalCardTex) {
      const card = new Sprite(paypalCardTex);
      card.anchor.set(0.5);
      card.x = GAME_WIDTH / 2;
      card.y = this.cardCenterY;
      card.scale.set(0.46);
      this.content.addChild(card);
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
    this.content.addChild(this.buttonContainer);
  }

  update(dt: number) {
    if (!this.container.visible) return;
    this.introTimer += dt;
    this.pulseTimer += dt;
    const pulse = Math.sin(this.pulseTimer * 5.2) * 0.5 + 0.5;
    this.glowStrength = 0.16 + pulse * 0.12;
    this.heroGlow.clear();
    this.heroGlow.roundRect(
      GAME_WIDTH / 2 - (124 + pulse * 4),
      this.cardCenterY - (80 + pulse * 4),
      248 + pulse * 8,
      160 + pulse * 8,
      28
    );
    this.heroGlow.fill({ color: 0xffc15f, alpha: this.glowStrength });
    this.heroGlow.stroke({ color: 0xffecb0, width: 4, alpha: 0.42 + pulse * 0.12 });
  }

  show() {
    this.hide();
    this.introTimer = 0;
    this.pulseTimer = 0;
    this.glowStrength = 0;
    this.container.visible = true;
    this.container.alpha = 0;
    this.content.alpha = 1;
    this.content.scale.set(0.92);
    this.content.x = GAME_WIDTH * 0.04;
    this.content.y = GAME_HEIGHT * 0.028;
    this.buttonContainer.scale.set(0.94);

    this.timeline = gsap.timeline();
    this.timeline.to(this.container, { alpha: 1, duration: 0.22, ease: "power1.out" }, 0);
    this.timeline.to(this.content, { x: 0, y: 0, duration: 0.45, ease: "back.out(1.7)" }, 0.08);
    this.timeline.to(
      this.content.scale,
      { x: 1, y: 1, duration: 0.7, ease: "back.out(1.5)" },
      0.08
    );
    this.timeline.to(
      this.buttonContainer.scale,
      { x: 1, y: 1, duration: 0.45, ease: "back.out(1.7)" },
      0.28
    );
    this.timeline.to(
      this.buttonContainer.scale,
      { x: 1.04, y: 1.04, duration: 1.25, yoyo: true, repeat: -1, ease: "sine.inOut" },
      0.82
    );
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
      introActive: this.introTimer < 0.48,
      contentScale: this.content.scale.x,
      accentGlowStrength: this.glowStrength,
      ctaButtonScale: this.buttonContainer.scale.x,
    };
  }

  onResize() {
    this.layoutOverlay();
  }

  hide() {
    this.timeline?.kill();
    this.timeline = undefined;

    this.container.visible = false;
    this.container.alpha = 1;

    this.content.alpha = 1;
    this.content.scale.set(1);
    this.content.x = 0;
    this.content.y = 0;

    this.buttonContainer.scale.set(1);

    this.introTimer = 0;
    this.pulseTimer = 0;
  }

  private layoutOverlay() {
    this.overlay.clear();
    this.overlay.rect(viewBounds.left, viewBounds.top, viewBounds.width, viewBounds.height);
    this.overlay.fill({ color: 0x121018, alpha: 0.76 });
  }
}
