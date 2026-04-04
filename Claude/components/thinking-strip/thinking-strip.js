Component({
  properties: {
    steps: { type: Array, value: [] },
    autoStart: { type: Boolean, value: true }
  },
  data: {
    visibleSteps: [],
    allDone: false
  },
  lifetimes: {
    attached() {
      if (this.properties.autoStart) {
        this.startAnimation();
      }
    },
    detached() {
      this._timers && this._timers.forEach(function(t) { clearTimeout(t); });
    }
  },
  methods: {
    startAnimation() {
      var that = this;
      var steps = this.properties.steps;
      this._timers = [];

      steps.forEach(function(step, i) {
        var t1 = setTimeout(function() {
          var visible = that.data.visibleSteps.slice();
          visible.push({
            label: step.label,
            meta: step.meta,
            color: step.color,
            icon: step.icon,
            done: false,
            loading: i === steps.length - 1
          });
          that.setData({ visibleSteps: visible });

          // Mark previous steps as done
          if (i > 0) {
            var key = 'visibleSteps[' + (i - 1) + '].done';
            var key2 = 'visibleSteps[' + (i - 1) + '].loading';
            that.setData({
              [key]: true,
              [key2]: false
            });
          }
        }, i * 800);
        that._timers.push(t1);
      });

      // Final step done + fire complete
      var tFinal = setTimeout(function() {
        var lastIdx = steps.length - 1;
        if (lastIdx >= 0) {
          var key = 'visibleSteps[' + lastIdx + '].done';
          var key2 = 'visibleSteps[' + lastIdx + '].loading';
          that.setData({
            [key]: true,
            [key2]: false,
            allDone: true
          });
        }
        that.triggerEvent('complete');
      }, steps.length * 800 + 600);
      that._timers.push(tFinal);
    }
  }
});
