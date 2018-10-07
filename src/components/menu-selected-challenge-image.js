AFRAME.registerComponent('menu-selected-challenge-image', {
  schema: {
    selectedChallengeId: {type: 'string'}
  },

  update: function () {
    const el = this.el;
    if (!this.data.selectedChallengeId) { return; }
    el.setAttribute(
      'material', 'src',
      `https://s3-us-west-2.amazonaws.com/supersaber/${this.data.selectedChallengeId}-image.jpg`);
  }
});
