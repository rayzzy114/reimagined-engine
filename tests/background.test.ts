import { Assets, Texture } from "pixi.js";
import { describe, expect, it } from "vitest";
import { Background } from "../src/Background";
import { viewBounds } from "../src/utils/constants";

function seedBackgroundTextures() {
  Assets.cache.set("bgMain", Texture.WHITE);
  Assets.cache.set("tree1", Texture.WHITE);
  Assets.cache.set("tree2", Texture.WHITE);
  Assets.cache.set("bushPremium1", Texture.WHITE);
  Assets.cache.set("bushPremium2", Texture.WHITE);
}

function getRoundedGaps(values: number[]) {
  const sorted = [...values].sort((left, right) => left - right);
  return sorted.slice(1).map((value, index) => Math.round(value - sorted[index]));
}

function withViewBounds(width: number, height: number, callback: () => void) {
  const original = {
    left: viewBounds.left,
    top: viewBounds.top,
    right: viewBounds.right,
    bottom: viewBounds.bottom,
    width: viewBounds.width,
    height: viewBounds.height,
  };

  viewBounds.left = 0;
  viewBounds.top = 0;
  viewBounds.right = width;
  viewBounds.bottom = height;
  viewBounds.width = width;
  viewBounds.height = height;

  try {
    callback();
  } finally {
    viewBounds.left = original.left;
    viewBounds.top = original.top;
    viewBounds.right = original.right;
    viewBounds.bottom = original.bottom;
    viewBounds.width = original.width;
    viewBounds.height = original.height;
  }
}

describe("Background decor", () => {
  it("seeds only front greenery when the scenic background already carries the horizon", () => {
    seedBackgroundTextures();
    const background = new Background();

    const meta = background.getDebugMeta();
    const frontGaps = getRoundedGaps(meta.frontTreeXs);
    const frontBushGaps = getRoundedGaps(meta.frontBushXs);
    const firstFrontTreeX = Math.min(...meta.frontTreeXs);
    const lastFrontTreeX = Math.max(...meta.frontTreeXs);

    expect(meta.rearDecorSpeeds).toHaveLength(0);
    expect(meta.frontDecorSpeeds.length).toBeGreaterThan(0);
    expect(new Set(meta.frontDecorSpeeds)).toHaveLength(1);
    expect(meta.rearTreeTargetCount).toBe(0);
    expect(meta.rearBushTargetCount).toBe(0);
    expect(meta.rearTreeXs).toHaveLength(0);
    expect(meta.frontTreeXs).toHaveLength(4);
    expect(meta.rearBushXs).toHaveLength(0);
    expect(meta.frontBushXs).toHaveLength(3);
    expect(meta.bushXs).toHaveLength(3);
    expect(meta.visibleRearTreeCount).toBe(0);
    expect(meta.visibleFrontTreeCount).toBe(4);
    expect(meta.visibleRearBushCount).toBe(0);
    expect(meta.visibleFrontBushCount).toBe(3);
    expect(meta.visibleBushCount).toBe(3);
    expect(frontGaps.length).toBeGreaterThan(1);
    expect(Math.min(...frontGaps)).toBeGreaterThanOrEqual(168);
    expect(Math.min(...frontBushGaps)).toBeGreaterThanOrEqual(170);
    expect(meta.bushXs.every((x) => x > firstFrontTreeX && x < lastFrontTreeX)).toBe(true);
    expect(meta.decorKinds.length).toBeGreaterThan(0);
    expect(meta.decorKinds.every((kind) => ["tree1", "tree2", "bushPremium1", "bushPremium2"].includes(kind))).toBe(true);
    expect(meta.decorKinds.length).toBe(7);
    expect(meta.rearTreeHeights).toHaveLength(0);
    expect(meta.frontTreeHeights.length).toBeGreaterThan(0);
    expect(meta.rearBushHeights).toHaveLength(0);
    expect(meta.frontBushHeights.length).toBeGreaterThan(0);
    expect(meta.bushHeights.length).toBeGreaterThan(0);
    expect(Math.min(...meta.frontTreeHeights)).toBeGreaterThanOrEqual(338);
    expect(Math.min(...meta.frontBushHeights)).toBeGreaterThanOrEqual(145);
    expect(Math.max(...meta.frontBushHeights)).toBeLessThanOrEqual(200);
  });

  it("keeps runtime tree spacing wide while the background scrolls", () => {
    seedBackgroundTextures();
    const background = new Background();

    for (let index = 0; index < 32; index++) {
      background.update(0.25);
    }

    const meta = background.getDebugMeta();
    const visibleFrontGaps = getRoundedGaps(meta.visibleFrontTreeXs);

    expect(meta.visibleRearTreeXs).toHaveLength(0);
    expect(meta.visibleFrontTreeXs.length).toBeGreaterThanOrEqual(3);
    expect(Math.min(...visibleFrontGaps)).toBeGreaterThanOrEqual(270);
    expect(meta.visibleBushXs.length).toBeGreaterThanOrEqual(1);
  });

  it("keeps mobile foliage compact and separated on narrow viewports", () => {
    seedBackgroundTextures();

    withViewBounds(720, 1558, () => {
      const background = new Background();
      const meta = background.getDebugMeta();

      expect(meta.rearTreeTargetCount).toBe(0);
      expect(meta.frontTreeTargetCount).toBe(4);
      expect(meta.rearBushTargetCount).toBe(0);
      expect(meta.frontBushTargetCount).toBe(3);
      expect(meta.rearTreeXs).toHaveLength(0);
      expect(meta.frontTreeXs).toHaveLength(4);
      expect(meta.rearBushXs).toHaveLength(0);
      expect(meta.frontBushXs).toHaveLength(3);
      expect(Math.min(...getRoundedGaps(meta.frontTreeXs))).toBeGreaterThanOrEqual(230);
      expect(Math.min(...getRoundedGaps(meta.frontBushXs))).toBeGreaterThanOrEqual(170);
      expect(Math.max(...meta.frontTreeHeights)).toBeLessThanOrEqual(400);
      expect(Math.max(...meta.frontBushHeights)).toBeLessThanOrEqual(170);
    });
  });
});
