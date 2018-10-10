var ONCE = {once: true};

/**
 * Delay logo light so it only applies to the logo.
 */
AFRAME.registerComponent('logo-light', {
  init: function () {
    this.logoBack = document.getElementById('logoBack');
    this.logoFront = document.getElementById('logoFront');
    this.logoFrontU = document.getElementById('logoFrontU');
  },

  play: function () {
    setTimeout(() => {
      this.el.setAttribute('light', {
        type: 'spot',
        penumbra: 1,
        intensity: 5,
        angle: 20
      });
      this.waitAndUpdate(this.logoBack);
      this.waitAndUpdate(this.logoFront);
      this.waitAndUpdate(this.logoFrontU);
    }, 1000);
  },

  waitAndUpdate: function (el) {
    if (el.getObject3D('mesh')) {
      el.object3D.traverse(this.updateMaterials);
    } else {
      el.addEventListener('model-loaded', () => {
        el.object3D.traverse(this.updateMaterials);
      }, ONCE);
    }
  },

  updateMaterials: function (node) {
    if (node.material) {
      node.material.needsUpdate = true;
    }
  }
});
