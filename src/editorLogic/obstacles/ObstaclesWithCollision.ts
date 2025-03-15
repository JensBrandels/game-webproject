import { Obstacle } from "../../types/Obstacle";

export const obstaclesWithCollision: Obstacle[] = [
  {
    id: 1,
    width: 100,
    height: 60,
    hitbox: {
      width: 50,
      height: 50,
      offsetX: 25, // Moves the hitbox 50px right
      offsetY: -5,
    },
    sprite: "/BigTreeTrunk.png", // 👈 Only the trunk part of the tree
    color: "green",
    isTree: true,
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
