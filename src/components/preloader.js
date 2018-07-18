AFRAME.registerComponent('gpu-preloader', {
  init: function() {
    setTimeout(() => {
      this.preloadFont();
      this.preloadKeyboard();
    }, 1000);

    setTimeout(() => {
      this.el.object3D.visible = false;
    }, 2000);
  },

  preloadFont: function() {
    var text;
    text = document.querySelector('[text]');
    if (text.components.text.texture) {
      this.preloadTexture(text.components.text.texture);
    } else {
      text.addEventListener('textfontset', () => {
        this.preloadTexture(text.components.text.texture);
      });
    }
  },

  preloadKeyboard: function() {
    var kbd;
    kbd = document.getElementById('kb');
    kbd.object3D.traverse(node => {
      if (node.material && node.material.map) {
        this.preloadTexture(node.material.map);
      }
    });
  },

  preloadTexture: function(texture) {
    this.el.sceneEl.renderer.setTexture2D(texture, 0);
  },
});
