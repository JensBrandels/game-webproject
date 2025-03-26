import "../styles/MapEditor.css";
import { useState, useEffect } from "react";
import EditorCanvas from "../editorLogic/EditorCanvas";
import { saveMap, loadSavedMaps, deleteMap } from "../game/mapDatabase";
import TileSelector from "../editorLogic/TileSelector";
import AssetBuilder from "../editorLogic/AssetBuilder";
import { loadAssets } from "../api/assets/assetApi";

const GRID_SIZE = 63;
const TILE_SIZE = 32;

const MapEditor = () => {
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
      setMapData({
        id: mapToLoad.id,
        name: mapToLoad.name,
        size: { width: GRID_SIZE * TILE_SIZE, height: GRID_SIZE * TILE_SIZE },
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

    const updatedMapData = { ...mapData, id: mapId, name: mapName };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/${mapId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedMapData),
      });

      if (!response.ok) throw new Error("Failed to update map");

      alert(`Map "${mapName}" updated successfully!`);

      // Refresh saved maps
      const updatedMaps = await loadSavedMaps();
      setSavedMaps(updatedMaps);
    } catch (error) {
      console.error("Error updating map:", error);
    }
  };

  // const getAssetBoundingBox = (asset: any) => {
  //   const tiles = [...asset.tilesWithCollision, ...asset.tilesWithoutCollision];
  //   if (tiles.length === 0) return null;

  //   const maxX = Math.max(...tiles.map((t) => t.x));
  //   const maxY = Math.max(...tiles.map((t) => t.y));

  //   return {
  //     tiles,
  //     width: maxX / 16 + 1,
  //     height: maxY / 16 + 1,
  //     previewTile: tiles[0],
  //   };
  // };

  return (
    <div>
      <h1>Map Editor</h1>

      {/* Loading Indicator */}
      {loading && <p>Loading maps...</p>}

      {/* Map Save Form */}
      <div style={{ marginBottom: "10px" }}>
        <label>
          Map Name:
          <input
            type="text"
            value={mapName}
            onChange={(e) => setMapName(e.target.value)}
            placeholder="Enter map name"
          />
        </label>
        <br />
        <label>
          Unique ID:
          <input type="text" value={mapId} readOnly />
          <button onClick={() => setMapId(crypto.randomUUID())}>
            Generate New ID
          </button>
        </label>
        <br />
        <div style={{ marginBottom: "10px" }}>
          <button onClick={handleSave}>Save Map</button>
          <button onClick={handleUpdateMap} style={{ marginLeft: "10px" }}>
            Update Map
          </button>
        </div>
      </div>

      {/* Load Map Dropdown */}
      <div style={{ marginBottom: "10px" }}>
        <label>
          Load Map:
          <select onChange={(e) => handleLoadMap(e.target.value)}>
            <option value="">Select a map</option>
            {savedMaps.map((map) => (
              <option key={map.id} value={map.id}>
                {map.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Delete Map Button */}
      <div>
        <button onClick={() => handleDeleteMap(mapId)}>
          Delete Selected Map
        </button>
      </div>

      {/* Editor Components */}
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

      <EditorCanvas
        selectedAsset={selectedAsset}
        assets={assets}
        mapData={mapData}
        setMapData={setMapData}
      />

      {/* TileSelector */}
      <TileSelector tileSize={16} onSelect={setSelectedAsset} />
      <AssetBuilder selectedAsset={selectedAsset} />
    </div>
  );
};

export default MapEditor;
