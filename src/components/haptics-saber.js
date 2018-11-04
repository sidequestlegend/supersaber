/**
 * Haptics when sabers collide.
 */
AFRAME.registerComponent('haptics-saber', {
  init: function () {
    const el = this.el;
    el.setAttribute('haptics__saber', {dur: 100, force: 0.025});

    el.addEventListener('mouseenter', evt => {
      if (!evt.detail || !evt.detail.intersectedEl) { return; }

      const intersectedEl = evt.detail.intersectedEl;
      if (!intersectedEl.classList.contains('blade') || intersectedEl === el) { return; }

      this.el.components.haptics__saber.pulse();
    });
  }
});
