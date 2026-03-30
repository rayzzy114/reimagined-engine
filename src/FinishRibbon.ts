import { Container, Graphics } from "pixi.js";
import { GAME_WIDTH, GAME_HEIGHT } from "./utils/constants";

interface RopePoint {
  x: number;
  y: number;
  oldX: number;
  oldY: number;
  pinned: boolean;
}

export class FinishRibbon {
  container: Container;
  private points: RopePoint[] = [];
  private graphics: Graphics;
  private active = false;
  private broken = false;
  private readonly numPoints = 12;
  private readonly restLength: number;
  private ribbonX = GAME_WIDTH + 200;

  constructor() {
    this.container = new Container();
    this.graphics = new Graphics();
    this.container.addChild(this.graphics);

    const topY = GAME_HEIGHT * 0.35;
    const bottomY = GAME_HEIGHT * 0.75;
    this.restLength = (bottomY - topY) / (this.numPoints - 1);

    for (let i = 0; i < this.numPoints; i++) {
      const y = topY + i * this.restLength;
      this.points.push({
        x: this.ribbonX,
        y,
        oldX: this.ribbonX,
        oldY: y,
        pinned: i === 0 || i === this.numPoints - 1,
      });
    }
  }

  setPosition(x: number) {
    const dx = x - this.ribbonX;
    this.ribbonX = x;
    for (const p of this.points) {
      p.x += dx;
      p.oldX += dx;
    }
  }

  breakRibbon(playerY: number) {
    if (this.broken) return;
    this.broken = true;

    // Apply impulse to points near player
    for (const p of this.points) {
      if (!p.pinned) {
        const dist = Math.abs(p.y - playerY);
        const force = Math.max(0, 1 - dist / 200) * 300;
        p.oldX = p.x - force;
      }
    }
    // Unpin bottom
    this.points[this.points.length - 1].pinned = false;
  }

  update(dt: number) {
    if (!this.active && !this.broken) return;

    const gravity = 400;

    // Verlet integration
    for (const p of this.points) {
      if (p.pinned) continue;

      const vx = (p.x - p.oldX) * 0.98;
      const vy = (p.y - p.oldY) * 0.98;
      p.oldX = p.x;
      p.oldY = p.y;
      p.x += vx;
      p.y += vy + gravity * dt * dt;
    }

    // Constraint solving
    for (let iter = 0; iter < 5; iter++) {
      for (let i = 0; i < this.points.length - 1; i++) {
        const p1 = this.points[i];
        const p2 = this.points[i + 1];
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist === 0) continue;
        const diff = (this.restLength - dist) / dist * 0.5;
        const ox = dx * diff;
        const oy = dy * diff;
        if (!p1.pinned) { p1.x -= ox; p1.y -= oy; }
        if (!p2.pinned) { p2.x += ox; p2.y += oy; }
      }
    }

    this.render();
  }

  private render() {
    this.graphics.clear();

    if (this.points.length < 2) return;

    // Red ribbon
    this.graphics.moveTo(this.points[0].x, this.points[0].y);
    for (let i = 1; i < this.points.length; i++) {
      const prev = this.points[i - 1];
      const curr = this.points[i];
      const cpX = (prev.x + curr.x) / 2;
      const cpY = (prev.y + curr.y) / 2;
      this.graphics.quadraticCurveTo(prev.x, prev.y, cpX, cpY);
    }
    const last = this.points[this.points.length - 1];
    this.graphics.lineTo(last.x, last.y);

    this.graphics.stroke({ width: 8, color: 0xff0000 });

    // White stripes on ribbon
    this.graphics.moveTo(this.points[0].x, this.points[0].y);
    for (let i = 1; i < this.points.length; i++) {
      const prev = this.points[i - 1];
      const curr = this.points[i];
      const cpX = (prev.x + curr.x) / 2;
      const cpY = (prev.y + curr.y) / 2;
      this.graphics.quadraticCurveTo(prev.x, prev.y, cpX, cpY);
    }
    this.graphics.lineTo(last.x, last.y);
    this.graphics.stroke({ width: 3, color: 0xffffff, alpha: 0.5 });
  }

  show() {
    this.active = true;
    this.render();
  }
}
