import type { RefObject } from "react";
import { checkCollision } from "../../../../../../src/game/Collision";
import type { MapType } from "../../../../../../src/game/Maps";
import { characters } from "@viking/characters";

export const updatePlayer = (
  player: {
    x: number;
    y: number;
    prevX: number;
    prevY: number;
    direction?: string;
  },
  keys: RefObject<Record<string, boolean>>,
  selectedCharacterId: number,
  selectedMap: MapType,
  camera: { x: number; y: number },
  canvas: HTMLCanvasElement,
  ctx?: CanvasRenderingContext2D
) => {
  const selectedCharacter = characters.find(
    (c) => c.id === selectedCharacterId
  );
  if (!selectedCharacter) return;

  const playerSize = 32;
  let newX = player.x;
  let newY = player.y;
  let direction = player.direction || "down";

  const speed = selectedCharacter.movementSpeed;

  const up = keys.current?.["ArrowUp"] || keys.current?.["w"];
  const down = keys.current?.["ArrowDown"] || keys.current?.["s"];
  const left = keys.current?.["ArrowLeft"] || keys.current?.["a"];
  const right = keys.current?.["ArrowRight"] || keys.current?.["d"];

  if (up) {
    newY -= speed;
    direction = "up";
  } else if (down) {
    newY += speed;
    direction = "down";
  } else if (left) {
    newX -= speed;
    direction = "left";
  } else if (right) {
    newX += speed;
    direction = "right";
  }

  newX = Math.max(0, Math.min(selectedMap.size.width - playerSize, newX));
  newY = Math.max(0, Math.min(selectedMap.size.height - playerSize, newY));

  if (
    !checkCollision(
      newX,
      newY,
      selectedCharacter,
      selectedMap.obstaclesWithCollision || [],
      ctx, // ✅ passed
      camera // ✅ passed
    )
  ) {
    player.prevX = player.x;
    player.prevY = player.y;
    player.x = newX;
    player.y = newY;

    const screenCenterX = canvas.width / 2;
    const screenCenterY = canvas.height / 2;

    camera.x = Math.max(
      0,
      Math.min(selectedMap.size.width - canvas.width, player.x - screenCenterX)
    );

    camera.y = Math.max(
      0,
      Math.min(
        selectedMap.size.height - canvas.height,
        player.y - screenCenterY
      )
    );
  }

  player.direction = direction;
};
