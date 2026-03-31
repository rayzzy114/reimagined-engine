const { expect, test } = require("@playwright/test");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const GAME_WIDTH = 720;
const GAME_HEIGHT = 1280;

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

test("jump applies squash and stretch before settling back to the base scale", async ({ page }) => {
  await page.goto(playableUrl);
  await page.waitForSelector("canvas");
  await page.waitForFunction(() => !!window.__PLAYABLE_TEST_API__);

  await page.evaluate(() => {
    window.__PLAYABLE_TEST_API__?.setState("playing");
    window.__PLAYABLE_TEST_API__?.tap();
  });

  await expect
    .poll(async () => page.evaluate(() => window.__PLAYABLE_TEST_API__?.snapshot().player))
    .toMatchObject({
      jumping: true,
      scaleY: expect.any(Number),
    });

  const airborne = await page.evaluate(() => window.__PLAYABLE_TEST_API__?.snapshot().player);
  expect(airborne.scaleY).toBeGreaterThan(0.54);
  expect(airborne.scaleX).toBeLessThan(0.54);

  await expect
    .poll(async () => page.evaluate(() => window.__PLAYABLE_TEST_API__?.snapshot().player))
    .toMatchObject({
      jumping: false,
      scaleX: 0.54,
      scaleY: 0.54,
    });
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

test("background road stripes move while gameplay is running", async ({ page }) => {
  await page.goto(playableUrl);
  await page.waitForSelector("canvas");
  await page.waitForFunction(() => !!window.__PLAYABLE_TEST_API__);

  await page.evaluate(() => window.__PLAYABLE_TEST_API__?.setState("playing"));

  const before = await page.evaluate(() => window.__PLAYABLE_TEST_API__?.snapshot().background);
  expect(before.stripeCount).toBeGreaterThan(0);

  await page.waitForTimeout(350);

  const after = await page.evaluate(() => window.__PLAYABLE_TEST_API__?.snapshot().background);
  expect(before.stripeRotation).toBe(0);
  expect(after.stripeRotation).toBe(0);
  expect(after.stripeOffset).not.toBe(before.stripeOffset);
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

test("mute button toggles audio without triggering gameplay", async ({ page }) => {
  await page.goto(playableUrl);
  await page.waitForSelector("canvas");
  await page.waitForFunction(() => !!window.__PLAYABLE_TEST_API__);

  await page.evaluate(() => window.__PLAYABLE_TEST_API__?.setState("playing"));

  const before = await page.evaluate(() => window.__PLAYABLE_TEST_API__?.snapshot());
  expect(before.state).toBe("playing");
  expect(before.sound.isMuted).toBe(false);
  const box = await page.locator("canvas").boundingBox();
  const scaleX = box.width / GAME_WIDTH;
  const scaleY = box.height / GAME_HEIGHT;

  await page
    .locator("canvas")
    .click({
      position: {
        x: before.hud.muteCenterX * scaleX,
        y: before.hud.muteCenterY * scaleY,
      },
      force: true,
    });

  await expect
    .poll(async () => page.evaluate(() => window.__PLAYABLE_TEST_API__?.snapshot()))
    .toMatchObject({
      state: "playing",
      sound: {
        isMuted: true,
      },
    });
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

  const hud = await page.evaluate(() => window.__PLAYABLE_TEST_API__?.snapshot().hud);
  expect(hud.lastFlyVariant).toBe("cash");
  expect(hud.lastFlyControlY).toBeLessThan(220);
});

test("collect and hit bursts are tracked in particle debug state", async ({ page }) => {
  await page.goto(playableUrl);
  await page.waitForSelector("canvas");
  await page.waitForFunction(() => !!window.__PLAYABLE_TEST_API__);

  await page.evaluate(() => {
    window.__PLAYABLE_TEST_API__?.setState("playing");
    window.__PLAYABLE_TEST_API__?.collectPickup?.();
    window.__PLAYABLE_TEST_API__?.obstacleHit();
  });

  await expect
    .poll(async () => page.evaluate(() => window.__PLAYABLE_TEST_API__?.snapshot().particles))
    .toMatchObject({
      collectBursts: 1,
      hitBursts: 1,
    });
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

  const activeKinds = await page.evaluate(() =>
    window.__PLAYABLE_TEST_API__?.snapshot().collectibles.map((item) => item.kind)
  );
  expect(activeKinds).not.toContain("paypal_counter");
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

test("win state applies an end zoom instead of a hard cut", async ({ page }) => {
  await page.goto(playableUrl);
  await page.waitForSelector("canvas");
  await page.waitForFunction(() => !!window.__PLAYABLE_TEST_API__);

  await page.evaluate(() => {
    window.__PLAYABLE_TEST_API__?.setState("win");
  });

  await expect
    .poll(async () => page.evaluate(() => window.__PLAYABLE_TEST_API__?.snapshot().endZoomScale))
    .toBeGreaterThan(1.06);

  await expect
    .poll(async () => page.evaluate(() => window.__PLAYABLE_TEST_API__?.snapshot().screenAccentGlowStrength))
    .toBeGreaterThan(0.15);
});

test("win state ticks the reward display up to the final amount", async ({ page }) => {
  await page.goto(playableUrl);
  await page.waitForSelector("canvas");
  await page.waitForFunction(() => !!window.__PLAYABLE_TEST_API__);

  await page.evaluate(() => {
    window.__PLAYABLE_TEST_API__?.setMoney(560);
    window.__PLAYABLE_TEST_API__?.setState("win");
  });

  await expect
    .poll(async () => page.evaluate(() => window.__PLAYABLE_TEST_API__?.snapshot().rewardDisplayAmount))
    .toBeGreaterThan(0);

  const midValue = await page.evaluate(() => window.__PLAYABLE_TEST_API__?.snapshot().rewardDisplayAmount);
  expect(midValue).toBeLessThan(560);

  await expect
    .poll(async () => page.evaluate(() => window.__PLAYABLE_TEST_API__?.snapshot().rewardDisplayAmount))
    .toBe(560);
});

test("win tap triggers install without showing a second CTA screen", async ({ page }) => {
  await page.goto(playableUrl);
  await page.waitForSelector("canvas");
  await page.waitForFunction(() => !!window.__PLAYABLE_TEST_API__);

  await page.evaluate(() => {
    window.__ctaCount = 0;
    window.install = () => {
      window.__ctaCount += 1;
    };
    window.__PLAYABLE_TEST_API__?.setState("win");
    window.__PLAYABLE_TEST_API__?.tap();
  });

  await expect
    .poll(async () =>
      page.evaluate(() => ({
        ctaCount: window.__ctaCount,
        state: window.__PLAYABLE_TEST_API__?.snapshot().state,
      }))
    )
    .toMatchObject({
      ctaCount: 1,
      state: "win",
    });
});

test("finish ribbon sits between posts around the runner torso", async ({ page }) => {
  await page.goto(playableUrl);
  await page.waitForSelector("canvas");
  await page.waitForFunction(() => !!window.__PLAYABLE_TEST_API__);

  await page.evaluate(() => {
    window.__PLAYABLE_TEST_API__?.setState("playing");
    window.__PLAYABLE_TEST_API__?.setDistance(16.9);
  });

  await expect
    .poll(async () => page.evaluate(() => window.__PLAYABLE_TEST_API__?.snapshot().finish))
    .toMatchObject({
      visible: true,
    });

  const finish = await page.evaluate(() => window.__PLAYABLE_TEST_API__?.snapshot().finish);
  expect(finish.hasPosts).toBe(true);
  expect(finish.bannerHeight).toBeLessThanOrEqual(28);
  expect(finish.bannerY).toBeGreaterThanOrEqual(790);
  expect(finish.bannerY).toBeLessThanOrEqual(870);
  expect(finish.groundY - finish.bannerY).toBeGreaterThanOrEqual(120);
  expect(finish.groundY - finish.bannerY).toBeLessThanOrEqual(220);
});

test("cta screen runs an intro motion before settling", async ({ page }) => {
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
      screenIntroActive: true,
    });

  await expect
    .poll(async () => page.evaluate(() => window.__PLAYABLE_TEST_API__?.snapshot().screenAccentGlowStrength))
    .toBeGreaterThan(0.15);
});

test("end-screen CTA pulse is aggressively scaled on win and CTA states", async ({ page }) => {
  await page.goto(playableUrl);
  await page.waitForSelector("canvas");
  await page.waitForFunction(() => !!window.__PLAYABLE_TEST_API__);

  await page.evaluate(() => {
    window.__PLAYABLE_TEST_API__?.setMoney(320);
    window.__PLAYABLE_TEST_API__?.setState("win");
  });

  await expect
    .poll(async () => page.evaluate(() => window.__PLAYABLE_TEST_API__?.snapshot().ctaButtonScale))
    .toBeGreaterThan(1.08);

  await page.evaluate(() => {
    window.__PLAYABLE_TEST_API__?.setState("cta");
  });

  await expect
    .poll(async () => page.evaluate(() => window.__PLAYABLE_TEST_API__?.snapshot().ctaButtonScale))
    .toBeGreaterThan(1.08);
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

  await page.waitForTimeout(2100);
  await expect
    .poll(async () => page.evaluate(() => window.__PLAYABLE_TEST_API__?.snapshot().countdownLabel))
    .not.toBe("00:56");
});

test("lose countdown enters danger mode under ten seconds", async ({ page }) => {
  await page.goto(playableUrl);
  await page.waitForSelector("canvas");
  await page.waitForFunction(() => !!window.__PLAYABLE_TEST_API__);

  await page.evaluate(() => {
    window.__PLAYABLE_TEST_API__?.setState("lose");
    window.__PLAYABLE_TEST_API__?.setLoseTimer?.(47);
  });

  await expect
    .poll(async () => page.evaluate(() => window.__PLAYABLE_TEST_API__?.snapshot()))
    .toMatchObject({
      state: "lose",
      countdownDanger: true,
    });

  const snapshot = await page.evaluate(() => window.__PLAYABLE_TEST_API__?.snapshot());
  expect(snapshot.countdownLabel).toBe("00:09");
  expect(snapshot.countdownScale).toBeGreaterThan(1.04);
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
