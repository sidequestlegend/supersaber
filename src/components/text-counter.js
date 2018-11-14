AFRAME.registerComponent('text-counter', {
  dependencies: ['text'],

  schema: {
    decimals: {default: 0},
    dur: {default: 2000, type: 'int'},
    emit: {default: false},
    prefix: {default: ''},
    suffix: {default: ''},
    value: {default: 0.0, type: 'float'}
  },

  init: function () {
    this.startTime = null;
    this.currentValue = 0;
    this.textValue = {value : ''};
    this.victoryInfoRank = document.getElementById('victoryInfoRank');
    this.victoryButtons = document.getElementById('victoryButtons');
  },

  decimals: function (n) {
    var d = Math.pow(10, this.data.decimals);
    return (parseInt(n * d) / d).toFixed(this.data.decimals);
  },

  update: function (oldData) {
    this.startTime = null;
    this.currentValue = 0;
    this.textValue.value = `${this.data.prefix} ${this.decimals(0)} ${this.data.suffix}`;
    this.el.setAttribute('text', this.textValue);
  },

  tick: function (time) {
    if (this.currentValue >= this.data.value) { return; }
    if (this.startTime === null) { this.startTime = time; return;   };
    const prevValue = Math.floor(this.currentValue);
    this.currentValue = this.data.value * (time - this.startTime) / this.data.dur;
    if (Math.floor(this.currentValue) === prevValue) { return; }
    if (this.currentValue >= this.data.value) {
      this.currentValue = this.data.value;
      if (this.data.emit) {
        this.victoryInfoRank.emit('textcounterdone', null, false);
        this.victoryButtons.emit('textcounterdone', null, false);
      }
    }
    this.textValue.value = `${this.data.prefix} ${this.decimals(this.currentValue)} ${this.data.suffix}`;
    this.el.setAttribute('text', this.textValue);
  }
})