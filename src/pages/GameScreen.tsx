import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import GameCanvas from "../game/GameCanvas";
import { characters } from "../game/Characters";
import { getMapById } from "../api/maps/mapApi";
import { loadAssets } from "../api/assets/assetApi";

const GameScreen = () => {
  const location = useLocation();
  const { selectedMapId, selectedCharacterId } = location.state || {};

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
    <GameCanvas
      selectedMap={selectedMap}
      selectedCharacter={selectedCharacter}
    />
  );
};

export default GameScreen;
