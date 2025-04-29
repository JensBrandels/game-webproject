type Frame = {
  x: number;
  y: number;
};

type Animation = {
  sheet: string;
  frames: Frame[];
};

export type Weapon = {
  id: number;
  name: string;
  damage: number;
  speed: number;
  cooldown: number;
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
    damage: 25,
    speed: 0.5,
    cooldown: 1,
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
