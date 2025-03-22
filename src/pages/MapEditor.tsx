import { useState, useEffect } from "react";
import EditorCanvas from "../editorLogic/EditorCanvas";
import EditorControls from "../editorLogic/EditorControls";
import { saveMap, loadSavedMaps, deleteMap } from "../game/mapDatabase";
import TileSelector from "../editorLogic/TileSelector";
import AssetBuilder from "../editorLogic/AssetBuilder";

const GRID_SIZE = 63;
const TILE_SIZE = 32;

const MapEditor = () => {
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [mapName, setMapName] = useState("");
  const [mapId, setMapId] = useState(crypto.randomUUID());
  const [savedMaps, setSavedMaps] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // This state holds the entire map data
  const [mapData, setMapData] = useState({
    id: mapId,
    size: { width: 2000, height: 2000 },
    background: [],
    obstaclesWithCollision: [],
    obstaclesForVisual: [],
  });

  // Load saved maps from MongoDB (async)
  useEffect(() => {
    const fetchMaps = async () => {
      setLoading(true);
      const maps = await loadSavedMaps();
      setSavedMaps(maps);
      setLoading(false);
    };
    fetchMaps();
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
        ...mapToLoad,
        size: { width: GRID_SIZE * TILE_SIZE, height: GRID_SIZE * TILE_SIZE },
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
      <EditorControls setSelectedAsset={setSelectedAsset} />
      <EditorCanvas
        selectedAsset={selectedAsset}
        setSelectedAsset={setSelectedAsset}
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
