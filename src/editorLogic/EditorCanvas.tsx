import { useEffect, useRef, useState, FC } from "react";
import "../styles/EditorCanvas.css";
import { obstaclesWithCollision } from "../editorLogic/obstacles/ObstaclesWithCollision";
import { obstacleForVisual } from "../editorLogic/obstacles/ObstaclesForVisual";

const TILE_SIZE = 32;

interface PlacedObject {
  id: number;
  x: number;
  y: number;
  asset: string;
  type: "collision" | "visual" | "background";
  offsetX?: number;
  offsetY?: number;
}

interface EditorCanvasProps {
  selectedAsset: string | null;
  setSelectedAsset: (asset: string | null) => void;
  mapData: {
    id: string;
    background: PlacedObject[];
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

    mapData.background.forEach(({ x, y, asset }) => {
      const img = new Image();
      img.src = asset;
      img.onload = () => ctx.drawImage(img, x, y, TILE_SIZE, TILE_SIZE);
    });

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
      [
        ...mapData.background,
        ...mapData.obstaclesWithCollision,
        ...mapData.obstaclesForVisual,
      ].find((obj) => {
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
      }) || null
    );
  };

  const handleLeftClick = (x: number, y: number) => {
    const foundObject = findObjectAtPosition(x, y);

    if (foundObject) {
      setSelectedObject(foundObject);
      return;
    }

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
        type: selectedAsset.includes("background")
          ? "background"
          : obstaclesWithCollision.some((o) => o.sprite === selectedAsset)
          ? "collision"
          : "visual",
      };

      if (placedObject.type === "background") {
        newMapData.background = [...newMapData.background, placedObject];
      } else if (placedObject.type === "collision") {
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

    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const foundObject = findObjectAtPosition(mouseX, mouseY);

    if (foundObject) {
      const obstacle =
        obstaclesWithCollision.find((o) => o.sprite === foundObject.asset) ||
        obstacleForVisual.find((o) => o.sprite === foundObject.asset);

      if (!obstacle) return;

      // Store offset so we grab from center
      const offsetX = mouseX - (foundObject.x + obstacle.width / 2);
      const offsetY = mouseY - (foundObject.y + obstacle.height / 2);

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
    setDraggingObject(null);
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!draggingObject) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Ensure offsetX and offsetY exist before using them
    const newX = mouseX - (draggingObject.offsetX || 0);
    const newY = mouseY - (draggingObject.offsetY || 0);

    setMapData((prev: any) => {
      const newMapData = { ...prev };

      newMapData.background = newMapData.background.map((obj: PlacedObject) =>
        obj.id === draggingObject.id ? { ...obj, x: newX, y: newY } : obj
      );

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
      background: prev.background.filter(
        (obj: PlacedObject) => obj.id !== foundObject.id
      ),
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

      {/* Tooltip for selected object */}
      {selectedObject && (
        <div
          className="tooltip"
          style={{
            position: "absolute",
            left: `${selectedObject.x + 0}px`,
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
          {selectedObject.type === "collision" && <div>hitbox: ✅ Yes</div>}
        </div>
      )}
    </div>
  );
};

export default EditorCanvas;
