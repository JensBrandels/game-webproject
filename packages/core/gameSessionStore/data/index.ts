import { create } from "zustand";

type GameSessionState = {
  sessionId: string | null;
  isGameActive: boolean;
  levelUpReady: boolean;
  setLevelUpReady: (val: boolean) => void;
  startSession: () => void;
  endSession: () => void;
};

export const useGameSessionStore = create<GameSessionState>((set) => ({
  sessionId: null,
  isGameActive: false,
  levelUpReady: false,
  setLevelUpReady: (val) => set({ levelUpReady: val }),
  startSession: () =>
    set({ isGameActive: true, sessionId: crypto.randomUUID() }),
  endSession: () => set({ isGameActive: false, sessionId: null }),
}));
