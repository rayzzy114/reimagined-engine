import { Assets, Container, Sprite, Texture } from "pixi.js";
import { GAME_WIDTH, GAME_HEIGHT } from "./utils/constants";

export class Background {
  container: Container;
  private bgSprite: Sprite | null = null;

  constructor() {
    this.container = new Container();

    const bgTex = Assets.get("bgMain") as Texture;
    if (bgTex) {
      this.bgSprite = new Sprite(bgTex);
      const scale = GAME_HEIGHT / bgTex.height;
      const scaledWidth = bgTex.width * scale;
      this.bgSprite.x = (GAME_WIDTH - scaledWidth) / 2;
      this.bgSprite.y = 0;
      this.bgSprite.width = scaledWidth;
      this.bgSprite.height = GAME_HEIGHT;
      this.container.addChild(this.bgSprite);
    }
  }

  update(dt: number) {
    if (this.bgSprite) {
      const bgTex = this.bgSprite.texture;
      const scale = GAME_HEIGHT / bgTex.height;
      const scaledWidth = bgTex.width * scale;
      this.bgSprite.x = (GAME_WIDTH - scaledWidth) / 2 + Math.sin(Date.now() * 0.0002) * 6;
    }
  }
}
