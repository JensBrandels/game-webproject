import { updatePlayer } from "./updatePlayer";
import { updateEnemies } from "./updateEnemies";
import { handleDamage } from "./handleDamage";
import { renderFrame } from "./renderFrame";
import { useAccountStore } from "@viking/game-store";
import { handleWeaponFire } from "./handleWeaponFire";
import { getRequiredXp } from "./characterLeveling";
import { enemies } from "@viking/enemies";
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
  const projectilesRef = { current: [] as Projectile[] };

  const loop = async () => {
    const now = performance.now();
    const { account, isHurt, isDead } = useAccountStore.getState();
    const charId = account?.selectedCharacterId;
    const character = account?.characters.find((c) => c.id === charId) || null;

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

      //Logic for firing the weapons
      handleWeaponFire({
        now,
        lastShootTimeRef,
        projectilesRef,
        player: playerRef.current,
      });

      //checking for collisions
      projectilesRef.current = projectilesRef.current.filter((proj) => {
        let hit = false;

        for (let i = 0; i < enemyInstancesRef.current.length; i++) {
          const enemy = enemyInstancesRef.current[i];
          const enemySize = 32;
          const half = enemySize / 2;
          const dx = Math.abs(proj.x - enemy.x);
          const dy = Math.abs(proj.y - enemy.y);

          if (dx < half && dy < half) {
            enemy.hp -= proj.damage;
            hit = true;
            if (enemy.hp <= 0) {
              enemyInstancesRef.current.splice(i, 1);

              //Grant XP
              const xpGain =
                enemies.find((e) => e.id === enemy.enemyId)?.xpReward ?? 0;
              character.xp += xpGain;

              const requiredXp = getRequiredXp(character.level);
              if (character.xp >= requiredXp) {
                character.level += 1;
                character.xp -= requiredXp;

                // Optional: stat boosts on level up
                character.maxHp += 10;
                character.hp = character.maxHp;
                character.attackSpeed += 0.1;

                //and call the gameSessionStore for leveling up to trigger the UI for choosing cool upgrades
                useGameSessionStore.getState().setLevelUpReady(true);
              }
            }
            break;
          }
        }

        return !hit;
      });
    }

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

  return () => cancelAnimationFrame(animationFrameId);
}
