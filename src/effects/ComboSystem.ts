import { Container, Text, TextStyle, Graphics } from "pixi.js";
import { GAME_WIDTH, viewBounds } from "../utils/constants";

export class ComboSystem {
  container: Container;
  private streak = 0;
  private multiplier = 1;
  private streakText: Text;
  private multiplierBadge: Container;
  private multiplierText: Text;
  private multiplierGlow: Graphics;
  private comboBreakText: Text;
  private glowPhase = 0;
  private breakTimer = 0;

  constructor() {
    this.container = new Container();

    // Streak counter
    this.streakText = new Text({
      text: "",
      style: new TextStyle({
        fontFamily: "PP Mori",
        fontSize: 32,
        fontWeight: "bold",
        fill: 0xffd700,
        stroke: { color: 0x000000, width: 4 },
      }),
    });
    this.streakText.anchor.set(0.5);
    this.streakText.x = GAME_WIDTH / 2;
    this.streakText.y = 80;
    this.streakText.visible = false;
    this.container.addChild(this.streakText);

    // Multiplier badge
    this.multiplierBadge = new Container();
    this.multiplierBadge.x = GAME_WIDTH - 200;
    this.multiplierBadge.y = 80;

    this.multiplierGlow = new Graphics();
    this.multiplierBadge.addChild(this.multiplierGlow);

    const badgeBg = new Graphics();
    badgeBg.roundRect(-30, -20, 60, 40, 8);
    badgeBg.fill({ color: 0xff6600 });
    this.multiplierBadge.addChild(badgeBg);

    this.multiplierText = new Text({
      text: "x1",
      style: new TextStyle({
        fontFamily: "PP Mori",
        fontSize: 24,
        fontWeight: "bold",
        fill: 0xffffff,
      }),
    });
    this.multiplierText.anchor.set(0.5);
    this.multiplierBadge.addChild(this.multiplierText);
    this.multiplierBadge.visible = false;
    this.container.addChild(this.multiplierBadge);

    // Combo break text
    this.comboBreakText = new Text({
      text: "COMBO LOST",
      style: new TextStyle({
        fontFamily: "PP Mori",
        fontSize: 36,
        fontWeight: "bold",
        fill: 0xff0000,
        stroke: { color: 0xffffff, width: 4 },
      }),
    });
    this.comboBreakText.anchor.set(0.5);
    this.comboBreakText.x = GAME_WIDTH / 2;
    this.comboBreakText.y = GAME_WIDTH / 2;
    this.comboBreakText.visible = false;
    this.container.addChild(this.comboBreakText);
  }

  onCoinCollect(): number {
    this.streak++;
    this.updateMultiplier();
    this.updateUI();
    return this.multiplier;
  }

  onCoinMissed() {
    if (this.streak > 0) {
      this.breakCombo();
    }
  }

  private updateMultiplier() {
    const oldMultiplier = this.multiplier;

    if (this.streak >= 9) {
      this.multiplier = 4;
    } else if (this.streak >= 6) {
      this.multiplier = 3;
    } else if (this.streak >= 3) {
      this.multiplier = 2;
    } else {
      this.multiplier = 1;
    }

    if (this.multiplier > oldMultiplier) {
      this.onMultiplierUpgrade();
    }
  }

  private onMultiplierUpgrade() {
    this.multiplierBadge.scale.set(1.3);
  }

  private breakCombo() {
    this.streak = 0;
    this.multiplier = 1;
    this.breakTimer = 1;
    this.comboBreakText.visible = true;
    this.comboBreakText.alpha = 1;
    this.updateUI();
  }

  private updateUI() {
    if (this.streak > 0) {
      this.streakText.text = `${this.streak} COMBO!`;
      this.streakText.visible = true;
      this.multiplierBadge.visible = true;
      this.multiplierText.text = `x${this.multiplier}`;
    } else {
      this.streakText.visible = false;
      this.multiplierBadge.visible = false;
    }
  }

  update(dt: number) {
    // Glow pulse
    if (this.streak > 0) {
      this.glowPhase += dt * 4;
      const pulse = Math.sin(this.glowPhase) * 0.5 + 0.5;
      this.multiplierGlow.clear();
      this.multiplierGlow.roundRect(-35, -25, 70, 50, 10);
      this.multiplierGlow.fill({ color: 0xffaa00, alpha: pulse * 0.4 });
    }

    // Badge scale lerp
    const targetScale = 1;
    this.multiplierBadge.scale.x += (targetScale - this.multiplierBadge.scale.x) * 0.2;
    this.multiplierBadge.scale.y += (targetScale - this.multiplierBadge.scale.y) * 0.2;

    // Combo break fade
    if (this.breakTimer > 0) {
      this.breakTimer -= dt;
      this.comboBreakText.alpha = Math.max(0, this.breakTimer);
      if (this.breakTimer <= 0) {
        this.comboBreakText.visible = false;
      }
    }
  }

  getMultiplier(): number {
    return this.multiplier;
  }
}
