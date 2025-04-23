import { useAccountStore } from "@viking/game-store";

export function restartGame() {
  const store = useAccountStore.getState();
  const account = store.account;
  const selected = store.selectedCharacter();

  if (!account || !selected) return;

  const updatedCharacters = account.characters.map((c) =>
    c.id === selected.id
      ? {
          ...c,
          hp: c.maxHp,
          items: [],
          xp: 0,
        }
      : c
  );

  store.setAccount({ ...account, characters: updatedCharacters });
  store.setIsDead(false);
  store.setIsHurt(false);
  console.log("✅ Restart complete:", {
    store: useAccountStore.getState(),
    updatedCharacterHp: updatedCharacters.find((c) => c.id === selected.id)?.hp,
  });
}
