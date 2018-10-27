AFRAME.registerComponent('song-progress-ring', {
  dependencies: ['geometry', 'material'],

  schema: {
    challengeId: {type: 'string'},
    enabled: {default: false}
  },

  init: function () {
    this.tick = AFRAME.utils.throttleTick(this.tick.bind(this), 2000);
    this.el.sceneEl.addEventListener('cleargame', () => {
      this.progress.value = 0;
    });
  },

  update: function (oldData) {
    // Reset when changing song.
    if (oldData.challengeId !== this.data.challengeId && this.progress) {
      this.progress.value = 0;
    }
  },

  play: function () {
    this.context = this.el.sceneEl.components.song.context;
    this.progress = this.el.getObject3D('mesh').material.uniforms.progress;
  },

  tick: function () {
    if (!this.data.enabled) { return; }

    const source = this.el.sceneEl.components.song.source;
    if (!source) { return; }

    const progress =
      this.el.sceneEl.components.song.getCurrentTime() /
      source.buffer.duration;
    this.progress.value = progress;
  }
});
