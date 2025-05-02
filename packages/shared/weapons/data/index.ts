type Frame = {
  x: number;
  y: number;
};

type WeaponType = "projectile" | "melee" | "aura" | "orbital" | "beam";

type WeaponAnimation = {
  sheet: string;
  frames: Frame[];
};

export type Weapon = {
  id: number;
  name: string;
  type: WeaponType;
  damage: number;
  speed: number;
  cooldown: number;
  size: number;
  range: number;
  animations:
    | Record<string, WeaponAnimation>
    | {
        shoot: {
          up: WeaponAnimation;
          down: WeaponAnimation;
          left: WeaponAnimation;
          right: WeaponAnimation;
        };
      };
};

export const weapons: Weapon[] = [
  {
    id: 1,
    name: "Fire Spell",
    type: "projectile",
    damage: 25,
    speed: 0.5,
    cooldown: 1,
    size: 64,
    range: 100,
    animations: {
      shoot: {
        up: {
          sheet: "/FireSpell.png",
          frames: Array.from({ length: 15 }, (_, i) => ({
            x: 0,
            y: i * 32,
          })),
        },
        down: {
          sheet: "/FireSpell.png",
          frames: Array.from({ length: 15 }, (_, i) => ({
            x: 0,
            y: i * 32,
          })),
        },
        left: {
          sheet: "/FireSpell.png",
          frames: Array.from({ length: 15 }, (_, i) => ({
            x: 0,
            y: i * 32,
          })),
        },
        right: {
          sheet: "/FireSpell.png",
          frames: Array.from({ length: 15 }, (_, i) => ({
            x: 0,
            y: i * 32,
          })),
        },
      },
    },
  },
  {
    id: 2,
    name: "Viking Shield",
    type: "orbital",
    damage: 15,
    speed: 0.002,
    cooldown: 0,
    size: 64,
    range: 80,
    animations: {
      spin: {
        sheet: "/ShieldSpell.png",
        frames: Array.from({ length: 4 }, (_, i) => ({
          x: 0,
          y: i * 64,
        })),
      },
    },
  },
];
