export const checkCollision = (
  x: number,
  y: number,
  player: any,
  obstacles: any[],
  ctx?: CanvasRenderingContext2D,
  camera?: { x: number; y: number }
) => {
  const hitbox = player.hitbox || {
    width: 16,
    height: 16,
    offsetX: 0,
    offsetY: 0,
  };

  const playerX = x - hitbox.offsetX;
  const playerY = y - hitbox.offsetY;

  if (ctx && camera) {
    // Force yellow hitbox drawing
    ctx.fillStyle = "rgba(255, 255, 0, 0.3)";
    ctx.fillRect(
      playerX - camera.x,
      playerY - camera.y,
      hitbox.width,
      hitbox.height
    );

    ctx.strokeStyle = "yellow";
    ctx.lineWidth = 2;
    ctx.strokeRect(
      playerX - camera.x,
      playerY - camera.y,
      hitbox.width,
      hitbox.height
    );
  }

  return obstacles.some((obj) => {
    return (
      playerX + hitbox.width > obj.x &&
      playerX < obj.x + obj.width &&
      playerY + hitbox.height > obj.y &&
      playerY < obj.y + obj.height
    );
  });
};
