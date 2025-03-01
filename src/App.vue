<template>
  <div id="app">
    <!-- Панель инструментов -->
    <Toolbar
        :config="config"
        :styles="styles"
        v-model:language="language"
        @update-pen="updatePen"
        @clear-canvas="clearCanvas"
        @undo="undo"
        @redo="redo" />

    <!-- Компонент для рисования -->
    <CanvasComponent ref="canvasComponent" />

    <!-- Результат генерации -->
    <div class="result" v-if="resultImage">
      <img :src="resultImage" alt="Generated Image" />
    </div>

    <!-- Кнопка генерации изображения -->
    <button @click="generateImage">Generate Image</button>
  </div>
</template>

<script>
import Toolbar from './components/Toolbar.vue'
import CanvasComponent from './components/Canvas.vue'

export default {
  name: 'App',
  components: { Toolbar, CanvasComponent },
  data() {
    return {
      config: {},
      styles: [],
      language: 'en',
      resultImage: ''
    }
  },
  mounted() {
    this.loadConfig()
  },
  methods: {
    loadConfig() {
      fetch('/static/config.json')
          .then(response => response.json())
          .then(data => {
            this.config = data
            return fetch(data.style_file)
          })
          .then(response => response.json())
          .then(styles => {
            this.styles = styles
          })
          .catch(error => console.error('Error loading config', error))
    },
    clearCanvas() {
      this.$refs.canvasComponent.clearCanvas()
    },
    undo() {
      this.$refs.canvasComponent.undo()
    },
    redo() {
      this.$refs.canvasComponent.redo()
    },
    updatePen(updated) {
      this.$refs.canvasComponent.updatePen(updated)
    },
    generateImage() {
      const canvas = this.$refs.canvasComponent.getCanvas()
      const dataUrl = canvas.toDataURL('image/png')
      const imageData = dataUrl.split(',')[1]
      // Получаем выбранный стиль – можно расширить логику выбора в Toolbar
      const style = this.config.style || '(No style)'

      fetch('/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageData, style: style })
      })
          .then(response => response.blob())
          .then(blob => {
            this.resultImage = URL.createObjectURL(blob)
          })
          .catch(error => console.error('Error generating image:', error))
    }
  }
}
</script>

<style>
.result {
  margin-top: 20px;
}
button {
  margin-top: 20px;
}
</style>
