AFRAME.registerComponent('text-counter', {
  dependencies: ['text'],
  schema: {
    value: {default: 0.0, type: 'float'},
    dur: {default: 2000, type: 'int'},
    prefix: {default: ''},
    suffix: {default: ''},
    decimals: {default: 0}
  },

  init: function () {
    this.startTime = null;
    this.currentValue = -1;
  },

  decimals: function (n) {
    var d = Math.pow(10, this.data.decimals);
    return (parseInt(n * d) / d).toFixed(this.data.decimals);
  },

  update: function (oldData) {
    this.startTime = null;
    this.currentValue = -1;
    this.el.setAttribute('text', {
      value: `${this.data.prefix} ${this.decimals(0)} ${this.data.suffix}`
    });
  },

  tick: function (time) {
    if (this.currentValue < this.data.value) {
      if (this.startTime === null) { this.startTime = time};
      const prevValue = Math.floor(this.currentValue);
      this.currentValue = this.data.value * (time - this.startTime) / this.data.dur;
      if (Math.floor(this.currentValue) !== prevValue) {
        if (this.currentValue >= this.data.value) {
          this.currentValue = this.data.value;
          document.getElementById('victoryInfoRank').emit('appear');
          document.getElementById('victoryButtons').emit('appear');
        }
        this.el.setAttribute('text', {
          value: `${this.data.prefix} ${this.decimals(this.currentValue)} ${this.data.suffix}`
        });
      }
    }
  }
})