export function getRequiredXp(level: number): number {
  const base = 100;
  const multiplier = 1.5;
  return Math.floor(base * Math.pow(multiplier, level - 1));
}
