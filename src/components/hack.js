AFRAME.registerComponent('hack', {
  play: function () {
    setTimeout(() => {
      this.el.sceneEl.exitVR();
      setTimeout(() => {
        this.el.sceneEl.enterVR();
      }, 100);
    }, 250);
  }
});
