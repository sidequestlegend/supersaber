AFRAME.registerComponent('discolight', {
  schema: {
    color: { type: 'color' },
    speed: { default: 1.0 },
  },
  init: function() {
    this.color = new THREE.Color(this.data.color);
    this.hsl = this.color.getHSL();
  },
  tick: function(time, delta) {
    this.hsl.h += delta * 0.0001 * this.data.speed;
    if (this.hsl.l > 1.0) this.hsl.l = 0.0;
    this.color.setHSL(this.hsl.h, this.hsl.s, this.hsl.l);
    this.el.setAttribute('light', { color: this.color.getHex() });
  },
});
