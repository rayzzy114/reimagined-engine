export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function intersects(a: Bounds, b: Bounds): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

export function inflateBounds(bounds: Bounds, padding: number): Bounds {
  return {
    x: bounds.x - padding,
    y: bounds.y - padding,
    width: bounds.width + padding * 2,
    height: bounds.height + padding * 2,
  };
}

export function shrinkBounds(bounds: Bounds, padding: number): Bounds {
  return {
    x: bounds.x + padding,
    y: bounds.y + padding,
    width: Math.max(0, bounds.width - padding * 2),
    height: Math.max(0, bounds.height - padding * 2),
  };
}

export function isCollectibleCollected(
  playerBounds: Bounds,
  collectibleBounds: Bounds,
  pickupRadius: number
): boolean {
  return intersects(playerBounds, inflateBounds(collectibleBounds, pickupRadius * 0.15));
}
