import { useNavigate } from "react-router-dom";
import { restartGame } from "../../../../../shared/restart/restart";

import "./style.scss";

export const DeathScreen = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    try {
      restartGame();
      setTimeout(() => {
        navigate("/selectionscreen");
      }, 0);
    } catch (err) {
      console.error("DeathScreen navigation failed:", err);
    }
  };

  return (
    <div className="death-screen">
      <h1>You Died</h1>
      <button onClick={handleBack}>Back to Selection</button>
    </div>
  );
};
