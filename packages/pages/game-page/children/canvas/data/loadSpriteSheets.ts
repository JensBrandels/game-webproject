import { enemies } from "@viking/enemies";
import { weapons as allWeapons } from "@viking/weapons";

export async function loadSpriteSheets(
  character: any
): Promise<Record<string, HTMLImageElement>> {
  const sheets = new Set<string>();

  // Character animations
  sheets.add(character.animations.idle.sheet);
  Object.values(character.animations.walk).forEach((a: any) =>
    sheets.add(a.sheet)
  );
  if (character.animations.hurt?.sheet)
    sheets.add(character.animations.hurt.sheet);
  if (character.animations.death?.sheet)
    sheets.add(character.animations.death.sheet);

  // Weapon animations (projectile + orbital)
  allWeapons.forEach((w) => {
    if ("shoot" in w.animations) {
      Object.values(w.animations.shoot).forEach((a: any) =>
        sheets.add(a.sheet)
      );
    }
    if ("spin" in w.animations) {
      sheets.add((w.animations as any).spin.sheet);
    }
  });

  // Enemy animations
  enemies.forEach((e) => {
    Object.values(e.animations).forEach((a: any) => {
      if ("sheet" in a) {
        sheets.add(a.sheet);
      } else {
        Object.values(a).forEach((d: any) => sheets.add(d.sheet));
      }
    });
  });

  const imgs: Record<string, HTMLImageElement> = {};

  for (const path of sheets) {
    await new Promise<void>((resolve) => {
      const img = new Image();
      img.src = path;
      img.onload = () => {
        imgs[path.replace(/^\/+/g, "")] = img;
        resolve();
      };
      img.onerror = () => {
        console.warn(`Failed to load sprite sheet: ${path}`);
        resolve();
      };
    });
  }

  return imgs;
}
