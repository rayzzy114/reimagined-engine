import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("Game source regressions", () => {
  it("uses the imported inflateBounds helper instead of a missing instance method", () => {
    const gamePath = path.resolve(import.meta.dirname, "../src/Game.ts");
    const source = readFileSync(gamePath, "utf8");

    expect(source).not.toContain("this.inflateBounds(");
  });

  it("uses a short decay-based shake instead of the old flat 10px jitter", () => {
    const gamePath = path.resolve(import.meta.dirname, "../src/Game.ts");
    const source = readFileSync(gamePath, "utf8");

    expect(source).toContain("const duration = 150;");
    expect(source).toContain("const decay = 1 - elapsed / duration;");
    expect(source).toContain("const magnitude = 12 * decay;");
    expect(source).not.toContain("(Math.random() - 0.5) * 10");
  });
});
