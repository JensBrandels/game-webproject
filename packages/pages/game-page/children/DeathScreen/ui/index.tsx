import { useNavigate } from "react-router-dom";
import { useAccountStore } from "@viking/game-store";

import "./style.scss";
export const DeathScreen = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    const store = useAccountStore.getState();
    const account = store.account;
    const selected = store.selectedCharacter();

    if (account && selected) {
      const updatedChar = {
        ...selected,
        hp: selected.maxHp,
      };

      store.setAccount({
        ...account,
        characters: account.characters.map((c) =>
          c.id === updatedChar.id ? updatedChar : c
        ),
      });
      store.setIsDead(false);
      store.setIsHurt(false);
    }

    navigate("/selectionscreen");
  };

  return (
    <div className="death-screen">
      <h1>You Died</h1>
      <button onClick={handleBack}>Back to Selection</button>
    </div>
  );
};
