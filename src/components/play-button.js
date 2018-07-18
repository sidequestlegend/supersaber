AFRAME.registerComponent('play-button', {
  init: function() {
    var el = this.el;

    el.addEventListener('click', () => {
      el.sceneEl.emit('playbuttonclick');
    });

    el.sceneEl.addEventListener('youtubefinished', evt => {
      el.object3D.visible = false;
    });
  },
});
