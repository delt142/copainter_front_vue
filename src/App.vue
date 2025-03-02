<template>
  <div id="app">
    <!-- Иконка в верхнем правом углу -->
    <div class="top-right-icon">
      <img src="/top-icon.png" alt="Top Icon" />
    </div>

    <!-- Фиксированная панель инструментов слева (Toolbar) -->
    <Toolbar
        :styles="styles"
        :language="currentLanguage"
        :languages="languages"
        :presets="presets"
        @update-pen="updatePen"
        @clear-canvas="clearCanvas"
        @undo="undo"
        @redo="redo"
        @update-style="updateStyle"
        @preset-change="applyPreset"
        @update:language="updateLanguage"
    />

    <!-- Основное содержимое, центрированное по вертикали и горизонтали -->
    <div class="main-container">
      <!-- Контейнер для окон, расположенных в одну строку -->
      <div class="windows-container">
        <!-- Область рисования (Canvas) -->
        <div class="drawing-window">
          <CanvasComponent
              ref="canvasComponent"
              :width="drawingDimensions.width"
              :height="drawingDimensions.height"
          />
        </div>
        <!-- Область генерации с рамкой -->
        <div class="generation-window">
          <div
              class="generation-container"
              :style="{
              width: generationDimensions.width + 'px',
              height: generationDimensions.height + 'px'
            }"
          >
            <img
                :src="resultImage"
                alt="Сгенерированное изображение"
                v-if="resultImage"
            />
          </div>
        </div>
      </div>

      <!-- Контейнер для кнопки генерации, размещённой по центру под окнами -->
      <div class="generate-button-container">
        <button class="generate-btn" @click="generateImage">
          Сгенерировать изображение
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import CanvasComponent from "./components/Canvas.vue";
import Toolbar from "./components/Toolbar.vue";

export default {
  name: "App",
  components: { CanvasComponent, Toolbar },
  data() {
    return {
      currentLanguage: "en",
      languages: ["en", "ru"],
      // Стили загружаются с бэкенда через endpoint /styles
      styles: [],
      selectedStyle: "(No style)",
      drawingDimensions: { width: 400, height: 400 },
      generationDimensions: { width: 400, height: 400 },
      presets: [
        {
          drawing: { width: 400, height: 400 },
          generation: { width: 800, height: 800 }
        },
        {
          drawing: { width: 600, height: 600 },
          generation: { width: 600, height: 600 }
        },
        {
          drawing: { width: 800, height: 800 },
          generation: { width: 400, height: 400 }
        }
      ],
      resultImage: ""
    };
  },
  mounted() {
    this.fetchStyles();
  },
  methods: {
    async fetchStyles() {
      try {
        const response = await fetch("/styles");
        if (response.ok) {
          this.styles = await response.json();
          console.log("Загруженные стили:", this.styles);
        } else {
          console.error("Ошибка загрузки стилей:", await response.text());
        }
      } catch (error) {
        console.error("Ошибка запроса стилей:", error);
      }
    },
    // Обработка выбора предустановленного варианта
    applyPreset(index) {
      const preset = this.presets[index];
      this.drawingDimensions = { ...preset.drawing };
      this.generationDimensions = { ...preset.generation };
      this.$refs.canvasComponent.resizeCanvas(
          this.drawingDimensions.width,
          this.drawingDimensions.height
      );
    },
    async generateImage() {
      const canvas = this.$refs.canvasComponent.getCanvas();
      let dataUrl = canvas.toDataURL("image/png");
      const base64Image = dataUrl.split(",")[1];

      try {
        const response = await fetch("/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image: base64Image,
            style: this.selectedStyle
          })
        });

        if (response.ok) {
          const blob = await response.blob();
          this.resultImage = URL.createObjectURL(blob);
        } else {
          console.error("Ошибка генерации:", await response.text());
        }
      } catch (error) {
        console.error("Ошибка при запросе:", error);
      }
    },
    updatePen(updated) {
      this.$refs.canvasComponent.updatePen(updated);
    },
    clearCanvas() {
      this.$refs.canvasComponent.clearCanvas();
    },
    undo() {
      this.$refs.canvasComponent.undo();
    },
    redo() {
      this.$refs.canvasComponent.redo();
    },
    updateStyle(newStyle) {
      this.selectedStyle = newStyle;
    },
    updateLanguage(newLanguage) {
      this.currentLanguage = newLanguage;
    }
  }
};
</script>

<style scoped>
/* Основной контейнер приложения */
#app {
  position: relative;
  min-height: 100vh;
  max-width: 100%;
}

/* Иконка в верхнем правом углу */
.top-right-icon {
  position: fixed;
  top: 10px;
  right: 10px;
  width: 500px;
  z-index: 1100;
}
.top-right-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* Основное содержимое, центрированное по вертикали и горизонтали */
.main-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  margin-left: 60px; /* Отступ, чтобы не перекрывать фиксированный Toolbar */
  box-sizing: border-box;
  padding: 20px;
}

/* Контейнер для окон — расположение в одну строку */
.windows-container {
  display: flex;
  flex-direction: row;
  gap: 20px;
  justify-content: center;
  align-items: center;
}

/* Окна рисования и генерации: задаём рамки */
.drawing-window,
.generation-window {
  border: 2px solid #000;
  /* Если есть padding, он может уменьшать размеры содержимого */
  padding: 0; /* или задайте его одинаково, как и для drawing-window */
  box-sizing: border-box;
}


/* Контейнер области генерации */
.generation-container {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fff;
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.generation-container img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* Контейнер для кнопки генерации, размещённой под окнами по центру */
.generate-button-container {
  margin-top: 20px;
  width: 100%;
  display: flex;
  justify-content: center;
}
.generate-btn {
  padding: 8px 12px;
  font-size: 16px;
  cursor: pointer;
}
</style>
