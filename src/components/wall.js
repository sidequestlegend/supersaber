AFRAME.registerComponent('wall', {
  schema: {
    speed: {default: 1.0}
  },

  init: function () {
    this.maxZ = 10;
  },

  tock: function (time, delta) {
    this.el.object3D.position.z += this.data.speed * (delta / 1000);
    this.returnToPool();
  },

  returnToPool: function () {
    if (this.el.object3D.position.z < this.maxZ) { return; }
    this.el.sceneEl.components.pool__wall.returnEntity(this.el);
    this.el.pause();
  },
});
