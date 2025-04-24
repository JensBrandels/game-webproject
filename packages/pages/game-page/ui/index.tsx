import { useEffect, useState } from "react";
import { useAccountStore } from "@viking/game-store";
import { GameCanvas } from "@viking/game-canvas";
import { getMapById } from "../../../core/api/map/mapApi";
import { loadAssets } from "../../../core/api/assets/assetApi";
import { useCountdown } from "../data/timer";

import "./style.scss";

export const GameScreen = () => {
  const selectedMapId = useAccountStore((s) => s.selectedMapId);
  const { formatted } = useCountdown(20);

  const selectedCharacter = useAccountStore((s) => s.selectedCharacter());
  const [selectedMap, setSelectedMap] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedMapId) return;

      const map = await getMapById(selectedMapId);
      const allAssets = await loadAssets();

      const placedObjectsWithAssets = map.placedObjects.map((obj: any) => {
        const assetData = allAssets.find((a: any) => a.id === obj.asset);
        return { ...obj, assetData };
      });

      setSelectedMap({
        ...map,
        placedObjects: placedObjectsWithAssets,
        obstaclesWithCollision: [],
      });
    };

    fetchData();
  }, [selectedMapId]);

  if (!selectedMap || !selectedCharacter) return <div>Loading...</div>;

  return (
    <div className="game-ui-overlay">
      <div className="game-timer">{formatted}</div>
      <div>
        <GameCanvas selectedMap={selectedMap} />
      </div>
    </div>
  );
};
