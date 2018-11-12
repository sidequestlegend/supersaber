/**
 * Score beat, auto-return to pool in 1.2s.
 */
AFRAME.registerComponent('score-beat', {
  play: function () {
    this.startTime = this.el.sceneEl.time;
  },

  tick: function (time) {
    if (time > this.startTime + 1200) {
      this.el.sceneEl.components.pool__beatscore.returnEntity(this.el);
    }
  }
});
