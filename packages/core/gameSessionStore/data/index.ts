import { create } from "zustand";

type GameSessionState = {
  sessionId: string | null;
  isGameActive: boolean;
  startSession: () => void;
  endSession: () => void;
};

export const useGameSessionStore = create<GameSessionState>((set) => ({
  sessionId: null,
  isGameActive: false,
  startSession: () =>
    set({ isGameActive: true, sessionId: crypto.randomUUID() }),
  endSession: () => set({ isGameActive: false, sessionId: null }),
}));
