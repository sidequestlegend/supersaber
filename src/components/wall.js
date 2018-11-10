/**
 * Wall speed and haptics.
 */
AFRAME.registerComponent('wall', {
  schema: {
    speed: {default: 1.0}
  },

  init: function () {
    this.maxZ = 10;
  },

  pause: function () {
    this.el.object3D.visible = false;
    this.el.removeAttribute('data-collidable-head');
  },

  play: function () {
    this.el.object3D.visible = true;
    this.el.setAttribute('data-collidable-head', '');
  },

  tock: function (time, delta) {
    this.el.object3D.position.z += this.data.speed * (delta / 1000);
    if (this.el.object3D.position.z > this.maxZ) {
      this.returnToPool();
      return;
    }
  },

  returnToPool: function () {
    this.el.sceneEl.components.pool__wall.returnEntity(this.el);
    this.el.object3D.position.z = 9999;
    this.el.pause();
    this.el.removeAttribute('data-collidable-head');
    this.el.removeAttribute('raycastable-game');
  }
});
