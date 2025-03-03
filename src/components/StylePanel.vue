<template>
  <transition name="slide">
    <div v-if="visible" class="style-panel">
      <h3>Выбор стиля</h3>
      <ul>
        <li v-for="style in styles" :key="style.name" @click="selectStyle(style)">
          {{ style.name }}
        </li>
      </ul>
      <button class="close-btn" @click="closePanel">Закрыть</button>
    </div>
  </transition>
</template>

<script>
export default {
  name: "StylePanel",
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    styles: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    selectStyle(style) {
      this.$emit("select-style", style);
    },
    closePanel() {
      this.$emit("close-panel");
    }
  }
};
</script>

<style scoped>
.style-panel {
  position: fixed;
  top: 0;
  left: 0;
  width: 250px;
  height: 100vh;
  background-color: #ffffff;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.2);
  z-index: 1100;
  padding: 20px;
  overflow-y: auto;
}

.slide-enter-active, .slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter {
  transform: translateX(-100%);
}

.slide-leave-to {
  transform: translateX(-100%);
}

.close-btn {
  margin-top: 20px;
  padding: 8px 12px;
  cursor: pointer;
}
</style>
