import "../styles/CharacterSelect.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Importing the characters
import { characters } from "../game/Characters";
// importing the maps
import MapComponent from "../components/MapComponent";

const SelectionScreen = () => {
  const [selectedCharacter, setSelectedCharacter] = useState<number | null>(
    null
  );
  const [selectedMapId, setSelectedMapId] = useState<string | null>(null);

  const handleSelectMap = (mapId: string) => {
    setSelectedMapId(mapId);
  };

  const handleCharacterClick = (characterId: number) => {
    setSelectedCharacter(characterId);
  };

  const navigate = useNavigate();
  // console.log(selectedCharacter);

  const handleStartGame = () => {
    navigate("/game", {
      state: {
        selectedMapId,
        selectedCharacterId: selectedCharacter,
      },
    });
  };

  return (
    <div className="character-selection-main-container">
      <h1 className="character-selection-title">Select Your Character</h1>
      <div className="character-selection-list">
        {characters.map((character) => (
          <div
            key={character.id}
            className={`character-selection-box ${
              selectedCharacter === character.id ? "selected" : ""
            }`}
            onClick={() => handleCharacterClick(character.id)}
          >
            <img
              className="character-selection-img"
              src={character.sprite}
              alt={character.name}
            />
            <h3 className="character-selection-name">{character.name}</h3>
            <ul className="character-selection-ul">
              <li>
                <strong>HP:</strong> {character.hp}
              </li>
              <li>
                <strong>MP:</strong> {character.mp}
              </li>
              <li>
                <strong>Movement Speed:</strong> {character.movementSpeed}
              </li>
              <li>
                <strong>Attack Speed:</strong> {character.attackSpeed}
              </li>
            </ul>
          </div>
        ))}
      </div>
      <div>
        <MapComponent
          onSelectMap={handleSelectMap}
          selectedMapId={selectedMapId} // Pass selectedMapId here
        />
      </div>
      <div className="character-selection-startgame">
        <button onClick={handleStartGame}>Start Game</button>
      </div>
    </div>
  );
};

export default SelectionScreen;
