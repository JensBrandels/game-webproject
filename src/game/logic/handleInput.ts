import { RefObject } from "react";

export const setupInputHandlers = (
  keys: RefObject<Record<string, boolean>>
) => {
  const handleKeyDown = (e: KeyboardEvent) => (keys.current[e.key] = true);
  const handleKeyUp = (e: KeyboardEvent) => (keys.current[e.key] = false);

  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);

  return () => {
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("keyup", handleKeyUp);
  };
};
