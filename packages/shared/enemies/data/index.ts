export type Frame = {
  x: number;
  y: number;
};

export type Animation = {
  sheet: string;
  frames: Frame[];
};

export type DirectionalAnimation = {
  up: Animation;
  down: Animation;
  left: Animation;
  right: Animation;
};

export type Enemy = {
  id: number;
  name: string;
  sprite?: string;
  hitbox: {
    width: number;
    height: number;
    offsetX: number;
    offsetY: number;
  };
  hp: number;
  damage: number;
  movementSpeed: number;
  spriteSize: { width: number; height: number };
  animations: {
    idle: Animation;
    walk: Partial<DirectionalAnimation> | Animation;
    death: Animation;
  };
};

export const enemies: Enemy[] = [
  {
    id: 1,
    name: "Green Blob",
    hitbox: {
      width: 16,
      height: 16,
      offsetX: 20,
      offsetY: 20,
    },
    hp: 50,
    damage: 10,
    movementSpeed: 0.2,
    spriteSize: { width: 64, height: 64 },
    animations: {
      idle: {
        sheet: "/GreenSlimeIdle.png",
        frames: [...Array(6)].map((_, i) => ({ x: 0, y: i * 64 })),
      },
      walk: {
        sheet: "/GreenSlimeWalk.png",
        frames: [...Array(6)].map((_, i) => ({ x: 0, y: i * 64 })),
      },
      death: {
        sheet: "/GreenSlimeDeath.png",
        frames: [...Array(6)].map((_, i) => ({ x: 0, y: i * 64 })),
      },
    },
  },
  {
    id: 2,
    name: "Blue Blob",
    hitbox: {
      width: 16,
      height: 16,
      offsetX: 20,
      offsetY: 20,
    },
    hp: 100,
    damage: 20,
    movementSpeed: 0.5,
    spriteSize: { width: 32, height: 32 },
    animations: {
      idle: {
        sheet: "/BlueSlimeIdle.png",
        frames: [...Array(6)].map((_, i) => ({ x: 0, y: i * 32 })),
      },
      walk: {
        left: {
          sheet: "/BlueSlimeLeft.png",
          frames: [...Array(6)].map((_, i) => ({ x: 0, y: i * 32 })),
        },
        right: {
          sheet: "/BlueSlimeRight.png",
          frames: [...Array(6)].map((_, i) => ({ x: 0, y: i * 32 })),
        },
        up: {
          sheet: "/BlueSlimeUp.png",
          frames: [...Array(6)].map((_, i) => ({ x: 0, y: i * 32 })),
        },
        down: {
          sheet: "/BlueSlimeDown.png",
          frames: [...Array(6)].map((_, i) => ({ x: 0, y: i * 32 })),
        },
      },
      death: {
        sheet: "/BlueSlimeDeath.png",
        frames: [...Array(6)].map((_, i) => ({ x: 0, y: i * 32 })),
      },
    },
  },
];
