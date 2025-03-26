import { useState } from "react";
import { obstaclesWithCollision } from "../editorLogic/obstacles/ObstaclesWithCollision";
import { obstacleForVisual } from "../editorLogic/obstacles/ObstaclesForVisual";

interface EditorControlsProps {
  setSelectedAsset: (asset: string | null) => void;
}

const EditorControls: React.FC<EditorControlsProps> = ({
  setSelectedAsset,
}) => {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (assetId: string) => {
    const newSelection = selected === assetId ? null : assetId;
    setSelected(newSelection);
    setSelectedAsset(newSelection);
  };

  return (
    <div className="asset-selection-box">
      <h3>Select an Asset:</h3>

      <h4>Obstacles</h4>
      <div className="asset-list">
        {obstaclesWithCollision.map((asset) => {
          const sprite = asset.sprite ?? "";
          return (
            <img
              key={sprite}
              src={sprite}
              alt={sprite || "Unknown Asset"}
              className={`asset-icon ${selected === sprite ? "selected" : ""}`}
              onClick={() => handleSelect(sprite)}
            />
          );
        })}
      </div>

      <h4>Visuals</h4>
      <div className="asset-list">
        {obstacleForVisual.map((asset) => {
          const sprite = asset.sprite ?? "";
          return (
            <img
              key={sprite}
              src={sprite}
              alt={sprite || "Unknown Asset"}
              className={`asset-icon ${selected === sprite ? "selected" : ""}`}
              onClick={() => handleSelect(sprite)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default EditorControls;
