import { useEffect, useRef } from "react";

export const useSpawnLoop = (
  getPlayerPos: () => { x: number; y: number },
  spawnCallback: (x: number, y: number, currentTimeSec: number) => void,
  intervalMs: number = 100
) => {
  const lastTime = useRef(performance.now());
  const gameStart = useRef(performance.now());

  useEffect(() => {
    let animationFrameId: number;

    const loop = () => {
      const now = performance.now();
      const elapsedSec = Math.floor((now - gameStart.current) / 1000);

      if (now - lastTime.current >= intervalMs) {
        const { x, y } = getPlayerPos();
        const angle = Math.random() * Math.PI * 2;
        const distance = 150 + Math.random() * 150;

        const spawnX = x + Math.cos(angle) * distance;
        const spawnY = y + Math.sin(angle) * distance;

        spawnCallback(spawnX, spawnY, elapsedSec);
        lastTime.current = now;
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);
};
