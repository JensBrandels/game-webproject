import { drawPlayer } from "./drawPlayer";
import { drawEnemy } from "./drawEnemies";
import { drawPlacedObjects } from "./drawPlacedObjects";
import { useAccountStore } from "@viking/game-store";
import { drawOrbitalWeapons, drawAura } from "../data/drawWeapon";

type WeaponAnimation = {
  sheet: string;
  frames: { x: number; y: number }[];
};

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
  isOrbital?: boolean;
  isAura?: boolean;
  isMelee?: boolean;
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
  frameIndex,
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
  projectilesRef,
  setShowDeathScreen,
}: {
  frameIndex: number;
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
  projectilesRef: React.MutableRefObject<Projectile[]>;
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
    if (p.isOrbital || p.isAura || p.isMelee) return true;

    // move
    p.x += p.dx * p.speed;
    p.y += p.dy * p.speed;
    p.traveled += p.speed;

    // draw animation frame
    const account = useAccountStore.getState().account!;
    const weapon = account.weapons[0];
    if (
      weapon &&
      weapon.type === "projectile" &&
      "shoot" in weapon.animations
    ) {
      const shootAnims = weapon.animations.shoot as Record<
        "up" | "down" | "left" | "right",
        WeaponAnimation
      >;
      const anim = shootAnims[p.direction];
      const total = anim.frames.length;
      const idx = Math.floor((p.traveled / p.maxDistance) * total) % total;
      const frame = anim.frames[idx];
      const img = spriteSheets[anim.sheet.replace(/^\/+/g, "")];

      if (img) {
        const drawSize = 32;

        // draw the projectile scaled to 32×32
        ctx.drawImage(
          img,
          frame.x,
          frame.y,
          32,
          32,
          p.x - camera.x - drawSize / 2,
          p.y - camera.y - drawSize / 2,
          drawSize,
          drawSize
        );

        //   // debug hitbox (32×32)
        //   ctx.save();
        //   ctx.strokeStyle = "blue";
        //   ctx.lineWidth = 2;
        //   ctx.strokeRect(
        //     p.x - camera.x - drawSize / 2,
        //     p.y - camera.y - drawSize / 2,
        //     drawSize,
        //     drawSize
        //   );
        //   ctx.restore();
      }
    }

    // keep projectile only while under maxDistance
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

  drawOrbitalWeapons({
    ctx,
    projectiles: projectilesRef.current,
    frameIndex,
    cameraOffset: camera,
    spriteSheets,
  });

  projectilesRef.current.forEach((p) => {
    if (!p.isMelee) return;

    const weapon = useAccountStore
      .getState()
      .account?.weapons.find((w) => w.type === "melee");

    if (!weapon) return;

    const slashLength = weapon.range;
    const slashThickness = 4;
    const sweepProgress = (performance.now() - p.id) / 150; // 0 to 1

    const direction: "up" | "down" | "left" | "right" =
      playerRef.current.direction ?? "down";

    const baseAngle = {
      up: -Math.PI / 2,
      right: 0,
      down: Math.PI / 2,
      left: Math.PI,
    }[direction];

    const coneAngle = Math.PI / 3;
    const sweepAngle = baseAngle - coneAngle / 2 + sweepProgress * coneAngle;

    // Directional visual offset
    let offsetX = 0;
    let offsetY = 0;
    switch (direction) {
      case "left":
        offsetX = -8;
        break;
      case "right":
        offsetX = 8;
        break;
      case "up":
        offsetY = -4;
        break;
      case "down":
        offsetY = 4;
        break;
    }

    const x1 = playerRef.current.x - camera.x + offsetX;
    const y1 = playerRef.current.y - camera.y + offsetY;
    const x2 = x1 + Math.cos(sweepAngle) * slashLength;
    const y2 = y1 + Math.sin(sweepAngle) * slashLength;

    ctx.strokeStyle = "rgba(255, 0, 0, 0.8)";
    ctx.lineWidth = slashThickness * 2;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  });

  drawAura({
    ctx,
    frameIndex,
    projectiles: projectilesRef.current.filter((p) => p.isAura),
    cameraOffset: camera,
    spriteSheets,
  });

  // finally, tell the caller whether the death animation finished
  return finished;
}
