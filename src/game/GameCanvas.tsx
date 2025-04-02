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
  const backgroundCanvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
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
    const backgroundCanvas = backgroundCanvasRef.current;
    const bgCtx = backgroundCanvas?.getContext("2d");

    if (!canvas || !ctx || !backgroundCanvas || !bgCtx) return;

    // Setup offscreen canvas
    offscreenCanvasRef.current = document.createElement("canvas");
    offscreenCanvasRef.current.width = selectedMap.size.width;
    offscreenCanvasRef.current.height = selectedMap.size.height;

    const offCtx = offscreenCanvasRef.current.getContext("2d");
    if (!offCtx) return;

    // Draw background + collision to offscreen canvas
    selectedMap.obstaclesWithCollision = [];
    drawPlacedObjects(
      offCtx,
      selectedMap.placedObjects,
      { x: 0, y: 0 },
      "background"
    );
    drawPlacedObjects(
      offCtx,
      selectedMap.placedObjects,
      { x: 0, y: 0 },
      "collision",
      selectedMap.obstaclesWithCollision
    );

    let animationFrameId: number;

    const draw = () => {
      // Draw visible portion of map from offscreen canvas
      bgCtx.clearRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);
      bgCtx.drawImage(
        offscreenCanvasRef.current!,
        camera.x,
        camera.y,
        backgroundCanvas.width,
        backgroundCanvas.height,
        0,
        0,
        backgroundCanvas.width,
        backgroundCanvas.height
      );

      // Clear top canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw player
      drawPlayer(
        ctx,
        playerRef.current,
        camera,
        selectedCharacter.id,
        spriteSheets
      );

      // Now draw zIndex=1 visual-only tiles *after* player
      drawPlacedObjects(ctx, selectedMap.placedObjects, camera, "visual");
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

  return (
    <>
      <canvas
        ref={backgroundCanvasRef}
        width={1280}
        height={720}
        style={{ position: "absolute", top: 0, left: 0 }}
      />
      <canvas
        ref={canvasRef}
        width={1280}
        height={720}
        style={{ position: "absolute", top: 0, left: 0 }}
      />
    </>
  );
};

export default GameCanvas;
