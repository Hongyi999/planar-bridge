Component({
  properties: {
    value: { type: String, value: '' },
    placeholder: { type: String, value: 'Legendary equipment for Ninja...' },
    compact: { type: Boolean, value: false }
  },
  methods: {
    onInput(e) {
      this.setData({ value: e.detail.value });
    },
    onConfirm(e) {
      this.triggerEvent('search', { value: e.detail.value || this.data.value });
    },
    onTap() {
      this.triggerEvent('tap');
    }
  }
});
