import { useEffect, useRef, useState } from "react";
import { drawPlayer } from "../data/drawPlayer";
import { updatePlayer } from "../data/updatePlayer";
import { setupInputHandlers } from "../data/handleInput";
import { drawPlacedObjects } from "../data/drawPlacedObjects";
import { characters } from "@viking/characters";
import { enemies } from "@viking/enemies";
import { useSpawnLoop } from "../data/spawnLoop";
import { drawEnemy } from "../data/drawEnemies";

import "./style.scss";

type EnemyInstance = {
  id: number;
  enemyId: number;
  x: number;
  y: number;
  hp: number;
  animationState: "idle" | "walk" | "death";
  frameIndex: number;
  direction?: "left" | "right" | "up" | "down";
};

type GameCanvasProps = {
  selectedMap: any;
  selectedCharacter: any;
};

export const GameCanvas = ({
  selectedMap,
  selectedCharacter,
}: GameCanvasProps) => {
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
  const enemyInstancesRef = useRef<EnemyInstance[]>([]);

  //control enemy spawn waves
  useSpawnLoop(
    () => playerRef.current,
    (x, y, currentTimeSec) => {
      let enemyToSpawn = enemies.find((e) => e.id === 1);
      if (currentTimeSec >= 30) {
        enemyToSpawn = enemies.find((e) => e.id === 2);
      }

      if (!enemyToSpawn) return;

      console.log(
        `Spawning enemy: ${enemyToSpawn?.name} at ${x}, ${y} (time: ${currentTimeSec}s)`
      );
      enemyInstancesRef.current.push({
        id: performance.now(),
        enemyId: enemyToSpawn.id,
        x,
        y,
        hp: enemyToSpawn.hp,
        animationState: "walk",
        frameIndex: 0,
        direction: "down",
      });
    },
    1000
  );

  useEffect(() => {
    const removeInputHandlers = setupInputHandlers(keys);
    const characterData = characters.find((c) => c.id === selectedCharacter.id);
    if (!characterData) return;

    const sheetPaths = new Set<string>();
    sheetPaths.add(characterData.animations.idle.sheet);
    Object.values(characterData.animations.walk).forEach((walkAnim) =>
      sheetPaths.add((walkAnim as any).sheet)
    );

    enemies.forEach((e) => {
      Object.values(e.animations).forEach((anim: any) => {
        if ("sheet" in anim) {
          sheetPaths.add(anim.sheet);
        } else {
          Object.values(anim).forEach((dirAnim: any) =>
            sheetPaths.add(dirAnim.sheet)
          );
        }
      });
    });

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

    offscreenCanvasRef.current = document.createElement("canvas");
    offscreenCanvasRef.current.width = selectedMap.size.width;
    offscreenCanvasRef.current.height = selectedMap.size.height;
    const offCtx = offscreenCanvasRef.current.getContext("2d");
    if (!offCtx) return;

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

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      //Draw player first (so hitbox alignment works)
      drawPlayer(
        ctx,
        playerRef.current,
        camera,
        selectedCharacter.id,
        spriteSheets
      );

      // then draw enemies (so they're behind trees, etc.)
      enemyInstancesRef.current.forEach((enemy) => {
        drawEnemy(ctx, enemy, camera, spriteSheets);
      });

      //Finally draw top-layer visuals like tree crowns
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

      const now = performance.now();

      const playerData = characters.find((c) => c.id === selectedCharacter.id);
      const hitbox = playerData?.hitbox ?? {
        width: 16,
        height: 16,
        offsetX: 8,
        offsetY: 6,
      };

      const playerCenterX =
        playerRef.current.x + hitbox.offsetX + hitbox.width / 2;
      const playerCenterY =
        playerRef.current.y + hitbox.offsetY + hitbox.height / 2;

      const enemiesList = enemyInstancesRef.current;

      //1. Repel enemies from each other BEFORE movement
      for (let i = 0; i < enemiesList.length; i++) {
        const a = enemiesList[i];
        for (let j = i + 1; j < enemiesList.length; j++) {
          const b = enemiesList[j];
          if (a.id === b.id) continue;

          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          const minDist = 24;

          if (dist < minDist && dist > 0) {
            const push = (minDist - dist) / 2;
            const pushX = (dx / dist) * push;
            const pushY = (dy / dist) * push;

            a.x += pushX;
            a.y += pushY;
            b.x -= pushX;
            b.y -= pushY;
          }
        }
      }

      //2. Move each enemy toward player AFTER separation
      enemiesList.forEach((enemy) => {
        const enemyData = enemies.find((e) => e.id === enemy.enemyId);
        if (!enemyData) return;

        const enemyCenterX =
          enemy.x + enemyData.hitbox.offsetX + enemyData.hitbox.width / 2;
        const enemyCenterY =
          enemy.y + enemyData.hitbox.offsetY + enemyData.hitbox.height / 2;

        const dx = playerCenterX - enemyCenterX;
        const dy = playerCenterY - enemyCenterY;
        const distance = Math.hypot(dx, dy);

        let direction: "left" | "right" | "up" | "down" = "down";
        if (Math.abs(dx) > Math.abs(dy)) {
          direction = dx < 0 ? "left" : "right";
        } else {
          direction = dy < 0 ? "up" : "down";
        }

        if (!(enemy as any).lastFrameTime) {
          (enemy as any).lastFrameTime = now;
        }

        if (now - (enemy as any).lastFrameTime > 150) {
          enemy.frameIndex += 1;
          (enemy as any).lastFrameTime = now;
        }

        enemy.direction = direction;

        const minDistance = (hitbox.width + enemyData.hitbox.width) / 2;
        if (distance > minDistance) {
          const angle = Math.atan2(dy, dx);
          const speed = enemyData.movementSpeed;

          enemy.x += Math.cos(angle) * speed;
          enemy.y += Math.sin(angle) * speed;
        }
      });

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
        className="game-canvas background"
      />
      <canvas
        ref={canvasRef}
        width={1280}
        height={720}
        className="game-canvas foreground"
      />
    </>
  );
};
