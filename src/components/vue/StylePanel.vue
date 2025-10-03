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

<script src="../js/stylepanel.js"></script>
<style src="../css/stylepanel.css" scoped></style>
