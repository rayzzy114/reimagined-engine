import { Application } from "pixi.js";
import { GAME_WIDTH, GAME_HEIGHT, viewBounds } from "./utils/constants";
import { Game } from "./Game";

declare global {
  interface Window {
    __PLAYABLE_TEST_API__?: {
      snapshot: () => ReturnType<Game["getDebugSnapshot"]>;
      setState: (state: string) => void;
      setMoney: (money: number) => void;
      setDistance: (distance: number) => void;
      setLoseTimer: (seconds: number) => void;
      tap: () => void;
      obstacleHit: () => void;
      spawnObstacleCollision: () => void;
      collectPickup: () => void;
      spawnRewardFly: () => void;
      triggerNearMiss: () => void;
      setViewportPreset?: (preset: string) => void;
    };
  }
}

const VIEWPORT_PRESETS: Record<string, { width: number; height: number } | null> = {
  auto: null,
  iphone14: { width: 390, height: 844 },
  iphone16: { width: 393, height: 852 },
  ipad: { width: 768, height: 1024 },
  ipadair: { width: 820, height: 1180 },
  laptop: { width: 1366, height: 768 },
  desktop: { width: 1920, height: 1080 },
};

async function init() {
  const app = new Application();
  const params = new URLSearchParams(window.location.search);
  const isDebug = params.get("debug") === "1";
  const container = document.getElementById("game")!;
  const shell = document.getElementById("viewport-shell")!;
  const debugPanel = document.getElementById("viewport-debug");
  let currentPreset = "auto";

  document.body.classList.toggle("debug-mode", isDebug);

  await app.init({
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    resizeTo: container,
    backgroundColor: 0x87ceeb,
    resolution: Math.min(3, Math.max(2, window.devicePixelRatio || 1)),
    autoDensity: true,
    antialias: true,
  });

  container.appendChild(app.canvas as HTMLCanvasElement);
  (app.canvas as HTMLCanvasElement).style.width = "100%";
  (app.canvas as HTMLCanvasElement).style.height = "100%";

  function syncRendererToContainer() {
    const width = Math.round(container.clientWidth);
    const height = Math.round(container.clientHeight);

    if (width > 0 && height > 0) {
      app.renderer.resize(width, height);
    }
  }

  function applyViewportPreset(preset: string) {
    if (!isDebug) {
      return;
    }

    currentPreset = preset in VIEWPORT_PRESETS ? preset : "auto";
    const size = VIEWPORT_PRESETS[currentPreset];

    if (size) {
      container.style.width = `${size.width}px`;
      container.style.height = `${size.height}px`;
      container.style.maxWidth = "calc(100vw - 32px)";
      container.style.maxHeight = "calc(100vh - 32px)";
      document.body.classList.add("preset-active");
    } else {
      container.style.width = "100%";
      container.style.height = "100%";
      container.style.maxWidth = "";
      container.style.maxHeight = "";
      document.body.classList.remove("preset-active");
    }

    debugPanel?.querySelectorAll("button").forEach((button) => {
      button.classList.toggle("active", button.getAttribute("data-preset") === currentPreset);
    });

    requestAnimationFrame(() => {
      syncRendererToContainer();
      layoutStage();
    });
  }

  function layoutStage() {
    const vw = app.screen.width;
    const vh = app.screen.height;

    // Scale to fit: all game content visible, no cropping
    const scale = Math.min(vw / GAME_WIDTH, vh / GAME_HEIGHT);

    app.stage.scale.set(scale);
    app.stage.x = (vw - GAME_WIDTH * scale) / 2;
    app.stage.y = (vh - GAME_HEIGHT * scale) / 2;

    // Compute visible area in game coordinates
    viewBounds.left = -app.stage.x / scale;
    viewBounds.top = -app.stage.y / scale;
    viewBounds.right = viewBounds.left + vw / scale;
    viewBounds.bottom = viewBounds.top + vh / scale;
    viewBounds.width = viewBounds.right - viewBounds.left;
    viewBounds.height = viewBounds.bottom - viewBounds.top;

    game?.onResize();
  }

  let game: Game | null = null;

  window.addEventListener("resize", () => {
    requestAnimationFrame(() => {
      syncRendererToContainer();
      layoutStage();
    });
  });
  if (isDebug) {
    debugPanel?.addEventListener("click", (event) => {
      const target = event.target as HTMLElement | null;
      const preset = target?.getAttribute("data-preset");
      if (preset) {
        applyViewportPreset(preset);
      }
    });
  }
  syncRendererToContainer();
  layoutStage();

  game = new Game(app);
  await game.init();
  syncRendererToContainer();
  layoutStage();

  window.__PLAYABLE_TEST_API__ = {
    snapshot: () => game.getDebugSnapshot(),
    setState: (state: string) => game.debugSetState(state as any),
    setMoney: (money: number) => game.debugSetMoney(money),
    setDistance: (distance: number) => game.debugSetDistance(distance),
    setLoseTimer: (seconds: number) => game.debugSetLoseTimer(seconds),
    tap: () => game.debugTap(),
    obstacleHit: () => game.debugObstacleHit(),
    spawnObstacleCollision: () => game.debugSpawnObstacleCollision(),
    collectPickup: () => game.debugCollectPickup(),
    spawnRewardFly: () => game.debugSpawnRewardFly(),
    triggerNearMiss: () => game.debugTriggerNearMiss(),
    ...(isDebug ? { setViewportPreset: (preset: string) => applyViewportPreset(preset) } : {}),
  };
}

init();
