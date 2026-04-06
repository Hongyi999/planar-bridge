Component({
  properties: {
    value: { type: String, value: '' },
    placeholders: { type: Array, value: [] },
    compact: { type: Boolean, value: false },
    focus: { type: Boolean, value: false }
  },
  data: {
    currentPlaceholder: '',
    nextPlaceholder: '',
    animating: false
  },
  lifetimes: {
    attached() {
      this._index = 0;
      var list = this.properties.placeholders;
      if (list.length > 0) {
        this.setData({ currentPlaceholder: list[0], nextPlaceholder: list.length > 1 ? list[1] : list[0] });
      }
    },
    detached() {
      this._stopRotation();
    }
  },
  observers: {
    'placeholders': function(list) {
      if (list.length > 0 && !this.data.currentPlaceholder) {
        this._index = 0;
        this.setData({ currentPlaceholder: list[0], nextPlaceholder: list.length > 1 ? list[1] : list[0] });
      }
    }
  },
  pageLifetimes: {
    show() { this._startRotation(); },
    hide() { this._stopRotation(); }
  },
  methods: {
    _startRotation() {
      this._stopRotation();
      var that = this;
      var list = this.properties.placeholders;
      if (list.length <= 1) return;
      this._timer = setInterval(function() {
        var nextIdx = (that._index + 1) % list.length;
        // Set next placeholder and trigger slide-up animation
        that.setData({ nextPlaceholder: list[nextIdx], animating: true });
        // After animation completes, swap current and reset
        setTimeout(function() {
          that._index = nextIdx;
          that.setData({
            currentPlaceholder: list[nextIdx],
            nextPlaceholder: list[(nextIdx + 1) % list.length],
            animating: false
          });
        }, 420);
      }, 2500);
    },
    _stopRotation() {
      if (this._timer) {
        clearInterval(this._timer);
        this._timer = null;
      }
    },
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
    }
  }
});
