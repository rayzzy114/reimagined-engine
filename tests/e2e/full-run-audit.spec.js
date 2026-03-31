const { test, expect } = require("@playwright/test");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

const playableUrl = pathToFileURL(
  path.resolve(__dirname, "../../dist/index.html")
).href;

const strategies = [
  { name: "steady-700", interval: 700, duration: 18000 },
  { name: "steady-850", interval: 850, duration: 18000 },
  { name: "steady-1000", interval: 1000, duration: 18000 },
  { name: "late-taps", interval: 900, delay: 2500, duration: 18000 },
];

test("full run audit via real taps", async ({ page }) => {
  test.setTimeout(120000);
  const results = [];

  for (const strategy of strategies) {
    const pageErrors = [];
    page.on("pageerror", (error) => pageErrors.push(String(error)));

    await page.goto(playableUrl);
    await page.waitForSelector("canvas");
    await page.waitForFunction(() => !!window.__PLAYABLE_TEST_API__);
    const canvas = page.locator("canvas");
    const box = await canvas.boundingBox();
    if (!box) {
      throw new Error("Canvas bounding box is missing");
    }
    const tapX = box.x + box.width / 2;
    const tapY = box.y + box.height / 2;

    await page.mouse.click(tapX, tapY);

    const startedAt = Date.now();
    while (Date.now() - startedAt < strategy.duration) {
      const elapsed = Date.now() - startedAt;
      if (elapsed > (strategy.delay || 0)) {
        await page.mouse.click(tapX, tapY);
      }

      await page.waitForTimeout(strategy.interval);
      const state = await page.evaluate(() => window.__PLAYABLE_TEST_API__?.snapshot().state);
      if (state === "win" || state === "lose" || state === "cta") {
        break;
      }
    }

    const snapshot = await page.evaluate(() => window.__PLAYABLE_TEST_API__?.snapshot());
    results.push({
      strategy: strategy.name,
      state: snapshot.state,
      lives: snapshot.lives,
      money: snapshot.money,
      countdownLabel: snapshot.countdownLabel,
      pageErrors,
    });
  }

  expect(results.every((entry) => entry.pageErrors.length === 0)).toBe(true);
  expect(results.some((entry) => entry.state === "win" || entry.state === "cta")).toBe(true);
});
