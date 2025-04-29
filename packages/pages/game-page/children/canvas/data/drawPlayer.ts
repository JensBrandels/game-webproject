import { useAccountStore } from "@viking/game-store";

export const animationState = new Map<
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
  spriteSheets: Record<string, HTMLImageElement>,
  isHurt: boolean,
  isDead: boolean,
  isPlayingHurt: { current: boolean }
): boolean => {
  const account = useAccountStore.getState().account;
  const character =
    account?.characters.find((c) => c.id === selectedCharacterId) || null;
  if (
    !character ||
    !player ||
    typeof player.x !== "number" ||
    typeof player.y !== "number" ||
    typeof character.hp !== "number"
  ) {
    return false;
  }

  const direction = player.direction || "down";
  const isMoving = player.x !== player.prevX || player.y !== player.prevY;
  const dir = direction as keyof typeof character.animations.walk;

  // 💀 DEATH animation
  if ((isDead || character.hp <= 0) && character.animations.death) {
    if (!player || player.x == null || player.y == null) return false;
    const deathAnim = character.animations.death;
    const image = spriteSheets[deathAnim.sheet.replace(/^\/+/g, "")];
    if (!image || deathAnim.frames.length === 0) return false;

    const deathFrameSpeed = 30;

    if (!animationState.has(character.id)) {
      animationState.set(character.id, {
        frameIndex: 0,
        frameTimer: 0,
        lastAnimKey: "death",
      });
    }

    const state = animationState.get(character.id)!;

    state.frameTimer++;
    if (state.frameTimer >= deathFrameSpeed) {
      if (state.frameIndex < deathAnim.frames.length - 1) {
        state.frameIndex++;
      }
      state.frameTimer = 0;
    }

    const frame = deathAnim.frames[state.frameIndex];

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

    return state.frameIndex === deathAnim.frames.length - 1;
  }

  // 🐷 HURT animation
  if (
    isHurt &&
    !isDead &&
    character.animations.hurt &&
    character.animations.hurt.frames &&
    character.animations.hurt.frames.length > 0
  ) {
    isPlayingHurt.current = true;

    const hurtAnim = character.animations.hurt;
    const image = spriteSheets[hurtAnim.sheet.replace(/^\/+/g, "")];
    if (!image) return false;

    const frame = hurtAnim.frames[0];

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

    drawHpBar(ctx, character.hp, character.maxHp ?? 120, player, camera);

    requestAnimationFrame(() => {
      isPlayingHurt.current = false;
    });

    return false;
  }

  // 🧍 NORMAL idle / walk animation
  const animData = isMoving
    ? character.animations.walk?.[dir] || character.animations.idle
    : character.animations.idle;

  if (!animData?.frames || animData.frames.length === 0) return false;

  const animKey = animData.sheet + "|" + direction;
  const image = spriteSheets[animData.sheet.replace(/^\/+/g, "")];
  if (!image) return false;

  if (!animationState.has(selectedCharacterId)) {
    animationState.set(selectedCharacterId, {
      frameIndex: 0,
      frameTimer: 0,
      lastAnimKey: "",
    });
  }

  const state = animationState.get(selectedCharacterId)!;

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

  const frame = animData.frames[state.frameIndex];

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

  drawHpBar(ctx, character.hp, character.maxHp ?? 120, player, camera);

  return false;
};

// === ❤️ Draw HP bar above player ===
function drawHpBar(
  ctx: CanvasRenderingContext2D,
  hp: number,
  maxHp: number,
  player: { x: number; y: number },
  camera: { x: number; y: number }
) {
  const barWidth = 32;
  const barHeight = 5;
  const hpPercent = Math.max(0, Math.min(1, hp / maxHp));
  const x = player.x - camera.x - barWidth / 2;
  const y = player.y - camera.y - 26;

  ctx.fillStyle = "black";
  ctx.fillRect(x, y, barWidth, barHeight);

  ctx.fillStyle = "red";
  ctx.fillRect(x + 1, y + 1, (barWidth - 2) * hpPercent, barHeight - 2);
}
