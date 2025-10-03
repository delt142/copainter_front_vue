import CanvasComponent from "./components/vue/Canvas.vue";
import Toolbar from "./components/vue/Toolbar.vue";
import GeneratedImages from "./components/vue/GeneratedImages.vue";

export default {
  name: "App",
  components: { CanvasComponent, Toolbar, GeneratedImages },
  data() {
    return {
      currentLanguage: "en",
      languages: ["en", "ru"],
      styles: [],
      selectedStyle: "(No style)",
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
        history: true,
      },
    };
  },
  computed: {
    generateButtonLabel() {
      return this.currentLanguage === "ru" ? "Сгенерировать изображение" : "Generate Image";
    },
    labels() {
      return this.currentLanguage === "ru"
        ? { styles: "Стили" }
        : { styles: "Styles" };
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
      this.resultImage = "/fin1.gif";

    //   const canvas = this.$refs.canvasComponent.getCanvas();
    //   const dataUrl = canvas.toDataURL("image/png");
    //   const base64Image = dataUrl.split(",")[1];
    const dataUrl = this.$refs.canvasComponent.getWhiteBackgroundDataUrl();
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
    }
  }
};
