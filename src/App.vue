<template>
  <div id="app">
    <Toolbar
      :buttonsVisibility="buttonsVisibility"
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
      @cycle-window-size="cycleWindowSize"
      @toggle-history="toggleHistory"
    />

    <div class="main-container">
      <GeneratedImages :isVisible="showHistoryPanel" />
      <div class="windows-container">
        <div class="drawing-window">
          <CanvasComponent
            ref="canvasComponent"
            :width="drawingDimensions.width"
            :height="drawingDimensions.height"
          />
        </div>
        <div class="generation-window">
          <div
            class="generation-container"
            :style="{
              width: generationDimensions.width + 'px',
              height: generationDimensions.height + 'px'
            }"
          >
            <img :src="resultImage" alt="Сгенерированное изображение" v-if="resultImage" />
          </div>
        </div>
      </div>

      <div class="generate-button-container">
        <button class="generate-btn" @click="generateImage" :disabled="isGenerating">
          {{ generateButtonLabel }}
        </button>
      </div>
    </div>

    <transition name="slide">
      <div v-if="showStylesPanel" class="styles-panel">
        <h3>{{ labels.styles }}</h3>
        <ul>
          <li v-for="style in styles" :key="style.name" @click="selectStyle(style)">
            {{ style.name }}
          </li>
        </ul>
        <button class="close-btn" @click="toggleStylesPanel">Закрыть</button>
      </div>
    </transition>
  </div>
</template>

<script src="./App.js"></script>
<style src="./App.css"></style>
