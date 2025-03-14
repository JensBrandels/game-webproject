import { MapType } from "../Maps";

export const drawBackground = (
  ctx: CanvasRenderingContext2D,
  backgroundImage: HTMLImageElement,
  selectedMap: MapType,
  camera: { x: number; y: number }
) => {
  if (!ctx) return;

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  if (backgroundImage.complete && backgroundImage.naturalWidth > 0) {
    for (let x = 0; x < selectedMap.size.width; x += backgroundImage.width) {
      for (
        let y = 0;
        y < selectedMap.size.height;
        y += backgroundImage.height
      ) {
        ctx.drawImage(backgroundImage, x - camera.x, y - camera.y);
      }
    }
  } else {
    ctx.fillStyle = "green";
    ctx.fillRect(
      0 - camera.x,
      0 - camera.y,
      selectedMap.size.width,
      selectedMap.size.height
    );
  }
};
