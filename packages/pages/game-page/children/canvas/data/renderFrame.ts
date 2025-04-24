import { drawPlayer } from "./drawPlayer";
import { drawEnemy } from "./drawEnemies";
import { drawPlacedObjects } from "./drawPlacedObjects";

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

export async function renderFrame({
  ctx,
  bgCtx,
  playerRef,
  camera,
  character,
  selectedMap,
  spriteSheets,
  isHurtRef,
  isDead,
  isPlayingHurt,
  offscreenCanvas,
  collisionObstaclesRef,
  enemyInstancesRef,
  setShowDeathScreen,
}: {
  ctx: CanvasRenderingContext2D;
  bgCtx: CanvasRenderingContext2D;
  playerRef: React.RefObject<any>;
  camera: { x: number; y: number };
  character: any;
  selectedMap: any;
  spriteSheets: Record<string, HTMLImageElement>;
  isHurtRef: React.MutableRefObject<boolean>;
  isDead: boolean;
  isPlayingHurt: React.MutableRefObject<boolean>;
  offscreenCanvas: HTMLCanvasElement;
  collisionObstaclesRef: React.MutableRefObject<any[]>;
  enemyInstancesRef: React.MutableRefObject<EnemyInstance[]>;
  setShowDeathScreen: (val: boolean) => void;
}) {
  bgCtx.clearRect(0, 0, bgCtx.canvas.width, bgCtx.canvas.height);
  bgCtx.drawImage(
    offscreenCanvas,
    camera.x,
    camera.y,
    bgCtx.canvas.width,
    bgCtx.canvas.height,
    0,
    0,
    bgCtx.canvas.width,
    bgCtx.canvas.height
  );

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  await drawPlacedObjects(ctx, selectedMap.placedObjects, camera, "collision");
  collisionObstaclesRef.current = [];
  await drawPlacedObjects(
    ctx,
    selectedMap.placedObjects,
    camera,
    "collision",
    collisionObstaclesRef.current
  );

  const finished = drawPlayer(
    ctx,
    playerRef.current,
    camera,
    character.id,
    spriteSheets,
    isHurtRef.current,
    isDead,
    isPlayingHurt
  );

  if (character.hp <= 0 && finished) {
    setShowDeathScreen(true);
  }

  enemyInstancesRef.current.forEach((enemy) => {
    drawEnemy(ctx, enemy, camera, spriteSheets);
  });

  await drawPlacedObjects(ctx, selectedMap.placedObjects, camera, "visual");
}
