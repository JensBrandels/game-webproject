import { enemies } from "@viking/enemies";

type EnemyInstance = {
  id: number;
  enemyId: number;
  x: number;
  y: number;
  hp: number;
  animationState: "idle" | "walk" | "death";
  frameIndex: number;
  direction?: "left" | "right" | "up" | "down";
};

export const drawEnemy = (
  ctx: CanvasRenderingContext2D,
  enemyInstance: EnemyInstance,
  camera: { x: number; y: number },
  spriteSheets: Record<string, HTMLImageElement>
) => {
  const data = enemies.find((e) => e.id === enemyInstance.enemyId);
  if (!data) return;

  const anim = data.animations[enemyInstance.animationState];
  if (!anim) return;

  const resolved =
    "frames" in anim
      ? anim
      : anim[enemyInstance.direction ?? "down"] ||
        anim["left"] ||
        Object.values(anim)[0];
  if (!resolved?.frames) return;

  const frame =
    resolved.frames[enemyInstance.frameIndex % resolved.frames.length];
  const sprite = spriteSheets[resolved.sheet.replace(/^\/+/, "")];
  if (!sprite) return;

  // --- center sprite on x,y ---
  const fw = data.spriteSize?.width ?? 32;
  const fh = data.spriteSize?.height ?? 32;
  const drawX = enemyInstance.x - camera.x - fw / 2;
  const drawY = enemyInstance.y - camera.y - fh / 2;

  // 1) draw sprite
  ctx.drawImage(sprite, frame.x, frame.y, fw, fh, drawX, drawY, fw, fh);

  // 2) HP bar (optional, unchanged)
  const ratio = Math.max(0, enemyInstance.hp / data.hp);
  ctx.fillStyle = "black";
  ctx.fillRect(drawX, drawY - 6, fw, 4);
  ctx.fillStyle = "red";
  ctx.fillRect(drawX, drawY - 6, fw * ratio, 4);

  // 3) debug-draw hitbox relative to that sprite
  const { offsetX, offsetY, width: hitW, height: hitH } = data.hitbox;
  const hx = drawX + offsetX;
  const hy = drawY + offsetY;

  ctx.save();
  ctx.strokeStyle = "yellow";
  ctx.lineWidth = 1;
  ctx.strokeRect(hx, hy, hitW, hitH);
  ctx.restore();
};
