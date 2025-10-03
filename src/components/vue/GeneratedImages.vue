<template>
  <div class="history-panel" v-if="isVisible">
    <h3>{{ labels.history }}</h3>

    <div class="calendar-container">
      <Datepicker
        v-model="dateRange"
        range
        locale="ru"
        :enableTimePicker="false"
        format="dd.MM.yyyy"
      />
    </div>

    <div v-if="loading" class="loading">Загрузка...</div>
    <div v-else>
      <div class="images-container" v-if="images.length">
        <div v-for="image in filteredImages" :key="image.id" class="image-item">
          <input type="checkbox" v-model="selectedImages" :value="image.url" />
          <img :src="image.url" :alt="image.name" />
          <span class="image-date">{{ formatDate(image.date) }}</span>
        </div>
      </div>
      <div v-else class="no-images">Нет доступных изображений</div>
    </div>

    <button v-if="selectedImages.length && !isReadyToSend" @click="confirmUpload">
      ✅ Подтвердить выбор
    </button>

    <button v-if="isReadyToSend" @click="uploadImages">
      📤 Отправить в облако
    </button>

    <v-dialog v-model="showConfirm">
      <div class="confirm-dialog">
        <p>Вы уверены, что хотите отправить {{ selectedImages.length }} изображений?</p>
        <button @click="finalizeSelection">Подтвердить</button>
        <button @click="showConfirm = false">Отмена</button>
      </div>
    </v-dialog>
  </div>
</template>

<script src="../js/generatedImages.js"></script>
<style src="../css/generatedImages.css" scoped></style>
