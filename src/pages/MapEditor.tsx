//is supposed to be the page for mapEditing (at a later stage only for admin)
import { useState } from "react";
import EditorCanvas from "../editorLogic/EditorCanvas";
import EditorControls from "../editorLogic/EditorControls";

const MapEditor = () => {
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);

  return (
    <div>
      <h1>Map Editor</h1>
      <EditorControls setSelectedAsset={setSelectedAsset} />
      <EditorCanvas
        selectedAsset={selectedAsset}
        setSelectedAsset={setSelectedAsset}
      />
    </div>
  );
};

export default MapEditor;
