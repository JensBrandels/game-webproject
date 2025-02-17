import { useEffect, useRef } from "react";
import { maps } from "./Maps";
import { characters } from "./Characters";
import { checkCollision } from "./Collision";

const GameCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const player = { x: 400, y: 300, speed: 3 }; // Player starts in center
  const camera = { x: 0, y: 0 }; // Camera position

  //Select character (later from user input)
  const selectedCharacter = characters.find((c) => c.id === 1) || characters[0];
  const characterImage = new Image();
  characterImage.src = selectedCharacter.sprite;

  //Select active map
  const selectedMap = maps.find((m) => m.id === 2) || maps[0];
  const backgroundImage = new Image();
  backgroundImage.src = selectedMap.background; // ✅ BACKGROUND RENDERING IS BACK

  //Load obstacle images from selectedMap
  const obstacleImages = selectedMap.obstaclesWithCollision.map((obstacle) => {
    const img = new Image();
    img.src = obstacle.sprite || "";
    return { ...obstacle, image: img };
  });

  //Load visual-only obstacles (tree crowns, decorations)
  const visualObstacleImages = selectedMap.obstaclesForVisual.map(
    (obstacle) => {
      const img = new Image();
      img.src = obstacle.sprite || "";
      return { ...obstacle, image: img };
    }
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let keys: Record<string, boolean> = {};

    const handleKeyDown = (e: KeyboardEvent) => (keys[e.key] = true);
    const handleKeyUp = (e: KeyboardEvent) => (keys[e.key] = false);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    const update = () => {
      const playerSize = 100;
      let newX = player.x;
      let newY = player.y;

      if (keys["ArrowUp"] || keys["w"]) newY -= player.speed;
      if (keys["ArrowDown"] || keys["s"]) newY += player.speed;
      if (keys["ArrowLeft"] || keys["a"]) newX -= player.speed;
      if (keys["ArrowRight"] || keys["d"]) newX += player.speed;

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
        Math.min(
          selectedMap.size.width - canvas.width,
          player.x - screenCenterX
        )
      );
      camera.y = Math.max(
        0,
        Math.min(
          selectedMap.size.height - canvas.height,
          player.y - screenCenterY
        )
      );
    };

    const draw = () => {
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // drawing the background
      if (backgroundImage.complete && backgroundImage.naturalWidth > 0) {
        for (
          let x = 0;
          x < selectedMap.size.width;
          x += backgroundImage.width
        ) {
          for (
            let y = 0;
            y < selectedMap.size.height;
            y += backgroundImage.height
          ) {
            ctx.drawImage(backgroundImage, x - camera.x, y - camera.y);
          }
        }
      } else {
        ctx.fillStyle = "green";
        ctx.fillRect(
          0 - camera.x,
          0 - camera.y,
          selectedMap.size.width,
          selectedMap.size.height
        );
      }

      //Draw obstacles with collision (trunks, rocks, etc.) BEFORE the player
      obstacleImages.forEach((obstacle) => {
        if (obstacle.image.complete) {
          ctx.drawImage(
            obstacle.image,
            obstacle.x - camera.x,
            obstacle.y - camera.y,
            obstacle.width,
            obstacle.height
          );
        }
      });

      //Draw Player
      if (characterImage.complete && characterImage.naturalWidth > 0) {
        ctx.drawImage(
          characterImage,
          player.x - camera.x,
          player.y - camera.y,
          100,
          100
        );
      }

      //Draw purely visual obstacles (tree crowns, decor, etc.) AFTER the player
      visualObstacleImages.forEach((obstacle) => {
        if (obstacle.image.complete) {
          ctx.drawImage(
            obstacle.image,
            obstacle.x - camera.x,
            obstacle.y - camera.y,
            obstacle.width,
            obstacle.height
          );
        }
      });

      // //Draw hitbox (debug mode)
      // selectedMap.obstaclesWithCollision.forEach((obstacle) => {
      //   ctx.strokeStyle = "red";
      //   ctx.lineWidth = 2;
      //   const hitboxX = obstacle.x + (obstacle.hitbox.offsetX || 0);
      //   const hitboxY = obstacle.y + (obstacle.hitbox.offsetY || 0);
      //   ctx.strokeRect(
      //     hitboxX - camera.x,
      //     hitboxY - camera.y,
      //     obstacle.hitbox.width,
      //     obstacle.hitbox.height
      //   );
      // });
    };

    const gameLoop = () => {
      update();
      draw();
      requestAnimationFrame(gameLoop);
    };

    gameLoop(); //Game starts immediately

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return <canvas ref={canvasRef} width={1280} height={720} />;
};

export default GameCanvas;
