import { obstacleList } from "./Obstacles";

export const maps = [
  {
    id: 1,
    background: "/grass.png",
    size: { width: 2000, height: 2000 },
    obstacles: [
      { x: 500, y: 500, ...obstacleList.tree },
      { x: 700, y: 600, ...obstacleList.rock },
      { x: 900, y: 400, ...obstacleList.bigRock },
    ],
  },
  {
    id: 2,
    background: "/grasstwo.png",
    size: { width: 2500, height: 1500 },
    obstacles: [
      { x: 100, y: 100, ...obstacleList.tree },
      { x: 1500, y: 500, ...obstacleList.rock },
      { x: 750, y: 400, ...obstacleList.bigRock },
    ],
  },
];
