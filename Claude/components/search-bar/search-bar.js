Component({
  properties: {
    value: { type: String, value: '' },
    placeholder: { type: String, value: '搜索 Ninja 的传奇装备...' },
    compact: { type: Boolean, value: false },
    focus: { type: Boolean, value: false },
    recording: { type: Boolean, value: false },
    bars: { type: Array, value: [8, 8, 8, 8, 8, 8, 8] }
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
    },
    onCameraTap() {
      this.triggerEvent('camera');
    },
    onMicTap() {
      this.triggerEvent('mic');
    }
  }
});