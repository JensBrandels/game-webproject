import { useEffect, useRef, useState, FC } from "react";
import "./style.css";

const TILE_SIZE = 16;

interface Tile {
  x: number;
  y: number;
  asset: string;
}

interface Asset {
  id: string;
  name: string;
  tilesWithCollision: Tile[];
  tilesWithoutCollision: Tile[];
}

interface PlacedObject {
  id: number;
  x: number;
  y: number;
  asset: string;
  zIndex: number;
  offsetX?: number;
  offsetY?: number;
}

interface EditorCanvasProps {
  selectedAsset: string | null;
  assets: Asset[];
  mapData: {
    id: string;
    size: { width: number; height: number };
    placedObjects: PlacedObject[];
  };
  setMapData: (data: any) => void;
}

// Image cache to preload images
const imageCache: Record<string, HTMLImageElement> = {};

export const EditorCanvas: FC<EditorCanvasProps> = ({
  selectedAsset,
  assets,
  mapData,
  setMapData,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [draggingObject, setDraggingObject] = useState<PlacedObject | null>(
    null
  );
  const [selectedObject, setSelectedObject] = useState<PlacedObject | null>(
    null
  );
  const [hoverTile, setHoverTile] = useState<{ x: number; y: number } | null>(
    null
  );
  const [activeZIndex, setActiveZIndex] = useState<number>(0);

  if (!mapData?.placedObjects) {
    return <div>Loading map...</div>;
  }

  const drawGrid = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Get sorted zIndex values (Layer 0 first, then Layer 1, etc.)
    const sortedLayers = [
      ...new Set(mapData.placedObjects.map((o) => o.zIndex)),
    ].sort((a, b) => a - b);

    // Loop through each zIndex layer and draw its corresponding objects
    sortedLayers.forEach((z) => {
      const objectsOnLayer = mapData.placedObjects
        .filter((obj) => obj.zIndex === z)
        .sort((a, b) => a.id - b.id); // Sort objects in the same layer by their ID

      objectsOnLayer.forEach((obj) => {
        const asset = assets.find((a) => a.id === obj.asset);
        if (!asset) return;

        const tiles = [
          ...asset.tilesWithCollision,
          ...asset.tilesWithoutCollision,
        ];
        if (tiles.length === 0) return;

        const minX = Math.min(...tiles.map((t) => t.x));
        const minY = Math.min(...tiles.map((t) => t.y));

        tiles.forEach(({ x, y, asset: tileAsset }) => {
          const img = imageCache[tileAsset];
          if (img && img.complete) {
            ctx.drawImage(
              img,
              obj.x + (x - minX),
              obj.y + (y - minY),
              TILE_SIZE,
              TILE_SIZE
            );
          }
        });
      });
    });

    // Draw hover tile outline
    if (hoverTile && !draggingObject && selectedAsset) {
      ctx.strokeStyle = "lime";
      ctx.lineWidth = 1;
      ctx.strokeRect(hoverTile.x, hoverTile.y, TILE_SIZE, TILE_SIZE);
    }
  };

  useEffect(() => {
    // Preload images for each asset tile
    assets.forEach((asset) => {
      [...asset.tilesWithCollision, ...asset.tilesWithoutCollision].forEach(
        (tile) => {
          if (!imageCache[tile.asset]) {
            const img = new Image();
            img.src = tile.asset;
            imageCache[tile.asset] = img;
          }
        }
      );
    });

    drawGrid(); // Draw the grid after the images have been preloaded
  }, [assets, mapData]); // Trigger redraw when assets or mapData change

  const handleLeftClick = (x: number, y: number) => {
    const snappedX = Math.floor(x / TILE_SIZE) * TILE_SIZE;
    const snappedY = Math.floor(y / TILE_SIZE) * TILE_SIZE;

    const foundObject = findObjectAtPosition(snappedX, snappedY);
    if (foundObject) {
      setSelectedObject(foundObject);
      return;
    }

    if (!selectedAsset) return;

    const placedObject: PlacedObject = {
      id: performance.now(),
      x: snappedX,
      y: snappedY,
      asset: selectedAsset,
      zIndex: activeZIndex,
    };

    setMapData((prev: any) => {
      const updated = {
        ...prev,
        placedObjects: [...prev.placedObjects, placedObject],
      };

      console.log("Updated mapData after placement:", updated);
      return updated;
    });
  };

  const findObjectAtPosition = (x: number, y: number): PlacedObject | null => {
    const sorted = [...mapData.placedObjects].sort(
      (a, b) => b.zIndex - a.zIndex
    );

    return (
      sorted.find((obj) => {
        const asset = assets.find((a) => a.id === obj.asset);
        if (!asset) return false;

        const tiles = [
          ...asset.tilesWithCollision,
          ...asset.tilesWithoutCollision,
        ];
        if (tiles.length === 0) return false;

        const minX = Math.min(...tiles.map((t) => t.x));
        const minY = Math.min(...tiles.map((t) => t.y));
        const maxX = Math.max(...tiles.map((t) => t.x));
        const maxY = Math.max(...tiles.map((t) => t.y));

        const width = maxX - minX + TILE_SIZE;
        const height = maxY - minY + TILE_SIZE;

        return (
          x >= obj.x && x < obj.x + width && y >= obj.y && y < obj.y + height
        );
      }) || null
    );
  };

  const handleMouseDown = (event: React.MouseEvent) => {
    if (event.button === 2) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const snappedX = Math.floor(mouseX / TILE_SIZE) * TILE_SIZE;
    const snappedY = Math.floor(mouseY / TILE_SIZE) * TILE_SIZE;

    const foundObject = findObjectAtPosition(snappedX, snappedY);

    if (foundObject) {
      const offsetX = mouseX - foundObject.x;
      const offsetY = mouseY - foundObject.y;
      setDraggingObject({ ...foundObject, offsetX, offsetY });
      setSelectedObject(foundObject);
    } else {
      if (selectedAsset) {
        handleLeftClick(mouseX, mouseY);
      } else {
        setSelectedObject(null);
      }
    }
  };

  const handleMouseUp = () => {
    if (draggingObject) {
      const placed = mapData.placedObjects.find(
        (obj) => obj.id === draggingObject.id
      );
      if (placed) {
        console.log("Updated position in mapData:", placed);
      }
    }

    setDraggingObject(null);
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const hoverX = Math.floor(mouseX / TILE_SIZE) * TILE_SIZE;
    const hoverY = Math.floor(mouseY / TILE_SIZE) * TILE_SIZE;
    setHoverTile({ x: hoverX, y: hoverY });

    if (!draggingObject) return;

    const newX =
      Math.floor((mouseX - (draggingObject.offsetX || 0)) / TILE_SIZE) *
      TILE_SIZE;
    const newY =
      Math.floor((mouseY - (draggingObject.offsetY || 0)) / TILE_SIZE) *
      TILE_SIZE;

    setMapData((prev: any) => {
      const updated = {
        ...prev,
        placedObjects: prev.placedObjects.map((obj: PlacedObject) =>
          obj.id === draggingObject.id ? { ...obj, x: newX, y: newY } : obj
        ),
      };
      return updated;
    });
  };

  const handleRightClick = (event: React.MouseEvent) => {
    event.preventDefault();

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const snappedX = Math.floor(x / TILE_SIZE) * TILE_SIZE;
    const snappedY = Math.floor(y / TILE_SIZE) * TILE_SIZE;

    const foundObject = findObjectAtPosition(snappedX, snappedY);
    if (!foundObject) return;

    setMapData((prev: any) => ({
      ...prev,
      placedObjects: prev.placedObjects.filter(
        (obj: PlacedObject) => obj.id !== foundObject.id
      ),
    }));

    setSelectedObject(null);
  };

  return (
    <div className="editor-container">
      <div style={{ marginBottom: "8px" }}>
        <label>
          <select
            value={activeZIndex}
            onChange={(e) => setActiveZIndex(Number(e.target.value))}
          >
            <option value={0}>Layer 0 (Background)</option>
            <option value={1}>Layer 1 (Collision)</option>
          </select>
        </label>
      </div>

      <canvas
        ref={canvasRef}
        width={mapData.size.width}
        height={mapData.size.height}
        className="editor-canvas"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onContextMenu={handleRightClick}
      />

      {selectedObject && (
        <div
          className="tooltip"
          style={{
            position: "absolute",
            left: `${selectedObject.x}px`,
            top: `${selectedObject.y - 60}px`,
            background: "rgba(0,0,0,0.7)",
            color: "white",
            padding: "5px",
            borderRadius: "5px",
            fontSize: "12px",
            pointerEvents: "none",
          }}
        >
          <div>x: {selectedObject.x}</div>
          <div>y: {selectedObject.y}</div>
          <div>layer: Layer {selectedObject.zIndex}</div>
        </div>
      )}
    </div>
  );
};
