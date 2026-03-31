import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("Game source regressions", () => {
  it("uses the imported inflateBounds helper instead of a missing instance method", () => {
    const gamePath = path.resolve(import.meta.dirname, "../src/Game.ts");
    const source = readFileSync(gamePath, "utf8");

    expect(source).not.toContain("this.inflateBounds(");
  });
});
