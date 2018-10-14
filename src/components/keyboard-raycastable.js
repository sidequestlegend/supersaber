AFRAME.registerComponent('keyboard-raycastable', {
  dependencies: ['super-keyboard'],

  play: function () {
    this.el.components['super-keyboard'].kbImg.setAttribute('bind-toggle__raycastable',
                                                            'keyboardActive');
  }
});
