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
        <button v-if="buttonsVisibility.styles" @click.stop="toggleStylesPanel">
          <span class="icon">🎨</span>
          <span class="btn-label">{{ labels.styles }}</span>
          <span class="selected-style">{{ selectedStyle }}</span>
        </button>
        <button
          v-if="buttonsVisibility.theme"
          @click="toggleTheme"
          class="theme-toggle-btn"
        >
          <span class="icon">{{ isDarkTheme ? '☀️' : '🌙' }}</span>
          <span class="btn-label">{{ labels.theme }}</span>
        </button>
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

    <!-- QR Images Block -->
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

<script src="../js/Toolbar.js"></script>
<style src="../css/Toolbar.css"></style>
