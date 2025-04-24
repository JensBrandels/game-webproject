import "./style.css";
import { useNavigate } from "react-router-dom";
import { characters } from "@viking/characters";
import { MapComponent } from "@viking/map-selection";
import { useAccountStore } from "@viking/game-store";

export const SelectionScreen = () => {
  const navigate = useNavigate();

  const selectedCharacterId = useAccountStore(
    (s) => s.account?.selectedCharacterId
  );
  const selectedMapId = useAccountStore((s) => s.selectedMapId);
  const selectCharacter = useAccountStore((s) => s.selectCharacter);
  const setSelectedMapId = useAccountStore((s) => s.setSelectedMapId);

  const handleSelectMap = (mapId: string) => {
    console.log(mapId);
    setSelectedMapId(mapId);
  };

  const handleCharacterClick = (characterId: number) => {
    console.log(characterId);
    selectCharacter(characterId);
  };

  const account = useAccountStore((s) => s.account);

  const handleStartGame = () => {
    if (selectedCharacterId && selectedMapId && account) {
      console.log("NEW GAMESTART — full store state:", account);
      navigate("/game");
    }
  };

  return (
    <div className="character-selection-main-container">
      <h1 className="character-selection-title">Select Your Character</h1>
      <div className="character-selection-list">
        {characters.map((character) => (
          <div
            key={character.id}
            className={`character-selection-box ${
              selectedCharacterId === character.id ? "selected" : ""
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
          selectedMapId={selectedMapId}
        />
      </div>

      <div className="character-selection-startgame">
        <button onClick={handleStartGame}>Start Game</button>
      </div>
    </div>
  );
};
