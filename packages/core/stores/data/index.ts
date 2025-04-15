import { create } from "zustand";

type GameStore = {
  selectedCharacterId: number | null;
  selectedMapId: string | null;
  setCharacterId: (id: number) => void;
  setMapId: (id: string) => void;
  resetGame: () => void;
};

export const useGameStore = create<GameStore>((set) => ({
  selectedCharacterId: null,
  selectedMapId: null,
  setCharacterId: (id) => set({ selectedCharacterId: id }),
  setMapId: (id) => set({ selectedMapId: id }),
  resetGame: () => set({ selectedCharacterId: null, selectedMapId: null }),
}));
