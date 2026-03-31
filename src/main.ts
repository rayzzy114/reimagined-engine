import { Application } from "pixi.js";
import { GAME_WIDTH, GAME_HEIGHT } from "./utils/constants";
import { Game } from "./Game";

declare global {
  interface Window {
    __PLAYABLE_TEST_API__?: {
      snapshot: () => ReturnType<Game["getDebugSnapshot"]>;
      setState: (state: string) => void;
      setMoney: (money: number) => void;
      tap: () => void;
      obstacleHit: () => void;
      spawnRewardFly: () => void;
    };
  }
}

async function init() {
  const app = new Application();

  await app.init({
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: 0x87ceeb,
    resolution: Math.min(3, Math.max(2, window.devicePixelRatio || 1)),
    autoDensity: true,
    antialias: true,
  });

  const container = document.getElementById("game")!;
  container.appendChild(app.canvas as HTMLCanvasElement);

  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const scale = Math.min(w / GAME_WIDTH, h / GAME_HEIGHT);

    const canvas = app.canvas as HTMLCanvasElement;
    canvas.style.width = `${GAME_WIDTH * scale}px`;
    canvas.style.height = `${GAME_HEIGHT * scale}px`;
  }

  window.addEventListener("resize", resize);
  resize();

  const game = new Game(app);
  await game.init();

  window.__PLAYABLE_TEST_API__ = {
    snapshot: () => game.getDebugSnapshot(),
    setState: (state: string) => game.debugSetState(state as any),
    setMoney: (money: number) => game.debugSetMoney(money),
    tap: () => game.debugTap(),
    obstacleHit: () => game.debugObstacleHit(),
    spawnRewardFly: () => game.debugSpawnRewardFly(),
  };
}

init();
