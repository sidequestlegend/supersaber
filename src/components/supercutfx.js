AFRAME.registerComponent('supercutfx', {
  init: function () {
    this.startTime = -1100; // pause on first tick
  },

  createSuperCut: function (position) {
    const mesh = this.el.getObject3D('mesh');
    this.el.object3D.position.copy(position);
    this.el.object3D.position.z = -1;
    this.el.object3D.visible = true;

    this.startTime = this.el.sceneEl.time;
    mesh.material.uniforms.startTime.value = this.startTime - 50;
    this.el.play();
  },

  tick: function (time) {
    if (time > this.startTime + 1000) {
      this.el.object3D.visible = false;
      this.el.pause();
    }
  }
});
