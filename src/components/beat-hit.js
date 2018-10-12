var audioContext = new window.AudioContext();

/**
 * Beat hit sound using positional audio and audio buffer source.
 * Pitch the sound up and down using the song audioanalyser FFT.
 */
AFRAME.registerComponent('beat-hit', {
  dependencies: ['sound__beathit'],

  init: function () {
    const data = this.data;
    const el = this.el;

    this.processSound = this.processSound.bind(this);

    const soundPool = el.components.sound__beathit;
    el.addEventListener('beathit', evt => {
      this.currentBeatEl = evt.detail;
      soundPool.playSound(this.processSound);
    });
  },

  processSound: function (sound) {
    this.currentBeatEl.object3D.getWorldPosition(sound.position);
    console.log(sound.position);
    // this.currentBeatEl.setObject3D('sound', sound);
  }
});
