import { useEffect, useRef, useState } from "react";
import "./style.css";
import generateId from "../../../../../../src/utils/GenerateId";

interface TileSelectorProps {
  tileSize: number;
  onSelect: (tileDataUrl: string) => void;
  onTilesheetSelect?: (tilesheetId: string) => void;
}

export const TileSelector = ({
  tileSize,
  onSelect,
  onTilesheetSelect,
}: TileSelectorProps) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageWidth, setImageWidth] = useState(0);
  const [imageHeight, setImageHeight] = useState(0);
  const [columns, setColumns] = useState(0);
  const [rows, setRows] = useState(0);
  const [savedTilesheets, setSavedTilesheets] = useState<any[]>([]);
  const [selectedTilesheetId, setSelectedTilesheetId] = useState("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [uploadedBase64, setUploadedBase64] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [showSaveButton, setShowSaveButton] = useState(false);

  const fetchTilesheets = async () => {
    try {
      const TILE_SHEET_API = import.meta.env.VITE_TILE_SHEET_API;
      const response = await fetch(`${TILE_SHEET_API}`);
      const data = await response.json();
      setSavedTilesheets(data);
    } catch (err) {
      console.error("Failed to fetch tilesheets:", err);
    }
  };

  useEffect(() => {
    fetchTilesheets();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      const base64 = reader.result as string;
      const img = new Image();
      img.src = base64;

      img.onload = () => {
        setImageSrc(base64);
        setImageWidth(img.width);
        setImageHeight(img.height);
        setColumns(Math.floor(img.width / tileSize));
        setRows(Math.floor(img.height / tileSize));
        setUploadedBase64(base64);
        setUploadedFileName(file.name);
        setShowSaveButton(true);
      };
    };

    reader.readAsDataURL(file);
  };

  const handleSaveTilesheet = async () => {
    if (!uploadedBase64 || !uploadedFileName) return;

    const newTilesheet = {
      id: generateId(),
      name: uploadedFileName,
      base64: uploadedBase64,
    };

    try {
      const TILE_SHEET_API = import.meta.env.VITE_TILE_SHEET_API;

      const response = await fetch(TILE_SHEET_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTilesheet),
      });

      const text = await response.text();

      try {
        const result = JSON.parse(text);

        if (!response.ok) {
          alert(`Failed to save: ${result.message || result.error}`);
          return;
        }

        setSavedTilesheets((prev) => [...prev, newTilesheet]);
        setSelectedTilesheetId(newTilesheet.id);
        setShowSaveButton(false);
        onTilesheetSelect?.(newTilesheet.id);
        alert("Tilesheet saved to database!");
        await fetchTilesheets();
      } catch (err) {
        console.error("JSON Parse Error:", err);
        alert(`Backend returned invalid JSON:\n${text}`);
      }
    } catch (err) {
      console.error("Error saving tilesheet:", err);
      alert("Failed to save tilesheet");
    }
  };

  const handleTilesheetSelect = (id: string) => {
    const selected = savedTilesheets.find((sheet) => sheet.id === id);
    if (!selected) return;

    const img = new Image();
    img.src = selected.base64;

    img.onload = () => {
      setImageSrc(selected.base64);
      setImageWidth(img.width);
      setImageHeight(img.height);
      setColumns(Math.floor(img.width / tileSize));
      setRows(Math.floor(img.height / tileSize));
      setSelectedTilesheetId(id);
      setShowSaveButton(false);
      onTilesheetSelect?.(id);
    };
  };

  return (
    <div>
      <input type="file" accept="image/png" onChange={handleImageUpload} />

      <div style={{ margin: "10px 0" }}>
        <label>Select a saved tilesheet:</label>
        <select
          value={selectedTilesheetId}
          onChange={(e) => handleTilesheetSelect(e.target.value)}
        >
          <option value="">-- Choose --</option>
          {savedTilesheets.map((sheet) => (
            <option key={sheet.id} value={sheet.id}>
              {sheet.name}
            </option>
          ))}
        </select>
      </div>

      {imageSrc && (
        <div className="tile-selector-container">
          <div
            className="tile-grid"
            style={{
              width: `${imageWidth}px`,
              height: `${imageHeight}px`,
              backgroundImage: `url(${imageSrc})`,
              backgroundSize: "cover",
            }}
          >
            {Array.from({ length: columns * rows }).map((_, index) => {
              const x = (index % columns) * tileSize;
              const y = Math.floor(index / columns) * tileSize;

              return (
                <div
                  key={index}
                  className="tile"
                  style={{ width: tileSize, height: tileSize }}
                  onClick={() => {
                    const tempCanvas = canvasRef.current!;
                    const ctx = tempCanvas.getContext("2d")!;
                    tempCanvas.width = tileSize;
                    tempCanvas.height = tileSize;

                    const img = new Image();
                    img.src = imageSrc;
                    img.onload = () => {
                      ctx.drawImage(
                        img,
                        x,
                        y,
                        tileSize,
                        tileSize,
                        0,
                        0,
                        tileSize,
                        tileSize
                      );
                      const tileData = tempCanvas.toDataURL();
                      onSelect(tileData);
                    };
                  }}
                />
              );
            })}
          </div>
        </div>
      )}
      {showSaveButton && (
        <button className="tile-save-button" onClick={handleSaveTilesheet}>
          💾 Save Tilesheet to Database
        </button>
      )}

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
};
