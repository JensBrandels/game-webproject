import { useAccountStore } from "@viking/game-store";

type Frame = { x: number; y: number };

type WeaponAnimation = {
  sheet: string;
  frames: Frame[];
};

type Projectile = {
  id: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  direction: "up" | "down" | "left" | "right";
  traveled: number;
  maxDistance: number;
  speed: number;
  damage: number;
  isOrbital?: boolean;
};

type Direction = "up" | "down" | "left" | "right";

// type Params = {
//   ctx: CanvasRenderingContext2D;
//   direction: Direction;
//   position: { x: number; y: number };
//   frameIndex: number;
//   cameraOffset: { x: number; y: number };
//   spriteSheets: Record<string, HTMLImageElement>;
// };

//drawing projectile weapons
export function drawWeapon({
  ctx,
  direction,
  position,
  frameIndex,
  cameraOffset,
  spriteSheets,
}: {
  ctx: CanvasRenderingContext2D;
  direction: Direction;
  position: { x: number; y: number };
  frameIndex: number;
  cameraOffset: { x: number; y: number };
  spriteSheets: Record<string, HTMLImageElement>;
}) {
  const weapon = useAccountStore.getState().account?.weapons[0];
  if (
    !weapon ||
    weapon.type !== "projectile" ||
    !("shoot" in weapon.animations)
  )
    return;

  const shootAnimations = (weapon.animations as any).shoot as Record<
    Direction,
    WeaponAnimation
  >;
  const anim = shootAnimations[direction];
  if (!anim) return;

  const frame = anim.frames[frameIndex % anim.frames.length];
  const image = spriteSheets[anim.sheet.replace(/^\/+/g, "")];
  if (!image) return;

  const size = 32;
  // draw the sprite
  ctx.drawImage(
    image,
    frame.x,
    frame.y,
    size,
    size,
    position.x - cameraOffset.x - size / 2,
    position.y - cameraOffset.y - size / 2,
    size,
    size
  );

  // debug hitbox
  ctx.save();
  ctx.strokeStyle = "blue";
  ctx.lineWidth = 2;
  ctx.strokeRect(
    position.x - cameraOffset.x - size / 2,
    position.y - cameraOffset.y - size / 2,
    size,
    size
  );
  ctx.restore();
}

//drawing orbital weapons
export function drawOrbitalWeapons({
  ctx,
  projectiles,
  frameIndex,
  cameraOffset,
  spriteSheets,
}: {
  ctx: CanvasRenderingContext2D;
  projectiles: Projectile[];
  frameIndex: number;
  cameraOffset: { x: number; y: number };
  spriteSheets: Record<string, HTMLImageElement>;
}) {
  const orbWep = useAccountStore
    .getState()
    .account?.weapons.find((w) => w.type === "orbital");
  if (!orbWep) return;

  // only draw those with isOrbital
  projectiles.forEach((p) => {
    if (!p.isOrbital) return;

    const anim = (orbWep.animations as any).spin as WeaponAnimation;
    const frame = anim.frames[frameIndex % anim.frames.length];
    const img = spriteSheets[anim.sheet.replace(/^\/+/g, "")];
    if (!img) return;

    const srcSize = orbWep.size; // 64
    const drawSize = 32;

    if (img) {
      ctx.drawImage(
        img,
        frame.x,
        frame.y,
        srcSize,
        srcSize,
        p.x - cameraOffset.x - drawSize / 2,
        p.y - cameraOffset.y - drawSize / 2,
        drawSize,
        drawSize
      );
      const debugSize = 32; // same as your collision half-size * 2

      ctx.save();
      ctx.strokeStyle = "blue";
      ctx.lineWidth = 2;
      ctx.strokeRect(
        p.x - cameraOffset.x - debugSize / 2,
        p.y - cameraOffset.y - debugSize / 2,
        debugSize,
        debugSize
      );
      ctx.restore();
    }
  });
}
