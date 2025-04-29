import { useAccountStore } from "@viking/game-store";

export function useSelectedCharacter() {
  const id = useAccountStore((s) => s.account?.selectedCharacterId);
  const chars = useAccountStore((s) => s.account?.characters);
  return chars?.find((c) => c.id === id) || null;
}
