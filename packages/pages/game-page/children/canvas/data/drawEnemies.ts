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
  const enemyData = enemies.find((e) => e.id === enemyInstance.enemyId);
  if (!enemyData) return;

  const animation = enemyData.animations[enemyInstance.animationState];
  if (!animation) return;

  //Handle directional animations
  const resolvedAnim =
    "frames" in animation
      ? animation
      : animation[enemyInstance.direction ?? "down"] ??
        animation["left"] ??
        Object.values(animation)[0];

  if (!resolvedAnim || !resolvedAnim.frames) return;

  const frame =
    resolvedAnim.frames[enemyInstance.frameIndex % resolvedAnim.frames.length];
  const sprite = spriteSheets[resolvedAnim.sheet.replace(/^\/+/, "")];
  if (!sprite) return;

  const { offsetX, offsetY } = enemyData.hitbox;
  const frameWidth = enemyData.spriteSize?.width ?? 32;
  const frameHeight = enemyData.spriteSize?.height ?? 32;

  const drawX = enemyInstance.x - camera.x - offsetX;
  const drawY = enemyInstance.y - camera.y - offsetY;

  ctx.drawImage(
    sprite,
    frame.x,
    frame.y,
    frameWidth,
    frameHeight,
    drawX,
    drawY,
    frameWidth,
    frameHeight
  );
};
