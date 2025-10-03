export default {
  name: "CanvasComponent",
  props: {
    width: {
      type: Number,
      default: 400
    },
    height: {
      type: Number,
      default: 400
    }
  },
  data() {
    return {
      canvas: null,
      ctx: null,
      canvasWidth: this.width,
      canvasHeight: this.height,
      penSize: 2,
      penColor: "black",
      defaultPenColor: "black",
      drawing: false,
      undoStack: [],
      redoStack: [],
      savedImageData: null,
      currentTool: "pencil",
      startPoint: null,
      visualBackgroundColor: " #928e8e10"
    };
  },
  mounted() {
    this.canvas = this.$refs.canvas;
    this.ctx = this.canvas.getContext("2d", { willReadFrequently: true });
    this.initializeCanvas();
    this.setupListeners();
  },
  methods: {
    initializeCanvas() {
      this.ctx.fillStyle = this.visualBackgroundColor;
      this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    },
    clearCanvas() {
      this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      this.ctx.fillStyle = this.visualBackgroundColor;
      this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
      this.saveState();
    },
    getWhiteBackgroundDataUrl() {
        // Сохраняем текущее содержимое
        const currentImageData = this.ctx.getImageData(0, 0, this.canvasWidth, this.canvasHeight);

        // Заливаем белым фоном
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

        // Восстанавливаем содержимое поверх белого фона
        this.ctx.putImageData(currentImageData, 0, 0);

        // Получаем dataUrl с белым фоном
        const dataUrl = this.canvas.toDataURL('image/png');

        // Восстанавливаем визуальное содержимое в том же состоянии
        this.ctx.putImageData(currentImageData, 0, 0);

        return dataUrl;
    },
    saveState() {
      const dataUrl = this.canvas.toDataURL();
      this.undoStack.push(dataUrl);
      if (this.undoStack.length > 20) {
        this.undoStack.shift();
      }
      this.redoStack = [];
    },
    undo() {
      if (this.undoStack.length > 0) {
        this.redoStack.push(this.canvas.toDataURL());
        const previousState = this.undoStack.pop();
        const img = new Image();
        img.src = previousState;
        img.onload = () => {
          this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
          this.ctx.fillStyle = "white";
          this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
          this.ctx.drawImage(img, 0, 0);
        };
      }
    },
    redo() {
      if (this.redoStack.length > 0) {
        this.undoStack.push(this.canvas.toDataURL());
        const nextState = this.redoStack.pop();
        const img = new Image();
        img.src = nextState;
        img.onload = () => {
          this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
          this.ctx.fillStyle = "white";
          this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
          this.ctx.drawImage(img, 0, 0);
        };
      }
    },
    setupListeners() {
      this.canvas.addEventListener("mousedown", this.onMouseDown);
      this.canvas.addEventListener("mousemove", this.onMouseMove);
      this.canvas.addEventListener("mouseup", this.onMouseUp);
      this.canvas.addEventListener("touchstart", this.onTouchStart, { passive: false });
      this.canvas.addEventListener("touchmove", this.onTouchMove, { passive: false });
      this.canvas.addEventListener("touchend", this.onTouchEnd);
    },
    getCanvas() {
      return this.canvas;
    },
    updatePen(updated) {
      if (updated.penSize !== undefined) {
        this.penSize = updated.penSize;
      }
      if (updated.penColor !== undefined) {
        if (this.currentTool !== "eraser") {
          this.defaultPenColor = updated.penColor;
          this.penColor = updated.penColor;
        }
      }
      if (updated.tool) {
        if (updated.tool === "eraser") {
          this.currentTool = "eraser";
          this.penColor = "#FFFFFF";
        } else if (updated.tool === "pencil") {
          this.currentTool = "pencil";
          this.penColor = this.defaultPenColor;
        } else if (updated.tool === "line") {
          this.currentTool = "line";
        }
      }
    },
    onMouseDown(event) {
      const rect = this.canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      this.saveState();
      this.drawing = true;
      if (this.currentTool === "line") {
        this.startPoint = { x, y };
        this.savedImageData = this.ctx.getImageData(0, 0, this.canvasWidth, this.canvasHeight);
      } else {
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
      }
    },
    onMouseMove(event) {
      if (!this.drawing) return;
      const rect = this.canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      if (this.currentTool === "line" && this.startPoint) {
        this.ctx.putImageData(this.savedImageData, 0, 0);
        this.drawLine(this.startPoint, { x, y });
      } else {
        this.draw({ x, y });
      }
    },
    onMouseUp(event) {
      const rect = this.canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      if (this.currentTool === "line" && this.startPoint) {
        this.ctx.putImageData(this.savedImageData, 0, 0);
        this.drawLine(this.startPoint, { x, y });
        this.startPoint = null;
      } else if (this.currentTool !== "line") {
        this.draw({ x, y });
      }
      this.drawing = false;
    },
    draw({ x, y }) {
      this.ctx.lineWidth = this.penSize;
      this.ctx.lineCap = "round";
      this.ctx.strokeStyle = this.penColor;
      this.ctx.lineTo(x, y);
      this.ctx.stroke();
      this.ctx.moveTo(x, y);
    },
    drawLine(start, end) {
      this.ctx.lineWidth = this.penSize;
      this.ctx.lineCap = "round";
      this.ctx.strokeStyle = this.penColor;
      this.ctx.beginPath();
      this.ctx.moveTo(start.x, start.y);
      this.ctx.lineTo(end.x, end.y);
      this.ctx.stroke();
    },
    onTouchStart(event) {
      event.preventDefault();
      const touch = event.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      this.drawing = true;
      if (this.currentTool === "line") {
        this.startPoint = { x, y };
        this.savedImageData = this.ctx.getImageData(0, 0, this.canvasWidth, this.canvasHeight);
      } else {
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
      }
      this.saveState();
    },
    onTouchMove(event) {
      event.preventDefault();
      const touch = event.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      if (!this.drawing) return;
      if (this.currentTool === "line" && this.startPoint) {
        this.ctx.putImageData(this.savedImageData, 0, 0);
        this.drawLine(this.startPoint, { x, y });
      } else {
        this.draw({ x, y });
      }
    },
    onTouchEnd() {
      if (this.drawing) {
        this.drawing = false;
        this.saveState();
      }
    },
    resizeCanvas(newWidth, newHeight) {
      const tempDataUrl = this.canvas.toDataURL();
      const oldWidth = this.canvasWidth;
      const oldHeight = this.canvasHeight;

      this.canvasWidth = newWidth;
      this.canvasHeight = newHeight;
      this.canvas.width = newWidth;
      this.canvas.height = newHeight;

      const image = new Image();
      image.src = tempDataUrl;
      image.onload = () => {
        this.ctx.drawImage(image, 0, 0, oldWidth, oldHeight, 0, 0, newWidth, newHeight);
      };
    }
  },
  watch: {
    width(newWidth) {
      this.resizeCanvas(newWidth, this.height);
    },
    height(newHeight) {
      this.resizeCanvas(this.width, newHeight);
    }
  }
};
