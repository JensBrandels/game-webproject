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
  animations: {
    idle: Animation;
    walk: Partial<DirectionalAnimation> | Animation;
    hurt?: Animation;
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
      offsetX: 0,
      offsetY: 0,
    },
    hp: 50,
    damage: 10,
    movementSpeed: 1.5,
    animations: {
      idle: {
        sheet: "/GreenSlimeIdle.png",
        frames: [...Array(6)].map((_, i) => ({ x: i * 32, y: 0 })),
      },
      walk: {
        sheet: "/GreenSlimeWalk.png",
        frames: [...Array(6)].map((_, i) => ({ x: i * 32, y: 0 })),
      },
      hurt: {
        sheet: "/GreenSlimeHurt.png",
        frames: [...Array(4)].map((_, i) => ({ x: i * 32, y: 0 })),
      },
      death: {
        sheet: "/GreenSlimeDeath.png",
        frames: [...Array(6)].map((_, i) => ({ x: i * 32, y: 0 })),
      },
    },
  },
  {
    id: 2,
    name: "Blue Blob",
    hitbox: {
      width: 32,
      height: 32,
      offsetX: 0,
      offsetY: 0,
    },
    hp: 100,
    damage: 20,
    movementSpeed: 1,
    animations: {
      idle: {
        sheet: "/BlueSlimeIdle.png",
        frames: [...Array(6)].map((_, i) => ({ x: i * 64, y: 0 })),
      },
      walk: {
        left: {
          sheet: "/BlueSlimeLeft.png",
          frames: [...Array(6)].map((_, i) => ({ x: i * 64, y: 0 })),
        },
        right: {
          sheet: "/BlueSlimeRight.png",
          frames: [...Array(6)].map((_, i) => ({ x: i * 64, y: 0 })),
        },
      },
      hurt: null as any,
      death: {
        sheet: "/BlueSlimeDeath.png",
        frames: [...Array(6)].map((_, i) => ({ x: i * 64, y: 0 })),
      },
    },
  },
];
