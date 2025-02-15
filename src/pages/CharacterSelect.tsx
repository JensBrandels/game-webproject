import { Link } from "react-router-dom";

const CharacterSelect = () => {
  return (
    <div>
      <h1>Select Your Character</h1>
      <Link to="/game">Start Game</Link>
    </div>
  );
};

export default CharacterSelect;