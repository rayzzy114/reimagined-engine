import { Application, Assets, Container, Graphics, Texture } from "pixi.js";
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
import { ParticleSystem } from "./ParticleSystem";

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
  private particles!: ParticleSystem;
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
  private endZoomTimer = 0;
  private readonly endZoomDuration = 0.56;
  private endZoomScale = 1;

  private lives = MAX_LIVES;
  private money = 0;
  private isInvincible = false;
  private invincibilityTimer = 0;
  private praiseIndex = 0;
  private collectCount = 0;
  private nearMissCount = 0;
  private lastNearMissLabel: string | null = null;

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

    this.particles = new ParticleSystem();
    this.gameContainer.addChild(this.particles.container);

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
    this.app.stage.on("pointertap", (event) => {
      if (event.target !== this.app.stage) {
        return;
      }
      this.onTap();
    });

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

    if (newState === GameState.WIN || newState === GameState.LOSE || newState === GameState.CTA) {
      this.endZoomTimer = this.endZoomDuration;
    } else {
      this.endZoomTimer = 0;
      this.endZoomScale = 1;
      this.gameContainer.scale.set(1);
      this.gameContainer.x = 0;
      this.gameContainer.y = 0;
    }

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
    if (newState === GameState.CTA) {
      this.ctaScreen.show();
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
        this.ctaScreen.triggerCTA();
        break;
      case GameState.LOSE:
        this.sounds.playClick();
        this.ctaScreen.triggerCTA();
        break;
      case GameState.CTA:
        this.sounds.playClick();
        this.ctaScreen.triggerCTA();
        break;
    }
  }

  private update(dt: number) {
    this.praisePopup.update(dt);
    this.winScreen.update(dt);
    this.ctaScreen.update(dt);
    this.hud.update(dt);
    this.particles.update(dt);
    this.updateEndZoom(dt);

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

  private updateEndZoom(dt: number) {
    if (this.endZoomTimer <= 0) return;
    this.endZoomTimer = Math.max(0, this.endZoomTimer - dt);
    const progress = 1 - this.endZoomTimer / this.endZoomDuration;
    const eased = 1 - Math.pow(1 - progress, 3);
    this.endZoomScale = 1 + eased * 0.1;
    this.gameContainer.scale.set(this.endZoomScale);
    this.gameContainer.x = (GAME_WIDTH * (1 - this.endZoomScale)) / 2;
    this.gameContainer.y = (GAME_HEIGHT * (1 - this.endZoomScale)) / 2 + eased * 18;
  }

  private checkCollisions() {
    const playerBounds = inflateBounds(this.player.getBounds(), 6);
    const playerFeetBounds = {
      x: playerBounds.x - 10,
      y: playerBounds.y + playerBounds.height * 0.44,
      width: playerBounds.width + 20,
      height: playerBounds.height * 0.78,
    };

    // Collectibles
    for (const collectible of this.level.getActiveCollectibles()) {
      if (collectible.collected) continue;

      const collectibleBounds = collectible.getBounds();
      if (isCollectibleCollected(playerBounds, collectibleBounds, PICKUP_RADIUS)) {
        collectible.collect();
        this.collectPickupReward(
          collectibleBounds.x + collectibleBounds.width / 2,
          collectibleBounds.y + collectibleBounds.height / 2
        );
      }
    }

    // Enemies
    if (!this.isInvincible) {
      for (const enemy of this.level.getActiveEnemies()) {
        const enemyBounds = shrinkBounds(enemy.getBounds(), 18);
        if (!enemy.hit && intersects(playerBounds, enemyBounds)) {
          enemy.onHit();
          if (this.applyDamage()) {
            return;
          }
        }
      }
    }

    // Obstacles
    if (!this.isInvincible) {
      for (const obstacle of this.level.getActiveObstacles()) {
        const obstacleBounds = inflateBounds(obstacle.getBounds(), 4);
        if (intersects(playerFeetBounds, obstacleBounds)) {
          if (this.applyDamage()) {
            return;
          }
          break;
        }
      }
    }

    if (!this.isInvincible) {
      this.checkNearMisses(playerBounds, playerFeetBounds);
    }

    // Finish
    if (this.level.isFinishReached()) {
      this.finishRibbon.breakRibbon(playerBounds.y + playerBounds.height / 2);
      this.setState(GameState.WIN);
    }
  }

  private checkNearMisses(
    playerBounds: { x: number; y: number; width: number; height: number },
    playerFeetBounds: { x: number; y: number; width: number; height: number }
  ) {
    const playerCenterX = playerBounds.x + playerBounds.width / 2;
    const playerCenterY = playerBounds.y + playerBounds.height / 2;
    const playerFeetCenterY = playerFeetBounds.y + playerFeetBounds.height / 2;

    for (const enemy of this.level.getActiveEnemies()) {
      if (enemy.nearMissAwarded || enemy.hit) continue;

      const enemyBounds = shrinkBounds(enemy.getBounds(), 10);
      const enemyRight = enemyBounds.x + enemyBounds.width;
      const enemyCenterY = enemyBounds.y + enemyBounds.height / 2;
      const passedRecently = enemyRight < playerCenterX && enemyRight > playerCenterX - 72;
      const verticalClose = Math.abs(enemyCenterY - playerCenterY) <= 82;

      if (passedRecently && verticalClose) {
        enemy.nearMissAwarded = true;
        this.triggerNearMiss(enemyBounds.x + enemyBounds.width / 2, enemyBounds.y - 48);
      }
    }

    for (const obstacle of this.level.getActiveObstacles()) {
      if (obstacle.nearMissAwarded) continue;

      const obstacleBounds = obstacle.getBounds();
      const obstacleRight = obstacleBounds.x + obstacleBounds.width;
      const obstacleCenterY = obstacleBounds.y + obstacleBounds.height / 2;
      const passedRecently = obstacleRight < playerCenterX && obstacleRight > playerCenterX - 68;
      const verticalClose = Math.abs(obstacleCenterY - playerFeetCenterY) <= 70;

      if (passedRecently && verticalClose) {
        obstacle.nearMissAwarded = true;
        this.triggerNearMiss(obstacleBounds.x + obstacleBounds.width / 2, obstacleBounds.y - 42);
      }
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
    const duration = 150;
    const shakeCallback = (t: any) => {
      elapsed += t.deltaMS;
      if (elapsed > duration) {
        this.gameContainer.x = original.x;
        this.gameContainer.y = original.y;
        this.app.ticker.remove(shakeCallback);
        return;
      }
      const decay = 1 - elapsed / duration;
      const magnitude = 12 * decay;
      this.gameContainer.x = original.x + (Math.random() - 0.5) * magnitude * 2;
      this.gameContainer.y = original.y + (Math.random() - 0.5) * magnitude * 2;
    };
    this.app.ticker.add(shakeCallback);
  }

  getDebugSnapshot() {
    const screenMeta =
      this.state === GameState.WIN
        ? this.winScreen.getDebugMeta()
        : this.state === GameState.LOSE
          ? this.loseScreen.getDebugMeta()
          : this.state === GameState.CTA
            ? this.ctaScreen.getDebugMeta()
            : null;

    return {
      state: this.state,
      lives: this.lives,
      money: this.money,
      sound: this.sounds.getDebugState(),
      background: this.background.getDebugMeta(),
      player: this.player.getDebugMeta(),
      finish: this.finishRibbon.getDebugMeta(),
      particles: this.particles.getDebugMeta(),
      nearMissCount: this.nearMissCount,
      lastNearMissLabel: this.lastNearMissLabel,
      footerVisible: this.hud.isFooterVisible(),
      hud: this.hud.getDebugMeta(),
      jackpot: this.level.getJackpotDebug(),
      collectibles: this.level.getCollectibleDebug(),
      nextWarning: this.level.getNextWarningDebug(),
      endZoomScale: this.endZoomScale,
      overlayVariant: screenMeta?.overlayVariant ?? null,
      hasSkyBurstOverlay: screenMeta?.hasSkyBurstOverlay ?? false,
      primaryCtaLabel: screenMeta?.primaryCtaLabel ?? null,
      screenIntroActive: screenMeta?.introActive ?? false,
      screenContentScale: screenMeta?.contentScale ?? 1,
      screenAccentGlowStrength: screenMeta?.accentGlowStrength ?? 0,
      ctaButtonScale: screenMeta?.ctaButtonScale ?? 1,
      rewardDisplayAmount: screenMeta?.rewardDisplayAmount ?? null,
      countdownDanger: screenMeta?.countdownDanger ?? false,
      countdownScale: screenMeta?.countdownScale ?? 1,
      countdownLabel: screenMeta?.countdownLabel ?? null,
    };
  }

  debugSetState(state: GameState) {
    this.setState(state);
  }

  debugSetMoney(money: number) {
    this.money = money;
    this.hud.updateMoney(money);
  }

  debugTap() {
    this.onTap();
  }

  debugObstacleHit() {
    this.applyDamage();
  }

  debugCollectPickup() {
    this.collectPickupReward(260, 520);
  }

  debugSpawnRewardFly() {
    this.hud.spawnRewardFly(this.resolveRewardFlyTexture(false), 220, 540, "cash", () =>
      this.hud.triggerCounterPop()
    );
  }

  debugTriggerNearMiss() {
    this.triggerNearMiss(260, 520);
  }

  debugSetDistance(distance: number) {
    this.level.setCurrentDistance(distance);
    this.level.update(0);
  }

  debugSetLoseTimer(seconds: number) {
    this.loseScreen.debugSetTimer(seconds);
  }

  private applyDamage() {
    this.lives--;
    this.hud.updateLives(this.lives);

    if (this.lives <= 0) {
      this.setState(GameState.LOSE);
      return true;
    }

    this.isInvincible = true;
    this.invincibilityTimer = INVINCIBILITY_DURATION;
    this.player.setInvincible(true);
    this.player.playHurt();
    this.sounds.playHit();
    const playerBounds = this.player.getBounds();
    this.particles.burstHit(playerBounds.x + playerBounds.width / 2, playerBounds.y + 24);
    this.triggerDamageFlash();
    this.shakeScreen();
    return false;
  }

  private triggerNearMiss(x: number, y: number) {
    this.nearMissCount++;
    this.lastNearMissLabel = "Close call!";
    this.money += COLLECTIBLE_VALUE;
    this.hud.updateMoney(this.money);
    this.praisePopup.show("Close call!", x, y);
    this.sounds.playCollect();
    this.hud.spawnRewardFly(this.resolveRewardFlyTexture(false), x, y, "cash", () =>
      this.hud.triggerCounterPop()
    );
  }

  private resolveRewardFlyTexture(usePaypal: boolean) {
    if (usePaypal) {
      return (
        (Assets.get("paypalCounter") as Texture) ||
        (Assets.get("paypalCard") as Texture) ||
        (Assets.get("dollar") as Texture) ||
        (Assets.get("coin") as Texture)
      );
    }
    return (
      (Assets.get("dollar") as Texture) ||
      (Assets.get("coin") as Texture) ||
      (Assets.get("paypalCard") as Texture) ||
      (Assets.get("paypalCounter") as Texture)
    );
  }

  private collectPickupReward(x: number, y: number) {
    this.money += COLLECTIBLE_VALUE;
    this.collectCount++;
    this.hud.updateMoney(this.money);
    this.sounds.playCollect();
    this.particles.burstCollect(x, y);
    this.hud.spawnRewardFly(this.resolveRewardFlyTexture(false), x, y, "cash", () =>
      this.hud.triggerCounterPop()
    );

    if (this.collectCount % 3 === 0) {
      const phrase = PRAISE_PHRASES[this.praiseIndex % PRAISE_PHRASES.length];
      this.praisePopup.show(phrase, x, y - 50);
      this.praiseIndex++;
    }
  }
}
