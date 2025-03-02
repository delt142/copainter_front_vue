<template>
  <div class="toolbar">
    <!-- Иконка в верхней части панели -->
    <div class="logo-container">
      <img src="/logo.png" alt="Logo" class="logo" />
    </div>

    <!-- Кнопки инструментов -->
    <button :class="{ selected: selectedTool === 'pencil' }" @click="setTool('pencil')">
      <span class="icon">✏️</span>
    </button>
    <button :class="{ selected: selectedTool === 'eraser' }" @click="setTool('eraser')">
      <span class="icon">🧽</span>
    </button>
    <button :class="{ selected: selectedTool === 'line' }" @click="setTool('line')">
      <span class="icon">📏</span>
    </button>
    <button @click="clearCanvas">
      <span class="icon">🧹</span>
    </button>
    <button @click="undoAction">
      <span class="icon">↶</span>
    </button>
    <button @click="redoAction">
      <span class="icon">↷</span>
    </button>
  </div>
</template>

<script>
export default {
  name: "Toolbar",
  props: {
    styles: { type: Array, default: () => [] },
    language: { type: String, default: "en" },
    languages: { type: Array, default: () => ["en", "ru"] },
    presets: { type: Array, default: () => [] }
  },
  data() {
    return {
      selectedTool: "pencil"
    };
  },
  methods: {
    setTool(tool) {
      this.selectedTool = tool;
      this.$emit("update-pen", { tool });
    },
    clearCanvas() {
      this.$emit("clear-canvas");
    },
    undoAction() {
      this.$emit("undo");
    },
    redoAction() {
      this.$emit("redo");
    }
  }
};
</script>

<style scoped>
.toolbar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;              /* Вся высота экрана */
  width: 60px;                /* Фиксированная ширина панели */
  background-color: #28be46;  /* Фоновый цвет панели */
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

.toolbar button {
  width: 40px;
  height: 40px;
  margin-bottom: 15px;
  background: none;
  border: none;
  cursor: pointer;
  color: #fff;
  outline: none;
}

.toolbar button.selected {
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

.icon {
  font-size: 24px;
}
</style>
