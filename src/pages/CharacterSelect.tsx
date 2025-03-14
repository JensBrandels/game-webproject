import "../styles/CharacterSelect.css";
import { Link } from "react-router-dom";
import { useState } from "react";

//importing the characters
import { characters } from "../game/Characters";

const CharacterSelect = () => {
  const [selectedCharacter, setSelectedCharacter] = useState<number | null>(
    null
  );

  const handleCharacterClick = (characterId: number) => {
    setSelectedCharacter(characterId);
  };

  console.log(selectedCharacter);

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
      <div className="character-selection-startgame">
        <Link to="/game">Start Game</Link>
      </div>
    </div>
  );
};

export default CharacterSelect;
