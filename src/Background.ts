import { Assets, Container, Graphics, Sprite, Texture } from "pixi.js";
import { GAME_HEIGHT, BASE_SPEED, viewBounds } from "./utils/constants";

type DecorLane = "rear" | "front";
type DecorRole = "tree" | "bush";

interface SidewalkDecor {
  sprite: Container | Sprite;
  speed: number;
  lane: DecorLane;
  role: DecorRole;
  kind: string;
}

export class Background {
  container: Container;
  private bgSprite: Sprite | null = null;
  private stripeLayer: Container;
  private stripeMask: Graphics;
  private stripes: Graphics[] = [];
  private stripeOffset = 0;
  private readonly stripeSpeed = 280;
  private readonly stripeSpacing = 170;
  private readonly stripeRotation = 0;
  private readonly rearDecorSpeed = BASE_SPEED * 0.28;
  private readonly frontDecorSpeed = BASE_SPEED * 0.46;

  private rearDecorLayer: Container;
  private frontDecorLayer: Container;
  private decors: SidewalkDecor[] = [];
  private elapsed = 0;
  private pulseTimer = 0;
  private pulseIntensity = 0;

  constructor() {
    this.container = new Container();

    const bgTex = Assets.get("bgMain") as Texture;
    if (bgTex) {
      this.bgSprite = new Sprite(bgTex);
      this.layoutBg();
      this.container.addChild(this.bgSprite);
    }

    this.rearDecorLayer = new Container();
    this.container.addChild(this.rearDecorLayer);

    this.stripeLayer = new Container();
    this.stripeMask = new Graphics();
    this.container.addChild(this.stripeLayer);
    this.container.addChild(this.stripeMask);

    this.frontDecorLayer = new Container();
    this.container.addChild(this.frontDecorLayer);

    this.rebuildStripes();

    // Seed initial decorations so sidewalk isn't empty at start
    this.seedInitialDecor();
  }

  pulse() {
    this.pulseTimer = 0.3;
    this.pulseIntensity = 0.02;
  }

  onResize() {
    this.layoutBg();
    this.rebuildStripes();
    this.rebuildDecor();
  }

  private layoutBg() {
    if (!this.bgSprite) return;
    const bgTex = this.bgSprite.texture;
    // Scale bg to cover the full visible height, then center horizontally
    const scaleH = Math.max(viewBounds.height, GAME_HEIGHT) / bgTex.height;
    const scaledWidth = bgTex.width * scaleH;
    // Center on the visible area
    const visibleCenterX = (viewBounds.left + viewBounds.right) / 2;
    this.bgSprite.x = visibleCenterX - scaledWidth / 2;
    this.bgSprite.y = viewBounds.top;
    this.bgSprite.width = scaledWidth;
    this.bgSprite.height = Math.max(viewBounds.height, GAME_HEIGHT);
  }

  private rebuildStripes() {
    // Clear old stripes
    for (const s of this.stripes) {
      this.stripeLayer.removeChild(s);
      s.destroy();
    }
    this.stripes = [];

    // Rebuild mask to cover full visible width
    this.stripeMask.clear();
    this.stripeMask.roundRect(
      viewBounds.left - 20,
      GAME_HEIGHT * 0.56,
      viewBounds.width + 40,
      GAME_HEIGHT * 0.22,
      18
    );
    this.stripeMask.fill({ color: 0xffffff });
    this.stripeLayer.mask = this.stripeMask;

    // Create enough stripes to cover the full visible width
    const stripeCount = Math.ceil(viewBounds.width / this.stripeSpacing) + 3;
    for (let index = 0; index < stripeCount; index++) {
      const stripe = new Graphics();
      stripe.roundRect(-84, -8, 168, 16, 8);
      stripe.fill({ color: 0xffffff, alpha: 0.16 });
      stripe.rotation = this.stripeRotation;
      stripe.y = GAME_HEIGHT * 0.69;
      stripe.x = index * this.stripeSpacing;
      this.stripeLayer.addChild(stripe);
      this.stripes.push(stripe);
    }
    this.layoutStripes();
  }

  update(dt: number) {
    this.elapsed += dt;
    if (this.bgSprite) {
      // Subtle parallax sway — recalculate base position each frame
      const bgTex = this.bgSprite.texture;
      const scaleH = Math.max(viewBounds.height, GAME_HEIGHT) / bgTex.height;
      const scaledWidth = bgTex.width * scaleH;
      const visibleCenterX = (viewBounds.left + viewBounds.right) / 2;
      this.bgSprite.x = visibleCenterX - scaledWidth / 2 + Math.sin(this.elapsed * 0.2) * 6;
    }

    // Background pulse
    if (this.pulseTimer > 0) {
      this.pulseTimer -= dt;
      const progress = 1 - (this.pulseTimer / 0.3);
      const scale = 1 + this.pulseIntensity * Math.sin(progress * Math.PI);
      this.container.scale.set(scale);
    } else {
      this.container.scale.set(1);
    }

    this.stripeOffset = (this.stripeOffset + dt * this.stripeSpeed) % this.stripeSpacing;
    this.layoutStripes();

    this.updateDecor(dt);
  }

  getDebugMeta() {
    const rearTreeDecor = this.decors.filter((decor) => decor.lane === "rear" && decor.role === "tree");
    const frontTreeDecor = this.decors.filter((decor) => decor.lane === "front" && decor.role === "tree");
    const rearBushDecor = this.decors.filter((decor) => decor.lane === "rear" && decor.role === "bush");
    const frontBushDecor = this.decors.filter((decor) => decor.lane === "front" && decor.role === "bush");
    const bushDecor = [...rearBushDecor, ...frontBushDecor];
    const visibleRearTreeXs = rearTreeDecor
      .filter((decor) => this.isDecorVisible(decor))
      .map((decor) => Number(decor.sprite.x.toFixed(2)));
    const visibleFrontTreeXs = frontTreeDecor
      .filter((decor) => this.isDecorVisible(decor))
      .map((decor) => Number(decor.sprite.x.toFixed(2)));
    const visibleRearBushXs = rearBushDecor
      .filter((decor) => this.isDecorVisible(decor))
      .map((decor) => Number(decor.sprite.x.toFixed(2)));
    const visibleFrontBushXs = frontBushDecor
      .filter((decor) => this.isDecorVisible(decor))
      .map((decor) => Number(decor.sprite.x.toFixed(2)));
    const visibleBushXs = bushDecor
      .filter((decor) => this.isDecorVisible(decor))
      .map((decor) => Number(decor.sprite.x.toFixed(2)));
    const rearDecorSpeeds = rearTreeDecor
      .map((decor) => Number(decor.speed.toFixed(2)));
    const frontDecorSpeeds = frontTreeDecor
      .map((decor) => Number(decor.speed.toFixed(2)));
    const rearTreeHeights = rearTreeDecor
      .map((decor) => Number(decor.sprite.height.toFixed(2)));
    const frontTreeHeights = frontTreeDecor
      .map((decor) => Number(decor.sprite.height.toFixed(2)));
    const rearBushHeights = rearBushDecor
      .map((decor) => Number(decor.sprite.height.toFixed(2)));
    const frontBushHeights = frontBushDecor
      .map((decor) => Number(decor.sprite.height.toFixed(2)));
    const bushHeights = bushDecor
      .map((decor) => Number(decor.sprite.height.toFixed(2)));
    const rearTreeXs = rearTreeDecor
      .map((decor) => Number(decor.sprite.x.toFixed(2)));
    const frontTreeXs = frontTreeDecor
      .map((decor) => Number(decor.sprite.x.toFixed(2)));
    const rearBushXs = rearBushDecor
      .map((decor) => Number(decor.sprite.x.toFixed(2)));
    const frontBushXs = frontBushDecor
      .map((decor) => Number(decor.sprite.x.toFixed(2)));
    const bushXs = bushDecor
      .map((decor) => Number(decor.sprite.x.toFixed(2)));

    return {
      stripeOffset: Number(this.stripeOffset.toFixed(2)),
      stripeCount: this.stripes.length,
      stripeRotation: this.stripeRotation,
      rearTreeTargetCount: this.getRearTreeTargetCount(),
      frontTreeTargetCount: this.getFrontTreeTargetCount(),
      rearBushTargetCount: this.getRearBushTargetCount(),
      frontBushTargetCount: this.getFrontBushTargetCount(),
      rearDecorSpeeds,
      frontDecorSpeeds,
      rearTreeHeights,
      frontTreeHeights,
      rearBushHeights,
      frontBushHeights,
      bushHeights,
      rearTreeXs,
      frontTreeXs,
      rearBushXs,
      frontBushXs,
      bushXs,
      visibleRearTreeXs,
      visibleFrontTreeXs,
      visibleRearBushXs,
      visibleFrontBushXs,
      visibleBushXs,
      visibleRearTreeCount: visibleRearTreeXs.length,
      visibleFrontTreeCount: visibleFrontTreeXs.length,
      visibleRearBushCount: visibleRearBushXs.length,
      visibleFrontBushCount: visibleFrontBushXs.length,
      visibleBushCount: visibleBushXs.length,
      decorKinds: this.decors.map((decor) => decor.kind),
    };
  }

  private layoutStripes() {
    // Move one continuous stripe belt instead of repositioning each stripe independently.
    this.stripeLayer.x = viewBounds.left - this.stripeSpacing * 2 - this.stripeOffset;
  }

  private usesMinimalHorizonDecor() {
    return false;
  }

  private isCompactView() {
    return viewBounds.height > GAME_HEIGHT;
  }

  private seedInitialDecor() {
    const compact = this.isCompactView();
    const rearTreeXs = this.buildLanePositions(
      this.getRearTreeTargetCount(),
      compact ? 56 : 84,
      compact ? 124 : 90,
      compact ? [0, -10, 12] : [0, -22, 16, -12, 10],
      compact ? 192 : 182
    );
    const frontTreeXs = this.buildLanePositions(
      this.getFrontTreeTargetCount(),
      compact ? 48 : 72,
      compact ? 136 : 64,
      compact ? [0, -8, 10] : [0, -16, 18, -12, 14],
      compact ? 238 : 168
    );

    for (const x of rearTreeXs) {
      this.spawnTree("rear", x);
    }

    for (const x of frontTreeXs) {
      this.spawnTree("front", x);
    }

    const rearGapIndexes = this.pickSeedGapIndexes(rearTreeXs.length - 1, this.getRearBushTargetCount());
    for (const gapIndex of rearGapIndexes) {
      this.spawnBushBetweenTrees("rear", rearTreeXs[gapIndex], rearTreeXs[gapIndex + 1], true);
    }

    const frontGapIndexes = this.pickSeedGapIndexes(frontTreeXs.length - 1, this.getFrontBushTargetCount());
    for (const gapIndex of frontGapIndexes) {
      this.spawnBushBetweenTrees("front", frontTreeXs[gapIndex], frontTreeXs[gapIndex + 1], true);
    }
  }

  private rebuildDecor() {
    for (const decor of this.decors) {
      (decor.lane === "rear" ? this.rearDecorLayer : this.frontDecorLayer).removeChild(decor.sprite);
      decor.sprite.destroy();
    }
    this.decors = [];
    this.seedInitialDecor();
  }

  private getRearTreeTargetCount() {
    if (this.usesMinimalHorizonDecor()) {
      return 0;
    }

    if (this.isCompactView()) {
      return 3;
    }

    return Math.max(4, Math.min(6, Math.round(viewBounds.width / 260)));
  }

  private getFrontTreeTargetCount() {
    if (this.isCompactView()) {
      return 4;
    }

    return Math.max(4, Math.min(6, Math.round(viewBounds.width / 260)));
  }

  private getRearBushTargetCount() {
    if (this.usesMinimalHorizonDecor()) {
      return 0;
    }

    if (this.isCompactView()) {
      return 2;
    }

    return Math.max(2, Math.min(4, this.getRearTreeTargetCount() - 1));
  }

  private getFrontBushTargetCount() {
    if (this.isCompactView()) {
      return 3;
    }

    return Math.max(3, Math.min(4, this.getFrontTreeTargetCount() - 1));
  }

  private getTreeRuntimeGap(lane: DecorLane) {
    if (this.isCompactView()) {
      return lane === "rear" ? 220 : 255;
    }

    return lane === "rear" ? 236 : 274;
  }

  private getBushRuntimeGap(lane: DecorLane) {
    if (this.isCompactView()) {
      return lane === "rear" ? 172 : 188;
    }

    return lane === "rear" ? 188 : 204;
  }

  private getBushSeedGap(lane: DecorLane) {
    if (this.isCompactView()) {
      return lane === "rear" ? 160 : 176;
    }

    return lane === "rear" ? 148 : 170;
  }

  private getBushInset(lane: DecorLane, isInitialSeed: boolean) {
    if (this.isCompactView()) {
      if (lane === "rear") {
        return isInitialSeed ? 62 : 84;
      }

      return isInitialSeed ? 78 : 108;
    }

    if (lane === "rear") {
      return isInitialSeed ? 70 : 94;
    }

    return isInitialSeed ? 90 : 116;
  }

  private getBushCrossLaneGap(lane: DecorLane) {
    if (this.isCompactView()) {
      return lane === "rear" ? 64 : 78;
    }

    return lane === "rear" ? 78 : 92;
  }

  private getBushSpawnLead(lane: DecorLane) {
    if (this.isCompactView()) {
      return lane === "rear" ? 56 : 84;
    }

    return lane === "rear" ? 64 : 96;
  }

  private getTreeCoverageLead(lane: DecorLane) {
    return this.getTreeRuntimeGap(lane) + (lane === "rear" ? 72 : 120);
  }

  private buildLanePositions(
    count: number,
    startInset: number,
    endInset: number,
    offsets: number[],
    minGap: number
  ) {
    if (count <= 0) {
      return [];
    }

    if (count <= 1) {
      return [viewBounds.left + startInset];
    }

    const positions: number[] = [];
    const usableWidth = Math.max(0, viewBounds.width - startInset - endInset);
    const baseStep = usableWidth / (count - 1);

    for (let index = 0; index < count; index++) {
      const baseX = viewBounds.left + startInset + baseStep * index;
      const offset = offsets[index % offsets.length];
      const candidateX = baseX + offset;
      const minX = index === 0 ? viewBounds.left + startInset : positions[index - 1] + minGap;
      const maxX = viewBounds.right - endInset - baseStep * (count - 1 - index);
      positions.push(Math.max(minX, Math.min(maxX, candidateX)));
    }

    return positions;
  }

  private pickSeedGapIndexes(gapCount: number, desiredCount: number) {
    if (gapCount <= 0 || desiredCount <= 0) {
      return [];
    }

    if (desiredCount >= gapCount) {
      return Array.from({ length: gapCount }, (_, index) => index);
    }

    const picked = new Set<number>();
    for (let index = 0; index < desiredCount; index++) {
      const ratio = desiredCount === 1 ? 0.5 : index / (desiredCount - 1);
      const rawIndex = Math.round(ratio * (gapCount - 1));
      let candidate = rawIndex;

      while (picked.has(candidate) && candidate < gapCount - 1) {
        candidate += 1;
      }

      while (picked.has(candidate) && candidate > 0) {
        candidate -= 1;
      }

      picked.add(candidate);
    }

    return [...picked].sort((left, right) => left - right);
  }

  private spawnTree(lane: DecorLane, startX?: number) {
    const decor = this.createTreeDecor(lane);
    const sprite = decor.sprite;

    const compact = this.isCompactView();
    const yBase = compact
      ? lane === "rear"
        ? GAME_HEIGHT * 0.506
        : GAME_HEIGHT * 0.558
      : lane === "rear"
        ? GAME_HEIGHT * 0.51
        : GAME_HEIGHT * 0.562;
    const yJitter = (Math.random() - 0.5) * GAME_HEIGHT * (compact ? (lane === "rear" ? 0.0012 : 0.0015) : lane === "rear" ? 0.004 : 0.005);
    sprite.y = yBase + yJitter;
    sprite.x = startX ?? this.resolveTreeSpawnX(lane);
    sprite.alpha = lane === "rear" ? 0.48 + Math.random() * 0.08 : 0.82 + Math.random() * 0.1;

    const speed = lane === "rear" ? this.rearDecorSpeed : this.frontDecorSpeed;

    (lane === "rear" ? this.rearDecorLayer : this.frontDecorLayer).addChild(sprite);
    const treeDecor = { sprite, speed, lane, role: "tree" as const, kind: decor.kind };
    this.decors.push(treeDecor);
    return treeDecor;
  }

  private spawnBush(lane: DecorLane, startX: number) {
    const decor = this.createBushDecor(lane);
    const sprite = decor.sprite;

    const compact = this.isCompactView();
    sprite.y =
      (lane === "rear" ? GAME_HEIGHT * 0.532 : GAME_HEIGHT * 0.58) +
      (Math.random() - 0.5) * GAME_HEIGHT * (compact ? (lane === "rear" ? 0.0009 : 0.0011) : lane === "rear" ? 0.003 : 0.0035);
    sprite.x = startX;
    sprite.alpha = lane === "rear" ? 0.42 + Math.random() * 0.08 : 0.86 + Math.random() * 0.08;

    (lane === "rear" ? this.rearDecorLayer : this.frontDecorLayer).addChild(sprite);
    const bushDecor = {
      sprite,
      speed: lane === "rear" ? this.rearDecorSpeed : this.frontDecorSpeed,
      lane,
      role: "bush" as const,
      kind: decor.kind,
    };
    this.decors.push(bushDecor);
    return bushDecor;
  }

  private spawnBushBetweenTrees(
    lane: DecorLane,
    leftTreeX: number,
    rightTreeX: number,
    isInitialSeed = false
  ) {
    const gap = rightTreeX - leftTreeX;
    const minimumGap = isInitialSeed ? this.getBushSeedGap(lane) : this.getBushRuntimeGap(lane);
    if (gap < minimumGap) return;

    const baseRatio = isInitialSeed
      ? (lane === "rear" ? 0.38 : 0.62)
      : lane === "rear"
        ? 0.34 + Math.random() * 0.16
        : 0.52 + Math.random() * 0.16;
    const preferredX = leftTreeX + gap * baseRatio;
    const jitter =
      (Math.random() - 0.5) * (isInitialSeed ? (lane === "rear" ? 12 : 10) : (lane === "rear" ? 26 : 18));
    const inset = this.getBushInset(lane, isInitialSeed);
    const minX = leftTreeX + inset;
    const maxX = rightTreeX - inset;
    const initialBushX = Math.max(minX, Math.min(maxX, preferredX + jitter));
    if (!isInitialSeed && initialBushX < viewBounds.right + this.getBushSpawnLead(lane)) {
      return;
    }
    const bushX = this.offsetBushFromOtherLane(lane, initialBushX, minX, maxX);

    this.spawnBush(lane, bushX);
  }

  private createTreeDecor(lane: DecorLane) {
    const textureName = Math.random() < 0.5 ? "tree1" : "tree2";
    const treeTexture = Assets.get(textureName) as Texture | undefined;

    if (treeTexture) {
      const sprite = new Sprite(treeTexture);
      sprite.anchor.set(0.5, 1);

      const compact = this.isCompactView();
      const sizeTier = Math.floor(Math.random() * 4);
      const targetHeight =
        lane === "rear"
          ? (compact ? 208 : 232) +
            [0, 18, 40, 66][sizeTier] +
            Math.random() * (compact ? 10 : 14)
          : (compact ? 292 : 338) +
            [0, 26, 56, 92][sizeTier] +
            Math.random() * (compact ? 12 : 20);
      const scaleY = targetHeight / treeTexture.height;
      const scaleX = scaleY * (compact ? (lane === "rear" ? 0.78 : 0.74) : lane === "rear" ? 0.9 : 0.84);
      sprite.scale.set(scaleX, scaleY);

      return {
        sprite,
        kind: textureName,
      };
    }

    const tree = new Container();
    const trunk = new Graphics();
    const canopyBack = new Graphics();
    const canopyFront = new Graphics();
    const style = Math.floor(Math.random() * 3);
    const trunkHeight = 48 + Math.random() * 18;
    const trunkColor = lane === "rear" ? 0x705848 : 0x6d3f2a;
    const canopyBackColor = lane === "rear" ? 0x8aa563 : 0x6d8a2d;
    const canopyFrontColor = lane === "rear" ? 0x9fbc70 : 0x88a93f;

    trunk.moveTo(-5, 0);
    trunk.lineTo(6, 0);
    trunk.lineTo(3, -trunkHeight * 0.58);
    trunk.lineTo(10, -trunkHeight);
    trunk.lineTo(2, -trunkHeight);
    trunk.lineTo(-4, -trunkHeight * 0.55);
    trunk.lineTo(-9, 0);
    trunk.closePath();
    trunk.fill({ color: trunkColor });

    if (style === 0) {
      canopyBack.ellipse(0, -trunkHeight - 6, 34, 10);
      canopyBack.fill({ color: canopyBackColor });
      canopyFront.ellipse(-18, -trunkHeight + 2, 16, 14);
      canopyFront.ellipse(16, -trunkHeight + 1, 18, 13);
      canopyFront.ellipse(0, -trunkHeight - 1, 24, 14);
    } else if (style === 1) {
      canopyBack.ellipse(0, -trunkHeight - 4, 28, 12);
      canopyBack.fill({ color: canopyBackColor });
      canopyFront.ellipse(-20, -trunkHeight + 3, 15, 15);
      canopyFront.ellipse(18, -trunkHeight + 4, 14, 14);
      canopyFront.ellipse(0, -trunkHeight - 8, 26, 10);
    } else {
      canopyBack.ellipse(0, -trunkHeight - 8, 30, 11);
      canopyBack.fill({ color: canopyBackColor });
      canopyFront.ellipse(-16, -trunkHeight - 1, 17, 12);
      canopyFront.ellipse(14, -trunkHeight, 17, 12);
      canopyFront.ellipse(0, -trunkHeight - 4, 21, 13);
    }

    canopyFront.fill({ color: canopyFrontColor });

    tree.addChild(trunk, canopyBack, canopyFront);
    return {
      sprite: tree,
      kind: "procedural_tree",
    };
  }

  private createBushDecor(lane: DecorLane) {
    const textureName = Math.random() < 0.5 ? "bushPremium1" : "bushPremium2";
    const bushTexture =
      (Assets.get(textureName) as Texture | undefined) ||
      (Assets.get("bush1") as Texture | undefined) ||
      (Assets.get("bush2") as Texture | undefined) ||
      (Assets.get("bush3") as Texture | undefined);

    if (bushTexture) {
      const sprite = new Sprite(bushTexture);
      sprite.anchor.set(0.5, 1);

      const compact = this.isCompactView();
      const targetHeight =
        lane === "rear"
          ? (compact ? 92 : 98) + Math.random() * (compact ? 22 : 32)
          : (compact ? 132 : 148) + Math.random() * (compact ? 34 : 48);
      const scaleY = targetHeight / bushTexture.height;
      const scaleX = scaleY * (compact ? (lane === "rear" ? 0.82 : 0.78) : lane === "rear" ? 0.92 : 0.86);
      sprite.scale.set(scaleX, scaleY);

      return {
        sprite,
        kind: textureName,
      };
    }

    const bush = new Graphics();
    bush.ellipse(0, -32, 62, 34);
    bush.fill({ color: 0x3d9b3d });
    bush.ellipse(-28, -18, 38, 26);
    bush.ellipse(28, -18, 40, 28);
    bush.fill({ color: 0x63c552 });
    bush.ellipse(0, -8, 72, 18);
    bush.fill({ color: 0x2f7a2c });

    return {
      sprite: bush,
      kind: "procedural_bush",
    };
  }

  private countDecors(role: DecorRole, lane?: DecorLane) {
    return this.decors.filter((decor) => decor.role === role && (lane ? decor.lane === lane : true)).length;
  }

  private getLaneRoleXs(role: DecorRole, lane: DecorLane) {
    return this.decors
      .filter((decor) => decor.role === role && decor.lane === lane)
      .map((decor) => decor.sprite.x);
  }

  private getSortedLaneRoleXs(role: DecorRole, lane: DecorLane) {
    return this.getLaneRoleXs(role, lane).sort((left, right) => left - right);
  }

  private offsetBushFromOtherLane(lane: DecorLane, preferredX: number, minX: number, maxX: number) {
    const otherLane = lane === "rear" ? "front" : "rear";
    const minimumCrossLaneGap = this.getBushCrossLaneGap(lane);
    const otherBushXs = this.getLaneRoleXs("bush", otherLane);

    if (otherBushXs.length === 0) {
      return preferredX;
    }

    const attempts = [
      preferredX,
      preferredX - minimumCrossLaneGap,
      preferredX + minimumCrossLaneGap,
      preferredX - minimumCrossLaneGap * 1.4,
      preferredX + minimumCrossLaneGap * 1.4,
      minX,
      maxX,
    ];

    for (const candidate of attempts) {
      if (candidate < minX || candidate > maxX) {
        continue;
      }

      if (otherBushXs.every((x) => Math.abs(x - candidate) >= minimumCrossLaneGap)) {
        return candidate;
      }
    }

    return preferredX;
  }

  private getRightmostLaneRoleX(role: DecorRole, lane: DecorLane) {
    const laneXs = this.getLaneRoleXs(role, lane);
    if (laneXs.length === 0) {
      return null;
    }

    return Math.max(...laneXs);
  }

  private fillTreeLane(lane: DecorLane) {
    if (lane === "rear" && this.usesMinimalHorizonDecor()) {
      return;
    }

    let guard = 0;
    while (guard < 4) {
      const rightmostTreeX = this.getRightmostLaneRoleX("tree", lane);
      if (rightmostTreeX !== null && rightmostTreeX >= viewBounds.right + this.getTreeCoverageLead(lane)) {
        return;
      }

      const newTree = this.spawnTree(lane);
      if (rightmostTreeX !== null) {
        this.spawnBushBetweenTrees(lane, rightmostTreeX, newTree.sprite.x);
      }
      guard += 1;
    }
  }

  private resolveTreeSpawnX(lane: DecorLane) {
    const baseSpawnX =
      viewBounds.right + (lane === "rear" ? 210 : 250) + Math.random() * (lane === "rear" ? 56 : 64);
    const rightmostLaneX = this.getRightmostLaneRoleX("tree", lane);

    if (rightmostLaneX === null) {
      return baseSpawnX;
    }

    return Math.max(baseSpawnX, rightmostLaneX + this.getTreeRuntimeGap(lane));
  }

  private isDecorVisible(decor: SidewalkDecor) {
    const bounds = decor.sprite.getBounds();
    return bounds.x < viewBounds.right && bounds.x + bounds.width > viewBounds.left;
  }

  private updateDecor(dt: number) {
    for (let i = this.decors.length - 1; i >= 0; i--) {
      const d = this.decors[i];
      d.sprite.x -= d.speed * dt;

      // Remove when off the left edge of visible area
      const despawnX =
        d.role === "tree"
          ? viewBounds.left - (d.lane === "rear" ? 250 : 220)
          : viewBounds.left - (d.lane === "rear" ? 150 : 140);
      if (d.sprite.x < despawnX) {
        (d.lane === "rear" ? this.rearDecorLayer : this.frontDecorLayer).removeChild(d.sprite);
        d.sprite.destroy();
        this.decors.splice(i, 1);
      }
    }

    this.fillTreeLane("rear");
    this.fillTreeLane("front");
  }
}
