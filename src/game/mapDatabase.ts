const API_URL = import.meta.env.VITE_API_URL;

//Save a map to MongoDB
export const saveMap = async (mapData: any) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mapData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        `Failed to save map: ${data.error || response.statusText}`
      );
    }

    console.log("Map saved successfully:", data);
    return data;
  } catch (error) {
    console.error("Error saving map:", error);
    throw error;
  }
};

//Load all saved maps from MongoDB
export const loadSavedMaps = async () => {
  try {
    const response = await fetch(`${API_URL}`);
    if (!response.ok) throw new Error("Failed to load maps");

    return await response.json();
  } catch (error) {
    console.error("Error loading maps:", error);
    return [];
  }
};

//Delete a map from MongoDB
export const deleteMap = async (mapId: string) => {
  try {
    const response = await fetch(`${API_URL}/${mapId}`, { method: "DELETE" });

    if (!response.ok) throw new Error("Failed to delete map");

    console.log(`Map with ID ${mapId} deleted.`);
  } catch (error) {
    console.error("Error deleting map:", error);
  }
};
