import { useGameSessionStore } from "@viking/gamesession-store";
import { useSelectedCharacter } from "../../../../../shared/hooks/useSelectedCharacter";
import { useAccountStore } from "@viking/game-store";
import { weapons } from "@viking/weapons";

import "./style.scss";

export function LevelUpScreen() {
  const character = useSelectedCharacter();
  const weapon = useAccountStore((s) => s.account?.weapons?.[0]);
  const setLevelUpReady = useGameSessionStore((s) => s.setLevelUpReady);

  const handleSelect = (option: string) => {
    if (!character) return;

    switch (option) {
      case "+50% Attack Speed":
        character.attackSpeed *= 1.5;
        break;
      case "+20% Range":
        if (weapon) weapon.range *= 1.2;
        break;
      case "+1 Weapon": {
        const shield = weapons.find((w) => w.name === "Viking Shield");
        if (shield) {
          useAccountStore.setState((s) => ({
            account: {
              ...s.account!,
              weapons: [...s.account!.weapons, { ...shield }],
            },
          }));
          console.log("🛡️Shield added");
        }
        break;
      }
    }

    setLevelUpReady(false);
  };

  const options = ["+50% Attack Speed", "+1 Weapon", "+20% Range"];

  return (
    <div className="levelup-overlay">
      <h2>Level Up!</h2>
      <div className="levelup-options">
        {options.map((opt) => (
          <button key={opt} onClick={() => handleSelect(opt)}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
