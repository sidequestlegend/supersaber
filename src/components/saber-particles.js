const HIT_LEFT = 'hitLeft';
const HIT_RIGHT = 'hitRight';
const LEFT = 'left';
const RIGHT = 'right';

/**
 * Show particles when touched by saber.
 */
AFRAME.registerComponent('saber-particles', {
  schema: {
    enabled: {default: false},
    hand: {type: 'string'}
  },

  init: function () {
    this.hiddenIntersection = {x: 999, y: 0, z: 0};
    this.intersectedEl = null;

    this.particles = document.getElementById('sparkParticles');
    this.particleEventDetail = {position: new THREE.Vector3(), rotation: new THREE.Euler()};
    this.particleEvent = {detail: this.particleEventDetail};
    this.particleSystem = null;

    this.saberEnter = this.saberEnter.bind(this);
    this.saberLeave = this.saberLeave.bind(this);

  },

  pause: function () {
    this.el.removeEventListener('mouseenter', this.saberEnter);
    this.el.removeEventListener('mouseleave', this.saberLeave);
  },

  play: function () {
    this.el.addEventListener('mouseenter', this.saberEnter);
    this.el.addEventListener('mouseleave', this.saberLeave);
    this.particlesDur = this.particles.getAttribute('particleplayer').dur;
  },

  saberEnter: function (evt) {
    if (!this.data.enabled) { return; }
    if (evt.target !== this.el) { return; }
    if (!evt.detail.intersectedEl.hasAttribute('data-saber-particles')) { return; }
    this.intersectedEl = evt.detail.intersectedEl;
  },

  saberLeave: function (evt) {
    if (evt.detail.target !== this.el) { return; }

    // Hide hit intersection texture.
    if (this.intersectedEl.components.wall || this.intersectedEl.id === 'floor') {
      const uniform = this.data.hand === RIGHT ? HIT_RIGHT : HIT_LEFT;
      const material = this.intersectedEl.getObject3D('mesh').material;
      material.uniforms[uniform].value = this.hiddenIntersection;
    }
    this.intersectedEl = null;
    this.particleSystem = null;
  },

  tick: function (time, delta) {
    if (!this.data.enabled || !this.intersectedEl) { return; }

    const raycaster = this.el.components.raycaster__game;
    const intersection = raycaster.getIntersection(this.intersectedEl);

    if (!intersection) { return; }

    // Update intersection material if necessary.
    /*
    if (this.intersectedEl.components.wall || this.intersectedEl.id === 'floor') {
      const uniform = this.data.hand === RIGHT ? HIT_RIGHT : HIT_LEFT;
      const material = this.intersectedEl.getObject3D('mesh').material;
      material.uniforms[uniform].value = intersection.point;
    }
    */

    if (this.particleSystem && this.particleSystem.active) {
      // Update particle position.
      this.particleSystem.mesh.position.copy(intersection.point);
    } else {
      // Start particle system.
      this.particleEventDetail.position.copy(intersection.point);
      this.particleSystem = this.particles.components.particleplayer.startAfterDelay(
        this.particleEvent);
    }
  }
});
