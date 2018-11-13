AFRAME.registerComponent('saber-intersection', {
  dependencies: ['raycaster__game'],
  schema: {
    active: {default: true}
  },

  init: function () {
    this.hiddenIntersection = {x: 999, y: 0, z: 0};
    this.saberHit = {
      rightHand: {active: false, position: null, raycaster: null},
      leftHand: {active: false, position: null, raycaster: null}
    };
    this.particles = document.getElementById('sparkParticles');
    this.intersecting = false;
    this.saberEnterFunc = this.saberEnter.bind(this);
    this.saberLeaveFunc = this.saberLeave.bind(this);
  },

  pause: function () {
    this.el.removeAttribute('raycastable-game');
    this.el.removeEventListener('mouseenter', this.saberEnterFunc);
    this.el.removeEventListener('mouseleave', this.saberLeaveFunc);
    this.intersecting = false;
  },

  play: function () {
    this.el.setAttribute('raycastable-game', '');
    this.el.addEventListener('mouseenter', this.saberEnterFunc);
    this.el.addEventListener('mouseleave', this.saberLeaveFunc);
    this.material = this.el.getObject3D('mesh').material;
    this.saberHit.rightHand.raycaster = document.getElementById('rightHand').components.raycaster__game;
    this.saberHit.leftHand.raycaster = document.getElementById('leftHand').components.raycaster__game;
  },

  saberEnter: function (evt) {
    if (!this.data.active) { return; }
    const saber = this.saberHit[evt.detail.cursorEl.id];
    saber.active = true;
    int = saber.raycaster.getIntersection(this.el);
      console.log(int);
    if (int) {
      this.particles.emit('start', {position: int.point, rotation: null});
    }
    this.intersecting = true;
  },

  saberLeave: function (evt) {
    const hand = evt.detail.cursorEl.id;
    this.saberHit[hand].active = false;
    this.material.uniforms[hand == 'rightHand' ? 'hitRight' : 'hitLeft'].value = this.hiddenIntersection;
    this.intersecting = this.saberHit.rightHand.active || this.saberHit.leftHand.active;
  },

  tick: function (time, delta) {
    if (this.data.active && this.intersecting) {
      var int;
      if (this.saberHit.rightHand.active) {
        int = this.saberHit.rightHand.raycaster.getIntersection(this.el);
        if (int) { this.material.uniforms.hitRight.value = int.point; }
      }
      if (this.saberHit.leftHand.active) {
        int = this.saberHit.leftHand.raycaster.getIntersection(this.el);
        if (int) { this.material.uniforms.hitLeft.value = int.point; }
      }
    }
  }
});
