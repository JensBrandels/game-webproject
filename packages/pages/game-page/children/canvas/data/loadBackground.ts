import { drawPlacedObjects } from "./drawPlacedObjects";

export async function loadBackground(
  selectedMap: any,
  setProgress: (val: number) => void,
  setCurrentStep: (val: string) => void
): Promise<HTMLCanvasElement> {
  const offCanvas = document.createElement("canvas");
  offCanvas.width = selectedMap.size.width;
  offCanvas.height = selectedMap.size.height;
  const offCtx = offCanvas.getContext("2d");
  if (!offCtx) throw new Error("Failed to get context for background canvas");

  setCurrentStep("Drawing background...");
  setProgress(80);

  await drawPlacedObjects(
    offCtx,
    selectedMap.placedObjects,
    { x: 0, y: 0 },
    "background"
  );

  return offCanvas;
}
