export const characters = [
  {
    id: 1,
    name: "Player",
    hitbox: {
      width: 16,
      height: 16,
      offsetX: 8,
      offsetY: 6,
    },
    hp: 120,
    mp: 0,
    movementSpeed: 5,
    attackSpeed: 1.2,
    weapons: [],
    animations: {
      idle: {
        sheet: "/IdlePlayer.png",
        frames: Array.from({ length: 12 }, (_, i) => ({
          x: 0,
          y: i * 32,
        })),
      },
      walk: {
        down: {
          sheet: "/PlayerDownWalk.png",
          frames: Array.from({ length: 6 }, (_, i) => ({ x: 0, y: i * 32 })),
        },
        up: {
          sheet: "/PlayerUpWalk.png",
          frames: Array.from({ length: 6 }, (_, i) => ({ x: 0, y: i * 32 })),
        },
        left: {
          sheet: "/PlayerLeftWalk.png",
          frames: Array.from({ length: 6 }, (_, i) => ({ x: 0, y: i * 32 })),
        },
        right: {
          sheet: "/PlayerRightWalk.png",
          frames: Array.from({ length: 6 }, (_, i) => ({ x: 0, y: i * 32 })),
        },
      },
      hurt: {
        sheet: "/Soldier-Hurt.png",
        frames: [
          { x: 5, y: 34 },
          { x: 38, y: 34 },
          { x: 71, y: 34 },
          { x: 104, y: 34 },
        ],
      },
      death: {
        sheet: "/Soldier-Death.png",
        frames: [
          { x: 5, y: 34 },
          { x: 38, y: 34 },
          { x: 71, y: 34 },
          { x: 104, y: 34 },
        ],
      },
    },
  },
];
