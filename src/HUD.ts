import { Container, Point, Sprite, Text, TextStyle, Texture, Assets, Graphics } from "pixi.js";
import { GAME_WIDTH, GAME_HEIGHT, MAX_LIVES } from "./utils/constants";

interface FlyReward {
  sprite: Sprite;
  start: Point;
  control: Point;
  target: Point;
  progress: number;
}

export class HUD {
  container: Container;
  private heartSprites: Graphics[] = [];
  private moneyText: Text;
  private moneyContainer: Container;
  private footerContainer: Container;
  private muteButton: Container;
  private muteWaves: Graphics;
  private muteSlash: Graphics;
  private muted = false;
  private rewardFlyLayer: Container;
  private rewardFlies: FlyReward[] = [];

  constructor(onToggleMute: () => void, isMuted: () => boolean) {
    this.container = new Container();
    this.rewardFlyLayer = new Container();
    this.container.addChild(this.rewardFlyLayer);

    // Hearts (drawn as Graphics since we don't have a heart asset that's separate)
    const heartContainer = new Container();
    heartContainer.x = 30;
    heartContainer.y = 24;

    for (let i = 0; i < MAX_LIVES; i++) {
      const heart = this.createHeart(0xff4466);
      heart.x = i * 50;
      heartContainer.addChild(heart);
      this.heartSprites.push(heart);
    }
    this.container.addChild(heartContainer);

    this.moneyContainer = new Container();
    this.moneyContainer.x = GAME_WIDTH - 172;
    this.moneyContainer.y = 6;

    const counterTex = Assets.get("paypalCounter") as Texture;
    if (counterTex) {
      const counter = new Sprite(counterTex);
      counter.width = 165;
      counter.height = 112;
      this.moneyContainer.addChild(counter);
    } else {
      const paypalBg = new Graphics();
      paypalBg.roundRect(0, 0, 160, 50, 12);
      paypalBg.fill({ color: 0xffffff });
      paypalBg.stroke({ color: 0x0070ba, width: 2 });
      this.moneyContainer.addChild(paypalBg);
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
    this.moneyText.y = 21;
    this.moneyContainer.addChild(this.moneyText);

    this.container.addChild(this.moneyContainer);

    this.muteButton = new Container();
    this.muteButton.eventMode = "static";
    this.muteButton.cursor = "pointer";
    this.muteButton.x = GAME_WIDTH - 220;
    this.muteButton.y = this.moneyContainer.y + 28;

    const muteBg = new Graphics();
    muteBg.roundRect(-18, -18, 36, 36, 10);
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

  update(dt: number) {
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
      reward.sprite.scale.set(0.18 - t * 0.08);
      reward.sprite.alpha = 1 - t * 0.15;
      reward.sprite.rotation += dt * 3.4;

      if (t >= 1) {
        this.rewardFlyLayer.removeChild(reward.sprite);
        reward.sprite.destroy();
        this.rewardFlies.splice(index, 1);
      }
    }
  }

  spawnRewardFly(texture: Texture, startX: number, startY: number) {
    const sprite = new Sprite(texture);
    sprite.anchor.set(0.5);
    sprite.x = startX;
    sprite.y = startY;
    sprite.scale.set(0.18);

    const target = this.getCounterTarget();
    const control = new Point(
      startX + (target.x - startX) * 0.55,
      Math.min(startY, target.y) - 120
    );

    this.rewardFlyLayer.addChild(sprite);
    this.rewardFlies.push({
      sprite,
      start: new Point(startX, startY),
      control,
      target,
      progress: 0,
    });
  }

  setFooterVisible(value: boolean) {
    this.footerContainer.visible = value;
  }

  isFooterVisible() {
    return this.footerContainer.visible;
  }

  setMuted(value: boolean) {
    this.muted = value;
    this.muteSlash.visible = value;
    this.muteWaves.alpha = value ? 0.25 : 1;
  }

  private getCounterTarget() {
    return new Point(this.moneyContainer.x + 118, this.moneyContainer.y + 42);
  }

  getDebugMeta() {
    return {
      counterTop: this.moneyContainer.y,
      muteTop: this.muteButton.y - 18,
      muteCenterY: this.muteButton.y,
      counterCenterY: this.moneyContainer.y + 28,
      flyCount: this.rewardFlies.length,
    };
  }
}
