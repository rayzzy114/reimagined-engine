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

    expect(source).toContain("this.shakeDuration = 150;");
    expect(source).toContain("const decay = 1 - this.shakeElapsed / this.shakeDuration;");
    expect(source).toContain("const magnitude = 12 * decay;");
    expect(source).not.toContain("(Math.random() - 0.5) * 10");
  });

  it("keeps reference invincibility timing and resize-aware overlays", () => {
    const constantsPath = path.resolve(import.meta.dirname, "../src/utils/constants.ts");
    const startScreenPath = path.resolve(import.meta.dirname, "../src/screens/StartScreen.ts");

    expect(readFileSync(constantsPath, "utf8")).toContain("export const INVINCIBILITY_DURATION = 500;");
    expect(readFileSync(startScreenPath, "utf8")).toContain("this.overlay.rect(viewBounds.left, viewBounds.top, viewBounds.width, viewBounds.height);");
  });

  it("does not reject stage taps when the event target is a child display object", () => {
    const gamePath = path.resolve(import.meta.dirname, "../src/Game.ts");
    const source = readFileSync(gamePath, "utf8");

    expect(source).toContain('this.app.stage.on("pointertap", () => {');
    expect(source).not.toContain("event.target !== this.app.stage");
  });

  it("uses resizeTo and a Rectangle hitArea for Pixi v8 interaction", () => {
    const mainPath = path.resolve(import.meta.dirname, "../src/main.ts");
    const gamePath = path.resolve(import.meta.dirname, "../src/Game.ts");

    expect(readFileSync(mainPath, "utf8")).toContain("resizeTo: container,");
    expect(readFileSync(gamePath, "utf8")).toContain("new Rectangle(viewBounds.left, viewBounds.top, viewBounds.width, viewBounds.height)");
  });

  it("spawns hazards off the visible edge and checks obstacle damage against the player body", () => {
    const levelPath = path.resolve(import.meta.dirname, "../src/Level.ts");
    const gamePath = path.resolve(import.meta.dirname, "../src/Game.ts");

    expect(readFileSync(levelPath, "utf8")).toContain("const x = Math.max(viewBounds.right + 280, GAME_WIDTH + 360);");
    expect(readFileSync(gamePath, "utf8")).toContain("if (intersects(playerBounds, obstacleBounds)) {");
  });

  it("includes viewport presets for buyer-facing adaptive previews", () => {
    const mainPath = path.resolve(import.meta.dirname, "../src/main.ts");
    const htmlPath = path.resolve(import.meta.dirname, "../index.html");

    expect(readFileSync(mainPath, "utf8")).toContain('iphone14: { width: 390, height: 844 }');
    expect(readFileSync(mainPath, "utf8")).toContain('iphone16: { width: 393, height: 852 }');
    expect(readFileSync(mainPath, "utf8")).toContain('const isDebug = params.get("debug") === "1";');
    expect(readFileSync(mainPath, "utf8")).toContain("app.renderer.resize(width, height);");
    expect(readFileSync(htmlPath, "utf8")).toContain("body.debug-mode #viewport-debug");
    expect(readFileSync(htmlPath, "utf8")).toContain('<div id="viewport-shell">');
  });

  it("does not restart the end zoom when transitioning from result screens into CTA", () => {
    const gamePath = path.resolve(import.meta.dirname, "../src/Game.ts");
    const source = readFileSync(gamePath, "utf8");

    expect(source).toContain("const preserveEndZoomIntoCta =");
    expect(source).toContain("newState === GameState.CTA &&");
    expect(source).toContain("previousState === GameState.WIN || previousState === GameState.LOSE");
  });

  it("despawns hazards based on full sprite bounds instead of a fixed x threshold", () => {
    const levelPath = path.resolve(import.meta.dirname, "../src/Level.ts");
    const source = readFileSync(levelPath, "utf8");

    expect(source).toContain("const spriteBounds = entity.sprite.getBounds();");
    expect(source).toContain("spriteBounds.x + spriteBounds.width < viewBounds.left - 120");
    expect(source).not.toContain("if (entity.x < -200)");
  });

  it("uses a continuous stripe belt and layered sidewalk decor", () => {
    const backgroundPath = path.resolve(import.meta.dirname, "../src/Background.ts");
    const source = readFileSync(backgroundPath, "utf8");

    expect(source).toContain('private rearDecorLayer: Container;');
    expect(source).toContain('private frontDecorLayer: Container;');
    expect(source).toContain('this.stripeLayer.x = viewBounds.left - this.stripeSpacing * 2 - this.stripeOffset;');
    expect(source).not.toContain('x = ((x % totalWidth) + totalWidth) % totalWidth;');
  });
});
