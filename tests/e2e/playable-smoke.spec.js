const { expect, test } = require("@playwright/test");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

const playableUrl = pathToFileURL(
  path.resolve(__dirname, "../../dist/index.html")
).href;

test("start tap enters gameplay without runtime freeze", async ({ page }) => {
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(String(error)));

  await page.goto(playableUrl);
  await page.waitForSelector("canvas");
  await page.waitForFunction(() => !!window.__PLAYABLE_TEST_API__);

  const before = await page.evaluate(() => window.__PLAYABLE_TEST_API__?.snapshot());
  expect(before?.state).toBe("start");

  await page.evaluate(() => window.__PLAYABLE_TEST_API__?.tap());

  await expect
    .poll(async () => page.evaluate(() => window.__PLAYABLE_TEST_API__?.snapshot().state))
    .toBe("playing");

  expect(pageErrors).toEqual([]);
});

test("warning obstacle is represented as a cone and warning text is emitted", async ({ page }) => {
  await page.goto(playableUrl);
  await page.waitForSelector("canvas");
  await page.waitForFunction(() => !!window.__PLAYABLE_TEST_API__);
  await page.waitForFunction(() => !!window.__PLAYABLE_TEST_API__);
  await page.evaluate(() => window.__PLAYABLE_TEST_API__?.setState("playing"));

  await expect
    .poll(async () => page.evaluate(() => window.__PLAYABLE_TEST_API__?.snapshot().nextWarning))
    .toMatchObject({
      obstacleKind: "cone",
      label: "EVADE!",
    });
});

test("obstacle hit flow removes one life", async ({ page }) => {
  await page.goto(playableUrl);
  await page.waitForSelector("canvas");
  await page.waitForFunction(() => !!window.__PLAYABLE_TEST_API__);

  await page.evaluate(() => {
    window.__PLAYABLE_TEST_API__?.setState("playing");
    window.__PLAYABLE_TEST_API__?.obstacleHit();
  });

  await expect
    .poll(async () => page.evaluate(() => window.__PLAYABLE_TEST_API__?.snapshot().lives))
    .toBe(2);
});

test("top hud keeps the sound button aligned with the paypal counter", async ({ page }) => {
  await page.goto(playableUrl);
  await page.waitForSelector("canvas");
  await page.waitForFunction(() => !!window.__PLAYABLE_TEST_API__);

  const snapshot = await page.evaluate(() => window.__PLAYABLE_TEST_API__?.snapshot());
  expect(snapshot.hud.muteTop).toBeGreaterThanOrEqual(snapshot.hud.counterTop);
  expect(Math.abs(snapshot.hud.muteCenterY - snapshot.hud.counterCenterY)).toBeLessThanOrEqual(2);
});

test("collecting money can spawn a fly-to-counter animation", async ({ page }) => {
  await page.goto(playableUrl);
  await page.waitForSelector("canvas");
  await page.waitForFunction(() => !!window.__PLAYABLE_TEST_API__);

  await page.evaluate(() => {
    window.__PLAYABLE_TEST_API__?.spawnRewardFly();
  });

  await expect
    .poll(async () => page.evaluate(() => window.__PLAYABLE_TEST_API__?.snapshot().hud.flyCount))
    .toBeGreaterThan(0);
});

test("reward arrival triggers a counter pop on the paypal hud", async ({ page }) => {
  await page.goto(playableUrl);
  await page.waitForSelector("canvas");
  await page.waitForFunction(() => !!window.__PLAYABLE_TEST_API__);

  await page.evaluate(() => {
    window.__PLAYABLE_TEST_API__?.spawnRewardFly();
  });

  await expect
    .poll(async () => page.evaluate(() => window.__PLAYABLE_TEST_API__?.snapshot().hud.counterPopActive))
    .toBe(true);
});

test("jackpot moment is scripted near the finish", async ({ page }) => {
  await page.goto(playableUrl);
  await page.waitForSelector("canvas");
  await page.waitForFunction(() => !!window.__PLAYABLE_TEST_API__);

  await page.evaluate(() => {
    window.__PLAYABLE_TEST_API__?.setState("playing");
    window.__PLAYABLE_TEST_API__?.setDistance(16.9);
  });

  await expect
    .poll(async () => page.evaluate(() => window.__PLAYABLE_TEST_API__?.snapshot().jackpot))
    .toMatchObject({
      totalCount: 4,
      activeCount: 4,
      upcomingCount: 0,
    });
});

test("near-miss bonus adds money and surfaces feedback", async ({ page }) => {
  await page.goto(playableUrl);
  await page.waitForSelector("canvas");
  await page.waitForFunction(() => !!window.__PLAYABLE_TEST_API__);

  await page.evaluate(() => {
    window.__PLAYABLE_TEST_API__?.setState("playing");
    window.__PLAYABLE_TEST_API__?.triggerNearMiss();
  });

  await expect
    .poll(async () => page.evaluate(() => window.__PLAYABLE_TEST_API__?.snapshot()))
    .toMatchObject({
      money: 20,
      nearMissCount: 1,
      lastNearMissLabel: "Close call!",
    });

  await expect
    .poll(async () => page.evaluate(() => window.__PLAYABLE_TEST_API__?.snapshot().hud.counterPopActive))
    .toBe(true);
});

test("win state uses the payoff overlay style without the sky burst", async ({ page }) => {
  await page.goto(playableUrl);
  await page.waitForSelector("canvas");
  await page.waitForFunction(() => !!window.__PLAYABLE_TEST_API__);

  await page.evaluate(() => {
    window.__PLAYABLE_TEST_API__?.setMoney(560);
    window.__PLAYABLE_TEST_API__?.setState("win");
  });

  await expect
    .poll(async () => page.evaluate(() => window.__PLAYABLE_TEST_API__?.snapshot()))
    .toMatchObject({
      state: "win",
      footerVisible: false,
      overlayVariant: "install",
      hasSkyBurstOverlay: false,
      primaryCtaLabel: "INSTALL AND EARN",
    });
});

test("lose state uses the install-and-earn layout", async ({ page }) => {
  await page.goto(playableUrl);
  await page.waitForSelector("canvas");
  await page.waitForFunction(() => !!window.__PLAYABLE_TEST_API__);

  await page.evaluate(() => {
    window.__PLAYABLE_TEST_API__?.setMoney(201);
    window.__PLAYABLE_TEST_API__?.setState("lose");
  });

  await expect
    .poll(async () => page.evaluate(() => window.__PLAYABLE_TEST_API__?.snapshot()))
    .toMatchObject({
      state: "lose",
      footerVisible: false,
      overlayVariant: "install",
      primaryCtaLabel: "INSTALL AND EARN",
      money: 201,
    });
});

test("cta state keeps the install layout and CTA label", async ({ page }) => {
  await page.goto(playableUrl);
  await page.waitForSelector("canvas");
  await page.waitForFunction(() => !!window.__PLAYABLE_TEST_API__);

  await page.evaluate(() => {
    window.__PLAYABLE_TEST_API__?.setState("cta");
  });

  await expect
    .poll(async () => page.evaluate(() => window.__PLAYABLE_TEST_API__?.snapshot()))
    .toMatchObject({
      state: "cta",
      footerVisible: false,
      overlayVariant: "install",
      primaryCtaLabel: "INSTALL AND EARN",
    });
});
