AFRAME.registerComponent('menu-slide-animation', {
  schema: {
    isSearching: {default: false},
    menuSelectedChallengeId: {type: 'string'}
  },

  init: function () {
    this.isOpen = false;  // Means toleft.
  },

  update: function (oldData) {
    const data = this.data;

    if (this.isOpen) {
      // Unselect.
      if (oldData.menuSelectedChallengeId && !data.menuSelectedChallengeId) { this.closeMenu(); }
      // Keyboard close.
      if (oldData.isSearching && !data.isSearching) { this.closeMenu(); }
    }

    if (!this.isOpen) {
      // Select.
      if (!oldData.menuSelectedChallengeId && data.menuSelectedChallengeId) { this.openMenu(); }
      // Keyboard open.
      if (!oldData.isSearching && data.isSearching) { this.openMenu(); }
    }
  },

  closeMenu: function () {
    this.el.components.animation__menuright.beginAnimation();
    this.isOpen = false;
  },

  openMenu: function () {
    this.el.components.animation__menuleft.beginAnimation();
    this.isOpen = true;
  }
});
