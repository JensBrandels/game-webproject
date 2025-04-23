import { useEffect, useRef, useState } from "react";
import { drawPlayer } from "../data/drawPlayer";
import { updatePlayer } from "../data/updatePlayer";
import { setupInputHandlers } from "../data/handleInput";
import { drawPlacedObjects } from "../data/drawPlacedObjects";
import { enemies } from "@viking/enemies";
import { useSpawnLoop } from "../data/spawnLoop";
import { drawEnemy } from "../data/drawEnemies";
import { LoadingScreen } from "@viking/loading";
import { useAccountStore } from "@viking/game-store";
import { handleDamage } from "../data/handleDamage";
import { DeathScreen } from "@viking/death-screen";

import { useLocation } from "react-router-dom";

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

export const GameCanvas = ({ selectedMap }: { selectedMap: any }) => {
  const selectedCharacter = useAccountStore((s) => s.selectedCharacter());
  const isDead = useAccountStore((s) => s.isDead);
  const isHurtRef = useRef(false);
  const [showDeathScreen, setShowDeathScreen] = useState(false);
  if (!selectedCharacter) return null;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const backgroundCanvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const collisionObstaclesRef = useRef<any[]>([]);
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

  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState("Loading assets...");
  const [progress, setProgress] = useState(0);

  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const totalSeconds = 20 * 60;

  const location = useLocation();

  // TIMER EFFECT
  useEffect(() => {
    setSecondsElapsed(0); //reset timer
    setShowDeathScreen(false); //reset deathscreen

    const interval = setInterval(() => {
      const character = useAccountStore.getState().selectedCharacter();
      if (!character || character.hp <= 0) return;

      setSecondsElapsed((prev) => {
        if (prev >= totalSeconds) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [location.pathname]);

  useSpawnLoop(
    () => playerRef.current,
    (x, y, currentTimeSec) => {
      const character = useAccountStore.getState().selectedCharacter();
      if (!character || character.hp <= 0) return;

      let enemyToSpawn = enemies.find((e) => e.id === 1);
      if (currentTimeSec >= 30) {
        enemyToSpawn = enemies.find((e) => e.id === 2);
      }
      if (!enemyToSpawn) return;

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
    const characterData = selectedCharacter;

    const sheetPaths = new Set<string>();
    sheetPaths.add(characterData.animations.idle.sheet);
    Object.values(characterData.animations.walk).forEach((walkAnim) =>
      sheetPaths.add((walkAnim as any).sheet)
    );
    if (characterData.animations.hurt?.sheet) {
      sheetPaths.add(characterData.animations.hurt.sheet);
    }
    if (characterData.animations.death?.sheet) {
      sheetPaths.add(characterData.animations.death.sheet);
    }

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
        images[path.replace(/^\/+/g, "")] = img;
        loadedCount++;
        if (loadedCount === sheetPaths.size) {
          setSpriteSheets(images);
        }
      };
    });

    return () => removeInputHandlers();
  }, [selectedCharacter.id]);

  useEffect(() => {
    if (!selectedMap || !selectedCharacter) return;

    const loadAll = async () => {
      const characterData = selectedCharacter;

      const sheetPaths = new Set<string>();
      sheetPaths.add(characterData.animations.idle.sheet);
      Object.values(characterData.animations.walk).forEach((walkAnim) =>
        sheetPaths.add((walkAnim as any).sheet)
      );
      if (characterData.animations.hurt?.sheet) {
        sheetPaths.add(characterData.animations.hurt.sheet);
      }
      if (characterData.animations.death?.sheet) {
        sheetPaths.add(characterData.animations.death.sheet);
      }

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

      setCurrentStep("Loading sprite sheets...");
      for (const path of sheetPaths) {
        await new Promise<void>((resolve) => {
          const img = new Image();
          img.src = path;
          img.onload = () => {
            images[path.replace(/^\/+/g, "")] = img;
            loadedCount++;
            setProgress(Math.floor((loadedCount / sheetPaths.size) * 40));
            resolve();
          };
        });
      }
      setSpriteSheets(images);

      const offCanvas = document.createElement("canvas");
      offCanvas.width = selectedMap.size.width;
      offCanvas.height = selectedMap.size.height;
      const offCtx = offCanvas.getContext("2d");
      if (!offCtx) return;

      setCurrentStep("Drawing background...");
      setProgress(80);
      await drawPlacedObjects(
        offCtx,
        selectedMap.placedObjects,
        { x: 0, y: 0 },
        "background"
      );

      offscreenCanvasRef.current = offCanvas;

      setProgress(90);
      setCurrentStep("Finalizing...");
      await new Promise((r) => setTimeout(r, 600));
      setProgress(100);
      setCurrentStep("Ready!");
      await new Promise((r) => setTimeout(r, 600));

      setIsLoading(false);
    };

    loadAll();
  }, [selectedCharacter.id, selectedMap.id]);

  useEffect(() => {
    if (isLoading) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const backgroundCanvas = backgroundCanvasRef.current;
    const bgCtx = backgroundCanvas?.getContext("2d");
    if (!canvas || !ctx || !backgroundCanvas || !bgCtx) return;

    const removeInputHandlers = setupInputHandlers(keys);
    let animationFrameId: number;

    const draw = async () => {
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

      await drawPlacedObjects(
        ctx,
        selectedMap.placedObjects,
        camera,
        "collision"
      );
      collisionObstaclesRef.current = [];
      await drawPlacedObjects(
        ctx,
        selectedMap.placedObjects,
        camera,
        "collision",
        collisionObstaclesRef.current
      );

      const finished = drawPlayer(
        ctx,
        playerRef.current,
        camera,
        selectedCharacter.id,
        spriteSheets,
        isHurtRef.current,
        isDead
      );

      if (selectedCharacter && selectedCharacter.hp <= 0 && finished) {
        setShowDeathScreen(true);
      }

      enemyInstancesRef.current.forEach((enemy) => {
        drawEnemy(ctx, enemy, camera, spriteSheets);
      });

      await drawPlacedObjects(ctx, selectedMap.placedObjects, camera, "visual");
    };

    const gameLoop = async () => {
      isHurtRef.current = useAccountStore.getState().isHurt;

      if (!useAccountStore.getState().isDead) {
        updatePlayer(
          playerRef.current,
          keys,
          selectedCharacter.id,
          {
            ...selectedMap,
            obstaclesWithCollision: collisionObstaclesRef.current,
          },
          camera,
          canvas,
          ctx!
        );

        const playerData = selectedCharacter;
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

        for (let i = 0; i < enemiesList.length; i++) {
          const a = enemiesList[i];
          for (let j = i + 1; j < enemiesList.length; j++) {
            const b = enemiesList[j];
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
            (enemy as any).lastFrameTime = performance.now();
          }

          if (performance.now() - (enemy as any).lastFrameTime > 150) {
            enemy.frameIndex += 1;
            (enemy as any).lastFrameTime = performance.now();
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

        handleDamage(
          enemyInstancesRef.current,
          playerRef.current.x,
          playerRef.current.y,
          false
        );
      }

      await draw();
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => {
      cancelAnimationFrame(animationFrameId);
      removeInputHandlers();
    };
  }, [isLoading, isDead]);

  const minutes = String(Math.floor(secondsElapsed / 60)).padStart(2, "0");
  const seconds = String(secondsElapsed % 60).padStart(2, "0");

  return isLoading ? (
    <LoadingScreen currentStep={currentStep} progress={progress} />
  ) : (
    <>
      <div className="game-timer">
        {minutes}:{seconds}
      </div>
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
      {showDeathScreen && <DeathScreen />}
    </>
  );
};
