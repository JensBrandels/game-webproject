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

export const getMapById = async (mapId: string) => {
  try {
    const res = await fetch(`${API_URL}/${mapId}`);
    if (!res.ok) throw new Error("Failed to fetch map");
    return await res.json();
  } catch (err) {
    console.error("Error fetching map:", err);
    throw err;
  }
};

export const updateMap = async (updatedMapData: any, mapId: string) => {
  try {
    const res = await fetch(`${API_URL}/${mapId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedMapData),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Update request failed.");
    }

    return await res.json();
  } catch (err) {
    console.error("Error updating map:", err);
    throw err;
  }
};
