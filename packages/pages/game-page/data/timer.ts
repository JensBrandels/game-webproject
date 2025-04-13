import { useEffect, useState } from "react";

export const useCountdown = (limitInMinutes: number) => {
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const totalSeconds = limitInMinutes * 60;

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsElapsed((prev) => {
        if (prev >= totalSeconds) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [totalSeconds]);

  const minutes = Math.floor(secondsElapsed / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (secondsElapsed % 60).toString().padStart(2, "0");

  return { formatted: `${minutes}:${seconds}`, raw: secondsElapsed };
};
