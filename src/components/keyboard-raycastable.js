AFRAME.registerComponent('keyboard-raycastable', {
  play: function() {
    var els;
    var i;
    els = this.el.querySelectorAll('*');
    for (i = 0; i < els.length; i++) {
      els[i].setAttribute('bind-toggle__raycastable', 'isSearchScreen');
    }
  },
});
