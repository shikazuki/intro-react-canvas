import React from "react";

let id = 0;
const getUniqueId = (prefix: string = '') => {
  return `${prefix}${id++}`;
};

export class Shape {
  constructor(
    protected _id: string,
    protected _x: number,
    protected _y: number,
    protected _width: number,
    protected _height: number,
    protected _index: number) {
    this._id = _id || getUniqueId(this.getPrefixKey());
  }

  protected getPrefixKey() {
    return '';
  }

  get id() { return this._id; }
  get x() { return this._x; }
  set x(value: number) { this._x = value; }
  get y() { return this._y; }
  set y(value: number) { this._y = value; }
  get width() { return this._width; }
  set width(value: number) { this._width = value; }
  get height() { return this._height; }
  set height(value: number) { this._height = value; }
  get index() { return this._index; }


  draw(context: CanvasRenderingContext2D, activatedId: string) {
    context.fillStyle = 'rgba(0,0,0,0)';
    context.fillRect(this._x, this._y, this._width, this._height);

    if (this._id === activatedId) {
      this.drawBorder(context);
      this.drawResizePoint(context);
    }
  }


  drawBorder(context: CanvasRenderingContext2D) {
    context.lineWidth = 3;
    context.strokeStyle = '#33CCFF';
    context.setLineDash([3]);
    context.strokeRect(this._x, this._y, this._width, this._height);
    context.setLineDash([]);
  }


  drawResizePoint(context: CanvasRenderingContext2D) {
    context.beginPath();
    context.fillStyle = '#fff';
    context.arc(this._x + this._width, this._y + this._height, 5, 0, 360);
    context.fill();
    context.lineWidth = 2;
    context.strokeStyle = '#33CCFF';
    context.stroke();
  }

  isTouchedIn(event: React.MouseEvent<HTMLCanvasElement>): boolean {
    const rect = event.currentTarget.getBoundingClientRect();
    if (!rect) return false;
    const diffX = (event.clientX - rect.left) - this._x;
    const diffY = (event.clientY - rect.top) - this._y;
    const isInX = Math.sign(this._width) === Math.sign(diffX) && Math.abs(diffX) <= Math.abs(this._width);
    const isInY = Math.sign(this._height) === Math.sign(diffY) && Math.abs(diffY) <= Math.abs(this._height);
    return isInX && isInY;
  }

  isTouchedResizePoint(event: React.MouseEvent<HTMLCanvasElement>): boolean {
    const rect = event.currentTarget.getBoundingClientRect();
    if (!rect) return false;
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return Math.pow(this._x + this._width - x, 2) + Math.pow(this._y + this._height - y, 2) <= Math.pow(5, 2);
  }


  clone(): Shape {
    return new Shape(this._id, this._x, this._y, this._width, this._height, this._index);
  }
}


export class TextBox extends Shape {
  constructor(
    id: string,
    x: number,
    y: number,
    width: number,
    height: number,
    index: number,
    protected _text: string = '',
    protected _fontColor: string = '#000',
    protected _color: string = '#f0f0f0',
    protected _isEditing: boolean = false
  ) {
    super(id, x, y, width, height, index);
  }

  get text() { return this._text; }
  set text(value: string) { this._text = value; }
  get fontColor() { return this._fontColor; }
  set fontColor(value: string) { this._fontColor = value; }
  get color() { return this._color; }
  set color(value: string) { this._color = value; }
  get isEditing() { return this._isEditing; }
  set isEditing(value: boolean) { this._isEditing = value; }

  protected getPrefixKey(): string {
    return 'box';
  }

  draw(context: CanvasRenderingContext2D, activeId: string) {
    context.fillStyle = this._color;
    context.fillRect(this.x, this.y, this.width, this.height);
    super.draw(context, activeId);

    if (!this._isEditing) {
      this.drawText(context);
    }
  }

  drawText(context: CanvasRenderingContext2D) {
    context.font = '24px sans-serif';
    context.fillStyle = this._fontColor;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(this._text, this.x + (this.width / 2), this.y + (this.height / 2));
  }

  clone(): TextBox {
    return new TextBox(
      this._id,
      this._x,
      this._y,
      this._width,
      this._height,
      this._index,
      this._text,
      this._fontColor,
      this._color,
      this._isEditing,
      );
  }
}

export class CircleBox extends Shape {

  constructor(
    id: string,
    x: number,
    y: number,
    width: number,
    height: number,
    index: number,
    protected _color: string = '#f0f0f0',
  ) {
    super(id, x, y, width, height, index);
  }


  get width() { return this._width; }
  set width(value: number) {
    if (value >= 0) {
      this._width = value;
    }
  }
  get height() { return this._height; }
  set height(value: number) {
    if (value >= 0) {
      this._height = value;
    }
  }
  get color() { return this._color; }
  set color(value: string) { this._color = value; }

  protected getPrefixKey(): string {
    return 'circle';
  }

  draw(context: CanvasRenderingContext2D, activeId: string) {
    this.drawCircle(context);
    super.draw(context, activeId);
  }

  drawCircle(context: CanvasRenderingContext2D) {
    context.beginPath();
    context.fillStyle = this._color;
    const radiusX = this._width / 2;
    const radiusY = this._height / 2;
    context.ellipse(this.x + radiusX, this.y + radiusY, radiusX, radiusY, 0, 0, 360);
    context.fill()
  }

  clone(): CircleBox {
    return new CircleBox(
      this._id,
      this._x,
      this._y,
      this._width,
      this._height,
      this._index,
      this._color,
    );
  }
}
