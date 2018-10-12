AFRAME.registerComponent('wall', {
  schema: {
    speed: {default: 1.0}
  },

  init: function () {
    this.maxZ = 10;
  },

  pause: function () {
    this.el.object3D.visible = false;
  },

  play: function () {
    this.el.object3D.visible = true;
  },

  tock: function (time, delta) {
    this.el.object3D.position.z += this.data.speed * (delta / 1000);
    this.returnToPool();
  },

  returnToPool: function () {
    if (this.el.object3D.position.z < this.maxZ) { return; }
    this.el.sceneEl.components.pool__wall.returnEntity(this.el);
    this.el.object3D.position.z = 9999;
    this.el.pause();
  },
});
