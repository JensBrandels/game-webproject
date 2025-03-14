import { RefObject } from "react";

import { checkCollision } from "../Collision";
import { MapType } from "../Maps";
import { characters } from "../Characters";

export const updatePlayer = (
  player: { x: number; y: number },
  keys: RefObject<Record<string, boolean>>,
  selectedCharacterId: number,
  selectedMap: MapType,
  camera: { x: number; y: number },
  canvas: HTMLCanvasElement
) => {
  const selectedCharacter = characters.find(
    (c) => c.id === selectedCharacterId
  );
  if (!selectedCharacter) return;

  const playerSize = 100;
  let newX = player.x;
  let newY = player.y;

  if (keys.current?.["ArrowUp"] || keys.current?.["w"])
    newY -= selectedCharacter.movementSpeed;
  if (keys.current?.["ArrowDown"] || keys.current?.["s"])
    newY += selectedCharacter.movementSpeed;
  if (keys.current?.["ArrowLeft"] || keys.current?.["a"])
    newX -= selectedCharacter.movementSpeed;
  if (keys.current?.["ArrowRight"] || keys.current?.["d"])
    newX += selectedCharacter.movementSpeed;

  newX = Math.max(0, Math.min(selectedMap.size.width - playerSize, newX));
  newY = Math.max(0, Math.min(selectedMap.size.height - playerSize, newY));

  if (
    !checkCollision(
      newX,
      newY,
      selectedCharacter,
      selectedMap.obstaclesWithCollision
    )
  ) {
    player.x = newX;
    player.y = newY;
  }

  const screenCenterX = canvas.width / 2;
  const screenCenterY = canvas.height / 2;

  camera.x = Math.max(
    0,
    Math.min(selectedMap.size.width - canvas.width, player.x - screenCenterX)
  );
  camera.y = Math.max(
    0,
    Math.min(selectedMap.size.height - canvas.height, player.y - screenCenterY)
  );
};
