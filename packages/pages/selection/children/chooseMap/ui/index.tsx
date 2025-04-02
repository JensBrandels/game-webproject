import "./style.css";
import { useState, useEffect } from "react";
import { loadSavedMaps } from "../../../../../../src/api/maps/mapApi";

interface MapComponentProps {
  onSelectMap: (mapId: string) => void;
  selectedMapId: string | null;
}

export const MapComponent: React.FC<MapComponentProps> = ({
  onSelectMap,
  selectedMapId,
}) => {
  const [maps, setMaps] = useState<any[]>([]);

  const mapImages: Record<string, string> = {
    map1: "/assets/images/grassland.jpg",
    map2: "/assets/images/village.jpg",
    map3: "/assets/images/desert.jpg",
  };

  const defaultColor: Record<string, string> = {
    map1: "#90EE90",
    map2: "#ADD8E6",
    map3: "#F4A300",
  };

  useEffect(() => {
    const fetchMaps = async () => {
      const loadedMaps = await loadSavedMaps();
      setMaps(loadedMaps);
    };
    fetchMaps();
  }, []);

  return (
    <div>
      <h2>Select a Map</h2>
      <div>
        {maps.length === 0 ? (
          <p>Loading maps...</p>
        ) : (
          maps.map((map) => {
            const imageSrc = mapImages[map.id];
            const fallbackColor = defaultColor[map.id];
            const isSelected = map.id === selectedMapId;

            return (
              <div key={map.id} style={{ marginBottom: "20px" }}>
                <button onClick={() => onSelectMap(map.id)}>
                  <div
                    className={`map-preview ${isSelected ? "selected" : ""}`}
                    style={{
                      backgroundImage: `url(${imageSrc})`,
                      backgroundColor: fallbackColor,
                    }}
                    onError={(
                      e: React.SyntheticEvent<HTMLDivElement, Event>
                    ) => {
                      e.currentTarget.style.backgroundColor = fallbackColor;
                    }}
                  >
                    {map.name}
                  </div>
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
