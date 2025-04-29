import { updatePlayer } from "./updatePlayer";
import { updateEnemies } from "./updateEnemies";
import { handleDamage } from "./handleDamage";
import { renderFrame } from "./renderFrame";
import { useAccountStore } from "@viking/game-store";

export function startGameLoop({
  playerRef,
  keys,
  selectedMap,
  camera,
  canvas,
  ctx,
  bgCtx,
  spriteSheets,
  isHurtRef,
  isPlayingHurt,
  offscreenCanvas,
  collisionObstaclesRef,
  enemyInstancesRef,
  setShowDeathScreen,
}: {
  playerRef: React.RefObject<any>;
  keys: React.RefObject<Record<string, boolean>>;
  selectedMap: any;
  camera: { x: number; y: number };
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  bgCtx: CanvasRenderingContext2D;
  spriteSheets: Record<string, HTMLImageElement>;
  isHurtRef: React.MutableRefObject<boolean>;
  isPlayingHurt: React.MutableRefObject<boolean>;
  offscreenCanvas: HTMLCanvasElement;
  collisionObstaclesRef: React.MutableRefObject<any[]>;
  enemyInstancesRef: React.MutableRefObject<any[]>;
  setShowDeathScreen: (val: boolean) => void;
}) {
  let animationFrameId: number;

  const loop = async () => {
    // grab the latest store state
    const { account, isHurt, isDead } = useAccountStore.getState();
    const charId = account?.selectedCharacterId;
    const character = account?.characters.find((c) => c.id === charId) || null;

    if (!character || !playerRef.current?.x || !playerRef.current?.y) {
      return;
    }

    isHurtRef.current = isHurt;

    if (!isDead) {
      updatePlayer(
        playerRef.current,
        keys,
        character.id,
        {
          ...selectedMap,
          obstaclesWithCollision: collisionObstaclesRef.current,
        },
        camera,
        canvas,
        ctx
      );

      updateEnemies(enemyInstancesRef, playerRef);

      handleDamage(
        enemyInstancesRef.current,
        playerRef.current.x,
        playerRef.current.y,
        isDead
      );
    }

    await renderFrame({
      ctx,
      bgCtx,
      playerRef,
      camera,
      character,
      selectedMap,
      spriteSheets,
      isHurtRef,
      isDead,
      isPlayingHurt,
      offscreenCanvas,
      collisionObstaclesRef,
      enemyInstancesRef,
      setShowDeathScreen,
    });

    animationFrameId = requestAnimationFrame(loop);
  };

  animationFrameId = requestAnimationFrame(loop);

  return () => {
    cancelAnimationFrame(animationFrameId);
  };
}
