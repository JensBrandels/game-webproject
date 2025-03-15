import { obstaclesWithCollision } from "../editorLogic/obstacles/ObstaclesWithCollision";
import { obstacleForVisual } from "../editorLogic/obstacles/ObstaclesForVisual";

//types
import { Obstacle } from "../types/Obstacle";

export type PlacedObstacle = Obstacle & { x: number; y: number };

export type MapType = {
  id: number;
  background: string;
  size: { width: number; height: number };
  obstaclesWithCollision: PlacedObstacle[];
  obstaclesForVisual: PlacedObstacle[];
};

export const maps: MapType[] = [
  {
    id: 1,
    background: "/grass.png",
    size: { width: 2000, height: 2000 },

    //Split obstacles into two categories
    obstaclesWithCollision: [
      {
        x: 500,
        y: 500,
        ...(obstaclesWithCollision.find((o) => o.id === 1) as Obstacle),
      },
      {
        x: 700,
        y: 600,
        ...(obstaclesWithCollision.find((o) => o.id === 2) as Obstacle),
      },
      {
        x: 900,
        y: 400,
        ...(obstaclesWithCollision.find((o) => o.id === 3) as Obstacle),
      },
    ].filter((o): o is PlacedObstacle => o !== undefined),

    obstaclesForVisual: [
      {
        x: 500,
        y: 450,
        ...(obstacleForVisual.find((o) => o.id === 1) as Obstacle),
      },
    ].filter((o): o is PlacedObstacle => o !== undefined),
  },

  {
    id: 2,
    background: "/grasstwo.png",
    size: { width: 2500, height: 1500 },

    obstaclesWithCollision: [
      {
        x: 100,
        y: 200,
        ...(obstaclesWithCollision.find((o) => o.id === 1) as Obstacle),
      },
      {
        x: 1500,
        y: 500,
        ...(obstaclesWithCollision.find((o) => o.id === 2) as Obstacle),
      },
      {
        x: 750,
        y: 400,
        ...(obstaclesWithCollision.find((o) => o.id === 3) as Obstacle),
      },
      {
        x: 800,
        y: 350,
        ...(obstaclesWithCollision.find((o) => o.id === 3) as Obstacle),
      },
    ].filter((o): o is PlacedObstacle => o !== undefined),

    obstaclesForVisual: [
      {
        x: 75,
        y: 53,
        ...(obstacleForVisual.find((o) => o.id === 1) as Obstacle),
      },
    ].filter((o): o is PlacedObstacle => o !== undefined),
  },
];
