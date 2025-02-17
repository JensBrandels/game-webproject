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
  color: string;
  isTree?: boolean;
};
