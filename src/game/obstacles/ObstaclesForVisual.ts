import { Obstacle } from "../../types/Obstacle";

export const obstacleForVisual: Obstacle[] = [
  {
    id: 1, //Same ID as the tree trunk, but this is the crown
    width: 150,
    height: 150,
    hitbox: { width: 0, height: 0, offsetX: 50, offsetY: 0 }, // No collision
    sprite: "/BigTreeCrown.png", //Only the crown part of the tree
    color: "green",
    isTree: true,
  },
];
