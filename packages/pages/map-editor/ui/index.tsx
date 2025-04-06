import "./style.scss";
import { useState, useEffect } from "react";
import { EditorCanvas } from "@viking/editor-canvas";
import { TileSelector } from "@viking/tile-selector";
import { AssetBuilder } from "@viking/asset-builder";
import { loadAssets } from "../../../core/api/assets/assetApi";
import {
  saveMap,
  loadSavedMaps,
  deleteMap,
  updateMap,
} from "../../../core/api/map/mapApi";

const GRID_SIZE = 63;
const TILE_SIZE = 32;

export const MapEditor = () => {
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [mapName, setMapName] = useState("");
  const [mapId, setMapId] = useState(crypto.randomUUID());
  const [savedMaps, setSavedMaps] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [assets, setAssets] = useState<any[]>([]);

  // This state holds the entire map data **
  const [mapData, setMapData] = useState({
    id: mapId,
    name: "",
    size: { width: GRID_SIZE * TILE_SIZE, height: GRID_SIZE * TILE_SIZE },
    placedObjects: [],
  });

  // Load saved maps from MongoDB (async)
  useEffect(() => {
    const fetchMapsAndAssets = async () => {
      setLoading(true);
      const maps = await loadSavedMaps();
      const assetsFromDB = await loadAssets();

      setSavedMaps(maps);
      setAssets(assetsFromDB);
      setLoading(false);
    };

    fetchMapsAndAssets();
  }, []);

  const handleSave = async () => {
    if (!mapName.trim()) {
      alert("Please enter a map name before saving.");
      return;
    }

    const newMapData = { ...mapData, id: mapId, name: mapName };

    try {
      console.log("Saving map:", newMapData);

      const response = await saveMap(newMapData);

      if (!response || !response.message) {
        throw new Error("Failed to save map - No response from backend.");
      }

      alert(`Map "${mapName}" saved successfully!`);

      //Ensure we fetch the latest data after saving
      const updatedMaps = await loadSavedMaps();
      setSavedMaps(updatedMaps);
    } catch (error) {
      console.error("Error saving map:", error);
      alert("Failed to save map. Check the console for details.");
    }
  };

  // Load selected map
  const handleLoadMap = async (mapId: string) => {
    const mapToLoad = savedMaps.find((map) => map.id === mapId);
    if (mapToLoad) {
      setMapId(mapToLoad.id);
      setMapName(mapToLoad.name);

      // Keep grid size consistent
      console.log("Loaded mapToLoad:", mapToLoad);
      setMapData({
        id: mapToLoad.id,
        name: mapToLoad.name,
        size: mapToLoad.size,
        placedObjects: mapToLoad.placedObjects || [],
      });

      alert(`Loaded map: ${mapToLoad.name}`);
    }
  };

  // Delete a map and refresh the dropdown
  const handleDeleteMap = async (mapId: string) => {
    await deleteMap(mapId);
    alert(`Deleted map: ${mapId}`);

    // Refresh saved maps
    const updatedMaps = await loadSavedMaps();
    setSavedMaps(updatedMaps);
  };

  //Update a map in MongoDB
  const handleUpdateMap = async () => {
    if (!mapName.trim()) {
      alert("Please enter a map name before updating.");
      return;
    }

    // Merge the name into mapData properly
    const updatedMapData = { ...mapData, name: mapName };

    try {
      console.log("Sending this data to update:", updatedMapData);

      const response = await updateMap(updatedMapData, updatedMapData.id);

      if (!response || !response.message) {
        throw new Error("Failed to update map - No response from backend.");
      }

      alert(`Map "${mapName}" updated successfully!`);

      const updatedMaps = await loadSavedMaps();
      setSavedMaps(updatedMaps);
    } catch (error) {
      console.error("Error updating map:", error);
      alert("Failed to update map. Check the console for details.");
    }
  };

  return (
    <div className="mapEditor-container">
      <h1 className="mapEditor-title">Map Editor</h1>

      {loading && <p>Loading maps...</p>}

      {/* TOP ROW - info + asset panel */}
      <div className="mapEditor-topRow">
        <div className="mapEditor-infoBox">
          <label className="mapEditor-label">
            Map Name:
            <input
              className="mapEditor-input"
              type="text"
              value={mapName}
              onChange={(e) => setMapName(e.target.value)}
              placeholder="Enter map name"
            />
          </label>
          <label className="mapEditor-label">
            Unique ID:
            <input
              className="mapEditor-input"
              type="text"
              value={mapId}
              readOnly
            />
            <button
              className="mapEditor-button"
              onClick={() => setMapId(crypto.randomUUID())}
            >
              Generate New ID
            </button>
          </label>

          <div className="mapEditor-buttonBox">
            <button className="mapEditor-button" onClick={handleSave}>
              Save Map
            </button>
            <button className="mapEditor-button" onClick={handleUpdateMap}>
              Update map
            </button>
          </div>

          <button
            className="mapEditor-button mapEditor-deleteButton"
            onClick={() => handleDeleteMap(mapId)}
          >
            Delete Selected Map
          </button>

          <label className="mapEditor-label">
            Load Map:
            <select
              className="mapEditor-select"
              onChange={(e) => handleLoadMap(e.target.value)}
            >
              <option value="">Select a map</option>
              {savedMaps.map((map) => (
                <option key={map.id} value={map.id}>
                  {map.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="asset-selector-panel">
          {assets.map((asset) => {
            const allTiles = [
              ...asset.tilesWithCollision,
              ...asset.tilesWithoutCollision,
            ];
            if (allTiles.length === 0) return null;

            const minX = Math.min(...allTiles.map((t) => t.x));
            const minY = Math.min(...allTiles.map((t) => t.y));
            const maxX = Math.max(...allTiles.map((t) => t.x));
            const maxY = Math.max(...allTiles.map((t) => t.y));
            const boxWidth = maxX - minX + 16;
            const boxHeight = maxY - minY + 16;

            return (
              <div
                key={asset.id}
                className={`asset-preview-box ${
                  selectedAsset === asset.id ? "selected" : ""
                }`}
                onClick={() =>
                  setSelectedAsset((prev) =>
                    prev === asset.id ? null : asset.id
                  )
                }
                style={{
                  width: `${boxWidth}px`,
                  height: `${boxHeight}px`,
                }}
              >
                {allTiles.map((tile, index) => (
                  <img
                    key={index}
                    src={tile.asset}
                    className="asset-preview-img"
                    style={{
                      left: `${tile.x - minX}px`,
                      top: `${tile.y - minY}px`,
                    }}
                    alt=""
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* CANVAS SECTION */}
      <div className="mapEditor-canvasWrapper">
        <EditorCanvas
          selectedAsset={selectedAsset}
          assets={assets}
          mapData={mapData}
          setMapData={setMapData}
        />
      </div>

      {/* BOTTOM PANEL */}
      <div className="mapEditor-bottomPanel">
        <TileSelector tileSize={16} onSelect={setSelectedAsset} />
        <AssetBuilder selectedAsset={selectedAsset} />
      </div>
    </div>
  );
};
