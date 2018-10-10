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

    if (!oldData.isPlaying && this.data.isPlaying) {
      this.analyserEl.components.audioanalyser.resumeContext();
      this.timeout = setTimeout(() => {
        // TODO: Fade in volume.
        this.analyserEl.setAttribute('audioanalyser', 'src', audio);
        audio.play();
        this.timeout = null;
      }, 1000);
    }

    if (oldData.isPlaying && !this.data.isPlaying) {
      if (this.timeout) { clearTimeout(this.timeout); }
      audio.pause();
    }
  },

  play: function () {
    this.audio.volume = 0.5;
    this.audio.play();
  }
});
