import { useNavigate } from "react-router-dom";
import { restartGame } from "../../../../../shared/restart/restart";

import "./style.scss";

export const DeathScreen = () => {
  const navigate = useNavigate();

  const handleBackToSelection = () => {
    console.log("DeathScreen: backing to selection → wiping state");
    restartGame();
    navigate("/selectionScreen");
  };

  return (
    <div className="death-screen">
      <h1>You Died</h1>
      <button onClick={handleBackToSelection}>Back to Selection</button>
    </div>
  );
};
