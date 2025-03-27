export const drawBackground = (
  ctx: CanvasRenderingContext2D,
  selectedMap: any,
  camera: { x: number; y: number }
) => {
  if (!ctx || !selectedMap.placedObjects) return;

  const backgroundTiles = selectedMap.placedObjects.filter(
    (obj: any) => obj.zindex === 0
  );

  backgroundTiles.forEach((tile: any) => {
    if (!tile.sprite) return;
    const image = new Image();
    image.src = tile.sprite;
    image.onload = () => {
      ctx.drawImage(image, tile.x - camera.x, tile.y - camera.y, 16, 16);
    };
  });
};
