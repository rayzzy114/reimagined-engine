import { Container, Graphics, Text, TextStyle } from "pixi.js";

export function createPaypalBadge(width: number, height: number, fontSize = 16) {
  const badge = new Container();

  const bg = new Graphics();
  bg.roundRect(-width / 2, -height / 2, width, height, Math.min(18, height * 0.22));
  bg.fill({ color: 0xffffff });
  bg.stroke({ color: 0x14479c, width: Math.max(2, height * 0.07) });
  badge.addChild(bg);

  const logo = new Text({
    text: "P",
    style: new TextStyle({
      fontFamily: "PP Mori",
      fontSize: Math.round(height * 0.62),
      fontWeight: "bold",
      fill: 0x123a8f,
    }),
  });
  logo.anchor.set(0.5);
  logo.x = -width * 0.24;
  logo.y = -height * 0.06;
  badge.addChild(logo);

  const brand = new Text({
    text: "PayPal",
    style: new TextStyle({
      fontFamily: "PP Mori",
      fontSize,
      fontWeight: "bold",
      fill: 0x145fc2,
    }),
  });
  brand.anchor.set(0.5);
  brand.x = width * 0.12;
  brand.y = height * 0.06;
  badge.addChild(brand);

  return badge;
}
