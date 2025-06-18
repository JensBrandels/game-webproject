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
  isAura?: boolean;
  isMelee?: boolean;
  tickInterval?: number;
  lastHitTimestamp?: number;
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

    // Pause or missing data
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

    // 1) Update world
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

      // 2) Orbital follow
      projectilesRef.current.forEach((p) => {
        if (p.isOrbital) {
          p.traveled += 0.016 * 1000 * p.speed;
          p.x = playerRef.current.x + Math.cos(p.traveled) * p.maxDistance;
          p.y = playerRef.current.y + Math.sin(p.traveled) * p.maxDistance;
        }
      });

      // 3) Spawn new projectiles (including aura as isAura)
      handleWeaponFire({
        now,
        lastShootTimesRef,
        projectilesRef,
        player: playerRef.current,
      });

      // 4) Shield hits
      projectilesRef.current.forEach((p) => {
        if (!p.isOrbital) return;
        const ts = performance.now();
        for (let i = enemyInstancesRef.current.length - 1; i >= 0; i--) {
          const e = enemyInstancesRef.current[i];
          const half = 16;
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

      // 5) Projectile hits
      projectilesRef.current = projectilesRef.current.filter((proj) => {
        if (proj.isMelee) {
          const weapon = useAccountStore
            .getState()
            .account?.weapons.find((w) => w.type === "melee");
          if (!weapon) return false;

          const origin = { x: playerRef.current.x, y: playerRef.current.y };
          const direction: "up" | "down" | "left" | "right" =
            playerRef.current.direction ?? "down";
          const angle = {
            up: -Math.PI / 2,
            right: 0,
            down: Math.PI / 2,
            left: Math.PI,
          }[direction];
          const range = weapon.range;
          const coneAngle = Math.PI / 3;

          for (let i = enemyInstancesRef.current.length - 1; i >= 0; i--) {
            const enemy = enemyInstancesRef.current[i];
            const dx = enemy.x - origin.x;
            const dy = enemy.y - origin.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const angleToEnemy = Math.atan2(dy, dx);
            function angleDiff(a: number, b: number) {
              let diff = a - b;
              while (diff < -Math.PI) diff += Math.PI * 2;
              while (diff > Math.PI) diff -= Math.PI * 2;
              return Math.abs(diff);
            }
            const diff = angleDiff(angleToEnemy, angle);

            if (distance <= range && diff <= coneAngle / 2) {
              enemy.hp -= proj.damage;
              if (enemy.hp <= 0) {
                enemyInstancesRef.current.splice(i, 1);
                const xp =
                  enemies.find((ev) => ev.id === enemy.enemyId)?.xpReward ?? 0;
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

          return now - proj.id < 150; //keep slash for 150ms
        }

        if (proj.isOrbital) return true;
        let didHit = false;
        for (let i = enemyInstancesRef.current.length - 1; i >= 0; i--) {
          const inst = enemyInstancesRef.current[i];
          const data = enemies.find((e) => e.id === inst.enemyId)!;
          const enemyBox = getEnemyHitbox(inst, data);
          const size = 16;
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

    // 5a) Aura hits and damage (fixed)
    projectilesRef.current.forEach((p) => {
      if (!p.isAura) return;

      // keep aura centered on the player
      p.x = playerRef.current.x;
      p.y = playerRef.current.y;

      const nowTs = performance.now();
      // safely grab or default the stored values
      const lastHit = p.lastHitTimestamp ?? 0;
      const tick = p.tickInterval ?? 0;

      for (let i = enemyInstancesRef.current.length - 1; i >= 0; i--) {
        const e = enemyInstancesRef.current[i];
        const dx = e.x - p.x;
        const dy = e.y - p.y;

        // AOE circle check
        if (dx * dx + dy * dy <= p.maxDistance * p.maxDistance) {
          if (nowTs - lastHit >= tick) {
            // update the last‐hit time on the projectile
            p.lastHitTimestamp = nowTs;
            // apply damage
            e.hp -= p.damage;

            // handle death, XP, and leveling
            if (e.hp <= 0) {
              enemyInstancesRef.current.splice(i, 1);
              const xp =
                enemies.find((ev) => ev.id === e.enemyId)?.xpReward ?? 0;
              character.xp += xp;
              let reqXp = getRequiredXp(character.level);
              while (character.xp >= reqXp) {
                character.xp -= reqXp;
                character.level++;
                character.maxHp += 10;
                character.hp = character.maxHp;
                character.attackSpeed += 0.1;
                useGameSessionStore.getState().setLevelUpReady(true);
                reqXp = getRequiredXp(character.level);
              }
            }
          }
        }
      }
    });

    // 6) Render & death check
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

    if (isDead && deathDone && !deathHandled) {
      deathHandled = true;
      setShowDeathScreen(true);
      cancelAnimationFrame(animationFrameId);
      return;
    }

    animationFrameId = requestAnimationFrame(loop);
  };

  animationFrameId = requestAnimationFrame(loop);
  return () => cancelAnimationFrame(animationFrameId);
}
