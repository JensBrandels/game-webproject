import { updatePlayer } from "./updatePlayer";
import { updateEnemies } from "./updateEnemies";
import { handleDamage } from "./handleDamage";
import { renderFrame } from "./renderFrame";
import { useAccountStore } from "@viking/game-store";
import { handleWeaponFire } from "./handleWeaponFire";
import { getRequiredXp } from "./characterLeveling";
import { enemies } from "@viking/enemies";
import {
  getEnemyHitbox,
  isBoxOverlap,
} from "../../../../../shared/collision/Collision";
import { useGameSessionStore } from "@viking/gamesession-store";

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
  lastShootTimesRef,
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
  lastShootTimesRef: React.MutableRefObject<Record<number, number>>;
}) {
  let animationFrameId: number;
  let deathHandled = false;
  const projectilesRef = { current: [] as Projectile[] };
  let frameIndex = 0;
  const shieldHitTimestamps = new Map<number, number>();

  const loop = async () => {
    frameIndex++;
    const now = performance.now();
    const { account, isHurt, isDead } = useAccountStore.getState();
    const charId = account?.selectedCharacterId;
    const character = account?.characters.find((c) => c.id === charId) || null;

    // If we're paused or missing data, just schedule next frame
    const isPaused = useGameSessionStore.getState().levelUpReady;
    if (
      isPaused ||
      !character ||
      playerRef.current.x == null ||
      playerRef.current.y == null
    ) {
      animationFrameId = requestAnimationFrame(loop);
      return;
    }

    // 1) Update player / world if still alive
    isHurtRef.current = isHurt;
    if (!isDead) {
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

      // 2) Orbital projectiles follow the player
      projectilesRef.current.forEach((p) => {
        if (p.isOrbital) {
          p.traveled += 0.016 * 1000 * p.speed;
          p.x = playerRef.current.x + Math.cos(p.traveled) * p.maxDistance;
          p.y = playerRef.current.y + Math.sin(p.traveled) * p.maxDistance;
        }
      });

      // 3) Spawn new projectiles
      handleWeaponFire({
        now,
        lastShootTimesRef,
        projectilesRef,
        player: playerRef.current,
      });

      // 4) Handle shield hits
      projectilesRef.current.forEach((p) => {
        if (!p.isOrbital) return;
        const ts = performance.now();
        for (let i = enemyInstancesRef.current.length - 1; i >= 0; i--) {
          const e = enemyInstancesRef.current[i];
          const half = 16; // orbital hit-size
          if (Math.abs(p.x - e.x) < half && Math.abs(p.y - e.y) < half) {
            const last = shieldHitTimestamps.get(e.id) || 0;
            if (ts - last > 500) {
              shieldHitTimestamps.set(e.id, ts);
              e.hp -= p.damage;
              if (e.hp <= 0) {
                enemyInstancesRef.current.splice(i, 1);
                const xp =
                  enemies.find((ev) => ev.id === e.enemyId)?.xpReward ?? 0;
                character.xp += xp;
                const reqXp = getRequiredXp(character.level);
                if (character.xp >= reqXp) {
                  character.level++;
                  character.xp -= reqXp;
                  character.maxHp += 10;
                  character.hp = character.maxHp;
                  character.attackSpeed += 0.1;
                  useGameSessionStore.getState().setLevelUpReady(true);
                }
              }
            }
          }
        }
      });

      // 5) Player → enemy projectile hits
      projectilesRef.current = projectilesRef.current.filter((proj) => {
        if (proj.isOrbital) return true;
        let didHit = false;
        for (let i = enemyInstancesRef.current.length - 1; i >= 0; i--) {
          const inst = enemyInstancesRef.current[i];
          const data = enemies.find((e) => e.id === inst.enemyId)!;
          const enemyBox = getEnemyHitbox(inst, data);
          const size = 16; // your projectile size
          const projBox = {
            x: proj.x - size / 2,
            y: proj.y - size / 2,
            width: size,
            height: size,
          };
          if (isBoxOverlap(enemyBox, projBox)) {
            inst.hp -= proj.damage;
            didHit = true;
            if (inst.hp <= 0) {
              enemyInstancesRef.current.splice(i, 1);
              const xp =
                enemies.find((ev) => ev.id === inst.enemyId)?.xpReward ?? 0;
              character.xp += xp;
              const reqXp = getRequiredXp(character.level);
              if (character.xp >= reqXp) {
                character.level++;
                character.xp -= reqXp;
                character.maxHp += 10;
                character.hp = character.maxHp;
                character.attackSpeed += 0.1;
                useGameSessionStore.getState().setLevelUpReady(true);
              }
            }
            break;
          }
        }
        return !didHit;
      });
    }

    // 6) Render everything and get death‐anim status
    const deathDone = await renderFrame({
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
    });

    // 7) If we’re dead and the death animation has finished, show death screen & stop
    if (isDead && deathDone && !deathHandled) {
      deathHandled = true;
      setShowDeathScreen(true);
      cancelAnimationFrame(animationFrameId);
      return;
    }

    // 8) Loop
    animationFrameId = requestAnimationFrame(loop);
  };

  animationFrameId = requestAnimationFrame(loop);
  return () => cancelAnimationFrame(animationFrameId);
}
