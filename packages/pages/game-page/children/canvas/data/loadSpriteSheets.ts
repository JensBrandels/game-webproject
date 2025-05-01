import { enemies } from "@viking/enemies";

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

  // ← Add weapon shoot sheets
  character.weapons?.forEach((w: any) => {
    Object.values(w.animations.shoot).forEach((anim: any) => {
      sheets.add(anim.sheet);
    });
  });

  // Enemy animations
  enemies.forEach((e) => {
    Object.values(e.animations).forEach((a: any) => {
      if ("sheet" in a) sheets.add(a.sheet);
      else Object.values(a).forEach((d: any) => sheets.add(d.sheet));
    });
  });

  const imgs: Record<string, HTMLImageElement> = {};
  let count = 0;

  for (const p of sheets) {
    await new Promise<void>((res) => {
      const img = new Image();
      img.src = p;
      img.onload = () => {
        imgs[p.replace(/^\/+/g, "")] = img;
        count++;
        res();
      };
    });
  }

  return imgs;
}
