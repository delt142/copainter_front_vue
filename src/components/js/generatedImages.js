import { defineComponent } from 'vue';
import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

export default defineComponent({
  components: { Datepicker },
  props: ["isVisible"],
  data() {
    return {
      images: [],
      selectedImages: [],
      loading: false,
      dateRange: null,
      showConfirm: false,
      isReadyToSend: false,
      labels: { history: "История изображений" }
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
        this.images = [];
      } finally {
        this.loading = false;
      }
    },
    confirmUpload() {
      this.showConfirm = true;
    },
    finalizeSelection() {
      this.showConfirm = false;
      this.isReadyToSend = true;
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
        this.selectedImages = [];
      }
    }
  },
  mounted() {
    this.fetchImages();
  }
});
