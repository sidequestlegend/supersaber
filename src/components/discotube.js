AFRAME.registerComponent('discotube', {
  schema: {
    speedX: { default: 1.0 },
    speedY: { default: 0.1 },
  },
  init: function() {
    this.material = this.el.object3D.children[0].material;
  },
  tick: function(time, delta) {
    if (this.material == null) return;
    this.material.map.offset.x -= delta * 0.0001 * this.data.speedX;
    this.material.map.offset.y -= delta * 0.0001 * this.data.speedY;
  },
});
