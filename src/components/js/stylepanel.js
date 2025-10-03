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
