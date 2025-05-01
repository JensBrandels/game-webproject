type Frame = {
  x: number;
  y: number;
};

type WeaponType = "projectile" | "melee" | "aura" | "orbital" | "beam";

type Animation = {
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
  animations: {
    shoot: {
      up: Animation;
      down: Animation;
      left: Animation;
      right: Animation;
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
];
