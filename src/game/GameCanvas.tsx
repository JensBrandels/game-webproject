import { useEffect, useRef } from "react";
import { drawPlayer } from "./rendering/drawPlayer";
import { updatePlayer } from "./logic/updatePlayer";
import { setupInputHandlers } from "./logic/handleInput";
import { drawPlacedObjects } from "./rendering/drawPlacedObjects";

type GameCanvasProps = {
  selectedMap: any;
  selectedCharacter: any;
};

const GameCanvas = ({ selectedMap, selectedCharacter }: GameCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const player = { x: 400, y: 300 };
  const camera = { x: 0, y: 0 };
  const keys = useRef<Record<string, boolean>>({});

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
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const obstacles: any[] = [];

      drawPlacedObjects(ctx, selectedMap.placedObjects, camera, "background");
      drawPlacedObjects(
        ctx,
        selectedMap.placedObjects,
        camera,
        "collision",
        obstacles
      );
      drawPlayer(ctx, player, camera, selectedCharacter.id);
      drawPlacedObjects(ctx, selectedMap.placedObjects, camera, "visual");

      selectedMap.obstaclesWithCollision = obstacles;
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
  }, [selectedMap, selectedCharacter]);

  return <canvas ref={canvasRef} width={1280} height={720} />;
};

export default GameCanvas;
