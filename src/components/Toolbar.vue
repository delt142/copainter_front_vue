<template>
  <div class="toolbar-wrapper">
    <!-- Base Panel -->
    <div class="toolbar-base">
      <div class="logo-container">
        <img src="/logo.png" alt="Logo" class="logo" />
      </div>

      <!-- Main Tools -->
      <div class="tools">
        <button
            v-if="buttonsVisibility.pencil"
            :class="{ selected: selectedTool === 'pencil' }"
            @click="setTool('pencil')"
        >
          <img :src="toolIcons.pencil" alt="Pencil Icon" class="icon" />
          <span class="btn-label">{{ labels.pencil }}</span>
        </button>
        <button
            v-if="buttonsVisibility.eraser"
            :class="{ selected: selectedTool === 'eraser' }"
            @click="setTool('eraser')"
        >
          <img :src="toolIcons.eraser" alt="Eraser Icon" class="icon" />
          <span class="btn-label">{{ labels.eraser }}</span>
        </button>
        <button
            v-if="buttonsVisibility.line"
            :class="{ selected: selectedTool === 'line' }"
            @click="setTool('line')"
        >
          <img :src="toolIcons.line" alt="Line Icon" class="icon" />
          <span class="btn-label">{{ labels.line }}</span>
        </button>
        <button v-if="buttonsVisibility.undo" @click="undoAction">
          <img :src="toolIcons.undo" alt="Undo Icon" class="icon" />
          <span class="btn-label">{{ labels.undo }}</span>
        </button>
        <button v-if="buttonsVisibility.redo" @click="redoAction">
          <img :src="toolIcons.redo" alt="Redo Icon" class="icon" />
          <span class="btn-label">{{ labels.redo }}</span>
        </button>
      </div>

      <!-- Pen Size Control -->
      <div class="pen-size-control">
        <input
            type="range"
            min="1"
            max="24"
            v-model.number="localPenSize"
            @input="updateBrushSize"
        />
        <div class="pen-size-preview-container">
          <div
              class="pen-size-preview"
              :style="{ width: localPenSize + 'px', height: localPenSize + 'px' }"
          ></div>
        </div>
        <span class="pen-size-label">{{ localPenSize }} px</span>
      </div>

      <!-- Bottom Controls -->
      <div class="bottom-controls">
        <!-- Стили -->
        <button v-if="buttonsVisibility.styles" @click.stop="toggleStylesPanel">
          <span class="icon">🎨</span>
          <span class="btn-label">{{ labels.styles }}</span>
          <span class="selected-style">{{ selectedStyle }}</span>
        </button>
        <!-- Тема -->
        <button
            v-if="buttonsVisibility.theme"
            @click="toggleTheme"
            class="theme-toggle-btn"
        >
          <span class="icon">{{ isDarkTheme ? '☀️' : '🌙' }}</span>
          <span class="btn-label">{{ labels.theme }}</span>
        </button>
        <!-- Язык -->
        <button
            v-if="buttonsVisibility.language"
            @click="changeLanguage"
        >
          <span class="icon">{{ selectedLanguage === 'en' ? 'EU' : 'RU' }}</span>
          <span class="btn-label">{{ labels.language }}</span>
        </button>
        <button
            v-if="buttonsVisibility.size"
            @click="cycleWindowSize"
        >
          <img :src="toolIcons.size" alt="Size Icon" class="icon" />
          <span class="btn-label">{{ labels.size }}</span>
        </button>
        <button
            v-if="buttonsVisibility.clear"
            @click="clearCanvas"
        >
          <img :src="toolIcons.clear" alt="Clear Icon" class="icon" />
          <span class="btn-label">{{ labels.clear }}</span>
        </button>
        <button
            v-if="buttonsVisibility.info"
            @click="showInfo"
        >
          <img :src="toolIcons.info" alt="Info Icon" class="icon" />
          <span class="btn-label">{{ labels.info }}</span>
        </button>
        <button
            v-if="buttonsVisibility.history"
            @click="$emit('toggle-history')"
        >
          📂 <span class="btn-label">История</span>
        </button>
        <!-- Кнопка для показа QR-картинок -->
        <button @click="toggleQRImages">
          <span class="icon">📷</span>
          <span class="btn-label">ссылки</span>
        </button>
      </div>
    </div>

    <!-- Styles Panel -->
    <transition name="slide">
      <div
          v-if="showStylesPanel"
          ref="stylesPanel"
          class="styles-panel"
          @click.stop
      >
        <h3>{{ labels.styles }}</h3>
        <ul>
          <li v-for="style in styles" :key="style.name" @click="selectStyle(style)">
            {{ style.name }}
          </li>
        </ul>
      </div>
    </transition>

    <!-- Блок для отображения QR-картинок с подписями -->
    <transition name="fade">
      <div v-if="showQRImages" class="qr-images">
        <figure class="qr-item">
          <img src="/qr1.png" alt="QR 1" />
          <figcaption>Галерея</figcaption>
        </figure>
        <figure class="qr-item">
          <img src="/qr2.png" alt="QR 2" />
          <figcaption>Сайт ИШИТР</figcaption>
        </figure>
      </div>
    </transition>

  </div>
</template>

<script>
export default {
  name: "Toolbar",
  props: {
    language: {
      type: String,
      default: "en"
    },
    languages: {
      type: Array,
      default: () => ["en", "ru"]
    },
    selectedStyle: {
      type: String,
      default: "(No style)"
    },
    styles: {
      type: Array,
      default: () => []
    },
    buttonsVisibility: {
      type: Object,
      default: () => ({
        pencil: true,
        eraser: true,
        line: true,
        undo: true,
        redo: true,
        styles: true,
        theme: true,
        language: true,
        size: false,
        clear: true,
        info: false,
        history: true
      })
    }
  },
  data() {
    return {
      selectedTool: "pencil",
      selectedLanguage: this.language,
      isDarkTheme: false,
      localPenSize: 2,
      localPenColor: "#000000",
      showStylesPanel: false,
      showHistoryPanel: false,
      showQRImages: false, // новое свойство для QR-картинок
    };
  },
  computed: {
    toolIcons() {
      const prefix = this.isDarkTheme
          ? "/public/toolbar_ico/dark_ico/"
          : "/public/toolbar_ico/light_ico/";
      return {
        pencil: `${prefix}pencil.svg`,
        eraser: `${prefix}eraser.svg`,
        line: `${prefix}line.svg`,
        undo: `${prefix}undo.svg`,
        redo: `${prefix}redo.svg`,
        clear: `${prefix}clear.svg`,
        info: `${prefix}info.svg`,
        size: `${prefix}size.svg`
      };
    },
    labels() {
      return this.selectedLanguage === "ru"
          ? {
            pencil: "Карандаш",
            eraser: "Ластик",
            line: "Линия",
            undo: "Отменить",
            redo: "Повторить",
            styles: "Стили",
            theme: "Тема",
            language: "Язык",
            clear: "Очистить",
            info: "Инфо",
            size: "Размеры"
          }
          : {
            pencil: "Pencil",
            eraser: "Eraser",
            line: "Line",
            undo: "Undo",
            redo: "Redo",
            styles: "Styles",
            theme: "Theme",
            language: "Language",
            clear: "Clear",
            info: "Info",
            size: "Size"
          };
    }
  },
  watch: {
    language(newVal) {
      this.selectedLanguage = newVal;
    }
  },
  mounted() {
    this.isDarkTheme = document.body.classList.contains("dark-theme");
    document.addEventListener("click", this.handleClickOutside);
  },
  beforeDestroy() {
    document.removeEventListener("click", this.handleClickOutside);
  },
  methods: {
    toggleHistory() {
      this.showHistoryPanel = !this.showHistoryPanel;
    },
    setTool(tool) {
      this.selectedTool = tool;
      if (tool === "pencil" || tool === "line") {
        this.localPenColor = "#000000";
        this.$emit("update-pen", {
          tool,
          penSize: this.localPenSize,
          penColor: "#000000"
        });
      } else {
        this.$emit("update-pen", {
          tool,
          penSize: this.localPenSize,
          penColor: this.localPenColor
        });
      }
    },
    undoAction() {
      this.$emit("undo");
    },
    redoAction() {
      this.$emit("redo");
    },
    updateBrushSize() {
      this.$emit("update-pen", {
        penSize: this.localPenSize,
        penColor:
            this.selectedTool === "pencil" || this.selectedTool === "line"
                ? "#000000"
                : this.localPenColor
      });
    },
    toggleStylesPanel() {
      this.showStylesPanel = !this.showStylesPanel;
    },
    handleClickOutside(event) {
      if (this.showStylesPanel) {
        const panel = this.$refs.stylesPanel;
        if (panel && !panel.contains(event.target) && !this.$el.contains(event.target)) {
          this.showStylesPanel = false;
        }
      }
    },
    toggleTheme() {
      this.isDarkTheme = !this.isDarkTheme;
      document.body.classList.toggle("dark-theme", this.isDarkTheme);
    },
    changeLanguage() {
      this.selectedLanguage = this.selectedLanguage === "en" ? "ru" : "en";
      this.$emit("update:language", this.selectedLanguage);
    },
    clearCanvas() {
      this.$emit("clear-canvas");
    },
    showInfo() {
      alert("Небольшой текст информации");
    },
    selectStyle(style) {
      this.$emit("update-style", style.name);
      this.showStylesPanel = false;
    },
    cycleWindowSize() {
      this.$emit("cycle-window-size");
    },
    // Новый метод для переключения показа QR-картинок
    toggleQRImages() {
      this.showQRImages = !this.showQRImages;
    }
  }
};
</script>

<style>
/* Пример анимации для появления QR-картинок */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.qr-images {
  margin-top: 100px;
  display: flex;
  gap: 150px;
  justify-content: center;
}

.qr-images img {
  max-width: 600px;
  height: auto;
}

.qr-item {
  text-align: center;
}

.qr-item img {
  max-width: 600px;
  height: auto;
}

.qr-item figcaption {
  margin-top: 5px;
  font-size: 14px;
  color: #555;
}

.theme-toggle-btn {
  background: none;
  border: none;
  cursor: pointer;
  outline: none;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.theme-icon,
.icon {
  width: 24px;
  height: 24px;
}

.btn-label {
  font-size: 10px;
  margin-top: 4px;
  text-align: center;
}

.toolbar-wrapper {
  position: relative;
  z-index: 1000;
}

.toolbar-base {
  position: fixed;
  top: 0;
  left: 0;
  width: 60px;
  height: 100vh;
  background-color: #28be46;
  border-right: 1px solid #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 0;
  box-sizing: border-box;
}

.logo-container {
  margin-bottom: 20px;
}

.logo {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.tools {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
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

.pen-size-control {
  width: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 15px;
}

.pen-size-control input[type="range"] {
  width: 100%;
}

.pen-size-label {
  font-size: 9px;
  margin-top: 2px;
  text-align: center;
}

.pen-size-preview-container {
  position: relative;
  width: 40px;
  height: 40px;
  margin: 5px 0;
}

.pen-size-preview {
  position: absolute;
  top: 50%;
  left: 50%;
  background-color: #000;
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.bottom-controls {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

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

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter,
.slide-leave-to {
  transform: translateX(-100%);
}

.selected-style {
  font-size: 9px;
  margin-top: 2px;
  color: #ddd;
}
</style>
