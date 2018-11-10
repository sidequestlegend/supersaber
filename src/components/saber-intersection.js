AFRAME.registerComponent('saber-intersection', {
  dependencies: ['raycaster__game'],
  init: function () {
    this.saberHit = {
      'rightHand': {active: false, position: null, raycaster: null},
      'leftHand': {active: false, position: null, raycaster: null}
    };
    this.intersecting = false;
  },

  pause: function () {
    this.el.removeAttribute('raycastable-game');
    this.el.removeEventListener('mouseenter', this.saberEnter);
    this.el.removeEventListener('mouseleave', this.saberLeave);
  },

  play: function () {
    this.el.setAttribute('raycastable-game', '');
    this.el.addEventListener('mouseenter', this.saberEnter.bind(this));
    this.el.addEventListener('mouseleave', this.saberLeave.bind(this));
    this.material = this.el.object3D.children[0].material;
    this.saberHit['rightHand'].raycaster = document.getElementById('rightHand').components['raycaster__game'];
    this.saberHit['leftHand'].raycaster = document.getElementById('leftHand').components['raycaster__game'];
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

  tick: function (time, delta) {
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
  }
});
