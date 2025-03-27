const loadedImages: Record<string, HTMLImageElement> = {};

const loadImage = (src: string): HTMLImageElement => {
  if (loadedImages[src]) return loadedImages[src];
  const img = new Image();
  img.src = src;
  loadedImages[src] = img;
  return img;
};

export const drawPlacedObjects = (
  ctx: CanvasRenderingContext2D,
  placedObjects: any[],
  camera: { x: number; y: number },
  stage: "background" | "collision" | "visual",
  collisionCollector?: any[]
) => {
  const zIndex = 1;

  placedObjects.forEach((obj: any) => {
    const { x, y, assetData } = obj;
    if (!assetData) return;

    if (obj.zIndex === 0 && stage === "background") {
      [
        ...assetData.tilesWithCollision,
        ...assetData.tilesWithoutCollision,
      ].forEach((tile: any) => {
        const img = loadImage(tile.asset);
        ctx.drawImage(
          img,
          x + tile.x - camera.x,
          y + tile.y - camera.y,
          16,
          16
        );
      });
    }

    if (obj.zIndex === zIndex && stage === "collision") {
      assetData.tilesWithCollision.forEach((tile: any) => {
        const img = loadImage(tile.asset);
        ctx.drawImage(
          img,
          x + tile.x - camera.x,
          y + tile.y - camera.y,
          16,
          16
        );
      });

      if (collisionCollector) {
        assetData.hitbox.forEach((hit: any) => {
          collisionCollector.push({
            x: x + hit.x,
            y: y + hit.y,
            width: 16,
            height: 16,
          });
        });
      }
    }

    if (obj.zIndex === zIndex && stage === "visual") {
      assetData.tilesWithoutCollision.forEach((tile: any) => {
        const img = loadImage(tile.asset);
        ctx.drawImage(
          img,
          x + tile.x - camera.x,
          y + tile.y - camera.y,
          16,
          16
        );
      });
    }
  });
};
