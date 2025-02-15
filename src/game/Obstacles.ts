import { Obstacle } from "../types/Obstacle";

export const obstacleList: Obstacle[] = [
  {
    id: 1,
    width: 150,
    height: 200,
    hitbox: {
      width: 50,
      height: 80,
      offsetX: 50, // Moves the hitbox 50px right
      offsetY: 120,
    },
    sprite: "/BigTree.png",
    color: "green",
  },
  {
    id: 2,
    width: 40,
    height: 40,
    hitbox: { width: 35, height: 35, offsetX: 0, offsetY: 0 },
    sprite: "/smallStone.png",
    color: "lightgrey",
  },
  {
    id: 3,
    width: 100,
    height: 100,
    hitbox: { width: 100, height: 100, offsetX: 0, offsetY: 0 },
    sprite: "/cutTree.png",
    color: "grey",
  },
];
