/**
 * Pause all beats.
 */
AFRAME.registerComponent('beat-pauser', {
  pause: function () {
    for (let i = 0; i < this.el.children.length; i++) {
      this.el.children[i].pause();
    }
  },

  play: function () {
    for (let i = 0; i < this.el.children.length; i++) {
      this.el.children[i].play();
    }
  }
});
