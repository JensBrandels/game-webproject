import { useState } from "react";
import "../styles/AssetBuilder.css";
import generateId from "../utils/GenerateId";

const GRID_WIDTH = 6;
const GRID_HEIGHT = 7;
const TILE_SIZE = 16;

interface AssetBuilderProps {
  selectedAsset: string | null;
}

interface HitboxTile {
  row: number;
  col: number;
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
}

const AssetBuilder = ({ selectedAsset }: AssetBuilderProps) => {
  const [grid, setGrid] = useState<(string | null)[][]>(
    Array.from({ length: GRID_HEIGHT }, () => Array(GRID_WIDTH).fill(null))
  );
  const [rowTypes, setRowTypes] = useState<string[]>(
    Array(GRID_HEIGHT).fill("non-collision")
  );
  const [assetName, setAssetName] = useState("");
  const [hitboxMode, setHitboxMode] = useState(false);
  const [hitboxTiles, setHitboxTiles] = useState<HitboxTile[]>([]);
  const [selectedHitbox, setSelectedHitbox] = useState<HitboxTile | null>(null);
  const [anchorX, setAnchorX] = useState<"left" | "right">("left");
  const [anchorY, setAnchorY] = useState<"top" | "bottom">("top");

  const handleTileClick = (row: number, col: number) => {
    if (hitboxMode) {
      toggleHitboxAt(row, col);
      return;
    }

    if (!selectedAsset) return;

    setGrid((prev) => {
      const updated = [...prev];
      updated[row] = [...updated[row]];
      updated[row][col] = selectedAsset;
      return updated;
    });
  };

  const toggleHitboxAt = (row: number, col: number) => {
    setHitboxTiles((prev) => {
      const exists = prev.find((t) => t.row === row && t.col === col);
      if (exists) {
        setSelectedHitbox(null);
        return prev.filter((t) => !(t.row === row && t.col === col));
      } else {
        const newTile = {
          row,
          col,
          offsetX: 0,
          offsetY: 0,
          width: TILE_SIZE,
          height: TILE_SIZE,
        };
        setSelectedHitbox(newTile);
        return [...prev, newTile];
      }
    });
  };

  const handleRowTypeChange = (row: number, type: string) => {
    setRowTypes((prev) => {
      const updated = [...prev];
      updated[row] = type;
      return updated;
    });
  };

  const updateHitbox = (
    row: number,
    col: number,
    field: keyof HitboxTile,
    value: number
  ) => {
    setHitboxTiles((prev) =>
      prev.map((t) => {
        if (t.row !== row || t.col !== col) return t;

        let updated = { ...t };

        if (field === "width" && anchorX === "right") {
          const delta = t.width - value;
          updated.width = value;
          updated.offsetX = t.offsetX + delta;
        } else if (field === "height" && anchorY === "bottom") {
          const delta = t.height - value;
          updated.height = value;
          updated.offsetY = t.offsetY + delta;
        } else {
          updated[field] = value;
        }

        return updated;
      })
    );

    setSelectedHitbox((prev) => {
      if (!prev || prev.row !== row || prev.col !== col) return prev;

      let updated = { ...prev };

      if (field === "width" && anchorX === "right") {
        const delta = prev.width - value;
        updated.width = value;
        updated.offsetX = prev.offsetX + delta;
      } else if (field === "height" && anchorY === "bottom") {
        const delta = prev.height - value;
        updated.height = value;
        updated.offsetY = prev.offsetY + delta;
      } else {
        updated[field] = value;
      }

      return updated;
    });
  };

  const handleSave = async () => {
    const tilesWithCollision: any[] = [];
    const tilesWithoutCollision: any[] = [];

    grid.forEach((row, rowIndex) => {
      row.forEach((tile, colIndex) => {
        if (!tile) return;

        const tileData = {
          x: colIndex * TILE_SIZE,
          y: rowIndex * TILE_SIZE,
          asset: tile,
        };

        if (rowTypes[rowIndex] === "collision") {
          tilesWithCollision.push(tileData);
        } else {
          tilesWithoutCollision.push(tileData);
        }
      });
    });

    const hitbox = hitboxTiles.map(
      ({ row, col, width, height, offsetX, offsetY }) => ({
        x: col * TILE_SIZE + offsetX,
        y: row * TILE_SIZE + offsetY,
        width,
        height,
      })
    );

    const result = {
      id: generateId(),
      name: assetName || "UnnamedAsset",
      tilesWithCollision,
      tilesWithoutCollision,
      hitbox,
    };

    console.log("Built Asset:", result);

    try {
      const response = await fetch(import.meta.env.VITE_ASSET_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to save asset: ${errorText}`);
      }

      alert("Asset saved to database!");

      setGrid(
        Array.from({ length: GRID_HEIGHT }, () => Array(GRID_WIDTH).fill(null))
      );
      setRowTypes(Array(GRID_HEIGHT).fill("non-collision"));
      setAssetName("");
      setHitboxTiles([]);
      setHitboxMode(false);
    } catch (err) {
      console.error("Error saving asset:", err);
      alert("Failed to save asset. Check console for details.");
    }
  };

  return (
    <div className="asset-builder-container">
      <div style={{ marginBottom: "10px" }}>
        <input
          type="text"
          value={assetName}
          onChange={(e) => setAssetName(e.target.value)}
          placeholder="Enter asset name"
          className="asset-name-input"
        />

        <button
          className={`asset-hitbox-toggle ${hitboxMode ? "active" : ""}`}
          onClick={() => setHitboxMode((prev) => !prev)}
        >
          {hitboxMode ? "Disable Hitbox Mode" : "Enable Hitbox Mode"}
        </button>

        <button className="asset-save-button" onClick={handleSave}>
          Save Asset
        </button>
      </div>

      <div style={{ display: "flex", gap: "20px" }}>
        {/* Zoom wrapper */}
        <div className="asset-builder-zoom">
          <div className="asset-builder-grid">
            {grid.map((row, rowIndex) => (
              <div className="asset-builder-row" key={rowIndex}>
                <select
                  value={rowTypes[rowIndex]}
                  onChange={(e) =>
                    handleRowTypeChange(rowIndex, e.target.value)
                  }
                  className="asset-row-select"
                >
                  <option value="non-collision">Non-Collision</option>
                  <option value="collision">Collision</option>
                </select>

                {row.map((tile, colIndex) => {
                  const hitbox = hitboxTiles.find(
                    (t) => t.row === rowIndex && t.col === colIndex
                  );
                  const isHitbox = !!hitbox;

                  return (
                    <div key={colIndex} style={{ position: "relative" }}>
                      <div
                        className={`asset-tile ${
                          isHitbox ? "hitbox-tile" : ""
                        }`}
                        style={{
                          backgroundImage: tile ? `url(${tile})` : "none",
                        }}
                        onClick={() => handleTileClick(rowIndex, colIndex)}
                      />
                      {hitbox && (
                        <div
                          className="hitbox-visual"
                          style={{
                            position: "absolute",
                            top: `${hitbox.offsetY}px`,
                            left: `${hitbox.offsetX}px`,
                            width: `${hitbox.width}px`,
                            height: `${hitbox.height}px`,
                            border: "1px solid red",
                            backgroundColor: "rgba(255, 0, 0, 0.1)",
                            boxSizing: "border-box",
                            pointerEvents: "none",
                            zIndex: 2,
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Hitbox editor panel */}
        {selectedHitbox && (
          <div className="hitbox-editor-panel">
            <h4>Hitbox Editor</h4>

            <label>
              Expand From (X):
              <select
                value={anchorX}
                onChange={(e) => setAnchorX(e.target.value as "left" | "right")}
              >
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
            </label>

            <label>
              Expand From (Y):
              <select
                value={anchorY}
                onChange={(e) => setAnchorY(e.target.value as "top" | "bottom")}
              >
                <option value="top">Top</option>
                <option value="bottom">Bottom</option>
              </select>
            </label>

            <p>
              Tile: ({selectedHitbox.row}, {selectedHitbox.col})
            </p>

            <label>
              W:
              <input
                type="number"
                value={selectedHitbox.width}
                min={1}
                max={32}
                onChange={(e) =>
                  updateHitbox(
                    selectedHitbox.row,
                    selectedHitbox.col,
                    "width",
                    Number(e.target.value)
                  )
                }
              />
            </label>
            <label>
              H:
              <input
                type="number"
                value={selectedHitbox.height}
                min={1}
                max={32}
                onChange={(e) =>
                  updateHitbox(
                    selectedHitbox.row,
                    selectedHitbox.col,
                    "height",
                    Number(e.target.value)
                  )
                }
              />
            </label>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetBuilder;
