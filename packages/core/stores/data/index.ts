import { create } from "zustand";
import { characters, type Character } from "@viking/characters";

type Item = {
  id: string;
  name: string;
  effect: string;
};

type Account = {
  id: string;
  email: string;
  username: string;
  characterIds: number[];
  selectedCharacterId: number | null;
  progress: {
    completedMaps: string[];
    accountLevel: number;
    xp: number;
  };
  inventory: Item[];
  stats: {
    enemiesKilled: number;
    timePlayed: number;
    deaths: number;
  };
};

type AccountStore = {
  account: Account | null;
  selectedMapId: string | null;

  setAccount: (data: Account) => void;
  selectCharacter: (id: number) => void;
  setSelectedMapId: (id: string) => void;
  resetAccount: () => void;

  // Derived values
  selectedCharacter: () => Character | null;
  accountLevel: () => number;
  isLoggedIn: () => boolean;
  hasCompletedMap: (mapId: string) => boolean;
};

export const useAccountStore = create<AccountStore>((set, get) => ({
  account: {
    id: "dev",
    email: "dev@dev.com",
    username: "DevUser",
    characterIds: [1],
    selectedCharacterId: null,
    progress: {
      completedMaps: [],
      accountLevel: 1,
      xp: 0,
    },
    inventory: [],
    stats: {
      enemiesKilled: 0,
      timePlayed: 0,
      deaths: 0,
    },
  },
  selectedMapId: null,

  setAccount: (data) => set({ account: data }),

  selectCharacter: (id) =>
    set((state) =>
      state.account
        ? {
            account: {
              ...state.account,
              selectedCharacterId: id,
            },
          }
        : {}
    ),

  setSelectedMapId: (id) => set({ selectedMapId: id }),

  resetAccount: () => set({ account: null, selectedMapId: null }),

  selectedCharacter: () => {
    const id = get().account?.selectedCharacterId;
    if (!id) return null;
    return characters.find((c) => c.id === id) || null;
  },

  accountLevel: () => get().account?.progress.accountLevel ?? 0,

  isLoggedIn: () => !!get().account?.id,

  hasCompletedMap: (mapId: string) =>
    get().account?.progress.completedMaps.includes(mapId) ?? false,
}));
