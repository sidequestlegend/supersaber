/**
 * Reuse images from the search results to not create another texture.
 */
AFRAME.registerComponent('menu-selected-challenge-image', {
  schema: {
    selectedChallengeId: {type: 'string'}
  },

  init: function () {
    this.searchResultEls = document.getElementById('searchResultList');
  },

  update: function () {
    const data = this.data;
    const el = this.el;

    if (!data.selectedChallengeId) { return; }

    const imageEl = this.searchResultEls
      .querySelector(`[data-id="${data.selectedChallengeId}"] .searchResultImage`);
    el.getObject3D('mesh').material.map = imageEl.getObject3D('mesh').material.map;
    el.getObject3D('mesh').material.needsUpdate = true;
  }
});
