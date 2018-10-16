/**
 * Score text fade in animation.
 */
AFRAME.registerComponent('score-texts', {
  schema: {
    isSongLoading: {default: false}
  },

  init: function () {
    this.textEls = this.el.querySelectorAll('[text]');

    for (let i = 0; i < this.textEls.length; i++) {
      this.textEls[i].setAttribute('animation__fadein', {
        autoplay: false,
        property:'components.text.material.uniforms.opacity.value',
        delay: 250,
        dur: 750,
        easing: 'easeInOutCubic',
        from: 0,
        to: 1
      });
    }
  },

  update: function (oldData) {
    // Finished loading.
    if (oldData.isSongLoading && !this.data.isSongLoading) {
      for (let i = 0; i < this.textEls.length; i++) {
        this.textEls[i].components['animation__fadein'].beginAnimation();
      }
    }

    // Started loading.
    if (!oldData.isSongLoading && this.data.isSongLoading) {
      for (let i = 0; i < this.textEls.length; i++) {
        this.textEls[i].components.text.material.uniforms.opacity.value = 0;
      }
    }
  }
});
