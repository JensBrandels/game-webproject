import { useEffect, useRef, useState } from "react";
import { drawPlayer } from "./rendering/drawPlayer";
import { updatePlayer } from "./logic/updatePlayer";
import { setupInputHandlers } from "./logic/handleInput";
import { drawPlacedObjects } from "./rendering/drawPlacedObjects";
import { characters } from "./Characters";

type GameCanvasProps = {
  selectedMap: any;
  selectedCharacter: any;
};

const GameCanvas = ({ selectedMap, selectedCharacter }: GameCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playerRef = useRef({
    x: 100,
    y: 100,
    prevX: 100,
    prevY: 100,
    direction: "down",
  });
  const camera = { x: 0, y: 0 };
  const keys = useRef<Record<string, boolean>>({});
  const [spriteSheets, setSpriteSheets] = useState<
    Record<string, HTMLImageElement>
  >({});

  useEffect(() => {
    const removeInputHandlers = setupInputHandlers(keys);
    const characterData = characters.find((c) => c.id === selectedCharacter.id);
    if (!characterData) return;

    const sheetPaths = new Set<string>();
    sheetPaths.add(characterData.animations.idle.sheet);
    Object.values(characterData.animations.walk).forEach((walkAnim) =>
      sheetPaths.add(walkAnim.sheet)
    );

    const images: Record<string, HTMLImageElement> = {};
    let loadedCount = 0;

    sheetPaths.forEach((path) => {
      const img = new Image();
      img.src = path;
      img.onload = () => {
        images[path.replace(/^\/+/, "")] = img;
        loadedCount++;
        if (loadedCount === sheetPaths.size) {
          setSpriteSheets(images);
        }
      };
    });

    return () => removeInputHandlers();
  }, [selectedCharacter.id]);

  useEffect(() => {
    if (Object.keys(spriteSheets).length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let animationFrameId: number;

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

      drawPlayer(
        ctx,
        playerRef.current,
        camera,
        selectedCharacter.id,
        spriteSheets
      );

      drawPlacedObjects(ctx, selectedMap.placedObjects, camera, "visual");
      selectedMap.obstaclesWithCollision = obstacles;

      // obstacles.forEach((hitbox) => {
      //   ctx.strokeStyle = "blue";
      //   ctx.lineWidth = 1;
      //   ctx.strokeRect(hitbox.x, hitbox.y, hitbox.width, hitbox.height);
      // });
    };

    const gameLoop = () => {
      updatePlayer(
        playerRef.current,
        keys,
        selectedCharacter.id,
        selectedMap,
        camera,
        canvas,
        ctx
      );

      draw();
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    return () => cancelAnimationFrame(animationFrameId);
  }, [spriteSheets, selectedCharacter.id, selectedMap.id]);

  return <canvas ref={canvasRef} width={1280} height={720} />;
};

export default GameCanvas;
