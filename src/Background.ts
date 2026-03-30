import { Container, TilingSprite, Sprite, Texture, Assets, Graphics } from "pixi.js";
import { GAME_WIDTH, GAME_HEIGHT, BASE_SPEED } from "./utils/constants";

export class Background {
  container: Container;
  private bgTiling: TilingSprite | null = null;
  private groundGraphics: Graphics;
  private decorations: Sprite[] = [];
  private scrollSpeed = 0;

  constructor() {
    this.container = new Container();

    // Sky gradient
    const sky = new Graphics();
    sky.rect(0, 0, GAME_WIDTH, GAME_HEIGHT * 0.55);
    sky.fill({ color: 0xf5deb3 }); // warm beige sky
    this.container.addChild(sky);

    // Main background as tiling sprite
    const bgTex = Assets.get("bgMain") as Texture;
    if (bgTex) {
      this.bgTiling = new TilingSprite({
        texture: bgTex,
        width: GAME_WIDTH,
        height: GAME_HEIGHT * 0.55,
      });
      this.container.addChild(this.bgTiling);
    }

    // Ground area
    this.groundGraphics = new Graphics();

    // Sidewalk
    this.groundGraphics.rect(0, GAME_HEIGHT * 0.55, GAME_WIDTH, GAME_HEIGHT * 0.20);
    this.groundGraphics.fill({ color: 0xb0b0c0 });

    // Sidewalk line
    this.groundGraphics.rect(0, GAME_HEIGHT * 0.62, GAME_WIDTH, 3);
    this.groundGraphics.fill({ color: 0x9999aa });

    // Road
    this.groundGraphics.rect(0, GAME_HEIGHT * 0.75, GAME_WIDTH, GAME_HEIGHT * 0.05);
    this.groundGraphics.fill({ color: 0x888899 });

    // Grass at bottom
    this.groundGraphics.rect(0, GAME_HEIGHT * 0.80, GAME_WIDTH, GAME_HEIGHT * 0.20);
    this.groundGraphics.fill({ color: 0x7ab648 });

    this.container.addChild(this.groundGraphics);
  }

  update(dt: number) {
    if (this.bgTiling) {
      this.bgTiling.tilePosition.x -= BASE_SPEED * dt * 0.15;
    }
  }
}
