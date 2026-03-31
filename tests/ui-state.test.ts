import { describe, expect, it } from "vitest";
import { shouldShowHudFooter } from "../src/utils/uiState";

describe("HUD footer visibility", () => {
  it("stays visible during gameplay states", () => {
    expect(shouldShowHudFooter("start")).toBe(true);
    expect(shouldShowHudFooter("playing")).toBe(true);
    expect(shouldShowHudFooter("tutorial_pause")).toBe(true);
  });

  it("hides on final states", () => {
    expect(shouldShowHudFooter("win")).toBe(false);
    expect(shouldShowHudFooter("lose")).toBe(false);
    expect(shouldShowHudFooter("cta")).toBe(false);
  });
});
