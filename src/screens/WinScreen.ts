import { Container, Text, TextStyle, Graphics } from "pixi.js";
import { GAME_WIDTH, GAME_HEIGHT } from "../utils/constants";

export class WinScreen {
  container: Container;
  private rewardText: Text;
  private getMoney: () => number;

  constructor(onContinue: () => void, getMoney: () => number) {
    this.container = new Container();
    this.container.visible = false;
    this.getMoney = getMoney;

    const overlay = new Graphics();
    overlay.rect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    overlay.fill({ color: 0x000000, alpha: 0.6 });
    this.container.addChild(overlay);

    const title = new Text({
      text: "Congratulations!",
      style: new TextStyle({
        fontFamily: "Arial",
        fontSize: 48,
        fontWeight: "bold",
        fill: 0xffdd00,
        stroke: { color: 0x000000, width: 5 },
      }),
    });
    title.anchor.set(0.5);
    title.x = GAME_WIDTH / 2;
    title.y = GAME_HEIGHT * 0.3;
    this.container.addChild(title);

    const subtitle = new Text({
      text: "Choose your reward!",
      style: new TextStyle({
        fontFamily: "Arial",
        fontSize: 32,
        fill: 0xffffff,
        stroke: { color: 0x000000, width: 3 },
      }),
    });
    subtitle.anchor.set(0.5);
    subtitle.x = GAME_WIDTH / 2;
    subtitle.y = GAME_HEIGHT * 0.38;
    this.container.addChild(subtitle);

    this.rewardText = new Text({
      text: "Your reward: $0",
      style: new TextStyle({
        fontFamily: "Arial",
        fontSize: 40,
        fontWeight: "bold",
        fill: 0x00ff00,
        stroke: { color: 0x000000, width: 4 },
      }),
    });
    this.rewardText.anchor.set(0.5);
    this.rewardText.x = GAME_WIDTH / 2;
    this.rewardText.y = GAME_HEIGHT * 0.48;
    this.container.addChild(this.rewardText);

    // Claim button
    const btnBg = new Graphics();
    btnBg.roundRect(GAME_WIDTH / 2 - 120, GAME_HEIGHT * 0.58, 240, 60, 15);
    btnBg.fill({ color: 0xff8800 });
    this.container.addChild(btnBg);

    const btnText = new Text({
      text: "CLAIM REWARD",
      style: new TextStyle({
        fontFamily: "Arial",
        fontSize: 26,
        fontWeight: "bold",
        fill: 0xffffff,
      }),
    });
    btnText.anchor.set(0.5);
    btnText.x = GAME_WIDTH / 2;
    btnText.y = GAME_HEIGHT * 0.58 + 30;
    this.container.addChild(btnText);
  }

  show(money: number) {
    this.rewardText.text = `Your reward: $${money}`;
  }
}
