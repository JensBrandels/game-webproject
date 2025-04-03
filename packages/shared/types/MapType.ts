import type { Obstacle } from "./Obstacle";

export type PlacedObstacle = Obstacle & { x: number; y: number };

export type MapType = {
  id: number;
  background: string;
  size: { width: number; height: number };
  obstaclesWithCollision: PlacedObstacle[];
  obstaclesForVisual: PlacedObstacle[];
};
