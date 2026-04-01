export const GAME_WIDTH = 720;
export const GAME_HEIGHT = 1280;

/** Visible area in game coordinates (updated on resize) */
export const viewBounds = {
  left: 0,
  top: 0,
  right: GAME_WIDTH,
  bottom: GAME_HEIGHT,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
};

export const BASE_SPEED = 600;
export const JUMP_HEIGHT = 300;
export const JUMP_DURATION = 800;

export const COLLECTIBLE_VALUE = 20;
export const PICKUP_RADIUS = 96;

export const ENEMY_CHASE_SPEED = 300;

export const MAX_LIVES = 3;
export const INVINCIBILITY_DURATION = 800;

export const FINISH_DISTANCE = 18;

export const PLAYER_X_RATIO = 0.18;
export const PLAYER_GROUND_Y_RATIO = 0.78125;

export enum EntityType {
  COLLECTIBLE = "collectible",
  ENEMY = "enemy",
  OBSTACLE = "obstacle",
  FINISH = "finish",
}

export enum EntityFlag {
  TUTORIAL_PAUSE = "tutorial_pause",
  SHOW_WARNING = "show_warning",
  JACKPOT = "jackpot",
}

export interface LevelItem {
  type: EntityType;
  distance: number;
  yOffset?: number;
  flags?: EntityFlag[];
  collectibleVariant?: "cash" | "paypal";
}

export const LEVEL_DATA: LevelItem[] = [
  { type: EntityType.COLLECTIBLE, distance: 1, yOffset: 90, collectibleVariant: "cash" },
  { type: EntityType.COLLECTIBLE, distance: 2, yOffset: 130, collectibleVariant: "paypal" },
  { type: EntityType.ENEMY, distance: 3, flags: [EntityFlag.TUTORIAL_PAUSE] },
  { type: EntityType.COLLECTIBLE, distance: 4.0, yOffset: 110, collectibleVariant: "paypal" },
  { type: EntityType.COLLECTIBLE, distance: 4.28, yOffset: 230, collectibleVariant: "paypal" },
  { type: EntityType.COLLECTIBLE, distance: 4.56, yOffset: 320, collectibleVariant: "paypal" },
  { type: EntityType.COLLECTIBLE, distance: 4.84, yOffset: 230, collectibleVariant: "paypal" },
  { type: EntityType.COLLECTIBLE, distance: 5.12, yOffset: 110, collectibleVariant: "paypal" },
  { type: EntityType.OBSTACLE, distance: 5.6, flags: [EntityFlag.SHOW_WARNING] },
  { type: EntityType.COLLECTIBLE, distance: 6.45, yOffset: 120, collectibleVariant: "cash" },
  { type: EntityType.ENEMY, distance: 7 },
  { type: EntityType.COLLECTIBLE, distance: 7.55, yOffset: 100, collectibleVariant: "cash" },
  { type: EntityType.COLLECTIBLE, distance: 7.9, yOffset: 220, collectibleVariant: "cash" },
  { type: EntityType.COLLECTIBLE, distance: 8.25, yOffset: 340, collectibleVariant: "cash" },
  { type: EntityType.COLLECTIBLE, distance: 8.6, yOffset: 220, collectibleVariant: "cash" },
  { type: EntityType.COLLECTIBLE, distance: 8.95, yOffset: 100, collectibleVariant: "cash" },
  { type: EntityType.OBSTACLE, distance: 9, flags: [EntityFlag.SHOW_WARNING] },
  { type: EntityType.COLLECTIBLE, distance: 9.7, yOffset: 110, collectibleVariant: "paypal" },
  { type: EntityType.ENEMY, distance: 10 },
  { type: EntityType.COLLECTIBLE, distance: 10.7, yOffset: 120, collectibleVariant: "cash" },
  { type: EntityType.COLLECTIBLE, distance: 11.05, yOffset: 250, collectibleVariant: "paypal" },
  { type: EntityType.COLLECTIBLE, distance: 11.4, yOffset: 120, collectibleVariant: "paypal" },
  { type: EntityType.OBSTACLE, distance: 12 },
  { type: EntityType.ENEMY, distance: 12.6 },
  { type: EntityType.COLLECTIBLE, distance: 13.05, yOffset: 110, collectibleVariant: "cash" },
  { type: EntityType.COLLECTIBLE, distance: 13.38, yOffset: 250, collectibleVariant: "cash" },
  { type: EntityType.COLLECTIBLE, distance: 13.71, yOffset: 110, collectibleVariant: "cash" },
  { type: EntityType.OBSTACLE, distance: 14, flags: [EntityFlag.SHOW_WARNING] },
  { type: EntityType.COLLECTIBLE, distance: 14.55, yOffset: 120, collectibleVariant: "paypal" },
  { type: EntityType.ENEMY, distance: 15 },
  { type: EntityType.COLLECTIBLE, distance: 15.35, yOffset: 100, collectibleVariant: "cash" },
  { type: EntityType.COLLECTIBLE, distance: 15.63, yOffset: 220, collectibleVariant: "cash" },
  { type: EntityType.COLLECTIBLE, distance: 15.91, yOffset: 330, collectibleVariant: "cash" },
  { type: EntityType.COLLECTIBLE, distance: 16.19, yOffset: 220, collectibleVariant: "cash" },
  { type: EntityType.OBSTACLE, distance: 16.5 },
  { type: EntityType.COLLECTIBLE, distance: 16.78, yOffset: 130, flags: [EntityFlag.JACKPOT], collectibleVariant: "cash" },
  { type: EntityType.COLLECTIBLE, distance: 16.98, yOffset: 240, flags: [EntityFlag.JACKPOT], collectibleVariant: "cash" },
  { type: EntityType.COLLECTIBLE, distance: 17.18, yOffset: 330, flags: [EntityFlag.JACKPOT], collectibleVariant: "cash" },
  { type: EntityType.COLLECTIBLE, distance: 17.38, yOffset: 240, flags: [EntityFlag.JACKPOT], collectibleVariant: "cash" },
  { type: EntityType.FINISH, distance: 18 },
];

export const PRAISE_PHRASES = ["Awesome!", "Fantastic!", "Great!", "Perfect!"];
