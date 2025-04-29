import { updatePlayer } from "./updatePlayer";
import { updateEnemies } from "./updateEnemies";
import { handleDamage } from "./handleDamage";
import { renderFrame } from "./renderFrame";
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

export function startGameLoop({
  playerRef,
  keys,
  selectedMap,
  camera,
  canvas,
  ctx,
  bgCtx,
  spriteSheets,
  isHurtRef,
  isPlayingHurt,
  offscreenCanvas,
  collisionObstaclesRef,
  enemyInstancesRef,
  setShowDeathScreen,
  lastShootTimeRef,
}: {
  playerRef: React.RefObject<any>;
  keys: React.RefObject<Record<string, boolean>>;
  selectedMap: any;
  camera: { x: number; y: number };
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  bgCtx: CanvasRenderingContext2D;
  spriteSheets: Record<string, HTMLImageElement>;
  isHurtRef: React.MutableRefObject<boolean>;
  isPlayingHurt: React.MutableRefObject<boolean>;
  offscreenCanvas: HTMLCanvasElement;
  collisionObstaclesRef: React.MutableRefObject<any[]>;
  enemyInstancesRef: React.MutableRefObject<any[]>;
  setShowDeathScreen: (val: boolean) => void;
  lastShootTimeRef: React.RefObject<number>;
}) {
  let animationFrameId: number;

  // store active projectiles
  const projectilesRef = { current: [] as Projectile[] };

  const loop = async () => {
    const now = performance.now();
    const { account, isHurt, isDead } = useAccountStore.getState();
    const charId = account?.selectedCharacterId;
    const character = account?.characters.find((c) => c.id === charId) || null;

    // ensure we have everything we need
    if (
      !character ||
      playerRef.current.x == null ||
      playerRef.current.y == null
    ) {
      animationFrameId = requestAnimationFrame(loop);
      return;
    }

    isHurtRef.current = isHurt;

    if (!isDead) {
      // update logic
      updatePlayer(
        playerRef.current,
        keys,
        character.id,
        {
          ...selectedMap,
          obstaclesWithCollision: collisionObstaclesRef.current,
        },
        camera,
        canvas,
        ctx
      );
      updateEnemies(enemyInstancesRef, playerRef);
      handleDamage(
        enemyInstancesRef.current,
        playerRef.current.x,
        playerRef.current.y,
        isDead
      );

      // shooting logic
      const weapon = account?.weapons?.[0];
      if (weapon && now - lastShootTimeRef.current > weapon.cooldown * 1000) {
        lastShootTimeRef.current = now;
        console.log("✴️ SHOOT", weapon.name);

        const speed = weapon.speed;
        const damage = weapon.damage;
        const x = playerRef.current.x;
        const y = playerRef.current.y;

        projectilesRef.current.push(
          {
            id: now,
            x,
            y,
            dx: 0,
            dy: -1,
            direction: "up",
            traveled: 0,
            maxDistance: 50,
            speed,
            damage,
          },
          {
            id: now,
            x,
            y,
            dx: 0,
            dy: 1,
            direction: "down",
            traveled: 0,
            maxDistance: 50,
            speed,
            damage,
          },
          {
            id: now,
            x,
            y,
            dx: -1,
            dy: 0,
            direction: "left",
            traveled: 0,
            maxDistance: 50,
            speed,
            damage,
          },
          {
            id: now,
            x,
            y,
            dx: 1,
            dy: 0,
            direction: "right",
            traveled: 0,
            maxDistance: 50,
            speed,
            damage,
          }
        );
      }
    }

    // render everything
    await renderFrame({
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
      projectilesRef,
    });

    animationFrameId = requestAnimationFrame(loop);
  };

  animationFrameId = requestAnimationFrame(loop);

  return () => {
    cancelAnimationFrame(animationFrameId);
  };
}
