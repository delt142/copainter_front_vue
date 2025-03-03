<template>
  <div class="toolbar">
    <!-- Логотип в верхней части панели -->
    <div class="logo-container">
      <img src="/logo.png" alt="Logo" class="logo" />
    </div>

    <!-- Блок с основными инструментами – кнопки выровнены по центру -->
    <div class="tools">
      <button :class="{ selected: selectedTool === 'pencil' }" @click="setTool('pencil')">
        <span class="icon">✏️</span>
        <span class="btn-label">{{ labels.pencil }}</span>
      </button>
      <button :class="{ selected: selectedTool === 'eraser' }" @click="setTool('eraser')">
        <span class="icon">🧽</span>
        <span class="btn-label">{{ labels.eraser }}</span>
      </button>
      <button :class="{ selected: selectedTool === 'line' }" @click="setTool('line')">
        <span class="icon">📏</span>
        <span class="btn-label">{{ labels.line }}</span>
      </button>
    </div>

    <!-- Нижняя часть панели с дополнительными кнопками -->
    <div class="bottom-controls">
      <!-- Кнопка для вызова панели со стилями -->
      <button @click="toggleStylesPanel">
        <span class="icon">🎨</span>
        <span class="btn-label">{{ labels.styles }}</span>
        <!-- Под кнопкой со стилями выводим выбранный стиль -->
        <span class="selected-style">{{ selectedStyle }}</span>
      </button>
      <!-- Кнопка переключения темы (светлая/тёмная) -->
      <button @click="toggleTheme">
        <span class="icon">{{ isDarkTheme ? '🌞' : '🌜' }}</span>
        <span class="btn-label">{{ labels.theme }}</span>
      </button>
      <!-- Кнопка смены языка -->
      <button @click="changeLanguage">
        <span class="icon">{{ selectedLanguage === 'en' ? 'RU' : 'EN' }}</span>
        <span class="btn-label">{{ labels.language }}</span>
      </button>
      <!-- Кнопка очистки Canvas -->
      <button @click="clearCanvas">
        <span class="icon">🧹</span>
        <span class="btn-label">{{ labels.clear }}</span>
      </button>
      <!-- Кнопка информации -->
      <button @click="showInfo">
        <span class="icon">ℹ️</span>
        <span class="btn-label">{{ labels.info }}</span>
      </button>
    </div>
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
    // Проп для выбранного стиля, отображаемый под кнопкой стилей
    selectedStyle: {
      type: String,
      default: "(No style)"
    }
  },
  data() {
    return {
      selectedTool: "pencil",
      selectedLanguage: this.language,
      isDarkTheme: false
    };
  },
  computed: {
    labels() {
      if (this.selectedLanguage === "ru") {
        return {
          pencil: "Карандаш",
          eraser: "Ластик",
          line: "Линия",
          styles: "Стили",
          theme: "Тема",
          language: "Язык",
          clear: "Очистить",
          info: "Инфо"
        };
      } else {
        return {
          pencil: "Pencil",
          eraser: "Eraser",
          line: "Line",
          styles: "Styles",
          theme: "Theme",
          language: "Language",
          clear: "Clear",
          info: "Info"
        };
      }
    }
  },
  watch: {
    language(newVal) {
      this.selectedLanguage = newVal;
    }
  },
  mounted() {
    // Проверяем, активна ли тёмная тема при загрузке DOM
    this.isDarkTheme = document.body.classList.contains("dark-theme");
  },
  methods: {
    setTool(tool) {
      this.selectedTool = tool;
      this.$emit("update-pen", { tool });
    },
    toggleStylesPanel() {
      // Эмиттируем событие toggle-styles-panel, которое родительский компонент обработает
      this.$emit("toggle-styles-panel");
    },
    toggleTheme() {
      this.isDarkTheme = !this.isDarkTheme;
      document.body.classList.toggle("dark-theme", this.isDarkTheme);
    },
    changeLanguage() {
      const nextLanguage = this.selectedLanguage === "en" ? "ru" : "en";
      this.selectedLanguage = nextLanguage;
      this.$emit("update:language", this.selectedLanguage);
    },
    clearCanvas() {
      this.$emit("clear-canvas");
    },
    showInfo() {
      alert("Небольшой текст информации");
    }
  }
};
</script>

<style scoped>
.toolbar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;             /* Панель занимает всю высоту экрана */
  width: 60px;               /* Фиксированная ширина панели */
  background-color: #28be46; /* Фоновый цвет панели */
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 0;
  box-sizing: border-box;
  z-index: 1000;
}

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

/* Общие стили для кнопок */
.toolbar button {
  width: 40px;
  height: 60px; /* Увеличенная высота для размещения иконки и подписи */
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
}

.toolbar button.selected {
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

/* Дополнительный текст под кнопкой со стилями */
.selected-style {
  font-size: 9px;
  margin-top: 2px;
  color: #ddd;
}

/* Нижняя часть панели с дополнительными кнопками */
.bottom-controls {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
