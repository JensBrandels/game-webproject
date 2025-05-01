import { useAccountStore } from "@viking/game-store";
import type { Weapon } from "@viking/weapons";

type Direction = "up" | "down" | "left" | "right";

type Params = {
  ctx: CanvasRenderingContext2D;
  direction: Direction;
  position: { x: number; y: number };
  frameIndex: number;
  cameraOffset: { x: number; y: number };
  spriteSheets: Record<string, HTMLImageElement>;
};

export function drawWeapon({
  ctx,
  direction,
  position,
  frameIndex,
  cameraOffset,
  spriteSheets,
}: Params) {
  const weapon: Weapon | undefined =
    useAccountStore.getState().account?.weapons[0];
  if (!weapon) return;

  const anim = weapon.animations.shoot[direction];
  const frame = anim.frames[frameIndex % anim.frames.length];

  const image = spriteSheets[anim.sheet.replace(/^\/+/g, "")];
  if (!image) return;

  ctx.drawImage(
    image,
    frame.x,
    frame.y,
    32,
    32,
    position.x - cameraOffset.x,
    position.y - cameraOffset.y,
    32,
    32
  );
}
