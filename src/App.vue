<template>

  <div id="app">
    <!-- Иконка в верхнем правом углу -->
    <div class="top-right-icon">
      <img src="/top-icon.png" alt="Top Icon" />
    </div>

    <!-- Компонент Toolbar -->
    <Toolbar
        :buttonsVisibility="buttonsVisibility"
        :styles="styles"
        :language="currentLanguage"
        :languages="languages"
        :selectedStyle="selectedStyle"
        :presets="presets"
        @update-pen="updatePen"
        @clear-canvas="clearCanvas"
        @undo="undo"
        @redo="redo"
        @update-style="updateStyle"
        @preset-change="applyPreset"
        @update:language="updateLanguage"
        @toggle-styles-panel="toggleStylesPanel"
        @cycle-window-size="cycleWindowSize"
        @toggle-history="toggleHistory"
    />

    <!-- Основное содержимое -->
    <div class="main-container">
      <GeneratedImages :isVisible="showHistoryPanel" />
      <div class="windows-container">
        <!-- Область рисования -->
        <div class="drawing-window">
          <CanvasComponent
              ref="canvasComponent"
              :width="drawingDimensions.width"
              :height="drawingDimensions.height"
          />
        </div>
        <!-- Область генерации -->
        <div class="generation-window">
          <div
              class="generation-container"
              :style="{
              width: generationDimensions.width + 'px',
              height: generationDimensions.height + 'px'
            }"
          >
            <!-- Пока идёт генерация показывается GIF, иначе результат -->
            <img :src="resultImage" alt="Сгенерированное изображение" v-if="resultImage" />
          </div>
        </div>
      </div>

      <!-- Кнопка генерации изображения -->
      <div class="generate-button-container">
        <button class="generate-btn" @click="generateImage" :disabled="isGenerating">
          {{ generateButtonLabel }}
        </button>
      </div>
    </div>

    <!-- Панель со стилями -->
    <transition name="slide">
      <div v-if="showStylesPanel" class="styles-panel">
        <h3>{{ labels.styles }}</h3>
        <ul>
          <li v-for="style in styles" :key="style.name" @click="selectStyle(style)">
            {{ style.name }}
          </li>
        </ul>
        <button class="close-btn" @click="toggleStylesPanel">Закрыть</button>
      </div>
    </transition>
  </div>
</template>

<script>
import CanvasComponent from "./components/Canvas.vue";
import Toolbar from "./components/Toolbar.vue";
import GeneratedImages from "./components/GeneratedImages.vue";

export default {
  name: "App",
  components: { CanvasComponent, Toolbar, GeneratedImages },
  data() {
    return {
      currentLanguage: "en",
      languages: ["en", "ru"],
      // Стили, загружаемые с backend
      styles: [],
      selectedStyle: "(No style)",
      // Пресеты размеров окон
      presets: [
        { drawing: { width: 800, height: 800 }, generation: { width: 800, height: 800 } },
      ],
      currentPresetIndex: 0,
      drawingDimensions: { width: 800, height: 800 },
      generationDimensions: { width: 800, height: 800 },
      resultImage: "",
      showStylesPanel: false,
      isGenerating: false,
      showHistoryPanel: false,
      buttonsVisibility: {
        pencil: true,
        eraser: true,
        line: true,
        undo: true,
        redo: true,
        styles: true,
        theme: false,
        language: true,
        size: false,
        clear: true,
        info: false,
        history: true
      },
    };
  },
  computed: {
    generateButtonLabel() {
      return this.currentLanguage === "ru" ? "Сгенерировать изображение" : "Generate Image";
    },
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
    toggleStylesPanel() {
      this.showStylesPanel = !this.showStylesPanel;
    },
    toggleHistory() {
      this.showHistoryPanel = !this.showHistoryPanel;
      // Если есть конфликт со стилями панели, закройте ее
      if (this.showHistoryPanel) {
        this.showStylesPanel = false;
      }
    },
    selectStyle(style) {
      this.selectedStyle = style.name;
      this.toggleStylesPanel();
      this.updateStyle(this.selectedStyle);
    },
    updateStyle(newStyle) {
      this.selectedStyle = newStyle;
    },
    applyPreset(index) {
      const preset = this.presets[index];
      this.drawingDimensions = { ...preset.drawing };
      this.generationDimensions = { ...preset.generation };
      if (this.$refs.canvasComponent && typeof this.$refs.canvasComponent.resizeCanvas === "function") {
        this.$refs.canvasComponent.resizeCanvas(
            this.drawingDimensions.width,
            this.drawingDimensions.height
        );
      }
    },
    async generateImage() {
      this.isGenerating = true;
      // Показываем GIF на время генерации (loading.gif должен быть в public)
      // this.resultImage = "/loading.gif";
      this.resultImage = "/fin1.gif";

      const canvas = this.$refs.canvasComponent.getCanvas();
      const dataUrl = canvas.toDataURL("image/png");
      const base64Image = dataUrl.split(",")[1];

      try {
        const response = await fetch("/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image: base64Image,
            style: this.selectedStyle,
          }),
        });

        if (response.ok) {
          const blob = await response.blob();
          this.resultImage = URL.createObjectURL(blob);
        } else {
          console.error("Ошибка генерации:", await response.text());
          this.resultImage = "";
        }
      } catch (error) {
        console.error("Ошибка при запросе:", error);
        this.resultImage = "";
      } finally {
        this.isGenerating = false;
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
    updateLanguage(newLanguage) {
      this.currentLanguage = newLanguage;
    },
    cycleWindowSize() {
      // Циклически меняем пресет: увеличиваем индекс, если достигнут конец, сбрасываем на ноль
      this.currentPresetIndex = (this.currentPresetIndex + 1) % this.presets.length;
      const preset = this.presets[this.currentPresetIndex];
      this.drawingDimensions = { ...preset.drawing };
      this.generationDimensions = { ...preset.generation };
      if (this.$refs.canvasComponent && typeof this.$refs.canvasComponent.resizeCanvas === "function") {
        this.$refs.canvasComponent.resizeCanvas(
            this.drawingDimensions.width,
            this.drawingDimensions.height
        );
      }
    },
  },
};
</script>

<style scoped>
#app {
  position: relative;
  min-height: 100vh;
  max-width: 100%;
}
.top-right-icon {
  position: fixed;
  top: 10px;
  right: 10px;
  width: 400px;
  z-index: 1100;
}
.top-right-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.main-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  margin-left: 60px;
  box-sizing: border-box;
  padding: 20px;
}
.windows-container {
  display: flex;
  flex-direction: row;
  gap: 20px;
  justify-content: center;
  align-items: center;
}
.drawing-window,
.generation-window {
  border: 2px solid #000;
}
.generation-container {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fff;
  width: 100%;
  height: 100%;
}
.generation-container img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.generate-button-container {
  margin-top: 20px;
  width: 100%;
  display: flex;
  justify-content: center;
}
.generate-btn {
  padding: 12px 20px;
  font-size: 18px;
  //font-weight: bold;
  color: #fff;
  background-color: #28be46;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
}

.generate-btn:hover {
  background-color: #1a8f34;
  transform: scale(1.05);
}

.generate-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  transform: none;
}



.toolbar-base button {
  width: 40px;
  height: 60px;
  margin-bottom: 15px;
  background: none;
  border: none;
  cursor: pointer;
  color: #fff;
  outline: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}
.toolbar-base button.selected {
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

.pen-size-control input[type="range"] {
  width: 100%;
}


/* Выдвигаемая панель со стилями */
.styles-panel {
  position: fixed;
  top: 0;
  left: 60px;
  width: 190px;
  height: 100vh;
  background-color: #28be46;
  border-left: 1px solid #fff;
  padding: 20px;
  box-sizing: border-box;
  z-index: 1200;
}
.styles-panel h3 {
  margin-top: 0;
  color: #fff;
}
.styles-panel ul {
  list-style: none;
  padding: 0;
  margin: 0;
  color: #fff;
}
.styles-panel li {
  padding: 8px 0;
  cursor: pointer;
  border-bottom: 1px solid rgba(255, 255, 255, 0.5);
}
.styles-panel li:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

</style>
