import React from "react";

let id = 0;
const getUniqueId = (prefix: string = '') => {
  return `${prefix}${id++}`;
};

export class Shape {
  public id: string;
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public index: number;
  public color: string;


  constructor(id: string, x: number, y: number, width: number, height: number, index: number, color: string = 'rgba(0,0,0)') {
    this.id = id || getUniqueId(this.getPrefixKey());
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.index = index;
    this.color = color;
  }

  protected getPrefixKey() {
    return '';
  }

  draw(context: CanvasRenderingContext2D, activatedId: string) {
    context.fillStyle = this.color;
    context.fillRect(this.x, this.y, this.width, this.height);

    if (this.id === activatedId) {
      this.drawBorder(context);
      this.drawResizePoint(context);
    }
  }


  drawBorder(context: CanvasRenderingContext2D) {
    context.lineWidth = 3;
    context.strokeStyle = '#33CCFF';
    context.setLineDash([3]);
    context.strokeRect(this.x, this.y, this.width, this.height);
    context.setLineDash([]);
  }


  drawResizePoint(context: CanvasRenderingContext2D) {
    context.beginPath();
    context.fillStyle = '#fff';
    context.arc(this.x + this.width, this.y + this.height, 5, 0, 360);
    context.fill();
    context.lineWidth = 2;
    context.strokeStyle = '#33CCFF';
    context.stroke();
  }

  isTouchedIn(event: React.MouseEvent<HTMLCanvasElement>): boolean {
    const rect = event.currentTarget.getBoundingClientRect();
    if (!rect) return false;
    const diffX = (event.clientX - rect.left) - this.x;
    const diffY = (event.clientY - rect.top) - this.y;
    const isInX = Math.sign(this.width) === Math.sign(diffX) && Math.abs(diffX) <= Math.abs(this.width);
    const isInY = Math.sign(this.height) === Math.sign(diffY) && Math.abs(diffY) <= Math.abs(this.height);
    return isInX && isInY;
  }

  isTouchedResizePoint(event: React.MouseEvent<HTMLCanvasElement>): boolean {
    const rect = event.currentTarget.getBoundingClientRect();
    if (!rect) return false;
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return Math.pow(this.x + this.width - x, 2) + Math.pow(this.y + this.height - y, 2) <= Math.pow(5, 2);
  }


  clone(): Shape {
    return new Shape(this.id, this.x, this.y, this.width, this.height, this.index, this.color);
  }
}


export class TextBox extends Shape {
  public text: string = '';
  public fontColor: string = '#000';
  public isEditing: boolean = false;

  constructor(id: string, x: number, y: number, width: number, height: number, index: number, color: string = '#f0f0f0') {
    super(id, x, y, width, height, index, color);
  }

  protected getPrefixKey(): string {
    return 'box';
  }

  draw(context: CanvasRenderingContext2D, activeId: string) {
    super.draw(context, activeId);

    if (!this.isEditing) {
      this.drawText(context);
    }
  }

  drawText(context: CanvasRenderingContext2D) {
    context.font = '24px sans-serif';
    context.fillStyle = this.fontColor;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(this.text, this.x + (this.width / 2), this.y + (this.height / 2));
  }

  clone(): TextBox {
    const box = new TextBox(this.id, this.x, this.y, this.width, this.height, this.index, this.color);
    box.text = this.text;
    box.fontColor = this.fontColor;
    box.isEditing = this.isEditing;
    return box;
  }
}
