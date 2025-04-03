const loadedImages: Record<string, HTMLImageElement> = {};

const loadImage = (src: string): HTMLImageElement => {
  if (loadedImages[src]) return loadedImages[src];
  const img = new Image();
  img.src = src;
  loadedImages[src] = img;
  return img;
};

let hasLogged = false;

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

    // Log only once
    if (!hasLogged && stage === "background") {
      hasLogged = true;
      console.log("PLACED OBJECT:", { x, y });
      console.log(
        "TILES:",
        assetData.tilesWithCollision,
        assetData.tilesWithoutCollision
      );
      console.log("HITBOXES:", assetData.hitbox);
    }

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
          const hitboxX = x + hit.x;
          const hitboxY = y + hit.y;
          const width = hit.width || 16;
          const height = hit.height || 16;

          collisionCollector.push({
            x: hitboxX,
            y: hitboxY,
            width,
            height,
            hitbox: { width, height, offsetX: 0, offsetY: 0 }, // <- important!
          });

          // ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
          // ctx.fillRect(hitboxX - camera.x, hitboxY - camera.y, width, height);
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
