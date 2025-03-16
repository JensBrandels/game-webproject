import { useEffect, useRef, useState, FC } from "react";
import "../styles/EditorCanvas.css";
import { obstaclesWithCollision } from "../editorLogic/obstacles/ObstaclesWithCollision";
import { obstacleForVisual } from "../editorLogic/obstacles/ObstaclesForVisual";

const GRID_SIZE = 25;
const TILE_SIZE = 32;

interface PlacedObject {
  id: number;
  x: number;
  y: number;
  asset: string;
  type: "collision" | "visual";
}

interface EditorCanvasProps {
  selectedAsset: string | null;
  setSelectedAsset: (asset: string | null) => void;
  mapData: {
    id: string;
    background: string;
    size: { width: number; height: number };
    obstaclesWithCollision: PlacedObject[];
    obstaclesForVisual: PlacedObject[];
  };
  setMapData: (data: any) => void;
}

const EditorCanvas: FC<EditorCanvasProps> = ({
  selectedAsset,
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

  const drawGrid = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#444";
    ctx.lineWidth = 1;

    for (let x = 0; x <= GRID_SIZE; x++) {
      ctx.beginPath();
      ctx.moveTo(x * TILE_SIZE, 0);
      ctx.lineTo(x * TILE_SIZE, GRID_SIZE * TILE_SIZE);
      ctx.stroke();
    }

    for (let y = 0; y <= GRID_SIZE; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * TILE_SIZE);
      ctx.lineTo(GRID_SIZE * TILE_SIZE, y * TILE_SIZE);
      ctx.stroke();
    }

    [...mapData.obstaclesWithCollision, ...mapData.obstaclesForVisual].forEach(
      ({ x, y, asset, id }) => {
        const obstacle =
          obstaclesWithCollision.find((o) => o.sprite === asset) ||
          obstacleForVisual.find((o) => o.sprite === asset);
        if (!obstacle) return;

        const img = new Image();
        img.src = obstacle.sprite ?? "";
        img.onload = () => {
          ctx.drawImage(img, x, y, obstacle.width, obstacle.height);
          if (selectedObject && selectedObject.id === id) {
            ctx.strokeStyle = "red";
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, obstacle.width, obstacle.height);
          }
        };
      }
    );
  };

  useEffect(() => {
    drawGrid();
  }, [mapData, selectedObject]);

  const findObjectAtPosition = (x: number, y: number) => {
    return (
      [...mapData.obstaclesWithCollision, ...mapData.obstaclesForVisual].find(
        (obj) => {
          const obstacle =
            obstaclesWithCollision.find((o) => o.sprite === obj.asset) ||
            obstacleForVisual.find((o) => o.sprite === obj.asset);

          if (!obstacle) return false;

          return (
            x >= obj.x &&
            x <= obj.x + obstacle.width &&
            y >= obj.y &&
            y <= obj.y + obstacle.height
          );
        }
      ) || null
    );
  };

  const handleLeftClick = (x: number, y: number) => {
    if (!selectedAsset) return;

    const obstacle =
      obstaclesWithCollision.find((o) => o.sprite === selectedAsset) ||
      obstacleForVisual.find((o) => o.sprite === selectedAsset);

    if (!obstacle) return;

    setMapData((prev: any) => {
      const newMapData = { ...prev };

      const placedObject: PlacedObject = {
        id: Date.now(),
        x,
        y,
        asset: obstacle.sprite ?? "",
        type: obstaclesWithCollision.some((o) => o.sprite === selectedAsset)
          ? "collision"
          : "visual",
      };

      if (placedObject.type === "collision") {
        newMapData.obstaclesWithCollision = [
          ...newMapData.obstaclesWithCollision,
          placedObject,
        ];
      } else {
        newMapData.obstaclesForVisual = [
          ...newMapData.obstaclesForVisual,
          placedObject,
        ];
      }

      return newMapData;
    });
  };

  const handleMouseDown = (event: React.MouseEvent) => {
    if (event.button === 2) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const foundObject = findObjectAtPosition(x, y);

    if (foundObject) {
      setDraggingObject(foundObject);
      setSelectedObject(foundObject);
    } else {
      if (selectedAsset) {
        handleLeftClick(x, y);
      } else {
        setSelectedObject(null);
      }
    }
  };

  const handleMouseUp = () => {
    setDraggingObject(null);
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!draggingObject) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const newX = event.clientX - rect.left;
    const newY = event.clientY - rect.top;

    setMapData((prev: any) => {
      const newMapData = { ...prev };
      newMapData.obstaclesWithCollision = newMapData.obstaclesWithCollision.map(
        (obj: PlacedObject) =>
          obj.id === draggingObject.id ? { ...obj, x: newX, y: newY } : obj
      );
      newMapData.obstaclesForVisual = newMapData.obstaclesForVisual.map(
        (obj: PlacedObject) =>
          obj.id === draggingObject.id ? { ...obj, x: newX, y: newY } : obj
      );
      return newMapData;
    });
  };

  const handleRightClick = (event: React.MouseEvent) => {
    event.preventDefault();

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const foundObject = findObjectAtPosition(x, y);
    if (!foundObject) return;

    setMapData((prev: any) => ({
      ...prev,
      obstaclesWithCollision: prev.obstaclesWithCollision.filter(
        (obj: PlacedObject) => obj.id !== foundObject.id
      ),
      obstaclesForVisual: prev.obstaclesForVisual.filter(
        (obj: PlacedObject) => obj.id !== foundObject.id
      ),
    }));

    setSelectedObject(null);
  };

  return (
    <div className="editor-container">
      {/* <button onClick={() => setSelectedAsset(null)}>Deselect Asset</button> */}
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
    </div>
  );
};

export default EditorCanvas;
