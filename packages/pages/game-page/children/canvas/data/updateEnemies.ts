import type { RefObject } from "react";
import { enemies } from "@viking/enemies";

type EnemyInstance = {
  id: number;
  enemyId: number;
  x: number;
  y: number;
  hp: number;
  animationState: "idle" | "walk" | "death";
  frameIndex: number;
  direction?: "left" | "right" | "up" | "down";
  lastFrameTime?: number;
};

type Player = {
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  direction: string;
};

export function updateEnemies(
  enemyInstancesRef: RefObject<EnemyInstance[]>,
  playerRef: RefObject<Player>
) {
  const player = playerRef.current;
  const enemiesList = enemyInstancesRef.current;
  if (!player || !enemiesList) return;

  const playerCenterX = player.x + 16;
  const playerCenterY = player.y + 16;

  for (let i = 0; i < enemiesList.length; i++) {
    const a = enemiesList[i];
    for (let j = i + 1; j < enemiesList.length; j++) {
      const b = enemiesList[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const dist = Math.hypot(dx, dy);
      const minDist = 24;
      if (dist < minDist && dist > 0) {
        const push = (minDist - dist) / 2;
        const pushX = (dx / dist) * push;
        const pushY = (dy / dist) * push;
        a.x += pushX;
        a.y += pushY;
        b.x -= pushX;
        b.y -= pushY;
      }
    }
  }

  for (const enemy of enemiesList) {
    const enemyData = enemies.find((e) => e.id === enemy.enemyId);
    if (!enemyData) continue;

    const enemyCenterX =
      enemy.x + enemyData.hitbox.offsetX + enemyData.hitbox.width / 2;
    const enemyCenterY =
      enemy.y + enemyData.hitbox.offsetY + enemyData.hitbox.height / 2;

    const dx = playerCenterX - enemyCenterX;
    const dy = playerCenterY - enemyCenterY;
    const distance = Math.hypot(dx, dy);

    enemy.direction =
      Math.abs(dx) > Math.abs(dy)
        ? dx < 0
          ? "left"
          : "right"
        : dy < 0
        ? "up"
        : "down";

    if (!enemy.lastFrameTime) enemy.lastFrameTime = performance.now();

    if (performance.now() - enemy.lastFrameTime > 150) {
      enemy.frameIndex += 1;
      enemy.lastFrameTime = performance.now();
    }

    const minDistance = (enemyData.hitbox.width + 16) / 2;
    if (distance > minDistance) {
      const angle = Math.atan2(dy, dx);
      const speed = enemyData.movementSpeed;
      enemy.x += Math.cos(angle) * speed;
      enemy.y += Math.sin(angle) * speed;
    }
  }
}
