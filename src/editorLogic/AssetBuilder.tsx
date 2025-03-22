import { useState } from "react";
import "../styles/AssetBuilder.css";

import generateId from "../utils/GenerateId";

const GRID_WIDTH = 6;
const GRID_HEIGHT = 7;
const TILE_SIZE = 16;

interface AssetBuilderProps {
  selectedAsset: string | null;
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
  const [hitboxTiles, setHitboxTiles] = useState<
    { row: number; col: number }[]
  >([]);

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
      const exists = prev.some((t) => t.row === row && t.col === col);
      if (exists) {
        return prev.filter((t) => !(t.row === row && t.col === col));
      } else {
        return [...prev, { row, col }];
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

  const handleSave = () => {
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

    const hitbox = hitboxTiles.map(({ row, col }) => ({
      x: col * TILE_SIZE,
      y: row * TILE_SIZE,
    }));

    const result = {
      id: generateId(),
      name: assetName || "UnnamedAsset",
      tilesWithCollision,
      tilesWithoutCollision,
      hitbox,
    };

    console.log("Built Asset:", result);
    alert("Asset saved! Check the console output.");
  };

  return (
    <div className="asset-builder-container">
      <h3>Asset Builder</h3>
      <input
        type="text"
        placeholder="Enter asset name"
        value={assetName}
        onChange={(e) => setAssetName(e.target.value)}
        className="asset-name-input"
      />

      <button
        onClick={() => setHitboxMode((prev) => !prev)}
        className={`asset-hitbox-toggle ${hitboxMode ? "active" : ""}`}
      >
        {hitboxMode ? "Hitbox Mode: ON" : "Set Hitbox Tiles"}
      </button>

      <div className="asset-builder-grid">
        {grid.map((row, rowIndex) => (
          <div key={rowIndex} className="asset-builder-row">
            <select
              value={rowTypes[rowIndex]}
              onChange={(e) => handleRowTypeChange(rowIndex, e.target.value)}
              className="asset-row-select"
            >
              <option value="non-collision">Non-Collision</option>
              <option value="collision">Collision</option>
            </select>
            {row.map((tile, colIndex) => {
              const isHitbox = hitboxTiles.some(
                (t) => t.row === rowIndex && t.col === colIndex
              );

              return (
                <div
                  key={colIndex}
                  className={`asset-tile ${isHitbox ? "hitbox-tile" : ""}`}
                  style={{
                    backgroundImage: tile ? `url(${tile})` : "none",
                  }}
                  onClick={() => handleTileClick(rowIndex, colIndex)}
                />
              );
            })}
          </div>
        ))}
      </div>

      <button className="asset-save-button" onClick={handleSave}>
        💾 Save Asset
      </button>
    </div>
  );
};

export default AssetBuilder;
