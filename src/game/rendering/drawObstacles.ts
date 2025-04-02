import type { PlacedObstacle } from "../Maps";

// Function to draw obstacles that have collision (rocks, tree trunks, etc.)
export const drawCollidableObstacles = (
  ctx: CanvasRenderingContext2D,
  obstacleImages: PlacedObstacle[],
  camera: { x: number; y: number }
) => {
  if (!ctx) return;

  obstacleImages.forEach((obstacle) => {
    if (obstacle.image?.complete) {
      ctx.drawImage(
        obstacle.image,
        obstacle.x - camera.x,
        obstacle.y - camera.y,
        obstacle.width,
        obstacle.height
      );
    }
  });
};

// Function to draw purely visual obstacles (tree crowns, decorations, etc.)
export const drawVisualObstacles = (
  ctx: CanvasRenderingContext2D,
  visualObstacleImages: PlacedObstacle[],
  camera: { x: number; y: number }
) => {
  if (!ctx) return;

  visualObstacleImages.forEach((obstacle) => {
    if (obstacle.image?.complete) {
      ctx.drawImage(
        obstacle.image,
        obstacle.x - camera.x,
        obstacle.y - camera.y,
        obstacle.width,
        obstacle.height
      );
    }
  });
};
