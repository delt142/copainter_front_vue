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
    />

    <!-- Основное содержимое, центрированное с учетом Toolbar -->
    <div class="main-container">
      <!-- Контейнер для областей (рисования и генерации) -->
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
              :style="{ width: generationDimensions.width + 'px', height: generationDimensions.height + 'px' }"
          >
            <!-- Если resultImage пустой, можно показывать пустой фон. Если генерируется, показываем loading.gif -->
            <img
                :src="resultImage"
                alt="Сгенерированное изображение"
                v-if="resultImage"
            />
          </div>
        </div>
      </div>

      <!-- Контейнер для кнопки генерации, расположенной под окнами по центру -->
      <div class="generate-button-container">
        <button
            class="generate-btn"
            @click="generateImage"
            :disabled="isGenerating"
        >
          {{ generateButtonLabel }}
        </button>
      </div>
    </div>

    <!-- Выдвигающаяся панель со стилями -->
    <transition name="slide">
      <div v-if="showStylesPanel" class="styles-panel">
        <h3>Стили</h3>
        <ul>
          <li v-for="style in styles" :key="style.name" @click="selectStyle(style)">
            {{ style.name }}
          </li>
        </ul>
        <button class="close-btn" @click="toggleStylesPanel">
          Закрыть
        </button>
      </div>
    </transition>
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
      // Стили загружаются с backend через endpoint /styles
      styles: [],
      selectedStyle: "(No style)",
      drawingDimensions: { width: 400, height: 400 },
      generationDimensions: { width: 400, height: 400 },
      presets: [
        { drawing: { width: 400, height: 400 }, generation: { width: 800, height: 800 } },
        { drawing: { width: 600, height: 600 }, generation: { width: 600, height: 600 } },
        { drawing: { width: 800, height: 800 }, generation: { width: 400, height: 400 } }
      ],
      resultImage: "",
      showStylesPanel: false, // Флаг отображения панели со стилями
      isGenerating: false // Флаг, указывающий, идет ли генерация изображения
    };
  },
  computed: {
    generateButtonLabel() {
      // Возвращает надпись для кнопки генерации в зависимости от языка
      return this.currentLanguage === "ru" ? "Сгенерировать изображение" : "Generate Image";
    }
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
    // Переключение видимости панели со стилями
    toggleStylesPanel() {
      this.showStylesPanel = !this.showStylesPanel;
    },
    // Выбор стиля из панели – устанавливаем выбранный стиль и закрываем панель
    selectStyle(style) {
      this.selectedStyle = style.name;
      this.toggleStylesPanel();
      // Эмиттируем событие, если нужно уведомить родителя
      this.updateStyle(this.selectedStyle);
    },
    updateStyle(newStyle) {
      this.selectedStyle = newStyle;
    },
    // Выбор предустановленного варианта
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
      // Блокируем кнопку генерации, показываем GIF:
      this.isGenerating = true;
      // Устанавливаем локальный gif (например, в каталоге public)
      this.resultImage = "/loading.gif";

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
          this.resultImage = ""; // Очищаем в случае ошибки
        }
      } catch (error) {
        console.error("Ошибка при запросе:", error);
        this.resultImage = "";
      } finally {
        this.isGenerating = false; // Разблокируем кнопку в любом случае
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
  width: 40px;
  height: 40px;
  z-index: 1100;
}
.top-right-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* Основное содержимое, центрированное с учетом фиксированного Toolbar */
.main-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  margin-left: 60px; /* Отступ для Toolbar */
  box-sizing: border-box;
  padding: 20px;
}

/* Контейнер для областей (рисования и генерации) — располагаем их в одну строку */
.windows-container {
  display: flex;
  flex-direction: row;
  gap: 20px;
  justify-content: center;
  align-items: center;
}

/* Окна рисования и генерации: задаем рамки */
.drawing-window,
.generation-window {
  border: 2px solid #000;
}

/* Контейнер области генерации */
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

/* Контейнер для кнопки генерации, размещенной под окнами */
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

/* Стили для выдвигаемой панели со стилями */
.styles-panel {
  position: fixed;
  top: 0;
  left: 0;
  width: 250px;
  height: 100vh;
  background-color: #fff;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.3);
  z-index: 1200;
  padding: 20px;
  box-sizing: border-box;
}
.styles-panel h3 {
  margin-top: 0;
}
.styles-panel ul {
  list-style: none;
  padding: 0;
}
.styles-panel li {
  padding: 8px 0;
  cursor: pointer;
  border-bottom: 1px solid #ddd;
}
.styles-panel li:hover {
  background-color: #f0f0f0;
}
.styles-panel .close-btn {
  margin-top: 20px;
  padding: 6px 10px;
  cursor: pointer;
}

/* Переход для панели (выдвижение) */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}
.slide-enter,
.slide-leave-to {
  transform: translateX(-100%);
}
</style>
