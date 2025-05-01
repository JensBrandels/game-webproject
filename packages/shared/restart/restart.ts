import { useAccountStore } from "@viking/game-store";
import { useGameSessionStore } from "@viking/gamesession-store";
import { animationState } from "@viking/game-canvas/data/drawPlayer";
import { clearHitTimestamps } from "@viking/game-canvas/data/handleDamage";

export let lastResetTime = 0;

export function restartGame() {
  lastResetTime = Date.now();
  clearHitTimestamps();

  // ————— BEFORE RESET —————
  const { account, isDead, isHurt } = useAccountStore.getState();
  const { sessionId } = useGameSessionStore.getState();
  const charId = account?.selectedCharacterId;
  const beforeChar = account?.characters.find((c) => c.id === charId);

  console.log("🔄 restartGame BEFORE →", {
    hp: beforeChar?.hp,
    isDead,
    isHurt,
    sessionId,
  });

  // ————— TEAR DOWN SESSION —————
  useGameSessionStore.getState().endSession();
  animationState.clear();

  // ————— RESET ACCOUNT STATE —————
  if (account && charId != null) {
    const updatedChars = account.characters.map((c) =>
      c.id === charId ? { ...c, hp: c.maxHp, items: [], xp: 0, level: 1 } : c
    );
    useAccountStore.getState().setAccount({
      ...account,
      characters: updatedChars,
    });
    useAccountStore.getState().selectCharacter(charId);
  }
  useAccountStore.getState().setIsDead(false);
  useAccountStore.getState().setIsHurt(false);

  // ————— AFTER RESET —————
  const {
    account: accAfter,
    isDead: deadAfter,
    isHurt: hurtAfter,
  } = useAccountStore.getState();
  const { sessionId: sessAfter } = useGameSessionStore.getState();
  const afterChar = accAfter?.characters.find((c) => c.id === charId);

  console.log("🔄 restartGame AFTER →", {
    hp: afterChar?.hp,
    isDead: deadAfter,
    isHurt: hurtAfter,
    sessionId: sessAfter,
  });
}
