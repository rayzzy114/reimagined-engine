import { describe, expect, it } from "vitest";
import {
  inflateBounds,
  intersects,
  isCollectibleCollected,
  shrinkBounds,
  type Bounds,
} from "../src/utils/collision";

describe("collision helpers", () => {
  it("detects overlap between bounds", () => {
    const a: Bounds = { x: 10, y: 10, width: 40, height: 40 };
    const b: Bounds = { x: 35, y: 35, width: 20, height: 20 };

    expect(intersects(a, b)).toBe(true);
  });

  it("does not treat edge-touching bounds as overlap", () => {
    const a: Bounds = { x: 10, y: 10, width: 40, height: 40 };
    const b: Bounds = { x: 50, y: 10, width: 20, height: 20 };

    expect(intersects(a, b)).toBe(false);
  });

  it("inflates bounds symmetrically", () => {
    const bounds: Bounds = { x: 100, y: 200, width: 40, height: 50 };

    expect(inflateBounds(bounds, 6)).toEqual({
      x: 94,
      y: 194,
      width: 52,
      height: 62,
    });
  });

  it("shrinks bounds and clamps width and height at zero", () => {
    const bounds: Bounds = { x: 100, y: 200, width: 20, height: 20 };

    expect(shrinkBounds(bounds, 20)).toEqual({
      x: 120,
      y: 220,
      width: 0,
      height: 0,
    });
  });

  it("collects a visibly overlapping bobbing collectible", () => {
    const playerBounds: Bounds = { x: 110, y: 720, width: 80, height: 180 };
    const collectibleBounds: Bounds = { x: 178, y: 760, width: 40, height: 24 };

    expect(isCollectibleCollected(playerBounds, collectibleBounds, 96)).toBe(true);
  });

  it("does not collect a distant collectible", () => {
    const playerBounds: Bounds = { x: 110, y: 720, width: 80, height: 180 };
    const collectibleBounds: Bounds = { x: 320, y: 760, width: 40, height: 24 };

    expect(isCollectibleCollected(playerBounds, collectibleBounds, 96)).toBe(false);
  });
});
