import { Tool } from "../../components/Canvas";
import { getExistingShapes } from "./http";

type Shape =
  | {
      type: "rectangle";
      x: number;
      y: number;
      width: number;
      height: number;
    }
  | {
      type: "circle";
      centerX: number;
      centerY: number;
      radius: number;
    }
  | {
      type: "pencil";
      points: { x: number; y: number }[];
    }
  | {
      type: "line";
      startX: number;
      startY: number;
      endX: number;
      endY: number;
    };

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private existingShapes: Shape[];
  private roomID: string;
  private clicked: boolean;
  private startX = 0;
  private startY = 0;
  private selectedTool: Tool = "circle";
  private currentPencilPath: { x: number; y: number }[];
  private devicePixelRatio: number;

  socket: WebSocket;

  constructor(
    canvas: HTMLCanvasElement,
    roomID: string,
    socket: WebSocket,
    devicePixelRatio: number = 1
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.existingShapes = [];
    this.roomID = roomID;
    this.socket = socket;
    this.clicked = false;
    this.currentPencilPath = [];
    this.devicePixelRatio = devicePixelRatio;
    this.init();
    this.initHandlers();
    this.initMouseHandlers();
    this.setupCanvasContext();
  }

  private setupCanvasContext() {
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = "high";
  }

  handleResize() {
    this.setupCanvasContext();
    this.clearCanvas();
  }

  private getMouseCoordinates(e: MouseEvent): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  destroy() {
    this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
    this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
    this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
  }

  setTool(tool: Tool) {
    this.selectedTool = tool;
    if (tool === "pencil") {
      this.currentPencilPath = [];
    }
  }

  async init() {
    this.existingShapes = await getExistingShapes(this.roomID);
    this.clearCanvas();
  }

  initHandlers() {
    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type == "chat") {
        const parsedShape = JSON.parse(message.shapes);
        this.existingShapes.push(parsedShape.shape);
        this.clearCanvas();
      }
    };
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "#f8f9fa";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.existingShapes.map((shape) => {
      this.ctx.strokeStyle = "#1e1e1e";
      this.ctx.lineWidth = 2;
      this.ctx.lineCap = "round";
      this.ctx.lineJoin = "round";

      if (shape.type === "rectangle") {
        this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
      } else if (shape.type === "circle") {
        this.ctx.beginPath();
        this.ctx.arc(
          shape.centerX,
          shape.centerY,
          Math.abs(shape.radius),
          0,
          Math.PI * 2
        );
        this.ctx.stroke();
        this.ctx.closePath();
      } else if (shape.type === "pencil") {
        if (shape.points && shape.points.length > 0) {
          const firstPoint = shape.points[0];
          if (firstPoint !== undefined) {
            this.ctx.beginPath();
            this.ctx.moveTo(firstPoint.x, firstPoint.y);
            for (let i = 1; i < shape.points.length; i++) {
              const point = shape.points[i];
              if (point !== undefined) {
                this.ctx.lineTo(point.x, point.y);
              }
            }
            this.ctx.stroke();
          }
        }
      } else if (shape.type === "line") {
        this.ctx.beginPath();
        this.ctx.moveTo(shape.startX, shape.startY);
        this.ctx.lineTo(shape.endX, shape.endY);
        this.ctx.stroke();
      }
    });

    if (this.selectedTool === "pencil" && this.currentPencilPath.length > 0) {
      const firstCurrentPoint = this.currentPencilPath[0];
      if (firstCurrentPoint !== undefined) {
        this.ctx.strokeStyle = "#1e1e1e";
        this.ctx.lineWidth = 2;
        this.ctx.lineCap = "round";
        this.ctx.lineJoin = "round";
        this.ctx.beginPath();
        this.ctx.moveTo(firstCurrentPoint.x, firstCurrentPoint.y);
        for (let i = 1; i < this.currentPencilPath.length; i++) {
          const currentPoint = this.currentPencilPath[i];
          if (currentPoint !== undefined) {
            this.ctx.lineTo(currentPoint.x, currentPoint.y);
          }
        }
        this.ctx.stroke();
      }
    }
  }

  mouseDownHandler = (e: MouseEvent) => {
    this.clicked = true;
    const coords = this.getMouseCoordinates(e);
    this.startX = coords.x;
    this.startY = coords.y;
    if (this.selectedTool === "pencil") {
      this.currentPencilPath = [{ x: this.startX, y: this.startY }];
    }
  };

  mouseUpHandler = (e: MouseEvent) => {
    this.clicked = false;
    const coords = this.getMouseCoordinates(e);
    const width = coords.x - this.startX;
    const height = coords.y - this.startY;

    const selectedTool = this.selectedTool;
    let shape: Shape | null = null;
    if (selectedTool === "rectangle") {
      shape = {
        type: "rectangle",
        x: this.startX,
        y: this.startY,
        height,
        width,
      };
    } else if (selectedTool === "circle") {
      const radius = Math.max(Math.abs(width), Math.abs(height)) / 2;
      shape = {
        type: "circle",
        radius: radius,
        centerX: this.startX + (width > 0 ? radius : -radius),
        centerY: this.startY + (height > 0 ? radius : -radius),
      };
    } else if (selectedTool === "pencil") {
      if (this.currentPencilPath.length > 0) {
        const lastPoint =
          this.currentPencilPath[this.currentPencilPath.length - 1];
        if (
          lastPoint !== undefined &&
          (lastPoint.x !== coords.x || lastPoint.y !== coords.y)
        ) {
          this.currentPencilPath.push({ x: coords.x, y: coords.y });
        }
        shape = {
          type: "pencil",
          points: [...this.currentPencilPath],
        };
      }
      this.currentPencilPath = [];
    } else if (selectedTool === "line") {
      shape = {
        type: "line",
        startX: this.startX,
        startY: this.startY,
        endX: coords.x,
        endY: coords.y,
      };
    }

    if (!shape) {
      return;
    }

    this.existingShapes.push(shape);

    this.socket.send(
      JSON.stringify({
        type: "chat",
        message: JSON.stringify({
          shape,
        }),
        roomID: this.roomID,
      })
    );
  };

  mouseMoveHandler = (e: MouseEvent) => {
    if (this.clicked) {
      const coords = this.getMouseCoordinates(e);
      const currentX = coords.x;
      const currentY = coords.y;
      this.clearCanvas();
      this.ctx.strokeStyle = "#1e1e1e";
      this.ctx.lineWidth = 2;
      this.ctx.lineCap = "round";
      this.ctx.lineJoin = "round";

      const selectedTool = this.selectedTool;
      if (selectedTool === "rectangle") {
        const width = currentX - this.startX;
        const height = currentY - this.startY;
        this.ctx.strokeRect(this.startX, this.startY, width, height);
      } else if (selectedTool === "circle") {
        const width = currentX - this.startX;
        const height = currentY - this.startY;
        const radius = Math.max(Math.abs(width), Math.abs(height)) / 2;
        const centerX = this.startX + (width > 0 ? radius : -radius);
        const centerY = this.startY + (height > 0 ? radius : -radius);
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, Math.abs(radius), 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.closePath();
      } else if (selectedTool === "pencil") {
        this.currentPencilPath.push({ x: currentX, y: currentY });
      } else if (selectedTool === "line") {
        this.ctx.beginPath();
        this.ctx.moveTo(this.startX, this.startY);
        this.ctx.lineTo(currentX, currentY);
        this.ctx.stroke();
      }
    }
  };

  initMouseHandlers() {
    this.canvas.addEventListener("mousedown", this.mouseDownHandler);
    this.canvas.addEventListener("mouseup", this.mouseUpHandler);
    this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
  }
}
