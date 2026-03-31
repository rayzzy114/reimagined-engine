import { Application, Container, Graphics } from "pixi.js";
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
import { SoundManager } from "./utils/sounds";
import { inflateBounds, intersects, isCollectibleCollected, shrinkBounds } from "./utils/collision";
import { shouldShowHudFooter } from "./utils/uiState";

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
  private sounds = new SoundManager();
  private damageFlash!: Graphics;
  private damageFlashTimer = 0;

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

    this.damageFlash = new Graphics();
    this.damageFlash.rect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    this.damageFlash.fill({ color: 0xff3344, alpha: 0 });
    this.damageFlash.visible = false;
    this.gameContainer.addChild(this.damageFlash);

    this.praisePopup = new PraisePopup();
    this.uiContainer.addChild(this.praisePopup.container);

    this.hud = new HUD(
      () => {
        const muted = this.sounds.toggleMute();
        this.hud.setMuted(muted);
      },
      () => this.sounds.isMuted()
    );
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

    this.loseScreen = new LoseScreen(() => this.setState(GameState.CTA), () => this.money);
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
    this.hud.setFooterVisible(shouldShowHudFooter(newState));

    if (newState === GameState.PLAYING || newState === GameState.TUTORIAL_PAUSE) {
      this.sounds.playBackgroundMusic();
    } else {
      this.sounds.stopBackgroundMusic();
    }

    if (newState === GameState.WIN) {
      this.sounds.playWin();
      this.winScreen.show(this.money);
    }
    if (newState === GameState.LOSE) {
      this.sounds.playLose();
      this.loseScreen.play();
    }
  }

  private onTap() {
    this.sounds.unlock();
    switch (this.state) {
      case GameState.START:
        this.sounds.playClick();
        this.setState(GameState.PLAYING);
        break;
      case GameState.PLAYING:
        this.sounds.playJump();
        this.player.jump();
        break;
      case GameState.TUTORIAL_PAUSE:
        this.sounds.playClick();
        this.setState(GameState.PLAYING);
        this.sounds.playJump();
        this.player.jump();
        break;
      case GameState.WIN:
        this.sounds.playClick();
        this.setState(GameState.CTA);
        break;
      case GameState.LOSE:
        this.sounds.playClick();
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

    if (this.state === GameState.LOSE) {
      this.loseScreen.update(dt);
      return;
    }

    if (this.state !== GameState.PLAYING) return;

    this.background.update(dt);
    this.player.update(dt);
    this.level.update(dt);
    this.updateFinishLine();
    this.finishRibbon.update(dt);

    if (this.damageFlashTimer > 0) {
      this.damageFlashTimer -= dt;
      const alpha = Math.max(0, this.damageFlashTimer / 0.18) * 0.22;
      this.damageFlash.visible = alpha > 0;
      this.damageFlash.alpha = alpha;
    } else {
      this.damageFlash.visible = false;
      this.damageFlash.alpha = 0;
    }

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

  private updateFinishLine() {
    const totalDistance = LEVEL_DATA[LEVEL_DATA.length - 1].distance;
    const remainingDistance = totalDistance - this.level.getCurrentDistance();

    if (remainingDistance > 2) return;

    this.finishRibbon.show();
    this.finishRibbon.setPosition(remainingDistance * GAME_WIDTH);
  }

  private checkCollisions() {
    const playerBounds = inflateBounds(this.player.getBounds(), 6);

    // Collectibles
    for (const collectible of this.level.getActiveCollectibles()) {
      if (collectible.collected) continue;

      const collectibleBounds = collectible.getBounds();
      if (isCollectibleCollected(playerBounds, collectibleBounds, PICKUP_RADIUS)) {
        collectible.collect();
        this.money += COLLECTIBLE_VALUE;
        this.collectCount++;
        this.hud.updateMoney(this.money);
        this.sounds.playCollect();

        if (this.collectCount % 3 === 0) {
          const phrase = PRAISE_PHRASES[this.praiseIndex % PRAISE_PHRASES.length];
          this.praisePopup.show(
            phrase,
            collectibleBounds.x + collectibleBounds.width / 2,
            collectibleBounds.y - 50
          );
          this.praiseIndex++;
        }
      }
    }

    // Enemies
    if (!this.isInvincible) {
      for (const enemy of this.level.getActiveEnemies()) {
        const enemyBounds = shrinkBounds(enemy.getBounds(), 18);
        if (!enemy.hit && intersects(playerBounds, enemyBounds)) {
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
          this.player.playHurt();
          this.sounds.playHit();
          this.triggerDamageFlash();
          this.shakeScreen();
        }
      }
    }

    // Obstacles
    if (!this.isInvincible) {
      for (const obstacle of this.level.getActiveObstacles()) {
        const obstacleBounds = shrinkBounds(obstacle.getBounds(), 14);
        if (intersects(playerBounds, obstacleBounds)) {
          this.lives--;
          this.hud.updateLives(this.lives);

          if (this.lives <= 0) {
            this.setState(GameState.LOSE);
            return;
          }

          this.isInvincible = true;
          this.invincibilityTimer = INVINCIBILITY_DURATION;
          this.player.setInvincible(true);
          this.player.playHurt();
          this.sounds.playHit();
          this.triggerDamageFlash();
          this.shakeScreen();
          break;
        }
      }
    }

    // Finish
    if (this.level.isFinishReached()) {
      this.finishRibbon.breakRibbon(playerBounds.y + playerBounds.height / 2);
      this.setState(GameState.WIN);
    }
  }

  private triggerDamageFlash() {
    this.damageFlashTimer = 0.18;
    this.damageFlash.visible = true;
    this.damageFlash.alpha = 0.22;
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

  getDebugSnapshot() {
    return {
      state: this.state,
      lives: this.lives,
      money: this.money,
      footerVisible: this.hud.isFooterVisible(),
    };
  }

  debugSetState(state: GameState) {
    this.setState(state);
  }

  debugSetMoney(money: number) {
    this.money = money;
    this.hud.updateMoney(money);
  }
}
