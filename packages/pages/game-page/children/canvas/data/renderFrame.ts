import { drawPlayer } from "./drawPlayer";
import { drawEnemy } from "./drawEnemies";
import { drawPlacedObjects } from "./drawPlacedObjects";
import { useAccountStore } from "@viking/game-store";

type Projectile = {
  id: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  direction: "up" | "down" | "left" | "right";
  traveled: number;
  maxDistance: number;
  speed: number;
  damage: number;
};

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
  projectilesRef, // ← must be passed in
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
  projectilesRef: React.MutableRefObject<Projectile[]>; // ← must match above
  setShowDeathScreen: (val: boolean) => void;
}) {
  // 1) Draw background
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

  // 2) Clear main canvas
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // 3) Draw collision layer
  await drawPlacedObjects(ctx, selectedMap.placedObjects, camera, "collision");
  collisionObstaclesRef.current = [];
  await drawPlacedObjects(
    ctx,
    selectedMap.placedObjects,
    camera,
    "collision",
    collisionObstaclesRef.current
  );

  // 4) Draw player
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

  // 5) Move & draw projectiles
  projectilesRef.current = projectilesRef.current.filter((p) => {
    // move
    p.x += p.dx * p.speed;
    p.y += p.dy * p.speed;
    p.traveled += p.speed;

    // draw animation frame
    const account = useAccountStore.getState().account!;
    const weapon = account.weapons[0];
    if (weapon) {
      const anim = weapon.animations.shoot[p.direction];
      const total = anim.frames.length;
      const idx = Math.floor((p.traveled / p.maxDistance) * total) % total;
      const frame = anim.frames[idx];
      const img = spriteSheets[anim.sheet.replace(/^\/+/g, "")];
      if (img) {
        ctx.drawImage(
          img,
          frame.x,
          frame.y,
          32,
          32,
          p.x - camera.x - 16,
          p.y - camera.y - 16,
          32,
          32
        );
      }
    }

    return p.traveled < p.maxDistance;
  });

  // 6) Death screen
  if (character.hp <= 0 && finished) setShowDeathScreen(true);

  // 7) Draw enemies
  enemyInstancesRef.current.forEach((enemy) =>
    drawEnemy(ctx, enemy, camera, spriteSheets)
  );

  // 8) Draw visuals
  await drawPlacedObjects(ctx, selectedMap.placedObjects, camera, "visual");
}
