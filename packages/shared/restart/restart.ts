import { useAccountStore } from "@viking/game-store";

export let isResetting = false;

export function restartGame() {
  isResetting = true;

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

  setTimeout(() => {
    isResetting = false;
  }, 100);
}

//validate the reset
export function validateResetState() {
  const store = useAccountStore.getState();
  const account = store.account;
  const selected = store.selectedCharacter();

  if (!account || !selected) {
    console.warn("Missing account or selected character");
    return;
  }

  const char = account.characters.find((c) => c.id === selected.id);

  console.log("Reset Validation:");
  console.log(
    "  isDead:",
    store.isDead === false ? "false" : `${store.isDead}`
  );
  console.log(
    "  isHurt:",
    store.isHurt === false ? "false" : `${store.isHurt}`
  );
  console.log(
    "  hp:",
    char?.hp === char?.maxHp
      ? `${char?.hp}/${char?.maxHp}`
      : `${char?.hp}/${char?.maxHp}`
  );

  // Add more checks if you want to verify enemies, map state, etc.
}
