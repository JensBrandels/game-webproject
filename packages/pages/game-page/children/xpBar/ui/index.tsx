import { useSelectedCharacter } from "../../../../../shared/hooks/useSelectedCharacter";
import { getRequiredXp } from "@viking/game-canvas/data/characterLeveling";
import "./style.scss";

export function XPBar() {
  const character = useSelectedCharacter();
  if (!character) return null;

  const requiredXp = getRequiredXp(character.level);
  const ratio = Math.min(character.xp / requiredXp, 1);

  return (
    <div className="xp-bar-wrapper">
      <div className="xp-bar-fill" style={{ width: `${ratio * 100}%` }} />
      <div className="xp-bar-text">
        LVL {character.level} — {character.xp}/{requiredXp} XP
      </div>
    </div>
  );
}
