AFRAME.registerComponent('tutorial-2d', {
  init: function () {
    this.el.sceneEl.canvas.style.display = 'none';
  },

  play: function () {
    this.el.sceneEl.canvas.style.display = 'block';
    document.getElementById('tutorial2d').style.display = 'none';
  }
});
