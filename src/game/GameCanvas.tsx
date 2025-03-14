import { useEffect, useRef } from "react";
import { maps } from "./Maps";
import { characters } from "./Characters";
import { drawBackground } from "./rendering/drawBackground";
import {
  drawCollidableObstacles,
  drawVisualObstacles,
} from "./rendering/drawObstacles";
import { drawPlayer } from "./rendering/drawPlayer";
import { updatePlayer } from "./logic/updatePlayer";
import { setupInputHandlers } from "./logic/handleInput";

const GameCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const player = { x: 400, y: 300 };
  const camera = { x: 0, y: 0 };
  const keys = useRef<Record<string, boolean>>({});

  const selectedCharacter = characters.find((c) => c.id === 1) || characters[0]; // Selects character
  const selectedMap = maps.find((m) => m.id === 2) || maps[0]; // Selects map

  const backgroundImage = new Image();
  backgroundImage.src = selectedMap.background;

  const obstacleImages = selectedMap.obstaclesWithCollision.map((obstacle) => {
    const img = new Image();
    img.src = obstacle.sprite || "";
    return { ...obstacle, image: img };
  });

  const visualObstacleImages = selectedMap.obstaclesForVisual.map(
    (obstacle) => {
      const img = new Image();
      img.src = obstacle.sprite || "";
      return { ...obstacle, image: img };
    }
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const removeInputHandlers = setupInputHandlers(keys);

    const update = () => {
      updatePlayer(
        player,
        keys,
        selectedCharacter.id,
        selectedMap,
        camera,
        canvas
      );
    };

    const draw = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      drawBackground(ctx, backgroundImage, selectedMap, camera);
      drawCollidableObstacles(ctx, obstacleImages, camera);
      drawPlayer(ctx, player, camera, selectedCharacter.id);
      drawVisualObstacles(ctx, visualObstacleImages, camera);
    };

    const gameLoop = () => {
      update();
      draw();
      requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      removeInputHandlers();
    };
  }, []);

  return <canvas ref={canvasRef} width={1280} height={720} />;
};

export default GameCanvas;
