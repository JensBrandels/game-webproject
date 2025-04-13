export type Enemy = {
  id: number;
  name: string;
  hp: number;
  movementSpeed: number;
  damage: number;
  hitbox: {
    width: number;
    height: number;
    offsetX: number;
    offsetY: number;
  };
  animations: {
    idle: Animation;
    walk: {
      up: Animation;
      down: Animation;
      left: Animation;
      right: Animation;
    };
    hurt: Animation;
    death: Animation;
  };
};
