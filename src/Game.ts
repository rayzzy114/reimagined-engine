import { Application, Container } from "pixi.js";
import { loadAssets } from "./utils/assets";
import { GAME_WIDTH, GAME_HEIGHT, BASE_SPEED, MAX_LIVES, INVINCIBILITY_DURATION, COLLECTIBLE_VALUE, PICKUP_RADIUS, LEVEL_DATA, EntityType, EntityFlag, PRAISE_PHRASES } from "./utils/constants";
import { Background } from "./Background";
import { Player } from "./Player";
import { Level } from "./Level";
import { HUD } from "./HUD";
import { FinishRibbon } from "./FinishRibbon";
import { StartScreen } from "./screens/StartScreen";
import { TutorialOverlay } from "./screens/TutorialOverlay";
import { WinScreen } from "./screens/WinScreen";
import { LoseScreen } from "./screens/LoseScreen";
import { CTAScreen } from "./screens/CTAScreen";
import { PraisePopup } from "./PraisePopup";

export enum GameState {
  START = "start",
  PLAYING = "playing",
  TUTORIAL_PAUSE = "tutorial_pause",
  WIN = "win",
  LOSE = "lose",
  CTA = "cta",
}

export class Game {
  private app: Application;
  private state: GameState = GameState.START;

  private gameContainer!: Container;
  private uiContainer!: Container;

  private background!: Background;
  private player!: Player;
  private level!: Level;
  private hud!: HUD;
  private finishRibbon!: FinishRibbon;
  private praisePopup!: PraisePopup;

  private startScreen!: StartScreen;
  private tutorialOverlay!: TutorialOverlay;
  private winScreen!: WinScreen;
  private loseScreen!: LoseScreen;
  private ctaScreen!: CTAScreen;

  private lives = MAX_LIVES;
  private money = 0;
  private isInvincible = false;
  private invincibilityTimer = 0;
  private praiseIndex = 0;
  private collectCount = 0;

  constructor(app: Application) {
    this.app = app;
  }

  async init() {
    await loadAssets();

    this.gameContainer = new Container();
    this.uiContainer = new Container();
    this.app.stage.addChild(this.gameContainer);
    this.app.stage.addChild(this.uiContainer);

    this.background = new Background();
    this.gameContainer.addChild(this.background.container);

    this.player = new Player();
    this.gameContainer.addChild(this.player.container);

    this.level = new Level(this.gameContainer);

    this.finishRibbon = new FinishRibbon();
    this.gameContainer.addChild(this.finishRibbon.container);

    this.praisePopup = new PraisePopup();
    this.uiContainer.addChild(this.praisePopup.container);

    this.hud = new HUD();
    this.uiContainer.addChild(this.hud.container);

    this.startScreen = new StartScreen(() => this.setState(GameState.PLAYING));
    this.uiContainer.addChild(this.startScreen.container);

    this.tutorialOverlay = new TutorialOverlay(() => this.setState(GameState.PLAYING));
    this.uiContainer.addChild(this.tutorialOverlay.container);

    this.winScreen = new WinScreen(
      () => this.setState(GameState.CTA),
      () => this.money
    );
    this.uiContainer.addChild(this.winScreen.container);

    this.loseScreen = new LoseScreen(() => this.setState(GameState.CTA));
    this.uiContainer.addChild(this.loseScreen.container);

    this.ctaScreen = new CTAScreen();
    this.uiContainer.addChild(this.ctaScreen.container);

    this.app.stage.eventMode = "static";
    this.app.stage.hitArea = this.app.screen;
    this.app.stage.on("pointerdown", () => this.onTap());

    this.setState(GameState.START);

    this.app.ticker.add((ticker) => this.update(ticker.deltaMS / 1000));
  }

  private setState(newState: GameState) {
    this.state = newState;

    this.startScreen.container.visible = newState === GameState.START;
    this.tutorialOverlay.container.visible = newState === GameState.TUTORIAL_PAUSE;
    this.winScreen.container.visible = newState === GameState.WIN;
    this.loseScreen.container.visible = newState === GameState.LOSE;
    this.ctaScreen.container.visible = newState === GameState.CTA;

    if (newState === GameState.WIN) {
      this.winScreen.show(this.money);
    }
  }

  private onTap() {
    switch (this.state) {
      case GameState.START:
        this.setState(GameState.PLAYING);
        break;
      case GameState.PLAYING:
        this.player.jump();
        break;
      case GameState.TUTORIAL_PAUSE:
        this.setState(GameState.PLAYING);
        this.player.jump();
        break;
      case GameState.WIN:
        this.setState(GameState.CTA);
        break;
      case GameState.LOSE:
        this.setState(GameState.CTA);
        break;
    }
  }

  private update(dt: number) {
    this.praisePopup.update(dt);

    if (this.state === GameState.START) {
      this.startScreen.update(dt);
      return;
    }

    if (this.state !== GameState.PLAYING) return;

    this.background.update(dt);
    this.player.update(dt);
    this.level.update(dt);
    this.finishRibbon.update(dt);

    if (this.isInvincible) {
      this.invincibilityTimer -= dt * 1000;
      if (this.invincibilityTimer <= 0) {
        this.isInvincible = false;
        this.player.setInvincible(false);
      }
    }

    const spawnResult = this.level.checkSpawns();
    if (spawnResult) {
      if (spawnResult.flags?.includes(EntityFlag.TUTORIAL_PAUSE)) {
        this.setState(GameState.TUTORIAL_PAUSE);
        return;
      }
    }

    this.checkCollisions();
  }

  private checkCollisions() {
    const playerBounds = this.player.getBounds();

    // Collectibles
    for (const collectible of this.level.getActiveCollectibles()) {
      if (!collectible.collected) {
        const dx = playerBounds.x + playerBounds.width / 2 - collectible.x;
        const dy = playerBounds.y + playerBounds.height / 2 - collectible.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < PICKUP_RADIUS) {
          collectible.collect();
          this.money += COLLECTIBLE_VALUE;
          this.collectCount++;
          this.hud.updateMoney(this.money);

          if (this.collectCount % 3 === 0) {
            const phrase = PRAISE_PHRASES[this.praiseIndex % PRAISE_PHRASES.length];
            this.praisePopup.show(phrase, collectible.x, collectible.y - 50);
            this.praiseIndex++;
          }
        }
      }
    }

    // Enemies
    if (!this.isInvincible) {
      for (const enemy of this.level.getActiveEnemies()) {
        if (!enemy.hit && this.intersects(playerBounds, enemy.getBounds())) {
          enemy.onHit();
          this.lives--;
          this.hud.updateLives(this.lives);

          if (this.lives <= 0) {
            this.setState(GameState.LOSE);
            return;
          }

          this.isInvincible = true;
          this.invincibilityTimer = INVINCIBILITY_DURATION;
          this.player.setInvincible(true);
          this.shakeScreen();
        }
      }
    }

    // Obstacles
    for (const obstacle of this.level.getActiveObstacles()) {
      if (!this.player.isOnGround()) continue;
      const obsBounds = obstacle.getBounds();
      const shrunk = {
        x: obsBounds.x + 10,
        y: obsBounds.y + 10,
        width: obsBounds.width - 20,
        height: obsBounds.height - 20,
      };
      if (this.intersects(playerBounds, shrunk)) {
        this.setState(GameState.LOSE);
        return;
      }
    }

    // Finish
    if (this.level.isFinishReached()) {
      this.finishRibbon.breakRibbon(playerBounds.y + playerBounds.height / 2);
      this.setState(GameState.WIN);
    }
  }

  private intersects(
    a: { x: number; y: number; width: number; height: number },
    b: { x: number; y: number; width: number; height: number }
  ): boolean {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  private shakeScreen() {
    const original = { x: this.gameContainer.x, y: this.gameContainer.y };
    let elapsed = 0;
    const shakeCallback = (t: any) => {
      elapsed += t.deltaMS;
      if (elapsed > 200) {
        this.gameContainer.x = original.x;
        this.gameContainer.y = original.y;
        this.app.ticker.remove(shakeCallback);
        return;
      }
      this.gameContainer.x = original.x + (Math.random() - 0.5) * 10;
      this.gameContainer.y = original.y + (Math.random() - 0.5) * 10;
    };
    this.app.ticker.add(shakeCallback);
  }
}
