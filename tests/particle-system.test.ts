import { describe, expect, it } from "vitest";
import { ParticleSystem } from "../src/ParticleSystem";

function advance(system: ParticleSystem, seconds: number, step = 1 / 60) {
  let remaining = seconds;
  while (remaining > 0) {
    const dt = Math.min(step, remaining);
    system.update(dt);
    remaining -= dt;
  }
}

describe("ParticleSystem", () => {
  it("reuses particle display objects across bursts instead of recreating them", () => {
    const system = new ParticleSystem();

    system.burstCollect(100, 120);
    const firstBurstGraphics = [...system.container.children];
    expect(firstBurstGraphics).toHaveLength(8);

    advance(system, 1);
    expect(system.getDebugMeta().activeCount).toBe(0);

    system.burstCollect(180, 220);
    const secondBurstGraphics = [...system.container.children];
    expect(secondBurstGraphics).toHaveLength(8);
    expect(secondBurstGraphics.every((graphic) => firstBurstGraphics.includes(graphic))).toBe(true);
  });
});
