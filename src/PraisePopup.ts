import { Assets, Container, Sprite, Text, TextStyle, Texture } from "pixi.js";

interface PopupEntry {
  text: Text;
  icon?: Sprite;
  timer: number;
  startY: number;
}

export class PraisePopup {
  container: Container;
  private popups: PopupEntry[] = [];

  constructor() {
    this.container = new Container();
  }

  show(phrase: string, x: number, y: number) {
    const iconTex = Assets.get("coin") as Texture;
    const text = new Text({
      text: phrase,
      style: new TextStyle({
        fontFamily: "PP Mori",
        fontSize: 34,
        fontWeight: "bold",
        fill: 0xffdd00,
        stroke: { color: 0x000000, width: 4 },
        dropShadow: {
          color: 0x000000,
          blur: 2,
          distance: 2,
          angle: Math.PI / 4,
        },
      }),
    });
    text.anchor.set(0.5);
    text.x = x;
    text.y = y + 6;
    text.scale.set(0);
    this.container.addChild(text);

    let icon: Sprite | undefined;
    if (iconTex) {
      icon = new Sprite(iconTex);
      icon.anchor.set(0.5);
      icon.scale.set(0.12);
      icon.x = x;
      icon.y = y - 30;
      icon.alpha = 0;
      this.container.addChild(icon);
    }

    this.popups.push({ text, icon, timer: 0, startY: y });
  }

  update(dt: number) {
    for (let i = this.popups.length - 1; i >= 0; i--) {
      const popup = this.popups[i];
      popup.timer += dt;

      const duration = 0.8;
      const progress = popup.timer / duration;

      if (progress >= 1) {
        if (popup.icon) {
          this.container.removeChild(popup.icon);
          popup.icon.destroy();
        }
        this.container.removeChild(popup.text);
        popup.text.destroy();
        this.popups.splice(i, 1);
        continue;
      }

      // Scale: 0 -> 1 in first 20%, then stay
      const scaleProgress = Math.min(progress / 0.2, 1);
      popup.text.scale.set(scaleProgress);
      if (popup.icon) {
        popup.icon.alpha = scaleProgress;
        popup.icon.y = popup.startY - 30 - progress * 28;
        popup.icon.scale.set(0.12 + scaleProgress * 0.02);
      }

      // Float up
      popup.text.y = popup.startY - progress * 60;

      // Fade out in last 30%
      if (progress > 0.7) {
        popup.text.alpha = 1 - (progress - 0.7) / 0.3;
        if (popup.icon) popup.icon.alpha = popup.text.alpha;
      }
    }
  }
}
