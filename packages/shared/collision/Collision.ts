import type { Enemy } from "@viking/enemies";

export type EnemyInstance = {
  id: number;
  enemyId: number;
  x: number;
  y: number;
  hp: number;
  animationState: "idle" | "walk" | "death";
  frameIndex: number;
  direction?: "left" | "right" | "up" | "down";
};

export const checkCollision = (
  x: number,
  y: number,
  player: any,
  obstacles: any[],
  ctx?: CanvasRenderingContext2D,
  camera?: { x: number; y: number }
) => {
  const hitbox = player.hitbox || {
    width: 16,
    height: 16,
    offsetX: 0,
    offsetY: 0,
  };

  const playerX = x - hitbox.offsetX;
  const playerY = y - hitbox.offsetY;

  if (ctx && camera) {
    // Force yellow hitbox drawing
    ctx.fillStyle = "rgba(255, 255, 0, 0.3)";
    ctx.fillRect(
      playerX - camera.x,
      playerY - camera.y,
      hitbox.width,
      hitbox.height
    );

    ctx.strokeStyle = "yellow";
    ctx.lineWidth = 2;
    ctx.strokeRect(
      playerX - camera.x,
      playerY - camera.y,
      hitbox.width,
      hitbox.height
    );
  }

  return obstacles.some((obj) => {
    return (
      playerX + hitbox.width > obj.x &&
      playerX < obj.x + obj.width &&
      playerY + hitbox.height > obj.y &&
      playerY < obj.y + obj.height
    );
  });
};

export function getEnemyHitbox(
  inst: EnemyInstance,
  data: Enemy
): { x: number; y: number; width: number; height: number } {
  const frameW = data.spriteSize?.width ?? 32;
  const frameH = data.spriteSize?.height ?? 32;
  const { offsetX = 0, offsetY = 0, width, height } = data.hitbox;
  return {
    x: inst.x - frameW / 2 + offsetX,
    y: inst.y - frameH / 2 + offsetY,
    width,
    height,
  };
}

export function isBoxOverlap(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number }
) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

export function isWeaponHittingEnemy(
  inst: { x: number; y: number; enemyId: number },
  data: {
    hitbox: {
      width: number;
      height: number;
      offsetX?: number;
      offsetY?: number;
    };
  },
  weaponRect: { x: number; y: number; width: number; height: number }
) {
  const enemyRect = getEnemyHitbox(inst, data);
  return isBoxOverlap(enemyRect, weaponRect);
}
