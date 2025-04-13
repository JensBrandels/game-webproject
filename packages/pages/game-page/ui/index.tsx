import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { GameCanvas } from "@viking/game-canvas";
import { characters } from "@viking/characters";
import { getMapById } from "../../../core/api/map/mapApi";
import { loadAssets } from "../../../core/api/assets/assetApi";
import { useCountdown } from "../data/timer";

import "./style.scss";

export const GameScreen = () => {
  const location = useLocation();
  const { selectedMapId, selectedCharacterId } = location.state || {};
  const { formatted } = useCountdown(20);

  const [selectedMap, setSelectedMap] = useState<any>(null);
  // const [assets, setAssets] = useState<any[]>([]);

  const selectedCharacter = characters.find(
    (c) => c.id === selectedCharacterId
  );

  useEffect(() => {
    const fetchData = async () => {
      const map = await getMapById(selectedMapId);
      const allAssets = await loadAssets();

      // Attach full asset data to placedObjects
      const placedObjectsWithAssets = map.placedObjects.map((obj: any) => {
        const assetData = allAssets.find((a: any) => a.id === obj.asset);
        return { ...obj, assetData };
      });

      setSelectedMap({
        ...map,
        placedObjects: placedObjectsWithAssets,
        obstaclesWithCollision: [], // will be filled during draw step
      });

      // setAssets(allAssets);
    };

    fetchData();
  }, [selectedMapId]);

  if (!selectedMap || !selectedCharacter) return <div>Loading...</div>;

  return (
    <div className="game-ui-overlay">
      <div className="game-timer">{formatted}</div>
      <div>
        <GameCanvas
          selectedMap={selectedMap}
          selectedCharacter={selectedCharacter}
        />
      </div>
    </div>
  );
};
