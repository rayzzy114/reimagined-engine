import gsap from "gsap";
import { Assets, Container, Graphics, Sprite, Text, TextStyle, Texture } from "pixi.js";
import { GAME_WIDTH, GAME_HEIGHT, viewBounds } from "../utils/constants";

export class WinScreen {
  container: Container;
  private overlay: Graphics;
  private fireworksLayer: Container;
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
  private startedAtMs = 0;
  private lastRewardUpdateMs = 0;
  private timeline?: gsap.core.Timeline;
  private fireworkLoop?: gsap.core.Timeline;
  private fireworkTimelines: gsap.core.Timeline[] = [];
  private fireworkStep = 0;
  private readonly fireworkBursts = [
    { x: GAME_WIDTH * 0.20, y: GAME_HEIGHT * 0.17 },
    { x: GAME_WIDTH * 0.77, y: GAME_HEIGHT * 0.20 },
    { x: GAME_WIDTH * 0.52, y: GAME_HEIGHT * 0.12 },
    { x: GAME_WIDTH * 0.30, y: GAME_HEIGHT * 0.31 },
    { x: GAME_WIDTH * 0.70, y: GAME_HEIGHT * 0.29 },
  ];
  private readonly fireworkPalettes = [
    [0xfff3b0, 0xffd24a, 0xff9a6b, 0xffffff],
    [0xffc15f, 0xff6a6a, 0xffffff, 0xfff1d2],
    [0x9be7ff, 0xffffff, 0x57c7ff, 0xffe39c],
    [0xb9ff9c, 0xfff0a8, 0xffffff, 0xff7ac8],
  ];

  constructor(onContinue: () => void, getMoney: () => number) {
    this.container = new Container();
    this.container.visible = false;

    this.overlay = new Graphics();
    this.layoutOverlay();
    this.container.addChild(this.overlay);

    this.fireworksLayer = new Container();
    this.fireworksLayer.blendMode = "add";
    this.container.addChild(this.fireworksLayer);

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
    this.hide();
    this.rewardTargetAmount = money;
    this.rewardDisplayAmount = 0;
    this.rewardTickTimer = 0;
    this.startedAtMs = 0;
    this.lastRewardUpdateMs = 0;
    this.rewardAmountText.text = "$0.00";
    this.introTimer = 0;
    this.pulseTimer = 0;
    this.container.visible = true;
    this.container.alpha = 0;
    this.content.alpha = 1;
    this.content.scale.set(0.92);
    this.content.x = GAME_WIDTH * 0.03;
    this.content.y = GAME_HEIGHT * 0.02;
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
    this.timeline.call(() => this.startFireworks(), undefined, 0.26);
  }

  update(dt: number) {
    if (!this.container.visible) {
      this.startedAtMs = 0;
      return;
    }

    if (this.startedAtMs === 0) {
      this.startedAtMs = performance.now();
    }

    const nowMs = performance.now();
    const elapsedSeconds = Math.max(0, (nowMs - this.startedAtMs) / 1000);
    this.introTimer = elapsedSeconds;
    this.pulseTimer = elapsedSeconds;
    const pulse = Math.sin(this.pulseTimer * 5.4) * 0.5 + 0.5;

    if (this.lastRewardUpdateMs === 0) {
      this.lastRewardUpdateMs = nowMs;
    }

    const rewardDeltaSeconds = Math.max(0, (nowMs - this.lastRewardUpdateMs) / 1000);
    this.lastRewardUpdateMs = nowMs;
    this.rewardTickTimer = Math.min(this.rewardTickDuration, this.rewardTickTimer + Math.min(rewardDeltaSeconds, 0.12));
    const rewardProgress = this.rewardTickTimer / this.rewardTickDuration;
    const rewardEased = 1 - Math.pow(1 - rewardProgress, 3);
    this.rewardDisplayAmount =
      rewardProgress >= 0.95
        ? this.rewardTargetAmount
        : Number((this.rewardTargetAmount * rewardEased).toFixed(2));
    this.rewardAmountText.text = `$${this.rewardDisplayAmount.toFixed(2)}`;
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
      fireworksBursts: this.fireworksLayer.children.length,
    };
  }

  hide() {
    this.stopFireworks();
    this.timeline?.kill();
    this.timeline = undefined;

    this.container.visible = false;
    this.container.alpha = 1;

    this.content.alpha = 1;
    this.content.scale.set(1);
    this.content.x = 0;
    this.content.y = 0;

    this.buttonContainer.scale.set(1);

    this.startedAtMs = 0;
    this.lastRewardUpdateMs = 0;
  }

  private startFireworks() {
    this.stopFireworks();
    this.fireworkStep = 0;
    this.fireworkLoop = gsap.timeline({ repeat: -1, repeatDelay: 0.35 });
    this.fireworkLoop.call(() => this.spawnFireworkBurst(), undefined, 0.0);
    this.fireworkLoop.call(() => this.spawnFireworkBurst(), undefined, 0.18);
    this.fireworkLoop.call(() => this.spawnFireworkBurst(), undefined, 0.36);
    this.fireworkLoop.call(() => this.spawnFireworkBurst(), undefined, 0.54);
  }

  private stopFireworks() {
    this.fireworkLoop?.kill();
    this.fireworkLoop = undefined;

    for (const timeline of this.fireworkTimelines) {
      timeline.kill();
    }
    this.fireworkTimelines = [];

    while (this.fireworksLayer.children.length > 0) {
      const child = this.fireworksLayer.children[this.fireworksLayer.children.length - 1];
      this.fireworksLayer.removeChild(child);
      child.destroy({ children: true });
    }
  }

  private spawnFireworkBurst() {
    const burstIndex = this.fireworkStep++;
    const position = this.fireworkBursts[burstIndex % this.fireworkBursts.length];
    const palette = this.fireworkPalettes[burstIndex % this.fireworkPalettes.length];
    const burst = new Container({ blendMode: "add" });
    burst.position.set(position.x, position.y);
    burst.eventMode = "none";
    this.fireworksLayer.addChild(burst);

    const flash = new Graphics();
    flash.circle(0, 0, 9);
    flash.fill({ color: palette[3], alpha: 0.9 });
    flash.alpha = 0.95;
    flash.scale.set(0.35);
    burst.addChild(flash);

    const ring = new Graphics();
    ring.circle(0, 0, 16);
    ring.stroke({ color: palette[0], width: 3, alpha: 0.9 });
    ring.alpha = 0.8;
    ring.scale.set(0.55);
    burst.addChild(ring);

    const halo = new Graphics();
    halo.circle(0, 0, 22);
    halo.fill({ color: palette[1], alpha: 0.18 });
    halo.alpha = 0.65;
    halo.scale.set(0.4);
    burst.addChild(halo);

    let timeline!: gsap.core.Timeline;
    timeline = gsap.timeline({
      onComplete: () => {
        const index = this.fireworkTimelines.indexOf(timeline);
        if (index >= 0) {
          this.fireworkTimelines.splice(index, 1);
        }
        if (burst.parent) {
          burst.parent.removeChild(burst);
        }
        burst.destroy({ children: true });
      },
    });
    this.fireworkTimelines.push(timeline);

    timeline.to(flash.scale, { x: 2.5, y: 2.5, duration: 0.18, ease: "power2.out" }, 0);
    timeline.to(flash, { alpha: 0, duration: 0.18, ease: "power1.out" }, 0);
    timeline.to(ring.scale, { x: 2.4, y: 2.4, duration: 0.34, ease: "power3.out" }, 0.02);
    timeline.to(ring, { alpha: 0, duration: 0.34, ease: "power1.out" }, 0.02);
    timeline.to(halo.scale, { x: 2.9, y: 2.9, duration: 0.42, ease: "power2.out" }, 0);
    timeline.to(halo, { alpha: 0, duration: 0.42, ease: "power1.out" }, 0);

    const sparkCount = 12;
    for (let index = 0; index < sparkCount; index++) {
      const angle = (Math.PI * 2 * index) / sparkCount + (Math.random() - 0.5) * 0.28;
      const travel = 74 + Math.random() * 48;
      const drift = 12 + Math.random() * 18;
      const sparkColor = palette[index % palette.length];
      const spark = new Graphics();
      spark.roundRect(-1.8, -8.5, 3.6, 17, 1.8);
      spark.fill({ color: sparkColor });
      spark.alpha = 1;
      spark.rotation = angle;
      spark.scale.set(0.92);
      burst.addChild(spark);

      const sparkDuration = 0.56 + Math.random() * 0.12;
      const delay = 0.04 + index * 0.01;

      timeline.to(
        spark,
        {
          x: Math.cos(angle) * travel,
          y: Math.sin(angle) * travel - drift,
          alpha: 0,
          rotation: angle + (Math.random() - 0.5) * 1.2,
          duration: sparkDuration,
          ease: "power3.out",
        },
        delay
      );
      timeline.to(
        spark.scale,
        { x: 0.22, y: 0.22, duration: sparkDuration, ease: "power3.out" },
        delay
      );
    }
  }

  onResize() {
    this.layoutOverlay();
  }

  private layoutOverlay() {
    this.overlay.clear();
    this.overlay.rect(viewBounds.left, viewBounds.top, viewBounds.width, viewBounds.height);
    this.overlay.fill({ color: 0x17151f, alpha: 0.72 });
  }
}
