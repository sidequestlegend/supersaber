AFRAME.registerComponent('assets-loaded', {
  init: function () {
    this.el.addEventListener('loaded', this.onLoad.bind(this));
    this.el.addEventListener('timeout', this.onLoad.bind(this));
  },

  onLoad: function (ev) {
    document.getElementById('tutorial2d').style.display = 'none';
  }
});