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
  characters: Character[];
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
  isHurt: boolean;
  isDead: boolean;

  setIsHurt: (value: boolean) => void;
  setIsDead: (value: boolean) => void;

  setAccount: (data: Account) => void;
  selectCharacter: (id: number) => void;
  setSelectedMapId: (id: string) => void;
  resetAccount: () => void;

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
    characters: [characters.find((c) => c.id === 1)!],
    selectedCharacterId: 1,
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

  isHurt: false,
  isDead: false,

  setIsHurt: (value) => set({ isHurt: value }),
  setIsDead: (value) => set({ isDead: value }),

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

  setSelectedMapId: (id: string) => set({ selectedMapId: id }),

  resetAccount: () => set({ account: null, selectedMapId: null }),

  selectedCharacter: () => {
    const account = get().account;
    if (!account?.selectedCharacterId) return null;
    return (
      account.characters.find((c) => c.id === account.selectedCharacterId) ||
      null
    );
  },

  accountLevel: () => get().account?.progress.accountLevel ?? 0,

  isLoggedIn: () => !!get().account?.id,

  hasCompletedMap: (mapId: string) =>
    get().account?.progress.completedMaps.includes(mapId) ?? false,
}));
