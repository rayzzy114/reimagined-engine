import { Application } from "pixi.js";
import { GAME_WIDTH, GAME_HEIGHT } from "./utils/constants";
import { Game } from "./Game";

async function init() {
  const app = new Application();

  await app.init({
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: 0x87ceeb,
    resolution: window.devicePixelRatio || 1,
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
}

init();
