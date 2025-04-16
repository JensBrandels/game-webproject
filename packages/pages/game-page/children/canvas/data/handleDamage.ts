import { useAccountStore } from "@viking/game-store";
import { enemies } from "@viking/enemies";
import { isBoxOverlap } from "../../../../../shared/collision/Collision";

const lastHitTimestamps: Map<number, number> = new Map();

export function handleDamage(
  enemyInstances: {
    id: number;
    enemyId: number;
    x: number;
    y: number;
  }[],
  playerX: number,
  playerY: number
) {
  const { selectedCharacter, setAccount, account, setIsHurt, setIsDead } =
    useAccountStore.getState();

  const character = selectedCharacter();
  if (!character || !account) return;

  const hitbox = character.hitbox;

  const playerBox = {
    x: playerX + hitbox.offsetX,
    y: playerY + hitbox.offsetY,
    width: hitbox.width,
    height: hitbox.height,
  };

  const now = Date.now();
  let damageTaken = 0;
  let overlapping = false;

  for (const enemy of enemyInstances) {
    const enemyData = enemies.find((e) => e.id === enemy.enemyId);
    if (!enemyData) continue;

    const enemyHitbox = enemyData.hitbox;
    const enemyBox = {
      x: enemy.x + enemyHitbox.offsetX,
      y: enemy.y + enemyHitbox.offsetY,
      width: enemyHitbox.width,
      height: enemyHitbox.height,
    };

    const overlap = isBoxOverlap(playerBox, enemyBox);
    const lastHit = lastHitTimestamps.get(enemy.id) || 0;

    if (overlap) {
      overlapping = true;

      if (now - lastHit > 1000) {
        lastHitTimestamps.set(enemy.id, now);
        damageTaken += enemyData.damage;
      }
    }
  }

  if (overlapping) {
    setIsHurt(true);
  } else {
    setIsHurt(false);
  }

  if (damageTaken > 0) {
    const newHp = Math.max(character.hp - damageTaken, 0);
    const updatedCharacter = {
      ...character,
      hp: newHp,
    };

    const updatedAccount = {
      ...account,
      characters: account.characters.map((c) =>
        c.id === character.id ? updatedCharacter : c
      ),
    };

    setAccount(updatedAccount);

    if (newHp <= 0) {
      console.log("Character died.");
      setIsDead(true);
    }
  }
}
