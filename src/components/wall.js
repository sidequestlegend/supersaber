/**
 * Wall speed and haptics.
 */
AFRAME.registerComponent('wall', {
  schema: {
    speed: {default: 1.0}
  },

  init: function () {
    this.maxZ = 10;
    this.saberHit = {
      'rightHand': {
        active: false,
        position: null,
        raycaster: document.getElementById('rightHand').components['raycaster__game']
      },
      'leftHand': {
        active: false,
        position: null,
        raycaster: document.getElementById('leftHand').components['raycaster__game']
      }
    };
    this.intersecting = false;
  },

  pause: function () {
    this.el.object3D.visible = false;
    this.el.removeAttribute('data-collidable-head');
    this.el.removeAttribute('raycastable-game');
    this.el.removeEventListener('mouseenter', this.saberEnter);
    this.el.removeEventListener('mouseleave', this.saberLeave);
  },

  play: function () {
    this.el.object3D.visible = true;
    this.el.setAttribute('data-collidable-head', '');
    this.el.setAttribute('raycastable-game', '');
    this.el.addEventListener('mouseenter', this.saberEnter.bind(this));
    this.el.addEventListener('mouseleave', this.saberLeave.bind(this));
    this.material = this.el.object3D.children[0].material;
  },

  saberEnter: function (evt) {
    this.saberHit[evt.detail.cursorEl.id].active = true;
    this.intersecting = true;
  },

  saberLeave: function (evt) {
    const hand = evt.detail.cursorEl.id;
    this.saberHit[hand].active = false;
    this.material.uniforms[hand == 'rightHand' ? 'hitRight' : 'hitLeft'].value = {x: 999, y: 0, z: 0};
    this.intersecting = this.saberHit['rightHand'].active || this.saberHit['leftHand'].active;
  },

  tock: function (time, delta) {
    if (this.intersecting) {
      var int;
      if (this.saberHit['rightHand'].active) {
        int = this.saberHit['rightHand'].raycaster.getIntersection(this.el);
        if (int) { this.material.uniforms.hitRight.value = int.point; }
      }
      if (this.saberHit['leftHand'].active) {
        int = this.saberHit['leftHand'].raycaster.getIntersection(this.el);
        if (int) { this.material.uniforms.hitLeft.value = int.point; }
      }
    }

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
