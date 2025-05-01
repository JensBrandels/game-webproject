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

export function handleWeaponFire({
  now,
  lastShootTimeRef,
  projectilesRef,
  player,
}: {
  now: number;
  lastShootTimeRef: React.MutableRefObject<number>;
  projectilesRef: React.MutableRefObject<Projectile[]>;
  player: any;
}) {
  const state = useAccountStore.getState();

  //Get weapon and character manually from Zustand
  const weapon = state.account?.weapons?.[0];
  const character = state.account?.characters.find(
    (c) => c.id === state.account?.selectedCharacterId
  );

  if (!weapon || !character) return;

  const cooldown = (weapon.cooldown / character.attackSpeed) * 1000;
  if (now - lastShootTimeRef.current < cooldown) return;

  lastShootTimeRef.current = now;

  switch (weapon.type) {
    case "projectile":
      const directions: {
        dx: number;
        dy: number;
        dir: "up" | "down" | "left" | "right";
      }[] = [
        { dx: 0, dy: -1, dir: "up" },
        { dx: 0, dy: 1, dir: "down" },
        { dx: -1, dy: 0, dir: "left" },
        { dx: 1, dy: 0, dir: "right" },
      ];

      directions.forEach(({ dx, dy, dir }) => {
        projectilesRef.current.push({
          id: now + Math.random(),
          x: player.x,
          y: player.y,
          dx,
          dy,
          direction: dir,
          traveled: 0,
          maxDistance: weapon.range,
          speed: weapon.speed ?? 1,
          damage: weapon.damage,
        });
      });
      break;

    case "melee":
      // add logic to hit enemies in front of player
      break;

    case "aura":
      // damage nearby enemies every interval
      break;

    case "orbital":
      // spawn orbiting projectile(s)
      break;

    case "beam":
      // long range instant hit in a line
      break;
  }
}
