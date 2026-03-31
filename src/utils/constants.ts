export const GAME_WIDTH = 720;
export const GAME_HEIGHT = 1280;

export const BASE_SPEED = 600;
export const JUMP_HEIGHT = 300;
export const JUMP_DURATION = 800;

export const COLLECTIBLE_VALUE = 20;
export const PICKUP_RADIUS = 96;

export const ENEMY_CHASE_SPEED = 300;

export const MAX_LIVES = 3;
export const INVINCIBILITY_DURATION = 500;

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
}

export interface LevelItem {
  type: EntityType;
  distance: number;
  yOffset?: number;
  flags?: EntityFlag[];
}

export const LEVEL_DATA: LevelItem[] = [
  { type: EntityType.COLLECTIBLE, distance: 1 },
  { type: EntityType.COLLECTIBLE, distance: 2 },
  { type: EntityType.ENEMY, distance: 3, flags: [EntityFlag.TUTORIAL_PAUSE] },
  { type: EntityType.COLLECTIBLE, distance: 4, yOffset: 50 },
  { type: EntityType.COLLECTIBLE, distance: 4.2, yOffset: 150 },
  { type: EntityType.COLLECTIBLE, distance: 4.4, yOffset: 250 },
  { type: EntityType.COLLECTIBLE, distance: 4.6, yOffset: 150 },
  { type: EntityType.COLLECTIBLE, distance: 4.8, yOffset: 50 },
  { type: EntityType.OBSTACLE, distance: 5.6, flags: [EntityFlag.SHOW_WARNING] },
  { type: EntityType.COLLECTIBLE, distance: 6.4 },
  { type: EntityType.ENEMY, distance: 7 },
  { type: EntityType.COLLECTIBLE, distance: 7.6 },
  { type: EntityType.COLLECTIBLE, distance: 7.8, yOffset: 100 },
  { type: EntityType.COLLECTIBLE, distance: 8, yOffset: 200 },
  { type: EntityType.COLLECTIBLE, distance: 8.2, yOffset: 280 },
  { type: EntityType.COLLECTIBLE, distance: 8.4, yOffset: 200 },
  { type: EntityType.COLLECTIBLE, distance: 8.6, yOffset: 100 },
  { type: EntityType.OBSTACLE, distance: 9, flags: [EntityFlag.SHOW_WARNING] },
  { type: EntityType.COLLECTIBLE, distance: 9.6 },
  { type: EntityType.ENEMY, distance: 10 },
  { type: EntityType.COLLECTIBLE, distance: 10.6 },
  { type: EntityType.COLLECTIBLE, distance: 11, yOffset: 80 },
  { type: EntityType.COLLECTIBLE, distance: 11.2, yOffset: 180 },
  { type: EntityType.COLLECTIBLE, distance: 11.4, yOffset: 80 },
  { type: EntityType.OBSTACLE, distance: 12 },
  { type: EntityType.ENEMY, distance: 12.6 },
  { type: EntityType.COLLECTIBLE, distance: 13 },
  { type: EntityType.COLLECTIBLE, distance: 13.2, yOffset: 100 },
  { type: EntityType.COLLECTIBLE, distance: 13.4, yOffset: 200 },
  { type: EntityType.COLLECTIBLE, distance: 13.6, yOffset: 100 },
  { type: EntityType.OBSTACLE, distance: 14, flags: [EntityFlag.SHOW_WARNING] },
  { type: EntityType.COLLECTIBLE, distance: 14.5 },
  { type: EntityType.ENEMY, distance: 15 },
  { type: EntityType.COLLECTIBLE, distance: 15.4, yOffset: 80 },
  { type: EntityType.COLLECTIBLE, distance: 15.6, yOffset: 180 },
  { type: EntityType.COLLECTIBLE, distance: 15.8, yOffset: 260 },
  { type: EntityType.COLLECTIBLE, distance: 16, yOffset: 180 },
  { type: EntityType.COLLECTIBLE, distance: 16.2, yOffset: 80 },
  { type: EntityType.OBSTACLE, distance: 16.5 },
  { type: EntityType.FINISH, distance: 18 },
];

export const PRAISE_PHRASES = ["Awesome!", "Fantastic!", "Great!", "Perfect!"];
