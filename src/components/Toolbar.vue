<template>
  <div class="toolbar">
    <!-- Кнопки инструментов -->
    <button @click="setTool('pencil')">Pencil</button>
    <button @click="setTool('eraser')">Eraser</button>
    <button @click="setTool('line')">Line</button>
    <button @click="$emit('clear-canvas')">Clear</button>
    <button @click="$emit('undo')">Undo</button>
    <button @click="$emit('redo')">Redo</button>

    <!-- Регулятор размера кисти -->
    <input type="range" min="1" max="24" v-model.number="localPenSize" @input="updateBrushSize" />
    <span>{{ localPenSize }} px</span>

    <!-- Выбор цвета -->
    <input type="color" v-model="localPenColor" @input="updatePenColor" />

    <!-- Переключатель языка -->
    <select v-model="selectedLanguage" @change="changeLanguage">
      <option v-for="lang in languages" :key="lang" :value="lang">{{ lang }}</option>
    </select>

    <!-- Выпадающий список стилей -->
    <select v-model="selectedStyle">
      <option v-for="style in styles" :key="style.name" :value="style.name">
        {{ style.name }}
      </option>
    </select>
  </div>
</template>

<script>
export default {
  name: 'Toolbar',
  props: {
    config: { type: Object, default: () => ({}) },
    styles: { type: Array, default: () => [] },
    language: { type: String, default: 'en' },
    languages: { type: Array, default: () => ['en', 'ru'] }
  },
  data() {
    return {
      localPenSize: 2,
      localPenColor: '#000000',
      selectedLanguage: this.language,
      selectedStyle: '(No style)'
    }
  },
  methods: {
    setTool(tool) {
      // Передаём родителю выбор инструмента
      this.$emit('update-pen', { tool });
    },
    updateBrushSize() {
      this.$emit('update-pen', { penSize: this.localPenSize });
    },
    updatePenColor() {
      this.$emit('update-pen', { penColor: this.localPenColor });
    },
    changeLanguage() {
      // Эмитим обновление выбранного языка
      this.$emit('update:language', this.selectedLanguage);
    }
  }
}
</script>

<style scoped>
.toolbar {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  background-color: #28be46;
  padding: 10px;
  border-radius: 30px;
}
button {
  padding: 5px 10px;
}
</style>
