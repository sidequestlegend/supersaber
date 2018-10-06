AFRAME.registerComponent('search-thumbnail-atlas', {
  dependencies: ['dynamic-texture-atlas', 'geometry', 'material'],

  schema: {
    dummyUpdater: {type: 'string'}
  },

  init: function () {
    this.el.setAttribute('material', 'src', '#searchThumbnailImagesCanvas');
    this.images = [];
  },

  update: function () {
    var el = this.el;
    var data = this.data;

    const results = el.sceneEl.systems.state.state.searchResultsPage;
    for (let i = 0; i < results.length; i++) {
      let img = this.images[i] = this.images[i] || document.createElement('img');
      img.crossOrigin = 'anonymous';
      img.src = results[i].image;
      if (img.complete) {
        this.el.components['dynamic-texture-atlas'].drawTexture(img, i, 1);
      } else {
        img.onload = (function (i) {
          return () => {
            this.el.components['dynamic-texture-atlas'].drawTexture(img, i, 1);
          };
        })(i);
      }
    }

    this.el.getObject3D('mesh').material.map.needsUpdate = true;
  }
});
