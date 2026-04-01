import { Container, Sprite, AnimatedSprite, Texture, Assets, Text, TextStyle, Graphics } from "pixi.js";
import { GAME_WIDTH, GAME_HEIGHT, BASE_SPEED, LEVEL_DATA, EntityType, EntityFlag, ENEMY_CHASE_SPEED, LevelItem, PLAYER_GROUND_Y_RATIO, viewBounds } from "./utils/constants";
import { thiefSpritesheet } from "./utils/assets";

export interface ActiveEntity {
  sprite: Container; // Use Container to hold sprite + glow
  mainSprite: Container | Sprite | AnimatedSprite | Graphics;
  glow?: Sprite;
  type: EntityType;
  x: number;
  y: number;
  active: boolean;
  collected: boolean;
  hit: boolean;
  nearMissAwarded: boolean;
  flags?: EntityFlag[];
  warningLabel?: Text;
  kind?: string;

  spawnAge: number;
  collect(): void;
  onHit(): void;
  getBounds(): { x: number; y: number; width: number; height: number };
}

export class Level {
  private gameContainer: Container;
  private entities: ActiveEntity[] = [];
  private spawnPointer = 0;
  private currentDistance = 0;
  private finishReached = false;
  private groundY: number;
  private tutorialTriggered = false;
  private readonly tutorialDistance = 3;
  private elapsed = 0;
  private jackpotTotalCount = LEVEL_DATA.filter((item) => item.flags?.includes(EntityFlag.JACKPOT)).length;

  constructor(gameContainer: Container) {
    this.gameContainer = gameContainer;
    this.groundY = GAME_HEIGHT * PLAYER_GROUND_Y_RATIO;
  }

  update(dt: number) {
    this.elapsed += dt;
    this.currentDistance += (BASE_SPEED * dt) / GAME_WIDTH;
    const spawnLeadDistance = viewBounds.width / GAME_WIDTH + 0.75;

    // Spawn entities when they're about to enter screen
    while (
      this.spawnPointer < LEVEL_DATA.length &&
      LEVEL_DATA[this.spawnPointer].distance <= this.currentDistance + spawnLeadDistance
    ) {
      if (!this.tutorialTriggered && LEVEL_DATA[this.spawnPointer].distance > this.tutorialDistance) {
        break;
      }
      this.spawnEntity(LEVEL_DATA[this.spawnPointer]);
      this.spawnPointer++;
    }

    // Update active entities
    for (const entity of this.entities) {
      if (!entity.active) continue;

      entity.spawnAge += dt;
      entity.x -= BASE_SPEED * dt;

      // Entrance scale-in
      if (entity.spawnAge < 0.2 && entity.type === EntityType.COLLECTIBLE) {
        const entranceT = Math.min(entity.spawnAge / 0.2, 1);
        const eased = 1 - Math.pow(1 - entranceT, 3);
        entity.sprite.scale.set(eased);
      } else if (entity.type === EntityType.COLLECTIBLE) {
        entity.sprite.scale.set(1);
      }

      // Enemy chase or death fade
      if (entity.type === EntityType.ENEMY) {
        if (!entity.hit && entity.x < GAME_WIDTH * 0.7) {
          entity.x -= ENEMY_CHASE_SPEED * dt;
        }
        if (entity.hit) {
          entity.sprite.alpha = Math.max(0, entity.sprite.alpha - dt * 3);
          entity.sprite.y -= dt * 120;
          if (entity.sprite.alpha <= 0) {
            entity.active = false;
            entity.sprite.visible = false;
          }
        }
      }

      // Glow pulsing
      if (entity.glow) {
        const pulse = Math.sin(this.elapsed * 10 + entity.x * 0.05) * 0.1 + 0.9;
        entity.glow.scale.set(pulse * 0.8);
        entity.glow.alpha = (Math.sin(this.elapsed * 10 + entity.x * 0.05) * 0.2 + 0.6) * 0.8;
      }

      // Collectible bobbing
      if (entity.type === EntityType.COLLECTIBLE && !entity.collected) {
        entity.mainSprite.y = Math.sin(this.elapsed * 5 + entity.x * 0.03) * 5;
        entity.mainSprite.rotation = Math.sin(this.elapsed * 3 + entity.x * 0.02) * 0.1;
      }

      // Off-screen removal — only despawn after the full sprite has cleared the visible area
      const spriteBounds = entity.sprite.getBounds();
      if (spriteBounds.x + spriteBounds.width < viewBounds.left - 120) {
        entity.active = false;
        entity.sprite.visible = false;
        if (entity.warningLabel) entity.warningLabel.visible = false;
      }

      // Warning label — clamp to visible area so player always sees it
      if (entity.warningLabel && entity.active) {
        entity.warningLabel.x = Math.max(viewBounds.left + 80, Math.min(entity.x, viewBounds.right - 80));
        entity.warningLabel.y = entity.y - 100;
        entity.warningLabel.visible = entity.x < viewBounds.right + 200 && entity.x > viewBounds.left - 100;
      }

      entity.sprite.x = entity.x;
    }

    // Check finish
    if (!this.finishReached && this.currentDistance >= LEVEL_DATA[LEVEL_DATA.length - 1].distance) {
      this.finishReached = true;
    }
  }

  setCurrentDistance(distance: number) {
    this.currentDistance = Math.max(0, distance);
    if (this.currentDistance > this.tutorialDistance) {
      this.tutorialTriggered = true;
    }
  }

  private spawnEntity(item: LevelItem) {
    if (item.type === EntityType.FINISH) return;

    const x = Math.max(viewBounds.right + 280, GAME_WIDTH + 360);
    const yOffset = item.yOffset || 0;

    const container = new Container();
    let mainSprite: Container | Sprite | AnimatedSprite;
    let glow: Sprite | undefined;
    let y: number;
    let kind: string | undefined;

    switch (item.type) {
      case EntityType.COLLECTIBLE: {
        const isJackpotPickup = item.flags?.includes(EntityFlag.JACKPOT) ?? false;
        const useDollar =
          item.collectibleVariant === "cash"
            ? true
            : item.collectibleVariant === "paypal"
              ? false
              : isJackpotPickup || Math.round(item.distance * 10) % 4 < 2;

        if (useDollar) {
          const tex = (Assets.get("dollar") as Texture) || (Assets.get("coin") as Texture);
          if (!tex) return;
          mainSprite = new Sprite(tex);
          mainSprite.anchor.set(0.5, 0.5);
          mainSprite.scale.set(isJackpotPickup ? 0.24 : 0.16);

          glow = new Sprite(Texture.WHITE);
          glow.anchor.set(0.5);
          glow.width = isJackpotPickup ? 98 : 66;
          glow.height = isJackpotPickup ? 40 : 28;
          glow.alpha = isJackpotPickup ? 0.2 : 0.12;
          glow.tint = 0xffd86b;
          container.addChild(glow);

          container.addChild(mainSprite);
          y = this.groundY - yOffset - (isJackpotPickup ? 82 : 62);
          kind = isJackpotPickup ? "jackpot_cash" : "cash_dollar";
        } else {
          // PayPal badge collectible
          const ppTex = (Assets.get("paypalCounter") as Texture) || (Assets.get("paypalCard") as Texture);
          if (!ppTex) return;
          mainSprite = new Sprite(ppTex);
          mainSprite.anchor.set(0.5, 0.5);
          mainSprite.width = 120;
          mainSprite.height = 80;

          glow = new Sprite(Texture.WHITE);
          glow.anchor.set(0.5);
          glow.width = 130;
          glow.height = 90;
          glow.alpha = 0.15;
          glow.tint = 0xffd86b;
          container.addChild(glow);

          container.addChild(mainSprite);
          y = this.groundY - yOffset - 72;
          kind = "paypal_badge";
        }
        break;
      }
      case EntityType.ENEMY: {
        const frames = thiefSpritesheet.animations["default"];
        mainSprite = new AnimatedSprite(frames);
        mainSprite.anchor.set(0.5, 1);
        (mainSprite as AnimatedSprite).animationSpeed = 0.2;
        (mainSprite as AnimatedSprite).play();
        mainSprite.scale.set(-0.702, 0.702); // Flip to face left
        container.addChild(mainSprite);
        y = this.groundY;
        break;
      }
      case EntityType.OBSTACLE: {
        const cones = this.createConeCluster();
        mainSprite = cones;
        container.addChild(cones);
        y = this.groundY - 6;
        kind = "cone";
        break;
      }
      default:
        return;
    }

    container.x = x;
    container.y = y;
    this.gameContainer.addChild(container);

    let warningLabel: Text | undefined;
    if (item.flags?.includes(EntityFlag.SHOW_WARNING)) {
      warningLabel = new Text({
        text: "EVADE!",
        style: new TextStyle({
          fontFamily: "PP Mori",
          fontSize: 30,
          fontWeight: "bold",
          fill: 0xffffff,
          stroke: { color: 0xcc2a1e, width: 4 },
        }),
      });
      warningLabel.anchor.set(0.5);
      warningLabel.visible = false;
      this.gameContainer.addChild(warningLabel);
    }

    const entity: ActiveEntity = {
      sprite: container,
      mainSprite,
      glow,
      type: item.type,
      x,
      y,
      active: true,
      collected: false,
      hit: false,
      nearMissAwarded: false,
      spawnAge: 0,
      flags: item.flags ? [...item.flags] : undefined,
      warningLabel,
      kind,

      collect() {
        this.collected = true;
        this.active = false;
        this.sprite.visible = false;
      },

      onHit() {
        this.hit = true;
      },

      getBounds() {
        const s = this.mainSprite;

        if (this.type === EntityType.COLLECTIBLE) {
          const bounds = s.getBounds();
          return {
            x: bounds.x,
            y: bounds.y,
            width: bounds.width,
            height: bounds.height,
          };
        }

        const bounds = this.sprite.getBounds();
        const spriteW = bounds.width;
        const spriteH = bounds.height;
        const centerX = bounds.x + bounds.width / 2;
        const centerY = bounds.y + bounds.height / 2;

        if (this.type === EntityType.ENEMY) {
          // Reference Hitbox: scale {X: 0.3, Y: 0.5}, offset {X: 0, Y: 0.2}
          const w = spriteW * 0.3;
          const h = spriteH * 0.5;
          const hitCenterY = centerY + (0.2 * spriteH);
          return {
            x: centerX - w / 2,
            y: hitCenterY - h / 2,
            width: w,
            height: h,
          };
        }

        if (this.type === EntityType.OBSTACLE) {
          const w = spriteW * 0.86;
          const h = spriteH * 0.82;
          return {
            x: centerX - w / 2,
            y: bounds.y + spriteH - h,
            width: w,
            height: h,
          };
        }

        const w = spriteW * 0.7;
        const h = spriteH * 0.8;
        return {
          x: centerX - w / 2,
          y: centerY - h / 2,
          width: w,
          height: h,
        };
      },
    };

    this.entities.push(entity);
  }

  checkSpawns(): LevelItem | null {
    if (this.tutorialTriggered) return null;

    for (const entity of this.entities) {
      if (
        entity.active &&
        entity.type === EntityType.ENEMY &&
        entity.flags?.includes(EntityFlag.TUTORIAL_PAUSE) &&
        entity.x < GAME_WIDTH * 0.7 &&
        !entity.hit
      ) {
        entity.flags = entity.flags.filter(f => f !== EntityFlag.TUTORIAL_PAUSE);
        this.tutorialTriggered = true;
        return { type: entity.type, distance: 0, flags: [EntityFlag.TUTORIAL_PAUSE] };
      }
    }
    return null;
  }

  getActiveCollectibles(): ActiveEntity[] {
    return this.entities.filter(e => e.active && e.type === EntityType.COLLECTIBLE && !e.collected);
  }

  getActiveEnemies(): ActiveEntity[] {
    return this.entities.filter(e => e.active && e.type === EntityType.ENEMY && !e.hit);
  }

  getActiveObstacles(): ActiveEntity[] {
    return this.entities.filter(e => e.active && e.type === EntityType.OBSTACLE);
  }

  isFinishReached(): boolean {
    return this.finishReached;
  }

  getCurrentDistance(): number {
    return this.currentDistance;
  }

  getNextWarningDebug() {
    const warningObstacle = this.entities.find(
      (entity) =>
        entity.active &&
        entity.type === EntityType.OBSTACLE &&
        entity.flags?.includes(EntityFlag.SHOW_WARNING)
    );

    if (warningObstacle) {
      return {
        obstacleKind: warningObstacle.kind ?? "unknown",
        label: "EVADE!",
        x: warningObstacle.x,
      };
    }

    const upcomingWarning = LEVEL_DATA.find(
      (item) => item.type === EntityType.OBSTACLE && item.flags?.includes(EntityFlag.SHOW_WARNING)
    );

    if (!upcomingWarning) {
      return null;
    }

    return {
      obstacleKind: "cone",
      label: "EVADE!",
      x: upcomingWarning.distance * GAME_WIDTH,
    };
  }

  getJackpotDebug() {
    const totalCount = this.jackpotTotalCount;
    const activeCount = this.entities.filter(
      (entity) => entity.active && entity.type === EntityType.COLLECTIBLE && entity.flags?.includes(EntityFlag.JACKPOT)
    ).length;

    const firstUpcoming = LEVEL_DATA.find((item) => item.flags?.includes(EntityFlag.JACKPOT));

    return {
      totalCount,
      activeCount,
      upcomingCount: Math.max(0, totalCount - activeCount),
      firstDistance: firstUpcoming?.distance ?? null,
    };
  }

  getCollectibleDebug() {
    return this.entities
      .filter((entity) => entity.active && entity.type === EntityType.COLLECTIBLE)
      .map((entity) => ({
        kind: entity.kind ?? "unknown",
        x: entity.x,
        y: entity.y,
      }));
  }

  private createConeCluster() {
    const cluster = new Graphics();

    // Draw back cone first (higher y = further back), then front cones
    this.drawCone(cluster, 0, -12, 1);
    this.drawCone(cluster, -40, 0, 0.86);
    this.drawCone(cluster, 38, 0, 0.82);

    return cluster;
  }

  private drawCone(graphics: Graphics, x: number, y: number, scale: number) {
    const coneHeight = 90 * scale;
    const coneWidth = 42 * scale;
    const baseWidth = 62 * scale;

    graphics.moveTo(x - coneWidth / 2, y);
    graphics.lineTo(x, y - coneHeight);
    graphics.lineTo(x + coneWidth / 2, y);
    graphics.closePath();
    graphics.fill({ color: 0xff7b22 });
    graphics.stroke({ color: 0xc84d12, width: 3 });

    graphics.moveTo(x - coneWidth * 0.28, y - coneHeight * 0.34);
    graphics.lineTo(x + coneWidth * 0.28, y - coneHeight * 0.34);
    graphics.lineTo(x + coneWidth * 0.16, y - coneHeight * 0.2);
    graphics.lineTo(x - coneWidth * 0.16, y - coneHeight * 0.2);
    graphics.closePath();
    graphics.fill({ color: 0xffffff });

    graphics.moveTo(x - coneWidth * 0.2, y - coneHeight * 0.62);
    graphics.lineTo(x + coneWidth * 0.2, y - coneHeight * 0.62);
    graphics.lineTo(x + coneWidth * 0.1, y - coneHeight * 0.49);
    graphics.lineTo(x - coneWidth * 0.1, y - coneHeight * 0.49);
    graphics.closePath();
    graphics.fill({ color: 0xffffff });

    graphics.roundRect(x - baseWidth / 2, y - 10 * scale, baseWidth, 16 * scale, 6 * scale);
    graphics.fill({ color: 0x161616 });
  }
}
