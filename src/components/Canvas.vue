<template>
  <canvas ref="canvas" width="600" height="600"></canvas>
</template>

<script>
export default {
  name: 'CanvasComponent',
  data() {
    return {
      canvas: null,
      ctx: null,
      penSize: 2,
      penColor: 'black',
      drawing: false,
      undoStack: [],
      redoStack: [],
      savedImageData: null,
      isLineMode: false,
      startPoint: null
    }
  },
  mounted() {
    this.canvas = this.$refs.canvas
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true })
    this.clearCanvas()
    this.setupListeners()
  },
  methods: {
    clearCanvas() {
      if (this.ctx) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.ctx.fillStyle = 'white'
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
        this.saveState()
      }
    },
    saveState() {
      const dataUrl = this.canvas.toDataURL()
      this.undoStack.push(dataUrl)
      if (this.undoStack.length > 20) {
        this.undoStack.shift()
      }
      this.redoStack = []
    },
    undo() {
      if (this.undoStack.length > 0) {
        this.redoStack.push(this.canvas.toDataURL())
        const previousState = this.undoStack.pop()
        const img = new Image()
        img.src = previousState
        img.onload = () => {
          this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
          this.ctx.fillStyle = 'white'
          this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
          this.ctx.drawImage(img, 0, 0)
        }
      }
    },
    redo() {
      if (this.redoStack.length > 0) {
        this.undoStack.push(this.canvas.toDataURL())
        const nextState = this.redoStack.pop()
        const img = new Image()
        img.src = nextState
        img.onload = () => {
          this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
          this.ctx.fillStyle = 'white'
          this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
          this.ctx.drawImage(img, 0, 0)
        }
      }
    },
    setupListeners() {
      this.canvas.addEventListener('mousedown', this.onMouseDown)
      this.canvas.addEventListener('mousemove', this.onMouseMove)
      this.canvas.addEventListener('mouseup', this.onMouseUp)
      this.canvas.addEventListener('touchstart', this.onTouchStart)
      this.canvas.addEventListener('touchmove', this.onTouchMove, { passive: false })
      this.canvas.addEventListener('touchend', this.onTouchEnd)
    },
    getCanvas() {
      return this.canvas
    },
    updatePen(updated) {
      if (updated.penSize) {
        this.penSize = updated.penSize
      }
      if (updated.penColor) {
        this.penColor = updated.penColor
      }
      if (updated.tool === 'eraser') {
        this.penColor = 'white'
      } else if (updated.tool === 'pencil') {
        this.penColor = 'black'
      } else if (updated.tool === 'line') {
        this.isLineMode = true
      }
    },
    onMouseDown(event) {
      const rect = this.canvas.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      if (this.isLineMode) {
        this.startPoint = { x, y }
        this.savedImageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
      } else {
        this.drawing = true
        this.ctx.beginPath()
        this.ctx.moveTo(x, y)
      }
      this.saveState()
    },
    onMouseMove(event) {
      const rect = this.canvas.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      if (this.drawing) {
        if (this.isLineMode && this.startPoint) {
          this.ctx.putImageData(this.savedImageData, 0, 0)
          this.drawLine(this.startPoint, { x, y })
        } else {
          this.draw({ x, y })
        }
      }
    },
    onMouseUp(event) {
      const rect = this.canvas.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      if (this.isLineMode && this.startPoint) {
        this.ctx.putImageData(this.savedImageData, 0, 0)
        this.drawLine(this.startPoint, { x, y })
        this.isLineMode = false
      } else if (this.drawing) {
        this.draw({ x, y })
      }
      this.drawing = false
      this.startPoint = null
      this.saveState()
    },
    draw({ x, y }) {
      this.ctx.lineWidth = this.penSize
      this.ctx.lineCap = 'round'
      this.ctx.strokeStyle = this.penColor
      this.ctx.lineTo(x, y)
      this.ctx.stroke()
      this.ctx.moveTo(x, y)
    },
    drawLine(start, end) {
      this.ctx.lineWidth = this.penSize
      this.ctx.lineCap = 'round'
      this.ctx.strokeStyle = this.penColor
      this.ctx.beginPath()
      this.ctx.moveTo(start.x, start.y)
      this.ctx.lineTo(end.x, end.y)
      this.ctx.stroke()
    },
    onTouchStart(event) {
      event.preventDefault()
      const touch = event.touches[0]
      const rect = this.canvas.getBoundingClientRect()
      const x = touch.clientX - rect.left
      const y = touch.clientY - rect.top

      if (this.isLineMode) {
        this.startPoint = { x, y }
        this.savedImageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
      } else {
        this.drawing = true
        this.ctx.beginPath()
        this.ctx.moveTo(x, y)
      }
      this.saveState()
    },
    onTouchMove(event) {
      event.preventDefault()
      const touch = event.touches[0]
      const rect = this.canvas.getBoundingClientRect()
      const x = touch.clientX - rect.left
      const y = touch.clientY - rect.top

      if (this.drawing) {
        if (this.isLineMode && this.startPoint) {
          this.ctx.putImageData(this.savedImageData, 0, 0)
          this.drawLine(this.startPoint, { x, y })
        } else {
          this.draw({ x, y })
        }
      }
    },
    onTouchEnd(event) {
      if (this.drawing) {
        this.drawing = false
        this.saveState()
      }
    }
  }
}
</script>

<style scoped>
canvas {
  border: 1px solid #000;
}
</style>
