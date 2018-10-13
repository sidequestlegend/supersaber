let i = 0;

/**
 * Preload stuff to GPU.
 * three.js renderer by default will not upload textures from non-visible entities.
 */
AFRAME.registerComponent('gpu-preloader', {
  play: function () {
    setTimeout(() => {
      this.preloadBeamMap();
      this.preloadBeatEnvMap();
      this.preloadCutParticles();
      this.preloadMissMap();
      this.preloadWallMap();
      this.preloadWrongMap();
    }, 250);
  },

  preloadBeamMap: function () {
    const beams = document.querySelector('[beams]');
    this.preloadTexture(beams.components.beams.texture);
  },

  preloadBeatEnvMap: function () {
    const beat = document.querySelector('#beatContainer [mixin~="beat"]');
    beat.object3D.traverse(node => {
      if (!node.material) { return; }
      if (node.material.envMap) {
        this.preloadTexture(node.material.envMap);
      }
      if (node.material.map) {
        this.preloadTexture(node.material.map);
      }
    });
  },

  preloadCutParticles: function () {
    const particles = document.querySelector('#saberParticles');
    this.preloadTexture(particles.components.particleplayer.material.map);
  },

  preloadMissMap: function () {
    const miss = document.querySelector('#missLeft');
    this.preloadTexture(miss.getObject3D('mesh').material.map);
  },

  preloadWallMap: function () {
    const wall = document.querySelector('a-entity[wall]');
    this.preloadTexture(wall.getObject3D('mesh').material.uniforms.tex.value);
  },

  preloadWrongMap: function () {
    const wrong = document.querySelector('#wrongLeft');
    this.preloadTexture(wrong.getObject3D('mesh').material.map);
  },

  preloadTexture: function (texture) {
    if (!texture || !texture.image) {
      console.warn('[gpu-preloader] Error preloading texture', texture);
      return;
    }
    this.el.renderer.setTexture2D(texture, i++ % 8);
  },
});
