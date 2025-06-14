<template>
  <div class="history-panel" v-if="isVisible">
    <h3>{{ labels.history }}</h3>

    <!-- Календарь для фильтрации по дате -->
    <div class="calendar-container">
      <Datepicker
          v-model="dateRange"
          range
          locale="ru"
          :enableTimePicker="false"
          format="dd.MM.yyyy"
      />
    </div>

    <!-- Список изображений с чекбоксами -->
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

    <!-- Кнопка подтверждения выбора -->
    <button v-if="selectedImages.length && !isReadyToSend" @click="confirmUpload">
      ✅ Подтвердить выбор
    </button>

    <!-- Кнопка отправки (появится после подтверждения) -->
    <button v-if="isReadyToSend" @click="uploadImages">
      📤 Отправить в облако
    </button>

    <!-- Модальное окно подтверждения -->
    <v-dialog v-model="showConfirm">
      <div class="confirm-dialog">
        <p>Вы уверены, что хотите отправить {{ selectedImages.length }} изображений?</p>
        <button @click="finalizeSelection">Подтвердить</button>
        <button @click="showConfirm = false">Отмена</button>
      </div>
    </v-dialog>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

export default defineComponent({
  components: { Datepicker },
  props: ["isVisible"],
  data() {
    return {
      images: [], // Загруженные изображения
      selectedImages: [], // Выбранные файлы
      loading: false,
      dateRange: null,
      showConfirm: false,
      isReadyToSend: false, // Флаг для появления кнопки "Отправить"
      labels: { history: "История изображений" },
    };
  },
  computed: {
    filteredImages() {
      if (!this.dateRange) return this.images;
      const [start, end] = this.dateRange || [];
      return this.images.filter(img => {
        const imgDate = new Date(img.date);
        return (!start || imgDate >= new Date(start)) &&
            (!end || imgDate <= new Date(end));
      });
    }
  },
  methods: {
    formatDate(date) {
      return new Date(date).toLocaleDateString('ru-RU');
    },
    async fetchImages() {
      this.loading = true;
      try {
        const response = await fetch("/history");
        if (!response.ok) throw new Error('Ошибка загрузки истории');
        this.images = await response.json();
      } catch (error) {
        console.error("Ошибка:", error);
        this.images = []; // Сброс при ошибке
      } finally {
        this.loading = false;
      }
    },
    confirmUpload() {
      this.showConfirm = true; // Показываем модальное окно
    },
    finalizeSelection() {
      this.showConfirm = false; // Закрываем модальное окно
      this.isReadyToSend = true; // Показываем кнопку "Отправить"
    },
    async uploadImages() {
      try {
        const response = await fetch("/upload-to-yandex", {
          method: "POST",
          body: JSON.stringify({ images: this.selectedImages }),
          headers: { "Content-Type": "application/json" },
        });
        const result = await response.json();
        console.log("Ответ сервера:", result.message);
      } catch (error) {
        console.error("Ошибка загрузки:", error);
      } finally {
        this.isReadyToSend = false;
        this.selectedImages = []; // Сброс выбора после отправки
      }
    }
  },
  mounted() {
    this.fetchImages();
  }
});
</script>

<style scoped>
.history-panel {
  position: fixed;
  top: 0;
  left: 60px;
  width: 350px;
  height: 100vh;
  background: #28be46;
  padding: 20px;
  overflow-y: auto;
  z-index: 1200;
  color: white;
}

.calendar-container {
  margin: 15px 0;
}

.loading {
  text-align: center;
  padding: 20px;
}

.images-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin: 20px 0;
}

.image-item {
  position: relative;
  border: 1px solid #fff;
  padding: 5px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.image-item img {
  width: 100%;
  height: 120px;
  object-fit: contain;
  background: white;
  margin-bottom: 5px;
}

.image-date {
  font-size: 12px;
  margin-bottom: 5px;
}

.image-item button {
  padding: 3px 6px;
  font-size: 12px;
  cursor: pointer;
}

.no-images {
  text-align: center;
  padding: 20px;
}
</style>