/**
 * Reuse images from the search result.
 */
AFRAME.registerComponent('menu-selected-challenge-image', {
  dependencies: ['geometry', 'material'],

  schema: {
    selectedChallengeIndex: {type: 'number'}
  },

  init: function () {
    const el = this.el;
    this.searchThumbnails = document.getElementById('searchThumbnailImages');
    el.getObject3D('mesh').material.map = this.searchThumbnails.getObject3D('mesh').material.map;
    el.getObject3D('mesh').material.needsUpdate = true;
  },

  update: function () {
    const data = this.data;
    const el = this.el;

    if (data.selectedChallengeIndex === -1 || data.selectedChallengeIndex === '') { return; }

    // Update UVs.
    el.setAttribute('atlas-uvs', 'row', data.selectedChallengeIndex + 1);
  }
});
