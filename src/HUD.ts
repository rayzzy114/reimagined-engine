import { Container, Point, Sprite, Text, TextStyle, Texture, Assets, Graphics } from "pixi.js";
import { GAME_WIDTH, GAME_HEIGHT, MAX_LIVES, viewBounds } from "./utils/constants";
import { createPaypalBadge } from "./utils/paypalBadge";

interface FlyReward {
  sprite: Container;
  start: Point;
  control: Point;
  target: Point;
  progress: number;
  variant: "cash" | "paypal";
  onComplete?: () => void;
}

export class HUD {
  container: Container;
  private heartContainer: Container;
  private heartSprites: Graphics[] = [];
  private moneyText: Text;
  private moneyContainer: Container;
  private counterShell: Container;
  private counterPopHalo: Graphics;
  private footerContainer: Container;
  private footerSprite: Sprite | null = null;
  private footerFallback: Graphics | null = null;
  private muteButton: Container;
  private muteWaves: Graphics;
  private muteSlash: Graphics;
  private muted = false;
  private rewardFlyLayer: Container;
  private rewardFlies: FlyReward[] = [];
  private counterPopTimer = 0;
  private counterPopDuration = 0.36;
  private lastFlyVariant: "cash" | "paypal" | null = null;
  private lastFlyControlY: number | null = null;
  private heartBounceTimers: number[] = [0, 0, 0];

  constructor(onToggleMute: () => void, isMuted: () => boolean) {
    this.container = new Container();
    this.rewardFlyLayer = new Container();
    this.container.addChild(this.rewardFlyLayer);

    // Hearts (drawn as Graphics since we don't have a heart asset that's separate)
    this.heartContainer = new Container();

    for (let i = 0; i < MAX_LIVES; i++) {
      const heart = this.createHeart(0xff4466);
      heart.x = i * 50;
      this.heartContainer.addChild(heart);
      this.heartSprites.push(heart);
    }
    this.container.addChild(this.heartContainer);

    this.moneyContainer = new Container();
    this.moneyContainer.x = GAME_WIDTH - 172;
    this.moneyContainer.y = 6;

    this.counterPopHalo = new Graphics();
    this.counterPopHalo.visible = false;
    this.moneyContainer.addChild(this.counterPopHalo);

    this.counterShell = new Container();
    this.moneyContainer.addChild(this.counterShell);

    const counterTex = Assets.get("paypalCounter") as Texture;
    if (counterTex) {
      const counter = new Sprite(counterTex);
      counter.width = 165;
      counter.height = 112;
      this.counterShell.addChild(counter);
    } else {
      const paypalBg = new Graphics();
      paypalBg.roundRect(0, 0, 160, 50, 12);
      paypalBg.fill({ color: 0xffffff });
      paypalBg.stroke({ color: 0x0070ba, width: 2 });
      this.counterShell.addChild(paypalBg);
    }

    this.moneyText = new Text({
      text: "$0.00",
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
    this.moneyText.y = 21;
    this.counterShell.addChild(this.moneyText);

    this.container.addChild(this.moneyContainer);

    this.muteButton = new Container();
    this.muteButton.eventMode = "static";
    this.muteButton.cursor = "pointer";
    this.muteButton.x = GAME_WIDTH - 220;
    this.muteButton.y = this.moneyContainer.y + 28;

    const muteBg = new Graphics();
    muteBg.roundRect(-24, -24, 48, 48, 12);
    muteBg.fill({ color: 0xffffff, alpha: 0.95 });
    muteBg.stroke({ color: 0x2d66b3, width: 2 });
    this.muteButton.addChild(muteBg);

    const speaker = new Graphics();
    speaker.moveTo(-9, -4);
    speaker.lineTo(-4, -4);
    speaker.lineTo(1, -8);
    speaker.lineTo(1, 8);
    speaker.lineTo(-4, 4);
    speaker.lineTo(-9, 4);
    speaker.closePath();
    speaker.fill({ color: 0x2d66b3 });
    this.muteButton.addChild(speaker);

    this.muteWaves = new Graphics();
    this.muteWaves.arc(4, 0, 4, -0.75, 0.75);
    this.muteWaves.stroke({ color: 0x2d66b3, width: 2 });
    this.muteWaves.arc(4, 0, 7, -0.75, 0.75);
    this.muteWaves.stroke({ color: 0x2d66b3, width: 2 });
    this.muteButton.addChild(this.muteWaves);

    this.muteSlash = new Graphics();
    this.muteSlash.moveTo(-9, 9);
    this.muteSlash.lineTo(10, -10);
    this.muteSlash.stroke({ color: 0xd13a3a, width: 3 });
    this.muteSlash.visible = false;
    this.muteButton.addChild(this.muteSlash);

    this.muteButton.on("pointerdown", (event) => {
      event.stopPropagation();
    });
    this.muteButton.on("pointertap", (event) => {
      event.stopPropagation();
      onToggleMute();
      this.setMuted(isMuted());
    });

    this.setMuted(isMuted());
    this.container.addChild(this.muteButton);

    this.footerContainer = new Container();
    this.container.addChild(this.footerContainer);
    this.layoutFooter();
    this.onResize();
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
      const heart = this.heartSprites[i];
      if (i >= lives && heart.alpha > 0.3) {
        // Animate the lost heart
        heart.scale.set(1.5);
        heart.alpha = 0.3;
        this.heartBounceTimers[i] = 0.25;
      } else {
        heart.alpha = i < lives ? 1 : 0.3;
      }
    }
  }

  updateMoney(amount: number) {
    this.moneyText.text = `$${amount.toFixed(2)}`;
  }

  update(dt: number) {
    // Heart bounce animation
    for (let i = 0; i < this.heartBounceTimers.length; i++) {
      if (this.heartBounceTimers[i] > 0) {
        this.heartBounceTimers[i] = Math.max(0, this.heartBounceTimers[i] - dt);
        const p = this.heartBounceTimers[i] / 0.25;
        this.heartSprites[i].scale.set(1 + p * 0.5);
      }
    }

    for (let index = this.rewardFlies.length - 1; index >= 0; index--) {
      const reward = this.rewardFlies[index];
      reward.progress = Math.min(1, reward.progress + dt * 2.8);

      const t = reward.progress;
      const invT = 1 - t;
      reward.sprite.x =
        invT * invT * reward.start.x +
        2 * invT * t * reward.control.x +
        t * t * reward.target.x;
      reward.sprite.y =
        invT * invT * reward.start.y +
        2 * invT * t * reward.control.y +
        t * t * reward.target.y;
      const startScale = reward.variant === "paypal" ? 1 : 0.18;
      const endScale = reward.variant === "paypal" ? 0.78 : 0.1;
      reward.sprite.scale.set(startScale - t * (startScale - endScale));
      reward.sprite.alpha = 1 - t * 0.15;
      reward.sprite.rotation += reward.variant === "paypal" ? dt * 0.6 : dt * 3.4;

      if (t >= 1) {
        reward.onComplete?.();
        this.rewardFlyLayer.removeChild(reward.sprite);
        reward.sprite.destroy();
        this.rewardFlies.splice(index, 1);
      }
    }

    if (this.counterPopTimer > 0) {
      this.counterPopTimer = Math.max(0, this.counterPopTimer - dt);
      const progress = 1 - this.counterPopTimer / this.counterPopDuration;
      const pulse = Math.sin(progress * Math.PI);
      const scale = 1 + pulse * 0.06;
      this.counterShell.scale.set(scale);
      this.counterPopHalo.visible = true;
      this.counterPopHalo.clear();
      this.counterPopHalo.roundRect(-10, -8, 184, 128, 18);
      this.counterPopHalo.fill({ color: 0xfff1b0, alpha: 0.34 * pulse });
      this.counterPopHalo.stroke({ color: 0xffd05a, width: 3, alpha: 0.8 * pulse });
    } else {
      this.counterShell.scale.set(1);
      this.counterPopHalo.visible = false;
      this.counterPopHalo.clear();
    }
  }

  spawnRewardFly(
    texture: Texture,
    startX: number,
    startY: number,
    variant: "cash" | "paypal",
    onComplete?: () => void
  ) {
    const sprite =
      variant === "paypal"
        ? createPaypalBadge(92, 58, 13)
        : new Sprite(texture);
    if (sprite instanceof Sprite) {
      sprite.anchor.set(0.5);
    }
    sprite.x = startX;
    sprite.y = startY;
    sprite.scale.set(variant === "paypal" ? 1 : 0.18);

    const target = this.getCounterTarget();
    const control = new Point(
      startX + (target.x - startX) * 0.48,
      Math.min(startY, target.y) - (variant === "paypal" ? 210 : 190)
    );

    this.lastFlyVariant = variant;
    this.lastFlyControlY = control.y;
    this.rewardFlyLayer.addChild(sprite);
    this.rewardFlies.push({
      sprite,
      start: new Point(startX, startY),
      control,
      target,
      progress: 0,
      variant,
      onComplete,
    });
  }

  setFooterVisible(value: boolean) {
    this.footerContainer.visible = value;
  }

  onResize() {
    const headerTop = viewBounds.top + 6;
    const narrowViewport = viewBounds.width <= 480;
    const heartScale = narrowViewport ? 0.9 : 1;
    const heartSpacing = narrowViewport ? 44 : 50;

    this.heartContainer.x = viewBounds.left + (narrowViewport ? 12 : 18);
    this.heartContainer.y = headerTop + 2;
    this.heartContainer.scale.set(heartScale);
    this.heartSprites.forEach((heart, index) => {
      heart.x = index * heartSpacing;
    });

    this.moneyContainer.x = viewBounds.right - 172;
    this.moneyContainer.y = headerTop;

    this.muteButton.x = this.moneyContainer.x - 48;
    this.muteButton.y = this.moneyContainer.y + 28;

    this.layoutFooter();
  }

  isFooterVisible() {
    return this.footerContainer.visible;
  }

  setMuted(value: boolean) {
    this.muted = value;
    this.muteSlash.visible = value;
    this.muteWaves.alpha = value ? 0.25 : 1;
  }

  triggerCounterPop() {
    this.counterPopTimer = this.counterPopDuration;
  }

  private getCounterTarget() {
    return new Point(this.moneyContainer.x + 118, this.moneyContainer.y + 42);
  }

  private layoutFooter() {
    const landscape = viewBounds.width > viewBounds.height;
    const footerKey = landscape ? "footerLandscape" : "footerPortrait";
    const footerTex = Assets.get(footerKey) as Texture;
    const footerWidth = viewBounds.width;
    const fallbackHeight = landscape ? 92 : 134;

    if (footerTex) {
      if (!this.footerSprite) {
        this.footerSprite = new Sprite(footerTex);
        this.footerContainer.addChild(this.footerSprite);
      }
      this.footerSprite.texture = footerTex;
      this.footerSprite.x = viewBounds.left;
      this.footerSprite.width = footerWidth;
      this.footerSprite.height = footerTex.height * (footerWidth / footerTex.width);
      this.footerSprite.y = viewBounds.bottom - this.footerSprite.height;
    } else {
      if (!this.footerFallback) {
        this.footerFallback = new Graphics();
        this.footerContainer.addChild(this.footerFallback);
      }
      this.footerFallback.clear();
      this.footerFallback.roundRect(
        viewBounds.left,
        viewBounds.bottom - fallbackHeight,
        footerWidth,
        fallbackHeight,
        20
      );
      this.footerFallback.fill({ color: 0x6b4fa0 });
    }

    if (this.footerFallback) {
      this.footerFallback.visible = !footerTex;
    }
    if (this.footerSprite) {
      this.footerSprite.visible = !!footerTex;
    }
  }

  getDebugMeta() {
    return {
      counterTop: this.moneyContainer.y,
      muteCenterX: this.muteButton.x,
      muteTop: this.muteButton.y - 18,
      muteCenterY: this.muteButton.y,
      counterCenterY: this.moneyContainer.y + 28,
      flyCount: this.rewardFlies.length,
      counterPopActive: this.counterPopTimer > 0,
      counterPopScale: this.counterShell.scale.x,
      lastFlyVariant: this.lastFlyVariant,
      lastFlyControlY: this.lastFlyControlY,
    };
  }
}
