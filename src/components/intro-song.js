AFRAME.registerComponent('intro-song', {
  schema: {
    isPlaying: {default: true}
  },

  init: function () {
    this.analyserEl = document.getElementById('audioAnalyser');
    this.audio = document.getElementById('introSong');
    this.timeout = null;
  },

  update: function (oldData) {
    const audio = this.audio;

    if (!this.el.sceneEl.isPlaying) { return; }

    // Play.
    if (!oldData.isPlaying && this.data.isPlaying) {
      this.analyserEl.components.audioanalyser.resumeContext();
      this.analyserEl.setAttribute('audioanalyser', 'src', audio);
      this.fadeInAudio();
    }

    // Pause.
    if (oldData.isPlaying && !this.data.isPlaying) { audio.pause(); }
  },

  play: function () {
    this.fadeInAudio();
  },

  fadeInAudio: function () {
    const context = this.analyserEl.components.audioanalyser.context;
    const gainNode = this.analyserEl.components.audioanalyser.gainNode;
    gainNode.gain.setValueAtTime(0, context.currentTime);
    this.audio.play();
    gainNode.gain.linearRampToValueAtTime(0.5, context.currentTime + 0.5);
  }
});
