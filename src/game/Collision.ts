export const checkCollision = (
  x: number,
  y: number,
  player: any,
  obstacles: any[]
) => {
  const playerHitbox = player.hitbox || { width: 100, height: 100 };
  const playerOffsetX = player.hitbox?.offsetX || 0;
  const playerOffsetY = player.hitbox?.offsetY || 0;

  // Adjusted player hitbox position
  const playerX = x + playerOffsetX;
  const playerY = y + playerOffsetY;

  return obstacles.some((obj) => {
    const hitbox = obj.hitbox || { width: obj.width, height: obj.height };
    const obstacleOffsetX = obj.hitbox?.offsetX || 0;
    const obstacleOffsetY = obj.hitbox?.offsetY || 0;

    // Ensure the obstacle hitbox is properly aligned
    const hitboxX = obj.x + obstacleOffsetX;
    const hitboxY = obj.y + obstacleOffsetY;

    const isCollidingFromSides =
      playerX + playerHitbox.width > hitboxX &&
      playerX < hitboxX + hitbox.width;

    const isCollidingFromTop =
      playerY + playerHitbox.height > hitboxY &&
      playerY < hitboxY + hitbox.height;

    const isCollidingFromBottom =
      playerY + playerHitbox.height < hitboxY + hitbox.height + 10;

    return isCollidingFromSides && isCollidingFromTop && isCollidingFromBottom;
  });
};
