import { useEffect, useRef } from "react";
import { maps } from "./Maps";
import { characters } from "./Characters";

const GameCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const player = { x: 400, y: 300, speed: 3 }; //Player starts in center
  const camera = { x: 0, y: 0 }; //Camera position

  //select character (later this we'll get from user input)
  const selectedCharacter = characters.find((c) => c.id === 1) || characters[0];
  const characterImage = new Image();
  characterImage.src = selectedCharacter.sprite;

  //select the active map from maps.ts(now it's hardcoded)
  const selectedMap = maps.find((m) => m.id === 2) || maps[0];
  const backgroundImage = new Image();
  backgroundImage.src = selectedMap.background; //get background from selectedmap

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.log("Canvas is null!");
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.log("Could not get 2D context!");
      return;
    }

    let keys: Record<string, boolean> = {}; //Track pressed keys

    const handleKeyDown = (e: KeyboardEvent) => (keys[e.key] = true);
    const handleKeyUp = (e: KeyboardEvent) => (keys[e.key] = false);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    //update character with camera
    const update = () => {
      const playerSize = 100;
      let newX = player.x;
      let newY = player.y;

      if (keys["ArrowUp"] || keys["w"]) newY -= player.speed;
      if (keys["ArrowDown"] || keys["s"]) newY += player.speed;
      if (keys["ArrowLeft"] || keys["a"]) newX -= player.speed;
      if (keys["ArrowRight"] || keys["d"]) newX += player.speed;

      //Prevent player from moving out of map bounds
      newX = Math.max(0, Math.min(selectedMap.size.width - playerSize, newX));
      newY = Math.max(0, Math.min(selectedMap.size.height - playerSize, newY));

      //Update player position
      player.x = newX;
      player.y = newY;

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

      //Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw the background manually as tiles
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
        // Fallback background
        ctx.fillStyle = "green";
        ctx.fillRect(
          0 - camera.x,
          0 - camera.y,
          selectedMap.size.width,
          selectedMap.size.height
        );
      }

      //Draw the player last (so it’s always on top)
      if (characterImage.complete && characterImage.naturalWidth > 0) {
        ctx.drawImage(
          characterImage,
          player.x - camera.x,
          player.y - camera.y,
          100,
          100
        );
      } else {
        ctx.fillStyle = "red"; // Fallback
        ctx.fillRect(player.x - camera.x, player.y - camera.y, 30, 30);
      }
    };

    const gameLoop = () => {
      update();
      draw();
      requestAnimationFrame(gameLoop);
    };

    //Only start the game loop after the grass texture loads
    backgroundImage.onload = () => {
      console.log("Grass texture loaded!");
      gameLoop();
    };

    characterImage.onload = () => {
      console.log("Character texture loaded!");
    };

    backgroundImage.onerror = () => {
      console.log("Failed to load grass texture!");
    };

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return <canvas ref={canvasRef} width={800} height={600} />;
};

export default GameCanvas;
