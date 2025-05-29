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

  socket: WebSocket;

  constructor(canvas: HTMLCanvasElement, roomID: string, socket: WebSocket) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.existingShapes = [];
    this.roomID = roomID;
    this.socket = socket;
    this.clicked = false;
    this.currentPencilPath = [];
    this.init();
    this.initHandlers();
    this.initMouseHandlers();
  }

  destroy() {
    this.canvas.removeEventListener("mousedown", this.mouseDownHandler);

    this.canvas.removeEventListener("mouseup", this.mouseUpHandler);

    this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
  }

  setTool(tool: "circle" | "pencil" | "rectangle" | "line") {
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
    this.ctx.fillStyle = "rgba(0, 0, 0)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.existingShapes.map((shape) => {
      this.ctx.strokeStyle = "rgba(255, 255, 255)";
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

    // Draw current pencil path if any
    if (this.selectedTool === "pencil" && this.currentPencilPath.length > 0) {
      const firstCurrentPoint = this.currentPencilPath[0];
      if (firstCurrentPoint !== undefined) {
        this.ctx.strokeStyle = "rgba(255, 255, 255)"; // Or a different color for current drawing
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

  mouseDownHandler = (e: { clientX: number; clientY: number }) => {
    this.clicked = true;
    this.startX = e.clientX;
    this.startY = e.clientY;
    if (this.selectedTool === "pencil") {
      this.currentPencilPath = [{ x: this.startX, y: this.startY }];
    }
  };
  mouseUpHandler = (e: { clientX: number; clientY: number }) => {
    this.clicked = false;
    const width = e.clientX - this.startX;
    const height = e.clientY - this.startY;

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
          (lastPoint.x !== e.clientX || lastPoint.y !== e.clientY)
        ) {
          this.currentPencilPath.push({ x: e.clientX, y: e.clientY });
        }
        shape = {
          type: "pencil",
          points: [...this.currentPencilPath],
        };
      }
      this.currentPencilPath = []; // Clear current path
    } else if (selectedTool === "line") {
      shape = {
        type: "line",
        startX: this.startX,
        startY: this.startY,
        endX: e.clientX,
        endY: e.clientY,
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
  mouseMoveHandler = (e: { clientX: number; clientY: number }) => {
    if (this.clicked) {
      const currentX = e.clientX;
      const currentY = e.clientY;
      this.clearCanvas();
      this.ctx.strokeStyle = "rgba(255, 255, 255)";
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
        // The drawing of the current path is handled by clearCanvas
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
