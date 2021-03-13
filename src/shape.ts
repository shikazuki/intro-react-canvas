import React from "react";

let id = 0;
const getUniqueId = (prefix: string = '') => {
  return `${prefix}${id++}`;
};

export class Box {
  public id: string;
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public index: number;
  public color: string;

  constructor(x: number, y: number, width: number, height: number, index: number, color: string = 'black') {
    this.id = getUniqueId('box');
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.index = index;
    this.color = color;
  }

  draw(context: CanvasRenderingContext2D, activeId: string) {
    context.fillStyle = this.color;
    context.fillRect(this.x, this.y, this.width, this.height);
    if (this.id === activeId) {
      context.lineWidth = 3;
      context.strokeStyle = 'green';
      context.strokeRect(this.x, this.y, this.width, this.height);
    }
  }

  isTouchedIn(event: React.MouseEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    if (!rect) return;
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return this.x <= x
      && x <= (this.x + this.width)
      && this.y <= y
      && y <= (this.y + this.height);
  }
}
