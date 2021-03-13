import React from "react";

let id = 0;
const getUniqueId = (prefix: string = '') => {
  return `${prefix}${id++}`;
};

export class Box {
  public id: string;
  public x: number;
  public y: number;
  public touchedX: number = 0;
  public touchedY: number = 0;
  public width: number;
  public height: number;
  public index: number;
  public color: string;
  public text: string = 'sample';
  public isEditing: boolean = false;

  constructor(x: number, y: number, width: number, height: number, index: number, color: string = '#e0e0e0') {
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

    if (!this.isEditing) {
      this.drawText(context);
    }

    if (this.id === activeId) {
      this.drawBorder(context);
      this.drawResizePoint(context);
    }
  }

  drawBorder(context: CanvasRenderingContext2D) {
    context.lineWidth = 2;
    context.strokeStyle = '#000';
    context.setLineDash([3]);
    context.strokeRect(this.x, this.y, this.width, this.height);
    context.setLineDash([]);
  }

  drawResizePoint(context: CanvasRenderingContext2D) {
    context.beginPath();
    context.fillStyle = '#33CCFF';
    context.arc(this.x + this.width, this.y + this.height, 5, 0, 360);
    context.fill();
    context.lineWidth = 1;
    context.strokeStyle = 'white';
    context.stroke();
  }

  drawText(context: CanvasRenderingContext2D) {
    context.font = '24px sans-serif';
    context.fillStyle = '#000';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(this.text, this.x + (this.width / 2), this.y + (this.height / 2));
  }

  isTouchedIn(event: React.MouseEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    if (!rect) return;
    const diffX = (event.clientX - rect.left) - this.x;
    const diffY = (event.clientY - rect.top) - this.y;
    const isInX = Math.sign(this.width) === Math.sign(diffX) && Math.abs(diffX) <= Math.abs(this.width);
    const isInY = Math.sign(this.height) === Math.sign(diffY) && Math.abs(diffY) <= Math.abs(this.height);
    return isInX && isInY;
  }

  isTouchedResizePoint(event: React.MouseEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    if (!rect) return;
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return Math.pow(this.x + this.width - x, 2) + Math.pow(this.y + this.height - y, 2) <= Math.pow(5, 2);
  }
}
