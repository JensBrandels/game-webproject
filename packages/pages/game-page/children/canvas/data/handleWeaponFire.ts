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
  isOrbital?: boolean;
  isAura?: boolean;
  tickInterval?: number;
  lastHitTimestamp?: number;
};

export function handleWeaponFire({
  now,
  lastShootTimesRef,
  projectilesRef,
  player,
}: {
  now: number;
  lastShootTimesRef: React.MutableRefObject<Record<number, number>>;
  projectilesRef: React.MutableRefObject<Projectile[]>;
  player: any;
}) {
  const state = useAccountStore.getState();
  const weapons = state.account?.weapons || [];
  const character = state.account?.characters.find(
    (c) => c.id === state.account?.selectedCharacterId
  );
  if (!character) return;

  for (const weapon of weapons) {
    // per-weapon cooldown lookup
    const last = lastShootTimesRef.current[weapon.id] || 0;
    const cd = (weapon.cooldown / character.attackSpeed) * 1000;
    if (now - last < cd) continue;

    switch (weapon.type) {
      case "projectile": {
        (["up", "down", "left", "right"] as const).forEach((dir) => {
          const [dx, dy] =
            dir === "up"
              ? [0, -1]
              : dir === "down"
              ? [0, 1]
              : dir === "left"
              ? [-1, 0]
              : [1, 0];
          projectilesRef.current.push({
            id: now + Math.random(),
            x: player.x,
            y: player.y,
            dx,
            dy,
            direction: dir,
            traveled: 0,
            maxDistance: weapon.range,
            speed: weapon.speed || 1,
            damage: weapon.damage,
            isOrbital: false,
          });
        });
        break;
      }
      case "orbital": {
        if (!projectilesRef.current.some((p) => p.isOrbital)) {
          projectilesRef.current.push({
            id: now + Math.random(),
            x: player.x + weapon.range,
            y: player.y,
            dx: 0,
            dy: 0,
            direction: "up",
            traveled: 0,
            maxDistance: weapon.range,
            speed: weapon.speed,
            damage: weapon.damage,
            isOrbital: true,
          });
        }
        break;
      }
      case "aura":
        // remove any existing aura
        projectilesRef.current = projectilesRef.current.filter(
          (p) => !p.isAura
        );

        // spawn a fresh aura centered on the player
        projectilesRef.current.push({
          id: now + Math.random(),
          x: player.x,
          y: player.y,
          dx: 0,
          dy: 0,
          direction: "up",
          traveled: 0,
          maxDistance: weapon.range,
          speed: 0,
          damage: weapon.damage,
          isOrbital: false,
          isAura: true,
          tickInterval: cd,
          lastHitTimestamp: 0,
        });
        break;
    }

    // reset this weapon's timer
    lastShootTimesRef.current[weapon.id] = now;
  }
}
