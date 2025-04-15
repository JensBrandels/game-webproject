const loadedImages: Record<string, HTMLImageElement> = {};

const loadImage = (src: string): Promise<HTMLImageElement> => {
  if (loadedImages[src]) {
    return Promise.resolve(loadedImages[src]);
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      loadedImages[src] = img;
      resolve(img);
    };
  });
};

export const drawPlacedObjects = async (
  ctx: CanvasRenderingContext2D,
  placedObjects: any[],
  camera: { x: number; y: number },
  stage: "background" | "collision" | "visual",
  collisionCollector?: any[]
) => {
  const zIndex = 1;

  for (const obj of placedObjects) {
    const { x, y, assetData } = obj;
    if (!assetData) continue;

    if (obj.zIndex === 0 && stage === "background") {
      const tiles = [
        ...assetData.tilesWithCollision,
        ...assetData.tilesWithoutCollision,
      ];
      for (const tile of tiles) {
        const img = await loadImage(tile.asset);
        ctx.drawImage(
          img,
          x + tile.x - camera.x,
          y + tile.y - camera.y,
          16,
          16
        );
      }
    }

    if (obj.zIndex === zIndex && stage === "collision") {
      // Only draw visuals when not collecting hitboxes
      if (!collisionCollector) {
        for (const tile of assetData.tilesWithCollision) {
          const img = await loadImage(tile.asset);
          ctx.drawImage(
            img,
            x + tile.x - camera.x,
            y + tile.y - camera.y,
            16,
            16
          );
        }
      }

      // Collect hitboxes if provided
      if (collisionCollector) {
        assetData.hitbox.forEach((hit: any) => {
          const hitboxX = x + hit.x;
          const hitboxY = y + hit.y;
          const width = hit.width || 16;
          const height = hit.height || 16;

          collisionCollector.push({
            x: hitboxX,
            y: hitboxY,
            width,
            height,
            hitbox: { width, height, offsetX: 0, offsetY: 0 },
          });
        });
      }
    }

    if (obj.zIndex === zIndex && stage === "visual") {
      for (const tile of assetData.tilesWithoutCollision) {
        const img = await loadImage(tile.asset);
        ctx.drawImage(
          img,
          x + tile.x - camera.x,
          y + tile.y - camera.y,
          16,
          16
        );
      }
    }
  }
};
