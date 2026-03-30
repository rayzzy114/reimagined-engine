import { Container, Sprite, AnimatedSprite, Texture, Assets, Text, TextStyle } from "pixi.js";
import { GAME_WIDTH, GAME_HEIGHT, BASE_SPEED, LEVEL_DATA, EntityType, EntityFlag, ENEMY_CHASE_SPEED, PLAYER_X_RATIO, LevelItem } from "./utils/constants";
import { thiefSpritesheet } from "./utils/assets";

export interface ActiveEntity {
  sprite: Sprite | AnimatedSprite;
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
    this.groundY = GAME_HEIGHT * 0.72;
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
        entity.x -= ENEMY_CHASE_SPEED * dt * 0.3;
      }

      // Collectible bobbing
      if (entity.type === EntityType.COLLECTIBLE && !entity.collected) {
        entity.sprite.y = entity.y + Math.sin(Date.now() * 0.005 + entity.x * 0.01) * 5;
        entity.sprite.rotation = Math.sin(Date.now() * 0.003 + entity.x * 0.02) * 0.1;
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

    const x = GAME_WIDTH + 100;
    const yOffset = item.yOffset || 0;

    let sprite: Sprite | AnimatedSprite;
    let y: number;

    switch (item.type) {
      case EntityType.COLLECTIBLE: {
        const tex = Assets.get("dollar") as Texture;
        if (!tex) return;
        sprite = new Sprite(tex);
        sprite.anchor.set(0.5, 0.5);
        sprite.scale.set(0.35);
        y = this.groundY - yOffset - 40;
        break;
      }
      case EntityType.ENEMY: {
        const frames = thiefSpritesheet.animations["default"];
        sprite = new AnimatedSprite(frames);
        sprite.anchor.set(0.5, 1);
        (sprite as AnimatedSprite).animationSpeed = 0.2;
        (sprite as AnimatedSprite).play();
        sprite.scale.set(-0.3, 0.3); // Flip to face left
        y = this.groundY;
        break;
      }
      case EntityType.OBSTACLE: {
        const bushTextures = ["bush1", "bush2", "bush3"];
        const bushName = bushTextures[Math.floor(Math.random() * bushTextures.length)];
        const tex = Assets.get(bushName) as Texture;
        if (!tex) return;
        sprite = new Sprite(tex);
        sprite.anchor.set(0.5, 1);
        sprite.scale.set(0.5);
        y = this.groundY;
        break;
      }
      default:
        return;
    }

    sprite.x = x;
    sprite.y = y;
    this.gameContainer.addChild(sprite);

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
      sprite,
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
        const s = this.sprite;
        const w = s.width * 0.7;
        const h = s.height * 0.8;
        return {
          x: this.x - w / 2,
          y: (this.type === EntityType.ENEMY ? this.y - s.height : this.y - h / 2),
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
