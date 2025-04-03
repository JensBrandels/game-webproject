const ASSET_API_URL = import.meta.env.VITE_ASSET_API_URL;

export const loadAssets = async () => {
  try {
    const res = await fetch(ASSET_API_URL);
    if (!res.ok) throw new Error("Failed to load assets");
    return await res.json();
  } catch (err) {
    console.error("Error loading assets:", err);
    return [];
  }
};

export const saveAsset = async (asset: any) => {
  try {
    const res = await fetch(ASSET_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(asset),
    });
    return await res.json();
  } catch (err) {
    console.error("Error saving asset:", err);
    throw err;
  }
};
