import { Container, Graphics } from "pixi.js";

interface Particle {
  graphics: Graphics;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

type BurstKind = "collect" | "hit";

export class ParticleSystem {
  container: Container;
  private particles: Particle[] = [];
  private graphicsPool: Graphics[] = [];
  private collectBursts = 0;
  private hitBursts = 0;

  constructor() {
    this.container = new Container();
  }

  burstCollect(x: number, y: number) {
    this.collectBursts++;
    this.burst(x, y, 8, 0xffd54a, 320, "collect");
  }

  burstHit(x: number, y: number) {
    this.hitBursts++;
    this.burst(x, y, 6, 0xff4d57, 220, "hit");
  }

  update(dt: number) {
    for (let index = this.particles.length - 1; index >= 0; index--) {
      const particle = this.particles[index];
      particle.life += dt;

      if (particle.life >= particle.maxLife) {
        this.container.removeChild(particle.graphics);
        particle.graphics.visible = false;
        this.graphicsPool.push(particle.graphics);
        this.particles.splice(index, 1);
        continue;
      }

      particle.vy += 640 * dt;
      particle.graphics.x += particle.vx * dt;
      particle.graphics.y += particle.vy * dt;

      const progress = particle.life / particle.maxLife;
      particle.graphics.alpha = 1 - progress;
      particle.graphics.scale.set(1 - progress * 0.5);
    }
  }

  getDebugMeta() {
    return {
      collectBursts: this.collectBursts,
      hitBursts: this.hitBursts,
      activeCount: this.particles.length,
    };
  }

  private burst(
    x: number,
    y: number,
    count: number,
    color: number,
    speed: number,
    kind: BurstKind
  ) {
    for (let index = 0; index < count; index++) {
      const angle = (Math.PI * 2 * index) / count + (Math.random() - 0.5) * 0.45;
      const velocity = speed * (0.6 + Math.random() * 0.45);
      const size = kind === "collect" ? 4 + Math.random() * 3 : 5 + Math.random() * 2;
      const particleGraphic = this.acquireGraphic(size, color, x, y);
      particleGraphic.x = x;
      particleGraphic.y = y;
      this.container.addChild(particleGraphic);

      this.particles.push({
        graphics: particleGraphic,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity - (kind === "collect" ? 80 : 20),
        life: 0,
        maxLife: 0.24 + Math.random() * 0.14,
      });
    }
  }

  private acquireGraphic(size: number, color: number, x: number, y: number) {
    const particleGraphic = this.graphicsPool.pop() ?? new Graphics();
    particleGraphic.clear();
    particleGraphic.circle(0, 0, size);
    particleGraphic.fill({ color });
    particleGraphic.alpha = 1;
    particleGraphic.scale.set(1);
    particleGraphic.visible = true;
    particleGraphic.x = x;
    particleGraphic.y = y;

    return particleGraphic;
  }
}
