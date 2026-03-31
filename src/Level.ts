import { Container, Sprite, AnimatedSprite, Texture, Assets, Text, TextStyle } from "pixi.js";
import { GAME_WIDTH, GAME_HEIGHT, BASE_SPEED, LEVEL_DATA, EntityType, EntityFlag, ENEMY_CHASE_SPEED, PLAYER_X_RATIO, LevelItem, PLAYER_GROUND_Y_RATIO } from "./utils/constants";
import { thiefSpritesheet } from "./utils/assets";

export interface ActiveEntity {
  sprite: Container; // Use Container to hold sprite + glow
  mainSprite: Sprite | AnimatedSprite;
  glow?: Sprite;
  type: EntityType;
  x: number;
  y: number;
  active: boolean;
  collected: boolean;
  hit: boolean;
  flags?: EntityFlag[];
  warningLabel?: Text;

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

  constructor(gameContainer: Container) {
    this.gameContainer = gameContainer;
    this.groundY = GAME_HEIGHT * PLAYER_GROUND_Y_RATIO;
  }

  update(dt: number) {
    this.currentDistance += (BASE_SPEED * dt) / GAME_WIDTH;

    // Spawn entities when they're about to enter screen
    while (
      this.spawnPointer < LEVEL_DATA.length &&
      LEVEL_DATA[this.spawnPointer].distance <= this.currentDistance + 2
    ) {
      this.spawnEntity(LEVEL_DATA[this.spawnPointer]);
      this.spawnPointer++;
    }

    // Update active entities
    for (const entity of this.entities) {
      if (!entity.active) continue;

      entity.x -= BASE_SPEED * dt;
      entity.sprite.x = entity.x;

      // Enemy chase
      if (entity.type === EntityType.ENEMY && !entity.hit && entity.x < GAME_WIDTH * 0.7) {
        entity.x -= ENEMY_CHASE_SPEED * dt;
      }

      // Glow pulsing
      if (entity.glow) {
        const pulse = Math.sin(Date.now() * 0.01) * 0.1 + 0.9;
        entity.glow.scale.set(pulse * 0.8);
        entity.glow.alpha = (Math.sin(Date.now() * 0.01) * 0.2 + 0.6) * 0.8;
      }

      // Collectible bobbing
      if (entity.type === EntityType.COLLECTIBLE && !entity.collected) {
        entity.mainSprite.y = Math.sin(Date.now() * 0.005 + entity.x * 0.01) * 5;
        entity.mainSprite.rotation = Math.sin(Date.now() * 0.003 + entity.x * 0.02) * 0.1;
      }

      // Off-screen removal
      if (entity.x < -200) {
        entity.active = false;
        entity.sprite.visible = false;
        if (entity.warningLabel) entity.warningLabel.visible = false;
      }

      // Warning label
      if (entity.warningLabel && entity.active) {
        entity.warningLabel.x = entity.x;
        entity.warningLabel.y = entity.y - 100;
        entity.warningLabel.visible = entity.x < GAME_WIDTH + 50;
      }
    }

    // Check finish
    if (!this.finishReached && this.currentDistance >= LEVEL_DATA[LEVEL_DATA.length - 1].distance) {
      this.finishReached = true;
    }
  }

  private spawnEntity(item: LevelItem) {
    if (item.type === EntityType.FINISH) return;

    const x = 1080;
    const yOffset = item.yOffset || 0;

    const container = new Container();
    let mainSprite: Sprite | AnimatedSprite;
    let glow: Sprite | undefined;
    let y: number;

    switch (item.type) {
      case EntityType.COLLECTIBLE: {
        const tex = Assets.get("dollar") as Texture;
        if (!tex) return;
        mainSprite = new Sprite(tex);
        mainSprite.anchor.set(0.5, 0.5);
        mainSprite.scale.set(0.15);
        
        const glowTex = Assets.get("coinGlow") as Texture;
        if (glowTex) {
          glow = new Sprite(glowTex);
          glow.anchor.set(0.5);
          glow.scale.set(0.8);
          glow.alpha = 0.8;
          container.addChild(glow);
        }
        
        container.addChild(mainSprite);
        y = this.groundY - yOffset - 40;
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
        const bushTextures = ["bush1", "bush2", "bush3"];
        const bushName = bushTextures[Math.floor(Math.random() * bushTextures.length)];
        const tex = Assets.get(bushName) as Texture;
        if (!tex) return;
        mainSprite = new Sprite(tex);
        mainSprite.anchor.set(0.5, 1);
        mainSprite.scale.set(0.5);

        const glowTex = Assets.get("coinGlow") as Texture;
        if (glowTex) {
          glow = new Sprite(glowTex);
          glow.anchor.set(0.5);
          glow.y = -mainSprite.height / 2;
          glow.scale.set(0.8);
          glow.alpha = 0.8;
          glow.tint = 0xFF0000;
          container.addChild(glow);
        }

        container.addChild(mainSprite);
        y = this.groundY;
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
          fontFamily: "Arial",
          fontSize: 28,
          fontWeight: "bold",
          fill: 0xff0000,
          stroke: { color: 0xffffff, width: 3 },
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
      flags: item.flags ? [...item.flags] : undefined,
      warningLabel,

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
        const spriteW = Math.abs(s.width);
        const spriteH = s.height;
        
        if (this.type === EntityType.ENEMY) {
          // Reference Hitbox: scale {X: 0.3, Y: 0.5}, offset {X: 0, Y: 0.2}
          const w = spriteW * 0.3;
          const h = spriteH * 0.5;
          const centerY = this.y - spriteH / 2 + (0.2 * spriteH);
          return {
            x: this.x - w / 2,
            y: centerY - h / 2,
            width: w,
            height: h,
          };
        }
        
        const w = spriteW * 0.7;
        const h = spriteH * 0.8;
        return {
          x: this.x - w / 2,
          y: (this.type === EntityType.COLLECTIBLE ? this.y - h / 2 : this.y - h),
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
}
