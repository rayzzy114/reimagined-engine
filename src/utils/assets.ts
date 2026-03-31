import { Assets, Spritesheet, Texture } from "pixi.js";
import { RUNNER_SHEET_DATA } from "./runnerSheet";
import { THIEF_SHEET_DATA } from "./thiefSheet";

// Asset imports
import runnerSheetUrl from "../../assets/runner_spritesheet.png";
import thiefSheetUrl from "../../assets/thief_spritesheet.png";
import bgMainUrl from "../../assets/bg_main.webp";
import tree1Url from "../../assets/tree1.png";
import tree2Url from "../../assets/tree2.png";
import lampUrl from "../../assets/lamp.png";
import bush1Url from "../../assets/bush1.png";
import bush2Url from "../../assets/bush2.png";
import bush3Url from "../../assets/bush3.png";
import dollarUrl from "../../assets/dollar.png";
import coinUrl from "../../assets/coin_collectible.png";
import finishLineUrl from "../../assets/finish_line.png";
import finishPostUrl from "../../assets/finish_post.png";
import finishTapeLeftUrl from "../../assets/finish_tape_left.png";
import finishTapeRightUrl from "../../assets/finish_tape_right.png";
import finishTapeTopUrl from "../../assets/finish_tape_top.png";
import handUrl from "../../assets/hand.webp";
import paypalCounterUrl from "../../assets/paypal_counter.webp";
import paypalCardUrl from "../../assets/paypal_card.webp";
import failImageUrl from "../../assets/fail_image.png";
import footerPortraitUrl from "../../assets/footer_portrait.webp";
import footerLandscapeUrl from "../../assets/footer_landscape.webp";
import lightsUrl from "../../assets/lights_effect.webp";
import coinGlowUrl from "../../assets/coin_glow.webp";
import ppMoriUrl from "../../assets/fonts/PPMori-Regular.otf";

const assetMap: Record<string, string> = {
  runnerSheet: runnerSheetUrl,
  thiefSheet: thiefSheetUrl,
  bgMain: bgMainUrl,
  tree1: tree1Url,
  tree2: tree2Url,
  lamp: lampUrl,
  bush1: bush1Url,
  bush2: bush2Url,
  bush3: bush3Url,
  dollar: dollarUrl,
  coin: coinUrl,
  finishLine: finishLineUrl,
  finishPost: finishPostUrl,
  finishTapeLeft: finishTapeLeftUrl,
  finishTapeRight: finishTapeRightUrl,
  finishTapeTop: finishTapeTopUrl,
  hand: handUrl,
  paypalCounter: paypalCounterUrl,
  paypalCard: paypalCardUrl,
  failImage: failImageUrl,
  footerPortrait: footerPortraitUrl,
  footerLandscape: footerLandscapeUrl,
  lights: lightsUrl,
  coinGlow: coinGlowUrl,
};

export let runnerSpritesheet: Spritesheet;
export let thiefSpritesheet: Spritesheet;

export async function loadAssets(): Promise<void> {
  for (const [alias, src] of Object.entries(assetMap)) {
    Assets.add({ alias, src });
  }
  await Assets.load(Object.keys(assetMap));

  const ppMori = new FontFace("PP Mori", `url(${ppMoriUrl})`);
  await ppMori.load();
  document.fonts.add(ppMori);

  // Parse spritesheets
  const runnerTex = Assets.get("runnerSheet") as Texture;
  runnerSpritesheet = new Spritesheet(runnerTex, RUNNER_SHEET_DATA as any);
  await runnerSpritesheet.parse();

  const thiefTex = Assets.get("thiefSheet") as Texture;
  thiefSpritesheet = new Spritesheet(thiefTex, THIEF_SHEET_DATA as any);
  await thiefSpritesheet.parse();
}

export function getTexture(name: string): Texture {
  return Assets.get(name);
}
