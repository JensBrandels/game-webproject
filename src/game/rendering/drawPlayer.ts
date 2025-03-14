import { characters } from "../Characters";

export const drawPlayer = (
  ctx: CanvasRenderingContext2D,
  player: { x: number; y: number },
  camera: { x: number; y: number },
  selectedCharacterId: number
) => {
  if (!ctx) return;

  // Find the selected character
  const selectedCharacter = characters.find(
    (c) => c.id === selectedCharacterId
  );
  if (!selectedCharacter) return;

  // Load character sprite
  const characterImage = new Image();
  characterImage.src = selectedCharacter.sprite;

  // Ensure the image is loaded before drawing
  if (characterImage.complete && characterImage.naturalWidth > 0) {
    ctx.drawImage(
      characterImage,
      player.x - camera.x,
      player.y - camera.y,
      100,
      100
    );
  }
};
