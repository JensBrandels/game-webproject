import { characters } from "../Characters";

const animationState = new Map<
  number,
  {
    frameIndex: number;
    frameTimer: number;
    lastAnimKey?: string;
  }
>();
const frameSpeed = 10;

export const drawPlayer = (
  ctx: CanvasRenderingContext2D,
  player: {
    x: number;
    y: number;
    prevX?: number;
    prevY?: number;
    direction?: string;
  },
  camera: { x: number; y: number },
  selectedCharacterId: number,
  spriteSheets: Record<string, HTMLImageElement>
) => {
  const character = characters.find((c) => c.id === selectedCharacterId);
  if (!character) return;

  const direction = player.direction || "down";
  const isMoving = player.x !== player.prevX || player.y !== player.prevY;
  const dir = direction as keyof typeof character.animations.walk;

  const animData = isMoving
    ? character.animations.walk?.[dir] || character.animations.idle
    : character.animations.idle;

  if (!animData?.frames || animData.frames.length === 0) {
    console.warn("Missing animation frames for direction:", dir);
    return;
  }

  const image = spriteSheets[animData.sheet.replace(/^\/+/, "")];
  if (!image) {
    console.warn("Missing image for:", animData.sheet);
    return;
  }

  if (!animationState.has(selectedCharacterId)) {
    animationState.set(selectedCharacterId, {
      frameIndex: 0,
      frameTimer: 0,
      lastAnimKey: "",
    });
  }

  const state = animationState.get(selectedCharacterId)!;
  const animKey = animData.sheet + "|" + direction;

  if (state.lastAnimKey !== animKey) {
    state.frameIndex = 0;
    state.frameTimer = 0;
    state.lastAnimKey = animKey;
  }

  state.frameTimer++;
  if (state.frameTimer >= frameSpeed) {
    state.frameIndex = (state.frameIndex + 1) % animData.frames.length;
    state.frameTimer = 0;
  }

  if (state.frameIndex >= animData.frames.length) {
    state.frameIndex = 0;
  }

  const frame = animData.frames[state.frameIndex];
  // const flipX = (animData as any).shouldFlipX;

  ctx.drawImage(
    image,
    frame.x,
    frame.y,
    32,
    32,
    player.x - camera.x - 16,
    player.y - camera.y - 16,
    32,
    32
  );
};
