let i = 0;

/**
 * Preload textures to GPU that are not visible from the start..
 * three.js renderer by default will not upload textures from non-visible entities.
 */
AFRAME.registerComponent('gpu-preloader', {
  play: function () {
    this.preloadMineEnvMaps();

    setTimeout(() => {
      this.preloadBeamMap();
      this.preloadBeatEnvMap();
      this.preloadCutParticles();
      this.preloadKeyboard();
      this.preloadMissMap();
      this.preloadPlayButton();
      this.preloadSearchPrevPage();
      this.preloadWallMap();
      this.preloadWrongMap();
    }, 1000);
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

  preloadKeyboard: function () {
    const keyboard = document.getElementById('keyboard')
    const kbImg = keyboard.components['super-keyboard'].kbImg;
    this.preloadTexture(kbImg.getObject3D('mesh').material.map);
  },

  preloadMineEnvMaps: function () {
    const stageColors = this.el.sceneEl.components['stage-colors'];
    this.el.sceneEl.addEventListener('mineredenvmaploaded', () => {
      this.preloadTexture(stageColors.mineEnvMap.red);
    });
    this.el.sceneEl.addEventListener('mineblueenvmaploaded', () => {
      this.preloadTexture(stageColors.mineEnvMap.blue);
    });
  },

  preloadMissMap: function () {
    const miss = document.querySelector('#missLeft');
    this.preloadTexture(miss.getObject3D('mesh').material.map);
  },

  preloadPlayButton: function () {
    const playButton = document.querySelector('#playButton');
    this.preloadTexture(playButton.getObject3D('mesh').material.map);
  },

  preloadSearchPrevPage : function () {
    const prevPage = document.querySelector('#searchPrevPage');
    this.preloadTexture(prevPage.children[0].getObject3D('mesh').material.map);
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
    if (!texture.image.complete) {
      console.warn('[gpu-preloader] Error preloading, image not loaded', texture);
      return;
    }
    this.el.renderer.setTexture2D(texture, i++ % 8);
  }
});
