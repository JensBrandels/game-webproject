export type Obstacle = {
  id: number;
  width: number;
  height: number;
  hitbox: {
    width: number;
    height: number;
    offsetX?: number;
    offsetY?: number;
  };
  sprite?: string;
  image?: HTMLImageElement;
  color: string;
  isTree?: boolean;
};
