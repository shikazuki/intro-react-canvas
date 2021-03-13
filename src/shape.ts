
export class Box {
  private x: number;
  private y: number;
  private width: number;
  private height: number;
  private color: string;

  constructor(x: number, y: number, width: number, height: number, color: string = 'black') {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
  }

  draw(context: CanvasRenderingContext2D) {
    context.fillStyle = this.color;
    context.fillRect(this.x, this.y, this.width, this.height);
  }
}
