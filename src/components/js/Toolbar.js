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
      showQRImages: false
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
    toggleQRImages() {
      this.showQRImages = !this.showQRImages;
    }
  }
};
