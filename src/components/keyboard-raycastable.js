AFRAME.registerComponent('keyboard-raycastable', {
  dependencies: ['super-keyboard'],

  play: function () {
    // TODO: bind-toggle__raycastable for when search is activated.
    this.el.components['super-keyboard'].kbImg.setAttribute('raycastable', '');
  },
});
