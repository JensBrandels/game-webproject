import { useEffect } from "react";
import { useAccountStore } from "@viking/game-store";

export function useGameTimer(
  setSecondsElapsed: (fn: (prev: number) => number) => void,
  reset: () => void,
  totalSeconds: number,
  path: string
) {
  useEffect(() => {
    reset();
    const interval = setInterval(() => {
      const character = useAccountStore.getState().selectedCharacter();
      if (!character || character.hp <= 0) return;
      setSecondsElapsed((prev) => (prev >= totalSeconds ? prev : prev + 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [path]);
}
