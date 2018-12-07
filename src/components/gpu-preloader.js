let i = 0;

/**
 * Preload textures to GPU that are not visible from the start..
 * three.js renderer by default will not upload textures from non-visible entities.
 */
AFRAME.registerComponent('gpu-preloader', {
  dependencies: ['materials'],

  play: function () {
    this.preloadMineEnvMaps();

    setTimeout(() => {
      this.preloadAtlas();
      this.preloadLogo();
      //this.prelodBeamMap();
      this.preloadBeatEnvMap();
      this.preloadCutParticles();
      this.preloadKeyboard();
      //this.preloadMissMap();
      this.preloadPlayButton();
      this.preloadSearchPrevPage();
      //this.preloadWallMap();
      //this.preloadWrongMap();
      this.preloadGenres();
    }, 1000);
  },

  preloadAtlas: function () {
    const stage = document.querySelector('#stageObj');
    this.preloadTexture(stage.getObject3D('mesh').children[0].material.uniforms.src.value);
  },

  preloadLogo: function () {
    const logo = document.querySelector('#logoBody');
    this.preloadTexture(logo.getObject3D('mesh').children[0].material.uniforms.src.value);
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
    const keyboard = document.getElementById('keyboard').components['super-keyboard'];
    this.preloadTexture(keyboard.kbImg.getObject3D('mesh').material.map);
    this.preloadTexture(keyboard.keyColorPlane.getObject3D('mesh').material.map);
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
    this.preloadTexture(wall.getObject3D('mesh').material.uniforms.env.value);
  },

  preloadWrongMap: function () {
    const wrong = document.querySelector('#wrongLeft');
    this.preloadTexture(wrong.getObject3D('mesh').material.map);
  },

  preloadGenres: function () {
    const genres = document.querySelector('.genreIcon');
    this.preloadTexture(genres.getObject3D('mesh').material.map);
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
