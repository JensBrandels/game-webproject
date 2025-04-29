import { useAccountStore } from "@viking/game-store";
import { enemies } from "@viking/enemies";
import { isBoxOverlap } from "../../../../../shared/collision/Collision";
import { lastResetTime } from "../../../../../shared/restart/restart";

export const lastHitTimestamps: Map<number, number> = new Map();

export function clearHitTimestamps() {
  lastHitTimestamps.clear();
}

export function handleDamage(
  enemyInstances: { id: number; enemyId: number; x: number; y: number }[],
  playerX: number,
  playerY: number,
  isDead: boolean
) {
  if (Date.now() - lastResetTime < 500) return;

  //pull everything you need from the store in one go
  const { account, setAccount, setIsHurt, setIsDead } =
    useAccountStore.getState();

  if (!account || isDead) return;

  //find the character fresh by id
  const charId = account.selectedCharacterId;
  const character = account.characters.find((c) => c.id === charId);
  if (!character) return;

  //build player hitbox
  const { offsetX, offsetY, width, height } = character.hitbox;
  const playerBox = {
    x: playerX + offsetX,
    y: playerY + offsetY,
    width,
    height,
  };

  let damageTaken = 0;
  let overlapping = false;
  const now = Date.now();

  for (const enemy of enemyInstances) {
    const enemyData = enemies.find((e) => e.id === enemy.enemyId);
    if (!enemyData) continue;

    const eh = enemyData.hitbox;
    const enemyBox = {
      x: enemy.x + eh.offsetX,
      y: enemy.y + eh.offsetY,
      width: eh.width,
      height: eh.height,
    };

    if (isBoxOverlap(playerBox, enemyBox)) {
      overlapping = true;
      const last = lastHitTimestamps.get(enemy.id) || 0;
      if (now - last > 1000) {
        lastHitTimestamps.set(enemy.id, now);
        damageTaken += enemyData.damage;
      }
    }
  }

  setIsHurt(overlapping);

  if (damageTaken > 0) {
    const newHp = Math.max(character.hp - damageTaken, 0);
    const updatedCharacters = account.characters.map((c) =>
      c.id === character.id ? { ...c, hp: newHp } : c
    );

    setAccount({ ...account, characters: updatedCharacters });

    if (newHp <= 0) {
      console.log("Character died.");
      setIsDead(true);
    }
  }
}
