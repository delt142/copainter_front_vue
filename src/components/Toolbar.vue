<template>
  <div class="toolbar-wrapper">
    <!-- Base Panel -->
    <div class="toolbar-base">
      <div class="logo-container">
        <img src="/logo.png" alt="Logo" class="logo" />
      </div>

      <!-- Main Tools -->
      <div class="tools">
        <button :class="{ selected: selectedTool === 'pencil' }" @click="setTool('pencil')">
          <img :src="toolIcons.pencil" alt="Pencil Icon" class="icon" />
          <span class="btn-label">{{ labels.pencil }}</span>
        </button>
        <button :class="{ selected: selectedTool === 'eraser' }" @click="setTool('eraser')">
          <img :src="toolIcons.eraser" alt="Eraser Icon" class="icon" />
          <span class="btn-label">{{ labels.eraser }}</span>
        </button>
        <button :class="{ selected: selectedTool === 'line' }" @click="setTool('line')">
          <img :src="toolIcons.line" alt="Line Icon" class="icon" />
          <span class="btn-label">{{ labels.line }}</span>
        </button>
        <button @click="undoAction">
          <img :src="toolIcons.undo" alt="Undo Icon" class="icon" />
          <span class="btn-label">{{ labels.undo }}</span>
        </button>
        <button @click="redoAction">
          <img :src="toolIcons.redo" alt="Redo Icon" class="icon" />
          <span class="btn-label">{{ labels.redo }}</span>
        </button>
      </div>

      <!-- Pen Size Control -->
      <div class="pen-size-control">
        <input type="range" min="1" max="24" v-model.number="localPenSize" @input="updateBrushSize" />
        <span class="pen-size-label">{{ localPenSize }} px</span>
      </div>

      <!-- Bottom Controls -->
      <div class="bottom-controls">
        <button @click.stop="toggleStylesPanel">
          <img :src="toolIcons.styles" alt="Styles Icon" class="icon" />
          <span class="btn-label">{{ labels.styles }}</span>
          <span class="selected-style">{{ selectedStyle }}</span>
        </button>
        <button @click="toggleTheme" class="theme-toggle-btn">
          <img :src="themeIcon" alt="Toggle Theme Icon" class="theme-icon" />
          <span class="btn-label">{{ labels.theme }}</span>
        </button>
        <button @click="changeLanguage">
          <img :src="toolIcons.language" alt="Language Icon" class="icon" />
          <span class="btn-label">{{ labels.language }}</span>
        </button>
        <button @click="cycleWindowSize">
          <img :src="toolIcons.size" alt="Size Icon" class="icon" />
          <span class="btn-label">{{ labels.size }}</span>
        </button>
        <button @click="clearCanvas">
          <img :src="toolIcons.clear" alt="Clear Icon" class="icon" />
          <span class="btn-label">{{ labels.clear }}</span>
        </button>
        <button @click="showInfo">
          <img :src="toolIcons.info" alt="Info Icon" class="icon" />
          <span class="btn-label">{{ labels.info }}</span>
        </button>
      </div>
    </div>

    <!-- Styles Panel -->
    <transition name="slide">
      <div v-if="showStylesPanel" ref="stylesPanel" class="styles-panel" @click.stop>
        <h3>{{ labels.styles }}</h3>
        <ul>
          <li v-for="style in styles" :key="style.name" @click="selectStyle(style)">
            {{ style.name }}
          </li>
        </ul>
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
    }
  },
  data() {
    return {
      selectedTool: "pencil",
      selectedLanguage: this.language,
      isDarkTheme: false,
      localPenSize: 2,
      localPenColor: "#000000",
      showStylesPanel: false
    };
  },
  computed: {
    themeIcon() {
      return this.isDarkTheme
          ? '/public/toolbar_ico/dark_ico/sun.svg'
          : '/public/toolbar_ico/light_ico/moon.svg';
    },
    toolIcons() {
      const prefix = this.isDarkTheme ? '/public/toolbar_ico/dark_ico/' : '/public/toolbar_ico/light_ico/';

      return {
        pencil: `${prefix}pencil.svg`,
        eraser: `${prefix}eraser.svg`,
        line: `${prefix}line.svg`,
        undo: `${prefix}undo.svg`,
        redo: `${prefix}redo.svg`,
        styles: `${prefix}styles.svg`,
        clear: `${prefix}clear.svg`,
        info: `${prefix}info.svg`,
        size: `${prefix}size.svg`,
        language: this.selectedLanguage === 'en' ? `${prefix}ru.svg` : `${prefix}en.svg`
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
    }
  }
};
</script>

<style scoped>
.theme-toggle-btn {
  background: none;
  border: none;
  cursor: pointer;
  outline: none;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.theme-icon {
  width: 24px;
  height: 24px;
}

.btn-label {
  font-size: 10px;
  margin-top: 4px;
  text-align: center;
}

.icon {
  width: 24px;
  height: 24px;
  object-fit: contain;
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

/* Логотип */
.logo-container {
  margin-bottom: 20px;
}
.logo {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

/* Блок с основными инструментами */
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
.icon {
  font-size: 24px;
  line-height: 1;
}
.btn-label {
  font-size: 10px;
  margin-top: 4px;
  text-align: center;
}

/* Контроль размера кисти */
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

/* Нижняя часть базовой панели с дополнительными кнопками */
.bottom-controls {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Выдвигаемая панель со стилями – отдельный фиксированный элемент */
.styles-panel {
  position: fixed;
  top: 0;
  left: 60px; /* появляется справа от базовой панели */
  width: 190px;
  height: 100vh;
  background-color: #28be46; /* тот же фон */
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

/* Transition для выдвижения панели */
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
