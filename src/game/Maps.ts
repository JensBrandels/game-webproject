import { obstacleList } from "./Obstacles";

//types
import { Obstacle } from "../types/Obstacle";

export type PlacedObstacle = Obstacle & { x: number; y: number };

export const maps = [
  {
    id: 1,
    background: "/grass.png",
    size: { width: 2000, height: 2000 },
    obstacles: [
      { x: 500, y: 500, ...(obstacleList.find((o) => o.id === 1) as Obstacle) },
      { x: 700, y: 600, ...(obstacleList.find((o) => o.id === 2) as Obstacle) },
      { x: 900, y: 400, ...(obstacleList.find((o) => o.id === 3) as Obstacle) },
    ].filter((o): o is PlacedObstacle => o !== undefined),
  },
  {
    id: 2,
    background: "/grasstwo.png",
    size: { width: 2500, height: 1500 },
    obstacles: [
      { x: 100, y: 100, ...(obstacleList.find((o) => o.id === 1) as Obstacle) },
      {
        x: 1500,
        y: 500,
        ...(obstacleList.find((o) => o.id === 2) as Obstacle),
      },
      { x: 750, y: 400, ...(obstacleList.find((o) => o.id === 3) as Obstacle) },
    ].filter((o): o is PlacedObstacle => o !== undefined),
  },
];
