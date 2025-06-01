import { Tool } from "../../components/Canvas";
import { getExistingShapes } from "./http";

type Shape =
  | {
      type: "rectangle";
      x: number;
      y: number;
      width: number;
      height: number;
      dbId?: number;
      localId?: string;
    }
  | {
      type: "circle";
      centerX: number;
      centerY: number;
      radius: number;
      dbId?: number;
      localId?: string;
    }
  | {
      type: "pencil";
      points: { x: number; y: number }[];
      dbId?: number;
      localId?: string;
    }
  | {
      type: "line";
      startX: number;
      startY: number;
      endX: number;
      endY: number;
      dbId?: number;
      localId?: string;
    }
  | {
      type: "diamond";
      centerX: number;
      centerY: number;
      width: number;
      height: number;
      dbId?: number;
      localId?: string;
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
  private eraserRadius = 10;
  private eraserTrail: { x: number; y: number }[] = [];
  private isErasing = false;
  private localShapeIdCounter = 0;
  private theme: "light" | "dark" = "light";

  socket: WebSocket;

  constructor(
    canvas: HTMLCanvasElement,
    roomID: string,
    socket: WebSocket,
    devicePixelRatio: number = 1,
    theme: "light" | "dark" = "light"
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.existingShapes = [];
    this.roomID = roomID;
    this.socket = socket;
    this.clicked = false;
    this.currentPencilPath = [];
    this.devicePixelRatio = devicePixelRatio;
    this.theme = theme;
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

    if (tool !== "eraser") {
      this.eraserTrail = [];
      this.isErasing = false;
    }

    if (tool === "eraser") {
      this.canvas.style.cursor = "none";
    } else {
      this.canvas.style.cursor = "crosshair";
    }
  }

  setTheme(theme: "light" | "dark") {
    this.theme = theme;
    this.clearCanvas();
  }

  private getStrokeColor(): string {
    return this.theme === "dark" ? "#e0e0e0" : "#1e1e1e";
  }

  async init() {
    this.existingShapes = await getExistingShapes(this.roomID);
    this.clearCanvas();
  }

  initHandlers() {
    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === "chat") {
        const payload = JSON.parse(message.message);
        const incomingShape = payload.shape as Shape;

        let existingShapeIndex = -1;
        let shapeToUpdate: Shape | undefined = undefined;

        if (incomingShape.localId) {
          existingShapeIndex = this.existingShapes.findIndex(
            (s) => s.localId === incomingShape.localId
          );
          if (existingShapeIndex !== -1) {
            shapeToUpdate = this.existingShapes[existingShapeIndex];
            if (shapeToUpdate && incomingShape.dbId && !shapeToUpdate.dbId) {
              shapeToUpdate.dbId = incomingShape.dbId;
            }
          }
        }

        if (!shapeToUpdate && incomingShape.dbId) {
          const dbIndex = this.existingShapes.findIndex(
            (s) => s.dbId === incomingShape.dbId
          );
          if (dbIndex !== -1) {
            shapeToUpdate = this.existingShapes[dbIndex];
          }
        }

        if (!shapeToUpdate) {
          const structurallyExists = this.existingShapes.some((localShape) => {
            if (
              incomingShape.dbId &&
              localShape.dbId &&
              incomingShape.dbId === localShape.dbId
            ) {
              return true;
            }
            return this.shapesAreEqual(localShape, incomingShape);
          });

          if (!structurallyExists) {
            this.existingShapes.push(incomingShape);
          }
        }

        this.clearCanvas();
      } else if (message.type == "erase_chat") {
        const erasedDbId =
          typeof message.chatId === "string"
            ? parseInt(message.chatId, 10)
            : message.chatId;

        if (erasedDbId !== undefined && !isNaN(erasedDbId)) {
          this.existingShapes = this.existingShapes.filter(
            (shape) => shape.dbId !== erasedDbId
          );
          this.clearCanvas();
        }
      }
    };
  }

  private shapesAreEqual(shape1: Shape, shape2: Shape): boolean {
    if (shape1.type !== shape2.type) return false;

    switch (shape1.type) {
      case "rectangle":
        if (shape2.type !== "rectangle") return false;
        return (
          shape1.x === shape2.x &&
          shape1.y === shape2.y &&
          shape1.width === shape2.width &&
          shape1.height === shape2.height
        );
      case "circle":
        if (shape2.type !== "circle") return false;
        return (
          shape1.centerX === shape2.centerX &&
          shape1.centerY === shape2.centerY &&
          shape1.radius === shape2.radius
        );
      case "line":
        if (shape2.type !== "line") return false;
        return (
          shape1.startX === shape2.startX &&
          shape1.startY === shape2.startY &&
          shape1.endX === shape2.endX &&
          shape1.endY === shape2.endY
        );
      case "pencil":
        if (shape2.type !== "pencil") return false;
        return JSON.stringify(shape1.points) === JSON.stringify(shape2.points);
      case "diamond":
        if (shape2.type !== "diamond") return false;
        return (
          shape1.centerX === shape2.centerX &&
          shape1.centerY === shape2.centerY &&
          shape1.width === shape2.width &&
          shape1.height === shape2.height
        );
      default:
        return false;
    }
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = this.theme === "dark" ? "#1a1a1a" : "#f8f9fa";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const strokeColor = this.getStrokeColor();

    this.existingShapes.map((shape) => {
      this.ctx.strokeStyle = strokeColor;
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
        this.drawArrowhead(shape.startX, shape.startY, shape.endX, shape.endY);
      } else if (shape.type === "diamond") {
        this.drawDiamond(
          shape.centerX,
          shape.centerY,
          shape.width,
          shape.height
        );
      }
    });

    if (this.selectedTool === "pencil" && this.currentPencilPath.length > 0) {
      const firstCurrentPoint = this.currentPencilPath[0];
      if (firstCurrentPoint !== undefined) {
        this.ctx.strokeStyle = this.getStrokeColor();
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

    if (this.selectedTool === "eraser") {
      this.isErasing = true;
      this.eraserTrail = [{ x: coords.x, y: coords.y }];
      this.eraseShapesAt(coords.x, coords.y);
    } else if (this.selectedTool === "pencil") {
      this.currentPencilPath = [{ x: this.startX, y: this.startY }];
    }
  };

  mouseUpHandler = (e: MouseEvent) => {
    this.clicked = false;

    if (this.selectedTool === "eraser") {
      this.isErasing = false;
      this.eraserTrail = [];
      this.clearCanvas();
      return;
    }

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
    } else if (selectedTool === "diamond") {
      const centerX = this.startX + width / 2;
      const centerY = this.startY + height / 2;
      shape = {
        type: "diamond",
        centerX,
        centerY,
        width: Math.abs(width),
        height: Math.abs(height),
      };
    }

    if (!shape) {
      return;
    }

    const localId = `local_${Date.now()}_${this.localShapeIdCounter++}`;
    shape.localId = localId;

    this.existingShapes.push(shape);

    const messagePayload = {
      type: "chat",
      message: JSON.stringify({
        shape,
      }),
      roomID: this.roomID,
    };
    this.socket.send(JSON.stringify(messagePayload));
  };

  mouseMoveHandler = (e: MouseEvent) => {
    const coords = this.getMouseCoordinates(e);
    const currentX = coords.x;
    const currentY = coords.y;

    if (this.selectedTool === "eraser") {
      this.canvas.style.cursor = "none";
    } else {
      this.canvas.style.cursor = "crosshair";
    }

    if (this.clicked) {
      if (this.selectedTool === "eraser") {
        this.eraserTrail.push({ x: currentX, y: currentY });
        this.eraseShapesAt(currentX, currentY);
        this.clearCanvas();
        this.drawEraserTrail();
        this.drawEraserCursor(currentX, currentY);
      } else {
        this.clearCanvas();
        this.ctx.strokeStyle = this.getStrokeColor();
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
          this.drawArrowhead(this.startX, this.startY, currentX, currentY);
        } else if (selectedTool === "diamond") {
          const width = currentX - this.startX;
          const height = currentY - this.startY;
          const centerX = this.startX + width / 2;
          const centerY = this.startY + height / 2;
          this.drawDiamond(centerX, centerY, width, height);
        }
      }
    }

    if (this.selectedTool === "eraser" && !this.isErasing) {
      this.clearCanvas();
      this.drawEraserCursor(currentX, currentY);
    }
  };

  private drawEraserCursor(x: number, y: number): void {
    this.ctx.save();

    this.ctx.fillStyle = "rgba(255, 107, 107, 0.3)";
    this.ctx.strokeStyle = "#ff6b6b";
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(x, y, this.eraserRadius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.fillStyle = "#ff6b6b";
    this.ctx.beginPath();
    this.ctx.arc(x, y, 2, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  private drawEraserTrail(): void {
    if (this.eraserTrail.length < 2) return;

    this.ctx.save();
    this.ctx.strokeStyle = "rgba(255, 107, 107, 0.4)";
    this.ctx.lineWidth = this.eraserRadius * 2;
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";
    this.ctx.globalCompositeOperation = "source-over";

    this.ctx.beginPath();
    const firstPoint = this.eraserTrail[0];
    if (firstPoint) {
      this.ctx.moveTo(firstPoint.x, firstPoint.y);
    }

    for (let i = 1; i < this.eraserTrail.length; i++) {
      const point = this.eraserTrail[i];
      if (point) {
        this.ctx.lineTo(point.x, point.y);
      }
    }

    this.ctx.stroke();
    this.ctx.restore();
  }

  initMouseHandlers() {
    this.canvas.addEventListener("mousedown", this.mouseDownHandler);
    this.canvas.addEventListener("mouseup", this.mouseUpHandler);
    this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
  }

  private isPointInShape(x: number, y: number, shape: Shape): boolean {
    const tolerance = this.eraserRadius;

    switch (shape.type) {
      case "rectangle":
        return (
          x >= shape.x - tolerance &&
          x <= shape.x + shape.width + tolerance &&
          y >= shape.y - tolerance &&
          y <= shape.y + shape.height + tolerance
        );

      case "circle": {
        const distance = Math.sqrt(
          Math.pow(x - shape.centerX, 2) + Math.pow(y - shape.centerY, 2)
        );
        return distance <= Math.abs(shape.radius) + tolerance;
      }

      case "line":
        return (
          this.distanceToLineSegment(
            x,
            y,
            shape.startX,
            shape.startY,
            shape.endX,
            shape.endY
          ) <= tolerance
        );

      case "pencil":
        return shape.points.some((point) => {
          const distance = Math.sqrt(
            Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2)
          );
          return distance <= tolerance;
        });

      case "diamond": {

        const halfWidth = shape.width / 2;
        const halfHeight = shape.height / 2;
        return (
          x >= shape.centerX - halfWidth - tolerance &&
          x <= shape.centerX + halfWidth + tolerance &&
          y >= shape.centerY - halfHeight - tolerance &&
          y <= shape.centerY + halfHeight + tolerance
        );
      }

      default:
        return false;
    }
  }

  private distanceToLineSegment(
    px: number,
    py: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): number {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;

    if (lenSq !== 0) {
      param = dot / lenSq;
    }

    let xx, yy;

    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    const dx = px - xx;
    const dy = py - yy;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private eraseShapesAt(x: number, y: number): void {
    const shapesToErase = this.existingShapes.filter((shape) =>
      this.isPointInShape(x, y, shape)
    );

    shapesToErase.forEach((shape) => {
      this.existingShapes = this.existingShapes.filter((s) => {
        if (s.dbId && shape.dbId) {
          return s.dbId !== shape.dbId;
        }
        if (s.localId && shape.localId) {
          return s.localId !== shape.localId;
        }
        return s !== shape;
      });

      if (shape.dbId) {
        const erasePayload = {
          type: "erase_chat",
          chatId: shape.dbId,
          roomID: this.roomID,
        };
        this.socket.send(JSON.stringify(erasePayload));
      }
    });

    if (shapesToErase.length > 0) {
      this.clearCanvas();
    }
  }

  private drawArrowhead(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    angle = Math.PI / 6,
    length = 10
  ) {
    const dx = toX - fromX;
    const dy = toY - fromY;
    const lineAngle = Math.atan2(dy, dx);

    this.ctx.beginPath();
    this.ctx.moveTo(toX, toY);
    this.ctx.lineTo(
      toX - length * Math.cos(lineAngle - angle),
      toY - length * Math.sin(lineAngle - angle)
    );
    this.ctx.moveTo(toX, toY);
    this.ctx.lineTo(
      toX - length * Math.cos(lineAngle + angle),
      toY - length * Math.sin(lineAngle + angle)
    );
    this.ctx.stroke();
  }

  private drawDiamond(
    centerX: number,
    centerY: number,
    width: number,
    height: number
  ) {
    const halfWidth = Math.abs(width) / 2;
    const halfHeight = Math.abs(height) / 2;

    this.ctx.beginPath();
    this.ctx.moveTo(centerX, centerY - halfHeight); // top
    this.ctx.lineTo(centerX + halfWidth, centerY); // right
    this.ctx.lineTo(centerX, centerY + halfHeight); // bottom
    this.ctx.lineTo(centerX - halfWidth, centerY); // left
    this.ctx.closePath();
    this.ctx.stroke();
  }

  downloadAsJPEG(slug?: string) {
    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d")!;

    tempCanvas.width = this.canvas.width;
    tempCanvas.height = this.canvas.height;

    tempCtx.fillStyle = "#ffffff";
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    tempCtx.drawImage(this.canvas, 0, 0);

    const link = document.createElement("a");
    link.download = `canvas-${slug || Date.now()}.jpeg`;
    link.href = tempCanvas.toDataURL("image/jpeg", 0.9);
    link.click();
  }
}
