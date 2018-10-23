/**
 * Haptics when sabers collide.
 */
AFRAME.registerComponent('haptics-saber', {
  dependencies: ['aabb-collider'],

  init: function () {
    const el = this.el;
    el.setAttribute('haptics__saber', {dur: 100, force: 0.025});

    el.addEventListener('hitclosest', evt => {
      if (!evt.detail || !evt.detail.el.classList.contains('saber') ||
          evt.detail.el === el) { return; }
      this.el.components.haptics__saber.pulse();
    });
  }
});
