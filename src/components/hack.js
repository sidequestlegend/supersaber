AFRAME.registerComponent('hack', {
  play: function () {
    const interval = setInterval(() => {
      if (!this.el.sceneEl.is('vr-mode')) {
        this.el.sceneEl.enterVR();
        clearInterval(interval);
      }
    }, 1000);
  }
});
