import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAccountStore } from "@viking/game-store";
import { enemies } from "@viking/enemies";
import { useSpawnLoop } from "../data/spawnLoop";
import { setupInputHandlers } from "../data/handleInput";
import { createInitialPlayer } from "../data/playerRef";
import { startGameLoop } from "../data/startGameLoop";
import { LoadingScreen } from "@viking/loading";
import { DeathScreen } from "@viking/death-screen";
import { loadSpriteSheets } from "../data/loadSpriteSheets";
import { loadBackground } from "../data/loadBackground";
import { useGameTimer } from "../data/useGameTimer";

import "./style.scss";

export const GameCanvas = ({ selectedMap }: { selectedMap: any }) => {
  const selectedCharacter = useAccountStore((s) => s.selectedCharacter());
  const isDead = useAccountStore((s) => s.isDead);
  const isHurtRef = useRef(false);
  const isPlayingHurt = useRef(false);
  const [showDeathScreen, setShowDeathScreen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const backgroundCanvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const collisionObstaclesRef = useRef<any[]>([]);
  const playerRef = useRef(createInitialPlayer());
  const camera = { x: 0, y: 0 };
  const keys = useRef<Record<string, boolean>>({});
  const [spriteSheets, setSpriteSheets] = useState<
    Record<string, HTMLImageElement>
  >({});
  const enemyInstancesRef = useRef<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState("Loading assets...");
  const [progress, setProgress] = useState(0);
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const totalSeconds = 20 * 60;
  const location = useLocation();

  useGameTimer(
    setSecondsElapsed,
    () => {
      setSecondsElapsed(0);
      setShowDeathScreen(false);
    },
    totalSeconds,
    location.pathname
  );

  useSpawnLoop(
    () => playerRef.current,
    (x, y, time) => {
      const c = useAccountStore.getState().selectedCharacter();
      if (!c || c.hp <= 0) return;
      const e = enemies.find((e) => e.id === (time >= 30 ? 2 : 1));
      if (e) {
        enemyInstancesRef.current.push({
          id: performance.now(),
          enemyId: e.id,
          x,
          y,
          hp: e.hp,
          animationState: "walk",
          frameIndex: 0,
          direction: "down",
        });
      }
    },
    1000
  );

  useEffect(() => {
    const remove = setupInputHandlers(keys);
    return () => remove();
  }, []);

  useEffect(() => {
    if (!selectedMap || !selectedCharacter) return;

    const load = async () => {
      setCurrentStep("Loading sprite sheets...");
      const images = await loadSpriteSheets(selectedCharacter);
      setSpriteSheets(images);

      offscreenCanvasRef.current = await loadBackground(
        selectedMap,
        setProgress,
        setCurrentStep
      );

      setProgress(90);
      setCurrentStep("Finalizing...");
      await new Promise((r) => setTimeout(r, 600));
      setProgress(100);
      setCurrentStep("Ready!");
      await new Promise((r) => setTimeout(r, 600));

      setIsLoading(false);
    };

    load();
  }, [selectedCharacter?.id, selectedMap?.id]);

  useEffect(() => {
    if (isLoading) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const bgCanvas = backgroundCanvasRef.current;
    const bgCtx = bgCanvas?.getContext("2d");
    if (!canvas || !ctx || !bgCanvas || !bgCtx) return;

    const removeInput = setupInputHandlers(keys);

    const cleanup = startGameLoop({
      playerRef,
      keys,
      selectedCharacter,
      selectedMap,
      camera,
      canvas,
      ctx,
      bgCtx,
      spriteSheets,
      isHurtRef,
      isPlayingHurt,
      isDead,
      offscreenCanvas: offscreenCanvasRef.current!,
      collisionObstaclesRef,
      enemyInstancesRef,
      setShowDeathScreen,
    });

    return () => {
      cleanup();
      removeInput();
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
